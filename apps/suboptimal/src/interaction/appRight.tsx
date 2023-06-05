import { Box, Text } from 'ink'
import path from 'path'
import React from 'react'
import { shallow } from 'zustand/shallow'
import {
  QueueEntryState,
  useQueueStore,
  type QueueEntryStateMuxerRunning,
} from '../store/index.mts'
import { getSubChoiceTrackName } from '../utils/getSubChoiceTrackName.mts'
import { useStdoutDimensions } from '../hooks/useStdoutDimensions.mts'

export const AppRight: React.FC = () => {
  const [columns] = useStdoutDimensions()
  let barColumns = Math.floor(columns / 2) - 6
  const [
    queueLength,
    queueUserDecidedCount,
    queueMuxedCount,
    currentMuxingEntry,
  ] = useQueueStore((s) => {
    let res = [0, 0, 0, undefined] as [
      number,
      number,
      number,
      QueueEntryStateMuxerRunning | null | undefined
    ]

    for (const key in s.queue) {
      if (Object.prototype.hasOwnProperty.call(s.queue, key)) {
        const e = s.queue[key]!
        res[0] += 1
        if (e.state >= QueueEntryState.USER_DECISION_SUCCEEDED) {
          res[1] += 1
        }
        if (e.state >= QueueEntryState.MUXER_SUCCEEDED) {
          res[2] += 1
        }
        if (e.state === QueueEntryState.MUXER_RUNNING) {
          res[3] = e
        }
      }
    }

    return res
  }, shallow)

  let userProgress = genProgressObject(
    barColumns,
    queueLength,
    queueUserDecidedCount
  )
  let muxingProgress = genProgressObject(
    barColumns,
    queueLength,
    queueMuxedCount
  )
  let progressBarText = '░'.repeat(barColumns)

  let upperProgress = muxingProgress
  let upperProgressName = 'Muxer'
  let upperProgressText =
    upperProgressName +
    ' ' +
    genProgressText(
      upperProgress.progress.current,
      upperProgress.progress.total,
      upperProgress.pct
    )

  let lowerProgress = userProgress
  let lowerProgressName = 'User'
  let lowerProgressText =
    lowerProgressName +
    ' ' +
    genProgressText(
      lowerProgress.progress.current,
      lowerProgress.progress.total,
      lowerProgress.pct
    )

  let muxingFileText =
    currentMuxingEntry == null
      ? 'Idle'
      : path.basename(currentMuxingEntry.inputPath)

  return (
    <Box flexDirection="column">
      <Box position="relative" marginX={1} paddingY={1} flexDirection="column">
        <Text>│{progressBarText}│</Text>
        <Box
          position="absolute"
          flexDirection="column"
          marginTop={1}
          paddingLeft={upperProgress.columns}
          width="100%"
        >
          <Box position="relative">
            <Box
              position="absolute"
              marginTop={-1}
              marginLeft={
                upperProgress.pct > 0.5 ? -upperProgressText.length + 1 : 0
              }
            >
              <Text>{upperProgressText}</Text>
            </Box>
            <Text>│</Text>
          </Box>
        </Box>
        <Box
          position="absolute"
          flexDirection="column"
          marginTop={1}
          margin={userProgress.columns}
          width="100%"
        >
          <Text>│</Text>
          <Box
            position="absolute"
            marginTop={1}
            marginLeft={
              userProgress.pct > 0.5 ? -lowerProgressText.length + 1 : 0
            }
          >
            <Text>{lowerProgressText}</Text>
          </Box>
        </Box>
      </Box>
      <Box flexDirection="column" padding={1}>
        <Text bold>Muxing file</Text>
        <Text>- {muxingFileText}</Text>
        <Text>
          {'  '}- S&S:{' '}
          {currentMuxingEntry?.subtitleTracks.signsAndSongs
            ? getSubChoiceTrackName(
                currentMuxingEntry?.subtitleTracks.signsAndSongs
              )
            : '-'}
        </Text>
        <Text>
          {'  '}- Full:{' '}
          {currentMuxingEntry?.subtitleTracks.full
            ? getSubChoiceTrackName(currentMuxingEntry?.subtitleTracks.full)
            : '-'}
        </Text>
      </Box>
    </Box>
  )
}

function genProgressObject(
  columns: number,
  queueLength: number,
  finishedLength: number
) {
  let pct = finishedLength / queueLength
  return {
    progress: { current: finishedLength, total: queueLength },
    pct,
    columns: Math.round(pct * (columns + 1)),
  }
}

function genProgressText(current: number, total: number, pct: number) {
  return `${String(current).padStart(String(total).length, '0')}/${total} - ${(
    pct * 100
  ).toFixed(0)}%`
}
