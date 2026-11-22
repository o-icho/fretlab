export const SIGNATURES = ["2/4", "3/4", "4/4", "7/4", "5/8", "6/8", "7/8", "9/8", "12/8"] as const;
export type TimeSignature = (typeof SIGNATURES)[number];
// BPM units are explicit: compound meters keep the existing 6/8 convention.
export const SIGNATURE_INFO = {
  "2/4": { steps: 2, unit: "quarter", subdivisions: 1 },
  "3/4": { steps: 3, unit: "quarter", subdivisions: 1 },
  "4/4": { steps: 4, unit: "quarter", subdivisions: 1 },
  "7/4": { steps: 7, unit: "quarter", subdivisions: 1 },
  "5/8": { steps: 5, unit: "eighth", subdivisions: 1 },
  "6/8": { steps: 6, unit: "dotted-quarter", subdivisions: 3 },
  "7/8": { steps: 7, unit: "eighth", subdivisions: 1 },
  "9/8": { steps: 9, unit: "dotted-quarter", subdivisions: 3 },
  "12/8": { steps: 12, unit: "dotted-quarter", subdivisions: 3 },
} as const;
export function isTimeSignature(value: string): value is TimeSignature {
  return SIGNATURES.some((signature) => signature === value);
}
