const tempoNumber = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export function formatTrackTempo(bpm: number): string {
  return `${tempoNumber.format(bpm)} BPM`;
}
