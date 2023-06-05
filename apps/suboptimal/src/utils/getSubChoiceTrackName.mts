import type { MediaInfoTrackText } from '@lib/media-info'

export function getSubChoiceTrackName(t: MediaInfoTrackText) {
  let size = (Number(t.StreamSize) / 1000).toFixed(2)

  return `${t.ID} - [${t.CodecID}][${t.Language}][${size}]${
    t.Default ? `[D]` : ''
  }${t.Forced ? `[F]` : ''} ${t.Title}`
}
