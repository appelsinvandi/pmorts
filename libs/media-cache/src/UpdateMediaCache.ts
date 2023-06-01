import { MediaRoots } from '@lib/constants'
import { GetMediaInfo } from '@lib/media-info'
import fs from 'fs'
import _ from 'lodash'
import mime from 'mime'
import path from 'path'
import { db } from './utils/db.js'
import cliProgress from 'cli-progress'

export async function UpdateMediaCache() {
  const fileList = Object.values(MediaRoots).flatMap((r) =>
    readdirRecursive(r, (f) => mime.getType(f)?.startsWith('video/') === true)
  )
  const cache = await db.video.findMany()
  const cacheMap = cache.reduce((a, c) => a.set(c.filePath, c), new Map<string, (typeof cache)[number]>())

  // Add new stuff
  const mediaCacheProgressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  mediaCacheProgressBar.start(fileList.length, 0)
  try {
    for (let f of fileList) {
      mediaCacheProgressBar.increment()

      if (f.includes('⏳')) continue

      const fSize = fs.statSync(f, { bigint: true }).size
      const cacheEntry = cacheMap.get(f)

      if (!cacheEntry) {
        await db.video.create({
          data: { filePath: f, fileSizeInBytes: fSize, mediaInfo: JSON.stringify(await GetMediaInfo(f)) },
        })
      } else {
        if (cacheEntry.fileSizeInBytes !== fSize) {
          await db.video.update({
            where: { filePath: f },
            data: { filePath: f, fileSizeInBytes: fSize, mediaInfo: JSON.stringify(await GetMediaInfo(f)) },
          })
        }

        cacheMap.delete(f)
      }
    }
  } finally {
    mediaCacheProgressBar.stop()
  }

  // Cleanup db
  for (const mediaDeletionQueueChunk of _.chunk([...cacheMap.values()], 1000)) {
    await db.video.deleteMany({ where: { id: { in: mediaDeletionQueueChunk.map((e) => e.id) } } })
  }
}

function readdirRecursive(dir: string, fileQualifierFn: (filePath: string) => boolean): string[] {
  const res: string[] = []

  fs.readdirSync(dir).forEach((e) => {
    const fullPath = path.resolve(dir, e)

    if (fs.statSync(fullPath).isDirectory()) {
      res.push(...readdirRecursive(fullPath, fileQualifierFn))
    } else if (fileQualifierFn(fullPath)) {
      res.push(fullPath)
    }
  })

  return res
}
