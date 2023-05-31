import { MediaInfoOutput } from '@lib/media-info'
import fs from 'fs'
import _ from 'lodash'
import z from 'zod'
import { TranscodeReason } from './TranscodeReason'
import { rulesSchema } from './appConfigSchema'
import { getMediaTracks } from './getMediaTracks'
import { spawnAssist } from './spawnAssist'

export async function ffmpeg(
  inputPath: string,
  mediaInfo: MediaInfoOutput,
  transcodeReasons: TranscodeReason[],
  rules: z.infer<typeof rulesSchema>,
  opts?: { forced?: boolean }
) {
  const tempOutputPath = genOutputPath(inputPath, '⏳', rules.general.extension.preferred)

  let tempFiles = [tempOutputPath]

  const { audioTracks, generalTrack, textTracks, videoTracks } = getMediaTracks(mediaInfo)

  // Subs extraction
  if (transcodeReasons.includes(TranscodeReason.ExtractTextTracks)) {
    for (let i in textTracks) {
      const t = textTracks[i]

      if (!rules.text.language.allowed.includes(t.Language)) continue

      let fileName = tempOutputPath.replace(/\.[^.]+$/, '')
      if (t.Forced) fileName += '.forced'
      fileName += `.${t.Language}${i}`

      if (t.Format === 'ASS') fileName += '.ass'
      else if (t.Format === 'EIA-608') continue
      else if (t.Format === 'EIA-708') continue
      else if (t.Format === 'PGS') fileName += '.sub'
      else if (t.Format === 'UTF-8') fileName += '.srt'

      await spawnAssist('mkvextract', ['tracks', inputPath, `${t.ID!}:${fileName}`])

      tempFiles.push(fileName)
    }
  }

  let ffmpegArgs: string[] = []

  // Global args
  ffmpegArgs.push('-y')

  // Input args
  ffmpegArgs.push('-i', inputPath)

  //   - Audio
  const audioEncodingParams = rules.audio.encodingParams

  audioTracks.forEach((t, i) => {
    if (
      transcodeReasons.includes(TranscodeReason.SurplusAudioTracks) &&
      !rules.audio.language.allowed.includes(t.Language)
    ) {
      return
    }

    if (transcodeReasons.includes(TranscodeReason.BadAudioCodec)) {
      ffmpegArgs.push(`-c:a:${i}`, rules.audio.encodingParams.codec)

      ffmpegArgs.push(
        ...Object.entries(_.omit(audioEncodingParams, 'codec')).flatMap(([k, v]) =>
          Array.isArray(v) ? v.flatMap((v) => ['-' + k, String(v)]) : ['-' + k, String(v)]
        )
      )
    } else {
      ffmpegArgs.push(`-c:a:${i}`, 'copy')
    }
  })

  //   - Video
  const videoTrack = videoTracks[0]
  const videoEncodingParams = rules.video.encodingParams
  let videoFilters: string[] = []

  if (
    transcodeReasons.some((r) =>
      [
        TranscodeReason.BadVideoCodec,
        TranscodeReason.BloatedFrameRate,
        TranscodeReason.BloatedVideoResolution,
      ].includes(r)
    )
  ) {
    ffmpegArgs.push('-c:v:0', videoEncodingParams.codec)

    ffmpegArgs.push(
      ...Object.entries(_.omit(videoEncodingParams, 'codec')).flatMap(([k, v]) =>
        Array.isArray(v) ? v.flatMap((v) => ['-' + k, String(v)]) : ['-' + k, String(v)]
      )
    )
  } else {
    ffmpegArgs.push('-c:v:0', 'copy')
  }

  if (transcodeReasons.includes(TranscodeReason.BloatedVideoResolution)) {
    const boundingBox = rules.video.resolutionBoundingBox
    const boundingRatio = boundingBox.longEdgePx / boundingBox.shortEdgePx
    const width = videoTrack.Width
    const height = videoTrack.Height

    if (width >= height) {
      const videoRatio = width / height

      if (videoRatio >= boundingRatio) {
        videoFilters.push(`scale=${boundingBox.longEdgePx}:-2`)
      } else {
        videoFilters.push(`scale=-2:${boundingBox.shortEdgePx}`)
      }
    } else {
      const videoRatio = height / width

      if (videoRatio >= boundingRatio) {
        videoFilters.push(`scale=-2:${boundingBox.longEdgePx}`)
      } else {
        videoFilters.push(`scale=${boundingBox.shortEdgePx}:-2`)
      }
    }
  }

  if (transcodeReasons.includes(TranscodeReason.BloatedFrameRate)) {
    videoFilters.push('fps=fps=30')
  }

  if (videoFilters.length > 0) {
    ffmpegArgs.push('-vf', videoFilters.join(', '))
  }

  // Optimization
  if (rules.general.extension.preferred === 'mp4') ffmpegArgs.push('-movflags', '+faststart')

  // Output args
  ffmpegArgs.push(tempOutputPath)

  // Exec
  console.log('ffmpeg', ffmpegArgs.join(' '))
  await spawnAssist('ffmpeg', ffmpegArgs)

  tempFiles.forEach((f) => fs.renameSync(f, f.replace(/⏳/g, '💯')))
}

function genOutputPath(inputPath: string, emoji: string, extension: string) {
  return `${inputPath.replace(/\.[^\.]+$/, '')}.${emoji}.${extension}`
}
