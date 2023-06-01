import { GetMediaCacheMap, UpdateMediaCache } from '@lib/media-cache'
import { isGeneralTrack } from '@lib/media-info'
import _, { type Truthy } from 'lodash'
import config from '../config.js'
import { TranscodeReason } from './TranscodeReason.js'
import { appConfigSchema } from './appConfigSchema.js'
import { ffmpeg } from './ffmpeg.js'
import { getMediaTracks } from './getMediaTracks.js'

main().catch((err) => console.dir(err, { depth: Infinity }))

const forcedTranscodeReasons: TranscodeReason[] = [
  TranscodeReason.BadAudioCodec,
  TranscodeReason.BadContainer,
  TranscodeReason.BadVideoCodec,
  TranscodeReason.SurplusAudioTracks,
  TranscodeReason.SurplusTextTracks,
  TranscodeReason.SurplusVideoTracks,
]

async function main() {
  await UpdateMediaCache()

  const configValRes = appConfigSchema.safeParse(config)
  if (!configValRes.success) {
    throw configValRes.error.format()
  }

  const mediaCacheMap = await GetMediaCacheMap()
  const mediaCacheArray = [...mediaCacheMap.values()]
  const mediaRoots = configValRes.data.mediaRoots.map((e) => ({
    ...e,
    media: e.directories.flatMap((d) => mediaCacheArray.filter((m) => m.filePath.startsWith(d))),
  }))

  const transcodeQueue = mediaRoots
    .flatMap((r) =>
      r.media.map((m) => {
        let reasons: TranscodeReason[] = []
        const rules = r.rules

        const mediaInfo = m.mediaInfo

        const { audioTracks, generalTrack, textTracks, videoTracks } = getMediaTracks(mediaInfo)

        if (generalTrack == null) return null

        if (videoTracks.length !== 1) console.log('Video tracks count invalid', m.filePath)
        if (videoTracks.length !== 1) return null
        const videoTrack = videoTracks[0]!

        if (!r.rules.general.extension.allowed.some((ext) => m.filePath.endsWith(`.${ext}`))) {
          reasons.push(TranscodeReason.BadContainer)
        }

        if (
          audioTracks.some((t) => !rules.audio.language.allowed.includes(t.Language)) &&
          audioTracks.some((t) => rules.audio.language.allowed.includes(t.Language))
        ) {
          reasons.push(TranscodeReason.SurplusAudioTracks)
        }
        if (!audioTracks.every((t) => rules.audio.codec.allowed.includes(t.Format))) {
          reasons.push(TranscodeReason.BadAudioCodec)
        }

        if (
          textTracks.some((t) => !rules.text.language.allowed.includes(t.Language)) &&
          textTracks.some((t) => rules.text.language.allowed.includes(t.Language))
        ) {
          reasons.push(TranscodeReason.SurplusTextTracks)
        }
        if (
          rules.text.style === 'external' &&
          textTracks.filter((t) => rules.text.language.allowed.includes(t.Language)).length > 0
        ) {
          reasons.push(TranscodeReason.ExtractTextTracks)
        }

        if (
          Math.max(videoTrack.Width, videoTrack.Height) > rules.video.resolutionBoundingBox.longEdgePx ||
          Math.min(videoTrack.Width, videoTrack.Height) > rules.video.resolutionBoundingBox.shortEdgePx
        ) {
          reasons.push(TranscodeReason.BloatedVideoResolution)
        }
        if ((generalTrack.FrameRate ?? 0) > 30) {
          reasons.push(TranscodeReason.BloatedFrameRate)
        }
        if (!rules.video.codec.allowed.includes(videoTrack.Format)) {
          reasons.push(TranscodeReason.BadVideoCodec)
        }

        return {
          file: m,
          mediaInfo,
          reasons,
          rules,
        }
      })
    )
    .filter((e): e is Truthy<typeof e> => !!e && e.reasons.length > 0)

  const prioritizedTranscodeQueue = _.orderBy(
    transcodeQueue,
    [(e) => _.sumBy(e.reasons, (v) => 1 << v), (e) => e.mediaInfo.media.track.find(isGeneralTrack)!.OverallBitRate],
    ['desc', 'desc']
  )
  console.log(prioritizedTranscodeQueue[0])
  return
  await ffmpeg(
    prioritizedTranscodeQueue[0]!.file.filePath,
    prioritizedTranscodeQueue[0]!.file.mediaInfo,
    prioritizedTranscodeQueue[0]!.reasons,
    prioritizedTranscodeQueue[0]!.rules
  )
}
