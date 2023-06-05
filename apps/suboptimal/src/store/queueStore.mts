import fastq from 'fastq'
import { appendFileSync } from 'fs'
import { produce } from 'immer'
import path from 'path'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { muxQueueEntry } from '../utils/muxVideo.mts'
import type { MediaInfoOutput, MediaInfoTrackText } from '@lib/media-info'

export enum QueueEntryState {
  INITIAL,
  USER_DECISION_RUNNING,
  USER_DECISION_FAILED,
  USER_DECISION_SUCCEEDED,
  MUXER_RUNNING,
  MUXER_FAILED,
  MUXER_SUCCEEDED,
}

export type QueueEntry =
  | QueueEntryStateInitial
  | QueueEntryStateUserDecisionRunning
  | QueueEntryStateUserDecisionSucceeded
  | QueueEntryStateUserDecisionFailed
  | QueueEntryStateMuxerRunning
  | QueueEntryStateMuxerSucceeded
  | QueueEntryStateMuxerFailed

export type QueueEntryStateInitial = {
  state: QueueEntryState.INITIAL
  inputPath: string
  mediaInfo: MediaInfoOutput
}
export type QueueEntryStateUserDecisionRunning = Omit<
  QueueEntryStateInitial,
  'state'
> & {
  state: QueueEntryState.USER_DECISION_RUNNING
}
export type QueueEntryStateUserDecisionSucceeded = Omit<
  QueueEntryStateUserDecisionRunning,
  'state'
> & {
  state: QueueEntryState.USER_DECISION_SUCCEEDED
  subtitleTracks: {
    full?: MediaInfoTrackText
    signsAndSongs?: MediaInfoTrackText
  }
}
export type QueueEntryStateUserDecisionFailed = Omit<
  QueueEntryStateUserDecisionRunning,
  'state'
> & {
  state: QueueEntryState.USER_DECISION_FAILED
  error: any
}
export type QueueEntryStateMuxerRunning = Omit<
  QueueEntryStateUserDecisionSucceeded,
  'state'
> & {
  state: QueueEntryState.MUXER_RUNNING
}
export type QueueEntryStateMuxerSucceeded = Omit<
  QueueEntryStateMuxerRunning,
  'state'
> & {
  state: QueueEntryState.MUXER_SUCCEEDED
  outputPath: string
}
export type QueueEntryStateMuxerFailed = Omit<
  QueueEntryStateMuxerRunning,
  'state'
> & {
  state: QueueEntryState.MUXER_FAILED
  error: any
}

const muxerQueue = fastq.promise<void, QueueEntryStateUserDecisionSucceeded>(
  async (e) => {
    try {
      useQueueStore.getState().setItem(e.inputPath, {
        state: QueueEntryState.MUXER_RUNNING,
      })

      const outputPath = await muxQueueEntry(e)

      useQueueStore.getState().setItem(e.inputPath, {
        state: QueueEntryState.MUXER_SUCCEEDED,
        outputPath,
      })
    } catch (err) {
      useQueueStore.getState().setItem(e.inputPath, {
        state: QueueEntryState.MUXER_FAILED,
        error: err,
      })
    }
  },
  1
)
muxerQueue.resume()

export const useQueueStore = create(
  combine(
    {
      queue: {} as { [fileName: string]: QueueEntry },
    },
    (set) => ({
      setItem: (
        inputPath: string,
        data:
          | Pick<QueueEntryStateInitial, 'state' | 'inputPath' | 'mediaInfo'>
          | Pick<QueueEntryStateUserDecisionRunning, 'state'>
          | Pick<
              QueueEntryStateUserDecisionSucceeded,
              'state' | 'subtitleTracks'
            >
          | Pick<QueueEntryStateUserDecisionFailed, 'state' | 'error'>
          | Pick<QueueEntryStateMuxerRunning, 'state'>
          | Pick<QueueEntryStateMuxerSucceeded, 'state' | 'outputPath'>
          | Pick<QueueEntryStateMuxerFailed, 'state' | 'error'>
      ) => {
        set((s) => {
          const newState = produce(s, (d) => {
            d.queue[inputPath] = {
              ...d.queue[inputPath],
              ...(data as any),
            }
          })

          if (data.state === QueueEntryState.USER_DECISION_SUCCEEDED) {
            setTimeout(
              () => muxerQueue.push(newState.queue[inputPath] as any),
              1
            )
          }

          if (QueueEntryState[data.state].endsWith('FAILED')) {
            appendFileSync(
              path.resolve(__dirname, '..', '..', 'errors.log'),
              '\n==========\n' +
                // @ts-ignore
                JSON.stringify(data.error, null, 2) +
                '\n==========\n'
            )
          }

          return newState
        })
      },
    })
  )
)
