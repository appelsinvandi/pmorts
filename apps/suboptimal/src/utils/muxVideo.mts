import { spawn } from 'child_process'
import path from 'path'
import { type QueueEntryStateUserDecisionSucceeded } from '../store/index.mts'
import type {
  MediaInfoOutput,
  MediaInfoTrackAudio,
  MediaInfoTrackGeneral,
  MediaInfoTrackMenu,
  MediaInfoTrackOther,
  MediaInfoTrackVideo,
} from '@lib/media-info'

export function muxQueueEntry(e: QueueEntryStateUserDecisionSucceeded) {
  return muxVideo(e.inputPath, e.mediaInfo, {
    full: e.subtitleTracks.full?.ID,
    signsAndSongs: e.subtitleTracks.signsAndSongs?.ID,
  })
}
export async function muxVideo(
  filePath: string,
  mediaInfo: MediaInfoOutput,
  subtitleTrackIds?: { full?: string; signsAndSongs?: string }
) {
  const trackOrder =
    '0:' +
    mediaInfo.media.track
      .filter(
        (
          t
        ): t is
          | MediaInfoTrackAudio
          | MediaInfoTrackVideo
          | MediaInfoTrackGeneral
          | MediaInfoTrackMenu
          | MediaInfoTrackOther => 'ID' in t && t['@type'] !== 'Text'
      )
      .map((t) => Number(t.ID) - 1)
      .concat(
        subtitleTrackIds?.full != null
          ? [Number(subtitleTrackIds.full) - 1]
          : []
      )
      .concat(
        subtitleTrackIds?.signsAndSongs != null
          ? [Number(subtitleTrackIds.signsAndSongs) - 1]
          : []
      )
      .join(',0:')
  const outputPath = path.resolve(
    path.dirname(filePath),
    '..',
    path.basename(filePath)
  )

  const commandArgs: string[] = []
  commandArgs.push('--output', outputPath)
  commandArgs.push('--title', '')
  commandArgs.push('--track-name', '0:')
  if (subtitleTrackIds?.full || subtitleTrackIds?.signsAndSongs) {
    commandArgs.push(
      '--subtitle-tracks',
      [subtitleTrackIds?.full, subtitleTrackIds?.signsAndSongs]
        .filter(Boolean)
        .map((s) => Number(s) - 1)
        .join(',')
    )

    if (subtitleTrackIds?.full) {
      commandArgs.push(
        '--track-name',
        `${Number(subtitleTrackIds.full) - 1}:Full`
      )
      commandArgs.push(
        '--default-track',
        `${Number(subtitleTrackIds.full) - 1}:yes`
      )
      commandArgs.push('--language', `${Number(subtitleTrackIds.full) - 1}:en`)
    }
    if (subtitleTrackIds?.signsAndSongs) {
      commandArgs.push(
        '--track-name',
        `${Number(subtitleTrackIds.signsAndSongs) - 1}:Signs & Songs`
      )
      commandArgs.push(
        '--default-track',
        `${Number(subtitleTrackIds.signsAndSongs) - 1}:no`
      )
      commandArgs.push(
        '--language',
        `${Number(subtitleTrackIds.signsAndSongs) - 1}:ja`
      )
    }
  } else {
    commandArgs.push('--no-subtitles')
  }
  commandArgs.push('--track-order', trackOrder)
  commandArgs.push(filePath)

  const mkvMergeStream = spawn('mkvmerge', commandArgs)

  const exitCode = await new Promise((r) => mkvMergeStream.once('exit', r))

  return outputPath
}
