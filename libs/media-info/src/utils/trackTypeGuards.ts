import { MediaInfoOutput } from '../types'

export const isAudioTrack = trackTypeGuardFactory('Audio')
export const isGeneralTrack = trackTypeGuardFactory('General')
export const isMenuTrack = trackTypeGuardFactory('Menu')
export const isOtherTrack = trackTypeGuardFactory('Other')
export const isTextTrack = trackTypeGuardFactory('Text')
export const isVideoTrack = trackTypeGuardFactory('Video')

function trackTypeGuardFactory<TTrackType extends MediaInfoOutput['media']['track'][number]['@type']>(
  type: TTrackType
) {
  return (
    track: MediaInfoOutput['media']['track'][number]
  ): track is Extract<MediaInfoOutput['media']['track'][number], { '@type': TTrackType }> => track['@type'] === type
}
