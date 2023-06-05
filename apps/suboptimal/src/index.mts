import { GetMediaCacheMap, UpdateMediaCache } from '@lib/media-cache'
import { program } from 'commander'
import fs from 'fs'
import path from 'path'
import { renderApp } from './interaction/index.tsx'
import { QueueEntryState, useQueueStore } from './store/index.mts'

program
  .version('1.0.0')
  .argument('[path]', 'The directory to search for MKVs')
  .parse()
let inputFolder = program.args[0]

let operatingDir = process.cwd()
if (inputFolder != null) {
  if (!fs.existsSync(path.resolve(inputFolder))) {
    console.error('Input folder does not exist')
    process.exit(1)
  }
  operatingDir = path.resolve(inputFolder)
}

await UpdateMediaCache()
const mediaCacheMap = await GetMediaCacheMap()

const queueStoreActions = useQueueStore.getState()
fs.readdirSync(operatingDir)
  .map((f) => path.resolve(operatingDir, f))
  .filter((p) => p.toLowerCase().endsWith('.mkv') && fs.lstatSync(p).isFile())
  .map(
    (e) =>
      [
        e,
        /S(\d+)E(\d+)/
          .exec(path.basename(e))
          ?.slice(1)
          .map((e) => Number(e)) as [season: number, episode: number],
      ] as const
  )
  .sort(([, a], [, b]) => a[0] * 1e9 + a[1] - b[0] * 1e9 - b[1])
  .forEach(([e]) =>
    queueStoreActions.setItem(e, {
      state: QueueEntryState.INITIAL,
      inputPath: e,
      mediaInfo: mediaCacheMap.get(e)!.mediaInfo,
    })
  )

renderApp()

while (
  Object.values(useQueueStore.getState().queue).some(
    (e) =>
      e.state !== QueueEntryState.MUXER_SUCCEEDED &&
      !QueueEntryState[e.state]?.endsWith('_FAILED')
  )
) {
  await new Promise((r) => setTimeout(r, 250))
}
