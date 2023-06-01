import { type MediaInfoOutput, isAudioTrack, isGeneralTrack, isTextTrack, isVideoTrack } from '@lib/media-info'

export function getMediaTracks(mediaInfo: MediaInfoOutput) {
  return mediaInfo.media.track.reduce(
    (a, c) => {
      if (isAudioTrack(c)) a.audioTracks.push(c)
      else if (isGeneralTrack(c)) a.generalTrack = c
      else if (isTextTrack(c)) a.textTracks.push(c)
      else if (isVideoTrack(c)) a.videoTracks.push(c)

      return a
    },
    {
      audioTracks: [],
      generalTrack: null,
      textTracks: [],
      videoTracks: [],
    } as {
      audioTracks: Extract<MediaInfoOutput['media']['track'][number], { '@type': 'Audio' }>[]
      generalTrack: Extract<MediaInfoOutput['media']['track'][number], { '@type': 'General' }> | null
      textTracks: Extract<MediaInfoOutput['media']['track'][number], { '@type': 'Text' }>[]
      videoTracks: Extract<MediaInfoOutput['media']['track'][number], { '@type': 'Video' }>[]
    }
  )
}
