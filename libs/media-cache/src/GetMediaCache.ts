import { MediaInfoOutput } from '@lib/media-info'
import { db } from './utils/db'

export async function GetMediaCache() {
  return await db.video.findMany().then((e) =>
    e.map((e) => ({
      ...e,
      mediaInfo: JSON.parse(e.mediaInfo) as MediaInfoOutput,
    }))
  )
}

export async function GetMediaCacheMap() {
  const mediaCache = await GetMediaCache()
  return mediaCache.reduce((a, c) => a.set(c.filePath, c), new Map<string, (typeof mediaCache)[number]>())
}
