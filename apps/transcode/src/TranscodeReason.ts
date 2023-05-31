// In order of priority, low -> high
export enum TranscodeReason {
  BadAudioCodec,
  BadVideoCodec,

  BloatedVideoResolution,
  BloatedFrameRate,

  // Likely only need mux
  SurplusTextTracks,
  SurplusAudioTracks,
  SurplusVideoTracks,

  ExtractTextTracks,

  BadContainer,
}
