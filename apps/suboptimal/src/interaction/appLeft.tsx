import { exec } from 'child_process'
import { Box, Text, useInput } from 'ink'
import path from 'path'
import React, { useEffect, useMemo, useState } from 'react'
import { shallow } from 'zustand/shallow'
import {
  QueueEntryState,
  useQueueStore,
  type QueueEntryStateInitial,
} from '../store/index.mts'
import { getSubChoiceTrackName } from '../utils/getSubChoiceTrackName.mts'
import { useStdoutDimensions } from '../hooks/useStdoutDimensions.mts'
import { isTextTrack, type MediaInfoTrackText } from '@lib/media-info'

export const AppLeft: React.FC = () => {
  const [, rows] = useStdoutDimensions()

  const [item, setQueueItem] = useQueueStore(
    (s) => [
      Object.values(s.queue).find(
        (e) =>
          e.state === QueueEntryState.USER_DECISION_RUNNING ||
          e.state === QueueEntryState.INITIAL
      ) as QueueEntryStateInitial | undefined,
      s.setItem,
    ],
    shallow
  )
  const [highlightedTrack, setHighlightedTrack] = useState('')
  const [subtitleTrackFull, setSubtitleTrackFull] =
    useState<MediaInfoTrackText | null>(null)
  const [subtitleTrackSignsAndSongs, setSubtitleTrackSignsAndSongs] =
    useState<MediaInfoTrackText | null>(null)

  const subtitleTracks = useMemo(
    () => (item ? item.mediaInfo.media.track.filter(isTextTrack) : []),
    [item]
  )

  useEffect(() => {
    if (item?.state !== QueueEntryState.INITIAL) {
      return
    }
    setQueueItem(item.inputPath, {
      state: QueueEntryState.USER_DECISION_RUNNING,
    })

    const subtitleTracks = item.mediaInfo.media.track.filter(
      (e): e is MediaInfoTrackText => e['@type'] === 'Text'
    )
    const eligibleSubtitleTracks = subtitleTracks
    const subtitleTrackFullScores = eligibleSubtitleTracks
      .map((e, _, a) => {
        let score = 0
        if (e.CodecID?.startsWith('S_TEXT/')) score += 0b0000_0001
        if (e.Language === 'eng') score += 0b0000_0010
        if (e.Title && /(ember)/gi.test(e.Title)) score += 0b0000_0100

        if (e.Title && /(dialog|honorific|full)/gi.test(e.Title))
          score += 0b1000_0000
        if (
          e.Language === 'eng' &&
          a.filter((e2) => e2.Language === 'eng').length === 1
        )
          score += 0b0100_0000
        if (e.Title?.toLowerCase() === 'english') score += 0b0010_0000

        return [score, e] as const
      })
      .filter(([score]) => score >= 0b0001_0000)
      .sort(([scoreA], [scoreB]) => scoreB - scoreA)
    setSubtitleTrackFull(subtitleTrackFullScores[0]?.[1] ?? null)

    const subtitleTrackSignsAndSongsScores = eligibleSubtitleTracks
      .map((e) => {
        let score = 0
        if (e.CodecID?.startsWith('S_TEXT/')) score += 0b0000_0001
        if (e.Title && /(signs|songs|s&s)/gi.test(e.Title)) score += 0b1000_0000

        return [score, e] as const
      })
      .filter(([score]) => score >= 0b0001_0000)
      .sort(([scoreA], [scoreB]) => scoreB - scoreA)
    setSubtitleTrackSignsAndSongs(
      subtitleTrackSignsAndSongsScores[0]?.[1] ?? null
    )

    setHighlightedTrack(subtitleTracks[0]?.ID ?? '')
  }, [item])

  useInput(
    (input, key) => {
      if (!item) return

      if (key.upArrow || input === 'o') {
        setHighlightedTrack(
          (s) =>
            subtitleTracks[subtitleTracks.findIndex((e) => e.ID === s) - 1]!
              .ID ?? s
        )
      } else if (key.downArrow || input === 'l') {
        setHighlightedTrack(
          (s) =>
            subtitleTracks[subtitleTracks.findIndex((e) => e.ID === s) + 1]!
              .ID ?? s
        )
      } else if (/\d/.test(input)) {
        setHighlightedTrack(
          (s) => subtitleTracks.find((e) => e.ID === input)?.ID ?? s
        )
      } else if (input === 's') {
        setSubtitleTrackSignsAndSongs((s) => {
          const track = subtitleTracks.find((e) => e.ID === highlightedTrack)
          return track && track !== s ? track : null
        })
      } else if (input === 'd') {
        setSubtitleTrackFull((s) => {
          const track = subtitleTracks.find((e) => e.ID === highlightedTrack)
          return track && track !== s ? track : null
        })
      } else if (input === ' ') {
        exec(`vlc "${item.inputPath}"`)
      } else if (
        (key.return &&
          subtitleTrackFull != null &&
          subtitleTrackSignsAndSongs != null) ||
        input === 'f'
      ) {
        setQueueItem(item.inputPath, {
          state: QueueEntryState.USER_DECISION_SUCCEEDED,
          subtitleTracks: {
            full: subtitleTrackFull ?? undefined,
            signsAndSongs: subtitleTrackSignsAndSongs ?? undefined,
          },
        })
      }
    },
    { isActive: item != null }
  )

  if (item == null) {
    return (
      <Box
        key="APP_LEFT:CONTAINER:EMPTY"
        alignItems="center"
        justifyContent="center"
        padding={1}
        width="100%"
        height="100%"
      >
        <Text>No input currently needed</Text>
      </Box>
    )
  }

  const maxVisibleTracks = Math.floor((rows - 4) / 3)
  const highlightedTrackIndex = subtitleTracks.findIndex(
    (e) => e.ID === highlightedTrack
  )
  const displayTracksStartIndex = Math.max(
    0,
    Math.min(
      highlightedTrackIndex - Math.floor(maxVisibleTracks / 2),
      subtitleTracks.length - maxVisibleTracks
    )
  )
  const displayTracksEndIndex = Math.min(
    subtitleTracks.length,
    displayTracksStartIndex + maxVisibleTracks
  )
  const trackElements = subtitleTracks
    .slice(displayTracksStartIndex, displayTracksEndIndex)
    .map((track) => {
      const roles = [
        subtitleTrackFull?.ID === track.ID ? 'Full' : null,
        subtitleTrackSignsAndSongs?.ID === track.ID ? 'S&S' : null,
      ]
        .filter(Boolean)
        .join(' | ')

      return (
        <Box
          key={`TRACK:${track.ID}`}
          justifyContent="space-between"
          borderStyle="round"
          borderColor={highlightedTrack === track.ID ? 'blueBright' : undefined}
          paddingX={1}
        >
          <Text>{getSubChoiceTrackName(track)}</Text>
          <Text color="green">{roles}</Text>
        </Box>
      )
    })

  const moreTracksIndicatorElement =
    displayTracksEndIndex < subtitleTracks.length ||
    displayTracksStartIndex !== 0 ? (
      <Box
        key="MORE_TRACKS_INDICATOR"
        justifyContent="center"
        position="absolute"
        marginTop={rows - 3}
        marginLeft={1}
      >
        <Text>&nbsp;scrollable&nbsp;</Text>
      </Box>
    ) : null

  return (
    <Box
      key="APP_LEFT:CONTAINER:CONTENT"
      flexDirection="column"
      paddingX={1}
      width="100%"
      height="100%"
      position="relative"
    >
      <Text bold>{path.basename(item.inputPath)}</Text>
      <Text>&nbsp;</Text>
      {trackElements}
      {moreTracksIndicatorElement}
    </Box>
  )
}
