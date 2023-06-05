import { MediaRoots } from '@lib/constants'
import { GetMediaCacheMap, UpdateMediaCache } from '@lib/media-cache'
import { isTextTrack } from '@lib/media-info'
import _ from 'lodash'
import path from 'path'

await UpdateMediaCache()
const mediaCacheMap = await GetMediaCacheMap().then(
  (e) =>
    new Map(
      Array.from(e.entries()).filter(
        ([k]) =>
          k.startsWith(path.resolve(MediaRoots.M, 'tv', 'anime')) &&
          !k.endsWith('Yameii.mkv')
      )
    )
)
const mediaCache = Array.from(mediaCacheMap.values())

const suboptimalMedia = await getSuboptimalSubs()
console.log(
  _.uniq(
    suboptimalMedia
      .filter((e) => e.error === 'FOREIGN_TRACKS')
      .map((e) => path.dirname(e.filePath))
  )
)
console.log(mediaCache.length, suboptimalMedia.length)

async function getSuboptimalSubs() {
  const errors: { error: 'FOREIGN_TRACKS' | 'BAD_ORDER'; filePath: string }[] =
    []

  for (const media of mediaCache) {
    const subtitleTracks = media.mediaInfo.media.track.filter(isTextTrack)
    const dialogueTrackIndex = subtitleTracks.findIndex(
      (track) => track.Title === 'Full' && track.Language === 'eng'
    )
    const signsAndSongsTrackIndex = subtitleTracks.findIndex(
      (track) => track.Title === 'Signs & Songs' && track.Language === 'jpn'
    )

    if (
      subtitleTracks.some(
        (_, i) => ![dialogueTrackIndex, signsAndSongsTrackIndex].includes(i)
      )
    ) {
      errors.push({ error: 'FOREIGN_TRACKS', filePath: media.filePath })
    }

    if (dialogueTrackIndex > signsAndSongsTrackIndex) {
      errors.push({ error: 'BAD_ORDER', filePath: media.filePath })
    }
  }

  return errors
}
