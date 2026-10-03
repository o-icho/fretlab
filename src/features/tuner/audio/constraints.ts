/** Ignore unsupported optional constraints instead of failing microphone activation. */
export function musicalAudioConstraints(
  supported: MediaTrackSupportedConstraints,
): MediaTrackConstraints {
  const audio: MediaTrackConstraints = {};
  if (supported.echoCancellation) audio.echoCancellation = false;
  if (supported.noiseSuppression) audio.noiseSuppression = false;
  if (supported.autoGainControl) audio.autoGainControl = false;
  return audio;
}
