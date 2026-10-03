// Imported from chords-db df06fa7b425cf5fd29485ff6591236b3557e3fac; see PROVENANCE.json and LICENSE.chords-db.txt.
import type { GuitarChord } from "../../features/chords/lib/model.ts";
export const CHORDS = [
  {
    id: "C-major",
    root: "C",
    quality: "major",
    displayName: "C",
    positions: [
      {
        id: "C-major-1",
        frets: [-1, 3, 2, 0, 1, 0],
        fingers: [0, 3, 2, 0, 1, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "C-major-2",
        frets: [-1, 3, 5, 5, 5, 3],
        fingers: [0, 1, 2, 3, 4, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C-major-3",
        frets: [-1, -1, 5, 5, 5, 8],
        fingers: [0, 0, 1, 1, 1, 4],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "C-major-4",
        frets: [8, 10, 10, 9, 8, 8],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "C-minor",
    root: "C",
    quality: "minor",
    displayName: "Cm",
    positions: [
      {
        id: "C-minor-1",
        frets: [-1, 3, 1, 0, 1, 3],
        fingers: [0, 3, 2, 0, 1, 4],
        baseFret: 1,
        barres: [],
      },
      {
        id: "C-minor-2",
        frets: [3, 3, 5, 5, 4, 3],
        fingers: [1, 1, 3, 4, 2, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C-minor-3",
        frets: [8, 6, 5, 5, -1, -1],
        fingers: [4, 2, 1, 1, 0, 0],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
      {
        id: "C-minor-4",
        frets: [8, 10, 10, 8, 8, 8],
        fingers: [1, 3, 4, 1, 1, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "C-dim",
    root: "C",
    quality: "dim",
    displayName: "Cdim",
    positions: [
      {
        id: "C-dim-1",
        frets: [-1, 3, 1, -1, 1, 2],
        fingers: [0, 4, 1, 0, 2, 3],
        baseFret: 1,
        barres: [],
      },
      {
        id: "C-dim-2",
        frets: [-1, 3, 4, 5, 4, -1],
        fingers: [0, 1, 2, 4, 3, 0],
        baseFret: 3,
        barres: [],
      },
      {
        id: "C-dim-3",
        frets: [8, 6, -1, 8, 7, -1],
        fingers: [3, 1, 0, 4, 2, 0],
        baseFret: 6,
        barres: [],
      },
      {
        id: "C-dim-4",
        frets: [-1, -1, 10, 11, -1, 11],
        fingers: [0, 0, 1, 2, 0, 3],
        baseFret: 10,
        barres: [],
      },
    ],
  },
  {
    id: "C-sus2",
    root: "C",
    quality: "sus2",
    displayName: "Csus2",
    positions: [
      {
        id: "C-sus2-1",
        frets: [-1, 3, 0, 0, 1, 3],
        fingers: [0, 3, 0, 0, 1, 4],
        baseFret: 1,
        barres: [],
      },
      {
        id: "C-sus2-2",
        frets: [-1, 3, 0, 0, 3, 3],
        fingers: [0, 1, 0, 0, 2, 3],
        baseFret: 1,
        barres: [],
      },
      {
        id: "C-sus2-3",
        frets: [3, 3, 5, 5, 3, 3],
        fingers: [1, 1, 3, 4, 1, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C-sus2-4",
        frets: [8, -1, 0, 7, 8, 8],
        fingers: [2, 0, 0, 1, 3, 4],
        baseFret: 7,
        barres: [],
      },
    ],
  },
  {
    id: "C-sus4",
    root: "C",
    quality: "sus4",
    displayName: "Csus4",
    positions: [
      {
        id: "C-sus4-1",
        frets: [-1, 3, 3, 0, 1, 1],
        fingers: [0, 3, 4, 0, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 4,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C-sus4-2",
        frets: [3, 3, 5, 5, 6, 3],
        fingers: [1, 1, 2, 3, 4, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C-sus4-3",
        frets: [8, 8, -1, 0, 6, 8],
        fingers: [2, 3, 0, 0, 1, 4],
        baseFret: 6,
        barres: [],
      },
      {
        id: "C-sus4-4",
        frets: [8, 10, 10, 10, 8, 8],
        fingers: [1, 2, 3, 4, 1, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "C-5",
    root: "C",
    quality: "5",
    displayName: "C5",
    positions: [
      {
        id: "C-5-1",
        frets: [8, 10, -1, -1, -1, -1],
        fingers: [1, 3, 0, 0, 0, 0],
        baseFret: 8,
        barres: [],
      },
      {
        id: "C-5-2",
        frets: [-1, 3, 5, -1, -1, -1],
        fingers: [0, 1, 3, 0, 0, 0],
        baseFret: 3,
        barres: [],
      },
      {
        id: "C-5-3",
        frets: [8, 10, 10, -1, -1, -1],
        fingers: [1, 3, 4, 0, 0, 0],
        baseFret: 8,
        barres: [],
      },
    ],
  },
  {
    id: "C-7",
    root: "C",
    quality: "7",
    displayName: "C7",
    positions: [
      {
        id: "C-7-1",
        frets: [-1, 3, 2, 3, 1, 0],
        fingers: [0, 3, 2, 4, 1, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "C-7-2",
        frets: [-1, 3, 5, 3, 5, 3],
        fingers: [0, 1, 3, 1, 4, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C-7-3",
        frets: [-1, -1, 5, 5, 5, 6],
        fingers: [0, 0, 1, 1, 1, 2],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "C-7-4",
        frets: [8, 10, 8, 9, 8, 8],
        fingers: [1, 3, 1, 2, 1, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "C-maj7",
    root: "C",
    quality: "maj7",
    displayName: "Cmaj7",
    positions: [
      {
        id: "C-maj7-1",
        frets: [3, 3, 2, 0, 0, 0],
        fingers: [2, 3, 1, 0, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "C-maj7-2",
        frets: [3, 3, 5, 4, 5, 3],
        fingers: [1, 1, 3, 2, 4, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C-maj7-3",
        frets: [-1, -1, 5, 5, 5, 7],
        fingers: [0, 0, 1, 1, 1, 4],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "C-maj7-4",
        frets: [-1, -1, 10, 12, 12, 12],
        fingers: [0, 0, 1, 3, 3, 3],
        baseFret: 10,
        barres: [
          {
            fret: 12,
            fromString: 3,
            toString: 5,
            finger: 3,
          },
        ],
      },
    ],
  },
  {
    id: "C-m7",
    root: "C",
    quality: "m7",
    displayName: "Cm7",
    positions: [
      {
        id: "C-m7-1",
        frets: [8, -1, 8, 8, 8, -1],
        fingers: [2, 0, 3, 3, 3, 0],
        baseFret: 8,
        barres: [],
      },
      {
        id: "C-m7-2",
        frets: [-1, 3, 1, 3, 4, -1],
        fingers: [0, 2, 1, 3, 4, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "C-m7-3",
        frets: [3, 3, 5, 3, 4, 3],
        fingers: [1, 1, 3, 1, 2, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C-m7-4",
        frets: [-1, -1, 5, 5, 4, 6],
        fingers: [0, 0, 2, 3, 1, 4],
        baseFret: 4,
        barres: [],
      },
      {
        id: "C-m7-5",
        frets: [8, 10, 8, 8, 8, 8],
        fingers: [1, 3, 1, 1, 1, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "C#-major",
    root: "C#",
    quality: "major",
    displayName: "C#",
    positions: [
      {
        id: "C#-major-1",
        frets: [-1, 4, 3, 1, 2, 1],
        fingers: [0, 4, 3, 1, 2, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 3,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-major-2",
        frets: [4, 4, 6, 6, 6, 4],
        fingers: [1, 1, 2, 3, 4, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-major-3",
        frets: [9, 8, 6, 6, 6, 9],
        fingers: [3, 2, 1, 1, 1, 4],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-major-4",
        frets: [9, 11, 11, 10, 9, 9],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "C#-minor",
    root: "C#",
    quality: "minor",
    displayName: "C#m",
    positions: [
      {
        id: "C#-minor-1",
        frets: [-1, 4, 2, 1, 2, -1],
        fingers: [0, 4, 2, 1, 3, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "C#-minor-2",
        frets: [4, 4, 6, 6, 5, 4],
        fingers: [1, 1, 3, 4, 2, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-minor-3",
        frets: [9, 7, 6, 6, -1, 9],
        fingers: [3, 2, 1, 1, 0, 4],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-minor-4",
        frets: [9, 11, 11, 9, 9, 9],
        fingers: [1, 3, 4, 1, 1, 1],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "C#-dim",
    root: "C#",
    quality: "dim",
    displayName: "C#dim",
    positions: [
      {
        id: "C#-dim-1",
        frets: [-1, 4, 2, -1, 2, 3],
        fingers: [0, 4, 1, 0, 2, 3],
        baseFret: 1,
        barres: [],
      },
      {
        id: "C#-dim-2",
        frets: [-1, 4, 5, 6, 5, -1],
        fingers: [0, 1, 2, 4, 3, 0],
        baseFret: 4,
        barres: [],
      },
      {
        id: "C#-dim-3",
        frets: [9, 7, -1, 9, 8, -1],
        fingers: [3, 1, 0, 4, 2, 0],
        baseFret: 7,
        barres: [],
      },
      {
        id: "C#-dim-4",
        frets: [-1, -1, 11, 12, -1, 12],
        fingers: [0, 0, 1, 2, 0, 3],
        baseFret: 11,
        barres: [],
      },
    ],
  },
  {
    id: "C#-sus2",
    root: "C#",
    quality: "sus2",
    displayName: "C#sus2",
    positions: [
      {
        id: "C#-sus2-1",
        frets: [4, 4, 6, 6, 4, 4],
        fingers: [1, 1, 3, 4, 1, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-sus2-4",
        frets: [11, 11, 11, 13, 14, 11],
        fingers: [1, 1, 1, 3, 4, 1],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "C#-sus4",
    root: "C#",
    quality: "sus4",
    displayName: "C#sus4",
    positions: [
      {
        id: "C#-sus4-1",
        frets: [-1, 4, 4, 1, 2, -1],
        fingers: [0, 3, 4, 1, 2, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "C#-sus4-2",
        frets: [4, 4, 6, 6, 7, 4],
        fingers: [1, 1, 2, 3, 4, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-sus4-4",
        frets: [9, 11, 11, 11, 9, 9],
        fingers: [1, 2, 3, 4, 1, 1],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "C#-5",
    root: "C#",
    quality: "5",
    displayName: "C#5",
    positions: [
      {
        id: "C#-5-1",
        frets: [9, 11, -1, -1, -1, -1],
        fingers: [1, 3, 0, 0, 0, 0],
        baseFret: 9,
        barres: [],
      },
      {
        id: "C#-5-2",
        frets: [-1, 4, 6, -1, -1, -1],
        fingers: [0, 1, 3, 0, 0, 0],
        baseFret: 4,
        barres: [],
      },
      {
        id: "C#-5-3",
        frets: [9, 11, 11, -1, -1, -1],
        fingers: [1, 3, 4, 0, 0, 0],
        baseFret: 9,
        barres: [],
      },
    ],
  },
  {
    id: "C#-7",
    root: "C#",
    quality: "7",
    displayName: "C#7",
    positions: [
      {
        id: "C#-7-1",
        frets: [-1, 4, 3, 4, 2, -1],
        fingers: [0, 3, 2, 4, 1, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "C#-7-2",
        frets: [-1, 4, 6, 4, 6, 4],
        fingers: [0, 1, 3, 1, 4, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-7-3",
        frets: [9, 8, 6, 6, 6, 7],
        fingers: [4, 3, 1, 1, 1, 2],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-7-4",
        frets: [9, 11, 9, 10, 9, 9],
        fingers: [1, 3, 1, 2, 1, 1],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "C#-maj7",
    root: "C#",
    quality: "maj7",
    displayName: "C#maj7",
    positions: [
      {
        id: "C#-maj7-1",
        frets: [-1, 4, 3, 1, 1, 1],
        fingers: [0, 4, 3, 1, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 3,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-maj7-2",
        frets: [4, 4, 6, 5, 6, 4],
        fingers: [1, 1, 3, 2, 4, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-maj7-3",
        frets: [-1, -1, -1, 6, 6, 8],
        fingers: [0, 0, 0, 1, 1, 3],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 3,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-maj7-4",
        frets: [9, -1, 10, 10, 9, -1],
        fingers: [1, 0, 3, 4, 2, 0],
        baseFret: 9,
        barres: [],
      },
    ],
  },
  {
    id: "C#-m7",
    root: "C#",
    quality: "m7",
    displayName: "C#m7",
    positions: [
      {
        id: "C#-m7-1",
        frets: [9, -1, 9, 9, 9, -1],
        fingers: [2, 0, 3, 3, 3, 0],
        baseFret: 9,
        barres: [],
      },
      {
        id: "C#-m7-2",
        frets: [-1, 4, 6, 4, 5, 4],
        fingers: [0, 1, 3, 1, 2, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-m7-3",
        frets: [-1, -1, 6, 6, 5, 7],
        fingers: [0, 0, 2, 3, 1, 4],
        baseFret: 5,
        barres: [],
      },
      {
        id: "C#-m7-4",
        frets: [9, 11, 9, 9, 9, 9],
        fingers: [1, 4, 1, 1, 1, 1],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "C#-m7-5",
        frets: [-1, -1, 11, 13, 12, 12],
        fingers: [0, 0, 1, 4, 2, 3],
        baseFret: 11,
        barres: [],
      },
    ],
  },
  {
    id: "D-major",
    root: "D",
    quality: "major",
    displayName: "D",
    positions: [
      {
        id: "D-major-1",
        frets: [-1, -1, 0, 2, 3, 2],
        fingers: [0, 0, 0, 1, 3, 2],
        baseFret: 1,
        barres: [],
      },
      {
        id: "D-major-2",
        frets: [-1, 5, 4, 2, 3, 2],
        fingers: [0, 4, 3, 1, 2, 1],
        baseFret: 2,
        barres: [
          {
            fret: 2,
            fromString: 3,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "D-major-3",
        frets: [-1, 5, 7, 7, 7, 5],
        fingers: [0, 1, 2, 3, 4, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "D-major-4",
        frets: [10, 12, 12, 11, 10, 10],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "D-minor",
    root: "D",
    quality: "minor",
    displayName: "Dm",
    positions: [
      {
        id: "D-minor-1",
        frets: [-1, -1, 0, 2, 3, 1],
        fingers: [0, 0, 0, 2, 3, 1],
        baseFret: 1,
        barres: [],
      },
      {
        id: "D-minor-2",
        frets: [5, 5, 7, 7, 6, 5],
        fingers: [1, 1, 3, 4, 2, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "D-minor-3",
        frets: [-1, 8, 7, 7, 6, -1],
        fingers: [0, 4, 2, 3, 1, 0],
        baseFret: 6,
        barres: [],
      },
      {
        id: "D-minor-4",
        frets: [10, 12, 12, 10, 10, 10],
        fingers: [1, 3, 4, 1, 1, 1],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "D-dim",
    root: "D",
    quality: "dim",
    displayName: "Ddim",
    positions: [
      {
        id: "D-dim-1",
        frets: [-1, -1, 0, 1, -1, 1],
        fingers: [0, 0, 0, 1, 0, 2],
        baseFret: 1,
        barres: [],
      },
      {
        id: "D-dim-2",
        frets: [-1, 5, 3, -1, 3, 4],
        fingers: [0, 4, 1, 0, 2, 3],
        baseFret: 3,
        barres: [],
      },
      {
        id: "D-dim-3",
        frets: [-1, 5, 6, 7, 6, -1],
        fingers: [0, 1, 2, 4, 3, 0],
        baseFret: 5,
        barres: [],
      },
      {
        id: "D-dim-4",
        frets: [10, 8, -1, 10, 9, -1],
        fingers: [3, 1, 0, 4, 2, 0],
        baseFret: 8,
        barres: [],
      },
    ],
  },
  {
    id: "D-sus2",
    root: "D",
    quality: "sus2",
    displayName: "Dsus2",
    positions: [
      {
        id: "D-sus2-1",
        frets: [-1, -1, 0, 2, 3, 0],
        fingers: [0, 0, 0, 2, 3, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "D-sus2-2",
        frets: [-1, -1, 2, 2, 3, 5],
        fingers: [0, 0, 1, 1, 2, 4],
        baseFret: 2,
        barres: [
          {
            fret: 2,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
      {
        id: "D-sus2-3",
        frets: [5, 5, 7, 7, 5, 5],
        fingers: [1, 1, 3, 4, 1, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "D-sus2-4",
        frets: [-1, 7, 7, 7, 10, 10],
        fingers: [0, 1, 1, 1, 4, 4],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 1,
            toString: 3,
            finger: 1,
          },
          {
            fret: 10,
            fromString: 4,
            toString: 5,
            finger: 4,
          },
        ],
      },
    ],
  },
  {
    id: "D-sus4",
    root: "D",
    quality: "sus4",
    displayName: "Dsus4",
    positions: [
      {
        id: "D-sus4-1",
        frets: [-1, -1, 0, 2, 3, 3],
        fingers: [0, 0, 0, 1, 2, 3],
        baseFret: 1,
        barres: [],
      },
      {
        id: "D-sus4-2",
        frets: [-1, 5, 0, 0, 3, 5],
        fingers: [0, 3, 0, 0, 1, 4],
        baseFret: 3,
        barres: [],
      },
      {
        id: "D-sus4-3",
        frets: [5, 5, 7, 7, 8, 5],
        fingers: [1, 1, 2, 3, 4, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "D-sus4-4",
        frets: [10, 12, 12, 12, 10, 10],
        fingers: [1, 2, 3, 4, 1, 1],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "D-5",
    root: "D",
    quality: "5",
    displayName: "D5",
    positions: [
      {
        id: "D-5-1",
        frets: [10, 12, -1, -1, -1, -1],
        fingers: [1, 3, 0, 0, 0, 0],
        baseFret: 10,
        barres: [],
      },
      {
        id: "D-5-2",
        frets: [-1, 5, 7, -1, -1, -1],
        fingers: [0, 1, 3, 0, 0, 0],
        baseFret: 5,
        barres: [],
      },
      {
        id: "D-5-3",
        frets: [10, 12, 12, -1, -1, -1],
        fingers: [1, 3, 4, 0, 0, 0],
        baseFret: 10,
        barres: [],
      },
    ],
  },
  {
    id: "D-7",
    root: "D",
    quality: "7",
    displayName: "D7",
    positions: [
      {
        id: "D-7-1",
        frets: [-1, -1, 0, 2, 1, 2],
        fingers: [0, 0, 0, 2, 1, 3],
        baseFret: 1,
        barres: [],
      },
      {
        id: "D-7-2",
        frets: [-1, 5, 4, 5, 3, -1],
        fingers: [0, 3, 2, 4, 1, 0],
        baseFret: 3,
        barres: [],
      },
      {
        id: "D-7-3",
        frets: [5, 5, 7, 5, 7, 5],
        fingers: [1, 1, 3, 1, 4, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "D-7-4",
        frets: [10, 12, 10, 11, 10, 10],
        fingers: [1, 3, 1, 2, 1, 1],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "D-maj7",
    root: "D",
    quality: "maj7",
    displayName: "Dmaj7",
    positions: [
      {
        id: "D-maj7-1",
        frets: [-1, -1, 0, 2, 2, 2],
        fingers: [0, 0, 0, 1, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 3,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "D-maj7-2",
        frets: [-1, 5, 4, 2, 2, 2],
        fingers: [0, 4, 3, 1, 1, 1],
        baseFret: 2,
        barres: [
          {
            fret: 2,
            fromString: 3,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "D-maj7-3",
        frets: [5, 5, 7, 6, 7, 5],
        fingers: [1, 1, 3, 2, 4, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "D-maj7-4",
        frets: [-1, -1, 7, 7, 7, 9],
        fingers: [0, 0, 1, 1, 1, 4],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "D-m7",
    root: "D",
    quality: "m7",
    displayName: "Dm7",
    positions: [
      {
        id: "D-m7-1",
        frets: [10, -1, 10, 10, 10, -1],
        fingers: [2, 0, 3, 3, 3, 0],
        baseFret: 10,
        barres: [],
      },
      {
        id: "D-m7-2",
        frets: [-1, -1, 0, 2, 1, 1],
        fingers: [0, 0, 0, 2, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 4,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "D-m7-3",
        frets: [-1, 5, 7, 5, 6, 5],
        fingers: [0, 1, 3, 1, 2, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "D-m7-4",
        frets: [-1, -1, 7, 7, 6, 8],
        fingers: [0, 0, 2, 3, 1, 4],
        baseFret: 6,
        barres: [],
      },
      {
        id: "D-m7-5",
        frets: [10, 12, 10, 10, 10, 10],
        fingers: [1, 3, 1, 1, 1, 1],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Eb-major",
    root: "Eb",
    quality: "major",
    displayName: "Eb",
    positions: [
      {
        id: "Eb-major-1",
        frets: [-1, -1, 1, 3, 4, 3],
        fingers: [0, 0, 1, 2, 4, 3],
        baseFret: 1,
        barres: [],
      },
      {
        id: "Eb-major-2",
        frets: [-1, 6, 5, 3, 4, 3],
        fingers: [0, 4, 3, 1, 2, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 3,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Eb-major-3",
        frets: [-1, 6, 8, 8, 8, 6],
        fingers: [0, 1, 2, 3, 4, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Eb-major-4",
        frets: [-1, -1, 8, 8, 8, 11],
        fingers: [0, 0, 1, 1, 1, 4],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Eb-minor",
    root: "Eb",
    quality: "minor",
    displayName: "Ebm",
    positions: [
      {
        id: "Eb-minor-1",
        frets: [-1, -1, 1, 3, 4, 2],
        fingers: [0, 0, 1, 3, 4, 2],
        baseFret: 1,
        barres: [],
      },
      {
        id: "Eb-minor-2",
        frets: [-1, -1, 4, 3, 4, 2],
        fingers: [0, 0, 3, 2, 4, 1],
        baseFret: 1,
        barres: [],
      },
      {
        id: "Eb-minor-3",
        frets: [6, 6, 8, 8, 7, 6],
        fingers: [1, 1, 3, 4, 2, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Eb-minor-4",
        frets: [11, 13, 13, 11, 11, 11],
        fingers: [1, 3, 4, 1, 1, 1],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Eb-dim",
    root: "Eb",
    quality: "dim",
    displayName: "Ebdim",
    positions: [
      {
        id: "Eb-dim-1",
        frets: [-1, -1, 1, 2, -1, 2],
        fingers: [0, 0, 1, 2, 0, 3],
        baseFret: 1,
        barres: [],
      },
      {
        id: "Eb-dim-2",
        frets: [-1, 6, 4, -1, 4, 5],
        fingers: [0, 4, 1, 0, 2, 3],
        baseFret: 4,
        barres: [],
      },
      {
        id: "Eb-dim-3",
        frets: [-1, 6, 7, 8, 7, -1],
        fingers: [0, 1, 2, 4, 3, 0],
        baseFret: 6,
        barres: [],
      },
      {
        id: "Eb-dim-4",
        frets: [11, 9, -1, 11, 10, -1],
        fingers: [3, 1, 0, 4, 2, 0],
        baseFret: 9,
        barres: [],
      },
    ],
  },
  {
    id: "Eb-sus2",
    root: "Eb",
    quality: "sus2",
    displayName: "Ebsus2",
    positions: [
      {
        id: "Eb-sus2-1",
        frets: [1, 1, 1, 3, 4, 1],
        fingers: [1, 1, 1, 3, 4, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Eb-sus2-2",
        frets: [6, 6, 8, 8, 6, 6],
        fingers: [1, 1, 3, 4, 1, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Eb-sus2-3",
        frets: [11, 8, 8, 10, 11, -1],
        fingers: [3, 1, 1, 2, 4, 0],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Eb-sus4",
    root: "Eb",
    quality: "sus4",
    displayName: "Ebsus4",
    positions: [
      {
        id: "Eb-sus4-1",
        frets: [-1, -1, 1, 3, 4, 4],
        fingers: [0, 0, 1, 2, 3, 4],
        baseFret: 1,
        barres: [],
      },
      {
        id: "Eb-sus4-2",
        frets: [6, 6, 8, 8, 9, 6],
        fingers: [1, 1, 2, 3, 4, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Eb-sus4-3",
        frets: [-1, -1, 8, 8, 9, -1],
        fingers: [0, 0, 1, 1, 2, 0],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
      {
        id: "Eb-sus4-4",
        frets: [11, 13, 13, 13, 11, 11],
        fingers: [1, 2, 3, 4, 1, 1],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Eb-5",
    root: "Eb",
    quality: "5",
    displayName: "Eb5",
    positions: [
      {
        id: "Eb-5-1",
        frets: [11, 13, -1, -1, -1, -1],
        fingers: [1, 3, 0, 0, 0, 0],
        baseFret: 11,
        barres: [],
      },
      {
        id: "Eb-5-2",
        frets: [-1, 6, 8, -1, -1, -1],
        fingers: [0, 1, 3, 0, 0, 0],
        baseFret: 6,
        barres: [],
      },
      {
        id: "Eb-5-3",
        frets: [11, 13, 13, -1, -1, -1],
        fingers: [1, 3, 4, 0, 0, 0],
        baseFret: 11,
        barres: [],
      },
    ],
  },
  {
    id: "Eb-7",
    root: "Eb",
    quality: "7",
    displayName: "Eb7",
    positions: [
      {
        id: "Eb-7-1",
        frets: [-1, -1, 1, 3, 2, 3],
        fingers: [0, 0, 1, 3, 2, 4],
        baseFret: 1,
        barres: [],
      },
      {
        id: "Eb-7-2",
        frets: [-1, 6, 8, 6, 8, 6],
        fingers: [0, 1, 3, 1, 4, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Eb-7-3",
        frets: [-1, -1, 8, 8, 8, 9],
        fingers: [0, 0, 1, 1, 1, 2],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "Eb-7-4",
        frets: [11, 13, 11, 12, 11, 11],
        fingers: [1, 3, 1, 2, 1, 1],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Eb-maj7",
    root: "Eb",
    quality: "maj7",
    displayName: "Ebmaj7",
    positions: [
      {
        id: "Eb-maj7-1",
        frets: [-1, 1, 1, 3, 3, 3],
        fingers: [0, 1, 1, 3, 3, 3],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
          {
            fret: 3,
            fromString: 3,
            toString: 5,
            finger: 3,
          },
        ],
      },
      {
        id: "Eb-maj7-2",
        frets: [-1, 6, 5, 3, 3, 3],
        fingers: [0, 4, 3, 1, 1, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 3,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Eb-maj7-3",
        frets: [6, 6, 8, 7, 8, 6],
        fingers: [1, 1, 3, 2, 4, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Eb-maj7-4",
        frets: [-1, -1, 8, 8, 8, 10],
        fingers: [0, 0, 1, 1, 1, 4],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Eb-m7",
    root: "Eb",
    quality: "m7",
    displayName: "Ebm7",
    positions: [
      {
        id: "Eb-m7-1",
        frets: [11, -1, 11, 11, 11, -1],
        fingers: [2, 0, 3, 3, 3, 0],
        baseFret: 11,
        barres: [],
      },
      {
        id: "Eb-m7-2",
        frets: [-1, -1, 1, 3, 2, 2],
        fingers: [0, 0, 1, 4, 2, 3],
        baseFret: 1,
        barres: [],
      },
      {
        id: "Eb-m7-3",
        frets: [6, 6, 8, 6, 7, 6],
        fingers: [1, 1, 3, 1, 2, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Eb-m7-4",
        frets: [-1, -1, 8, 8, 7, 9],
        fingers: [0, 0, 2, 3, 1, 4],
        baseFret: 7,
        barres: [],
      },
      {
        id: "Eb-m7-5",
        frets: [11, 13, 11, 11, 11, 11],
        fingers: [1, 4, 1, 1, 1, 1],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "E-major",
    root: "E",
    quality: "major",
    displayName: "E",
    positions: [
      {
        id: "E-major-1",
        frets: [0, 2, 2, 1, 0, 0],
        fingers: [0, 2, 3, 1, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "E-major-2",
        frets: [-1, -1, 2, 4, 5, 4],
        fingers: [0, 0, 1, 2, 4, 3],
        baseFret: 2,
        barres: [],
      },
      {
        id: "E-major-3",
        frets: [-1, 7, 6, 4, 5, 4],
        fingers: [0, 4, 3, 1, 2, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 3,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "E-major-4",
        frets: [-1, 7, 9, 9, 9, 7],
        fingers: [0, 1, 2, 3, 4, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "E-minor",
    root: "E",
    quality: "minor",
    displayName: "Em",
    positions: [
      {
        id: "E-minor-1",
        frets: [0, 2, 2, 0, 0, 0],
        fingers: [0, 2, 3, 0, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "E-minor-2",
        frets: [0, 2, 2, 4, 5, 3],
        fingers: [0, 1, 1, 3, 4, 2],
        baseFret: 2,
        barres: [
          {
            fret: 2,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "E-minor-3",
        frets: [-1, 7, 9, 9, 8, 7],
        fingers: [0, 1, 3, 4, 2, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "E-minor-4",
        frets: [12, 10, 9, 9, -1, -1],
        fingers: [4, 3, 1, 2, 0, 0],
        baseFret: 9,
        barres: [],
      },
    ],
  },
  {
    id: "E-dim",
    root: "E",
    quality: "dim",
    displayName: "Edim",
    positions: [
      {
        id: "E-dim-1",
        frets: [-1, -1, 2, 3, -1, 3],
        fingers: [0, 0, 1, 2, 0, 3],
        baseFret: 1,
        barres: [],
      },
      {
        id: "E-dim-2",
        frets: [-1, 7, 5, -1, 5, 6],
        fingers: [0, 4, 1, 0, 2, 3],
        baseFret: 5,
        barres: [],
      },
      {
        id: "E-dim-3",
        frets: [-1, 7, 8, 9, 8, -1],
        fingers: [0, 1, 2, 4, 3, 0],
        baseFret: 7,
        barres: [],
      },
      {
        id: "E-dim-4",
        frets: [12, 10, -1, 12, 11, -1],
        fingers: [3, 1, 0, 4, 2, 0],
        baseFret: 10,
        barres: [],
      },
    ],
  },
  {
    id: "E-sus2",
    root: "E",
    quality: "sus2",
    displayName: "Esus2",
    positions: [
      {
        id: "E-sus2-1",
        frets: [2, 2, 2, 4, 5, 2],
        fingers: [1, 1, 1, 3, 4, 1],
        baseFret: 2,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "E-sus2-2",
        frets: [0, 7, 9, 9, 7, 7],
        fingers: [0, 1, 3, 4, 1, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "E-sus2-3",
        frets: [0, 9, 9, 9, 0, 0],
        fingers: [0, 1, 2, 3, 0, 0],
        baseFret: 9,
        barres: [],
      },
    ],
  },
  {
    id: "E-sus4",
    root: "E",
    quality: "sus4",
    displayName: "Esus4",
    positions: [
      {
        id: "E-sus4-1",
        frets: [0, 2, 2, 2, 0, 0],
        fingers: [0, 2, 3, 4, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "E-sus4-2",
        frets: [0, 2, 2, 4, 5, 5],
        fingers: [0, 1, 1, 2, 3, 4],
        baseFret: 2,
        barres: [
          {
            fret: 2,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "E-sus4-3",
        frets: [7, 7, 9, 9, 10, 7],
        fingers: [1, 1, 2, 3, 4, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "E-sus4-4",
        frets: [-1, -1, 9, 9, 10, 0],
        fingers: [0, 0, 1, 1, 2, 0],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "E-5",
    root: "E",
    quality: "5",
    displayName: "E5",
    positions: [
      {
        id: "E-5-1",
        frets: [12, 14, -1, -1, -1, -1],
        fingers: [1, 3, 0, 0, 0, 0],
        baseFret: 12,
        barres: [],
      },
      {
        id: "E-5-2",
        frets: [-1, 7, 9, -1, -1, -1],
        fingers: [0, 1, 3, 0, 0, 0],
        baseFret: 7,
        barres: [],
      },
      {
        id: "E-5-3",
        frets: [12, 14, 14, -1, -1, -1],
        fingers: [1, 3, 4, 0, 0, 0],
        baseFret: 12,
        barres: [],
      },
      {
        id: "E-5-4",
        frets: [0, 2, 2, -1, -1, -1],
        fingers: [0, 2, 3, 0, 0, 0],
        baseFret: 1,
        barres: [],
      },
    ],
  },
  {
    id: "E-7",
    root: "E",
    quality: "7",
    displayName: "E7",
    positions: [
      {
        id: "E-7-1",
        frets: [0, 2, 0, 1, 0, 0],
        fingers: [0, 2, 0, 1, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "E-7-2",
        frets: [-1, 7, 6, 7, 5, -1],
        fingers: [0, 3, 2, 4, 1, 0],
        baseFret: 5,
        barres: [],
      },
      {
        id: "E-7-3",
        frets: [7, 7, 9, 7, 9, 7],
        fingers: [1, 1, 3, 1, 4, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "E-7-4",
        frets: [-1, -1, 9, 9, 9, 10],
        fingers: [0, 0, 1, 1, 1, 2],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "E-maj7",
    root: "E",
    quality: "maj7",
    displayName: "Emaj7",
    positions: [
      {
        id: "E-maj7-1",
        frets: [0, 2, 1, 1, 0, 0],
        fingers: [0, 3, 1, 2, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "E-maj7-2",
        frets: [-1, -1, 2, 4, 4, 4],
        fingers: [0, 0, 1, 3, 3, 3],
        baseFret: 1,
        barres: [
          {
            fret: 4,
            fromString: 3,
            toString: 5,
            finger: 3,
          },
        ],
      },
      {
        id: "E-maj7-3",
        frets: [-1, 7, 6, 4, 4, 4],
        fingers: [0, 4, 3, 1, 1, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 3,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "E-maj7-4",
        frets: [7, 7, 9, 8, 9, 7],
        fingers: [1, 1, 3, 2, 4, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "E-m7",
    root: "E",
    quality: "m7",
    displayName: "Em7",
    positions: [
      {
        id: "E-m7-2",
        frets: [12, -1, 12, 12, 12, -1],
        fingers: [2, 0, 3, 3, 3, 0],
        baseFret: 12,
        barres: [],
      },
      {
        id: "E-m7-3",
        frets: [0, 2, 2, 0, 3, 0],
        fingers: [0, 2, 3, 0, 4, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "E-m7-4",
        frets: [0, 2, 0, 0, 0, 0],
        fingers: [0, 2, 0, 0, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "E-m7-5",
        frets: [0, 2, 2, 4, 3, 3],
        fingers: [0, 1, 1, 4, 2, 3],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "E-m7-6",
        frets: [7, 7, 9, 7, 8, 7],
        fingers: [1, 1, 3, 1, 2, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "E-m7-7",
        frets: [-1, -1, 9, 9, 8, 10],
        fingers: [0, 0, 2, 3, 1, 4],
        baseFret: 8,
        barres: [],
      },
    ],
  },
  {
    id: "F-major",
    root: "F",
    quality: "major",
    displayName: "F",
    positions: [
      {
        id: "F-major-1",
        frets: [1, 3, 3, 2, 1, 1],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F-major-3",
        frets: [-1, -1, 3, 5, 6, 5],
        fingers: [0, 0, 1, 2, 4, 3],
        baseFret: 3,
        barres: [],
      },
      {
        id: "F-major-4",
        frets: [-1, 8, 7, 5, 6, 5],
        fingers: [0, 4, 3, 1, 2, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 3,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F-major-5",
        frets: [-1, 8, 10, 10, 10, 8],
        fingers: [0, 1, 2, 3, 4, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "F-minor",
    root: "F",
    quality: "minor",
    displayName: "Fm",
    positions: [
      {
        id: "F-minor-1",
        frets: [1, 3, 3, 1, 1, 1],
        fingers: [1, 3, 4, 1, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F-minor-2",
        frets: [-1, -1, 3, 5, 6, 4],
        fingers: [0, 0, 1, 3, 4, 2],
        baseFret: 3,
        barres: [],
      },
      {
        id: "F-minor-3",
        frets: [-1, 8, 10, 10, 9, 8],
        fingers: [0, 1, 3, 4, 2, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F-minor-4",
        frets: [13, 11, 10, 10, -1, -1],
        fingers: [4, 2, 1, 1, 0, 0],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "F-dim",
    root: "F",
    quality: "dim",
    displayName: "Fdim",
    positions: [
      {
        id: "F-dim-1",
        frets: [-1, -1, 3, 4, -1, 4],
        fingers: [0, 0, 1, 2, 0, 3],
        baseFret: 1,
        barres: [],
      },
      {
        id: "F-dim-2",
        frets: [-1, 8, 6, -1, 6, 7],
        fingers: [0, 4, 1, 0, 2, 3],
        baseFret: 6,
        barres: [],
      },
      {
        id: "F-dim-3",
        frets: [-1, 8, 9, 10, 9, -1],
        fingers: [0, 1, 2, 4, 3, 0],
        baseFret: 8,
        barres: [],
      },
      {
        id: "F-dim-4",
        frets: [13, 11, -1, 13, 12, -1],
        fingers: [3, 1, 0, 4, 2, 0],
        baseFret: 11,
        barres: [],
      },
    ],
  },
  {
    id: "F-sus2",
    root: "F",
    quality: "sus2",
    displayName: "Fsus2",
    positions: [
      {
        id: "F-sus2-2",
        frets: [3, 3, 3, 5, 6, 3],
        fingers: [1, 1, 1, 3, 4, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F-sus2-3",
        frets: [8, 8, 10, 10, 8, 8],
        fingers: [1, 1, 3, 4, 1, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F-sus2-4",
        frets: [13, 10, 10, 12, 13, -1],
        fingers: [3, 1, 1, 2, 4, 0],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "F-sus4",
    root: "F",
    quality: "sus4",
    displayName: "Fsus4",
    positions: [
      {
        id: "F-sus4-1",
        frets: [1, 3, 3, 3, 1, 1],
        fingers: [1, 2, 3, 4, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F-sus4-2",
        frets: [-1, -1, 3, 5, 6, 6],
        fingers: [0, 0, 1, 2, 3, 4],
        baseFret: 3,
        barres: [],
      },
      {
        id: "F-sus4-3",
        frets: [8, 8, 10, 10, 11, 8],
        fingers: [1, 1, 2, 3, 4, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F-sus4-4",
        frets: [-1, -1, 10, 10, 11, -1],
        fingers: [0, 0, 1, 1, 2, 0],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "F-5",
    root: "F",
    quality: "5",
    displayName: "F5",
    positions: [
      {
        id: "F-5-1",
        frets: [1, 3, -1, -1, -1, -1],
        fingers: [1, 3, 0, 0, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "F-5-2",
        frets: [-1, 8, 10, -1, -1, -1],
        fingers: [0, 1, 3, 0, 0, 0],
        baseFret: 8,
        barres: [],
      },
      {
        id: "F-5-3",
        frets: [1, 3, 3, -1, -1, -1],
        fingers: [1, 3, 4, 0, 0, 0],
        baseFret: 1,
        barres: [],
      },
    ],
  },
  {
    id: "F-7",
    root: "F",
    quality: "7",
    displayName: "F7",
    positions: [
      {
        id: "F-7-1",
        frets: [1, 3, 1, 2, 1, 1],
        fingers: [1, 3, 1, 2, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F-7-2",
        frets: [-1, 3, 3, 5, 4, 5],
        fingers: [0, 1, 1, 3, 2, 4],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "F-7-3",
        frets: [8, 8, 10, 8, 10, 8],
        fingers: [1, 1, 3, 1, 4, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F-7-4",
        frets: [-1, -1, 10, 10, 10, 11],
        fingers: [0, 0, 1, 1, 1, 2],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "F-maj7",
    root: "F",
    quality: "maj7",
    displayName: "Fmaj7",
    positions: [
      {
        id: "F-maj7-1",
        frets: [-1, -1, 3, 2, 1, 0],
        fingers: [0, 0, 3, 2, 1, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "F-maj7-2",
        frets: [1, 3, 2, 2, 1, 1],
        fingers: [1, 4, 2, 3, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F-maj7-3",
        frets: [-1, 3, 3, 5, 5, 5],
        fingers: [0, 1, 1, 3, 3, 3],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "F-maj7-4",
        frets: [8, 8, 10, 9, 10, 8],
        fingers: [1, 1, 3, 2, 4, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "F-m7",
    root: "F",
    quality: "m7",
    displayName: "Fm7",
    positions: [
      {
        id: "F-m7-1",
        frets: [1, -1, 1, 1, 1, -1],
        fingers: [2, 0, 3, 3, 3, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "F-m7-2",
        frets: [13, -1, 13, 13, 13, -1],
        fingers: [2, 0, 3, 3, 3, 0],
        baseFret: 13,
        barres: [],
      },
      {
        id: "F-m7-3",
        frets: [1, 3, 1, 1, 1, 1],
        fingers: [1, 3, 1, 1, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F-m7-4",
        frets: [-1, -1, 3, 5, 4, 4],
        fingers: [0, 0, 1, 4, 2, 3],
        baseFret: 3,
        barres: [],
      },
      {
        id: "F-m7-5",
        frets: [8, 8, 10, 8, 9, 8],
        fingers: [1, 1, 3, 1, 2, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F-m7-6",
        frets: [-1, -1, 10, 10, 9, 11],
        fingers: [0, 0, 2, 3, 1, 4],
        baseFret: 9,
        barres: [],
      },
    ],
  },
  {
    id: "F#-major",
    root: "F#",
    quality: "major",
    displayName: "F#",
    positions: [
      {
        id: "F#-major-1",
        frets: [2, 4, 4, 3, 2, 2],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-major-2",
        frets: [-1, 4, 4, 6, 7, 6],
        fingers: [0, 1, 1, 2, 4, 3],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-major-3",
        frets: [6, 9, 8, 6, 7, 6],
        fingers: [1, 4, 3, 1, 2, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-major-4",
        frets: [9, 9, 11, 11, 11, 9],
        fingers: [1, 1, 2, 3, 4, 1],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "F#-minor",
    root: "F#",
    quality: "minor",
    displayName: "F#m",
    positions: [
      {
        id: "F#-minor-1",
        frets: [2, 4, 4, 2, 2, 2],
        fingers: [1, 3, 4, 1, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-minor-2",
        frets: [-1, 4, 4, 6, 7, 5],
        fingers: [0, 1, 1, 3, 4, 2],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-minor-3",
        frets: [-1, -1, 7, 6, 7, 5],
        fingers: [0, 0, 3, 2, 4, 1],
        baseFret: 5,
        barres: [],
      },
      {
        id: "F#-minor-4",
        frets: [9, 9, 11, 11, 10, 9],
        fingers: [1, 1, 3, 4, 2, 1],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "F#-dim",
    root: "F#",
    quality: "dim",
    displayName: "F#dim",
    positions: [
      {
        id: "F#-dim-1",
        frets: [2, 0, -1, 2, 1, -1],
        fingers: [2, 0, 0, 3, 1, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "F#-dim-2",
        frets: [-1, -1, 4, 5, -1, 5],
        fingers: [0, 0, 1, 2, 0, 3],
        baseFret: 4,
        barres: [],
      },
      {
        id: "F#-dim-3",
        frets: [-1, 9, 7, -1, 7, 8],
        fingers: [0, 4, 1, 0, 2, 3],
        baseFret: 7,
        barres: [],
      },
      {
        id: "F#-dim-4",
        frets: [-1, 9, 10, 11, 10, -1],
        fingers: [0, 1, 2, 4, 3, 0],
        baseFret: 9,
        barres: [],
      },
    ],
  },
  {
    id: "F#-sus2",
    root: "F#",
    quality: "sus2",
    displayName: "F#sus2",
    positions: [
      {
        id: "F#-sus2-1",
        frets: [2, -1, -1, 1, 2, 2],
        fingers: [2, 0, 0, 1, 3, 4],
        baseFret: 1,
        barres: [],
      },
      {
        id: "F#-sus2-2",
        frets: [4, 4, 4, 6, 7, 4],
        fingers: [1, 1, 1, 3, 4, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-sus2-3",
        frets: [9, 9, 11, 11, 9, 9],
        fingers: [1, 1, 3, 4, 1, 1],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-sus2-4",
        frets: [14, 11, 11, 13, 14, -1],
        fingers: [3, 1, 1, 2, 4, 0],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "F#-sus4",
    root: "F#",
    quality: "sus4",
    displayName: "F#sus4",
    positions: [
      {
        id: "F#-sus4-1",
        frets: [2, 4, 4, 4, 2, 2],
        fingers: [1, 2, 3, 4, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-sus4-2",
        frets: [-1, 4, 4, 6, 7, 7],
        fingers: [0, 1, 1, 2, 3, 4],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-sus4-3",
        frets: [9, 9, 11, 11, 12, 9],
        fingers: [1, 1, 2, 3, 4, 1],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-sus4-4",
        frets: [-1, -1, 11, 11, 12, 14],
        fingers: [0, 0, 1, 1, 2, 4],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "F#-5",
    root: "F#",
    quality: "5",
    displayName: "F#5",
    positions: [
      {
        id: "F#-5-1",
        frets: [2, 4, -1, -1, -1, -1],
        fingers: [1, 3, 0, 0, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "F#-5-2",
        frets: [-1, 9, 11, -1, -1, -1],
        fingers: [0, 1, 3, 0, 0, 0],
        baseFret: 9,
        barres: [],
      },
      {
        id: "F#-5-3",
        frets: [2, 4, 4, -1, -1, -1],
        fingers: [1, 3, 4, 0, 0, 0],
        baseFret: 1,
        barres: [],
      },
    ],
  },
  {
    id: "F#-7",
    root: "F#",
    quality: "7",
    displayName: "F#7",
    positions: [
      {
        id: "F#-7-1",
        frets: [2, 4, 2, 3, 2, 2],
        fingers: [1, 3, 1, 2, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-7-2",
        frets: [-1, 4, 4, 6, 5, 6],
        fingers: [0, 1, 1, 3, 2, 4],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-7-3",
        frets: [-1, 9, 8, 9, 7, -1],
        fingers: [0, 3, 2, 4, 1, 0],
        baseFret: 7,
        barres: [],
      },
      {
        id: "F#-7-4",
        frets: [9, 9, 11, 9, 11, 9],
        fingers: [1, 1, 3, 1, 4, 1],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "F#-maj7",
    root: "F#",
    quality: "maj7",
    displayName: "F#maj7",
    positions: [
      {
        id: "F#-maj7-1",
        frets: [2, 4, 3, 3, 2, 2],
        fingers: [1, 4, 2, 3, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-maj7-2",
        frets: [-1, 4, 4, 6, 6, 6],
        fingers: [0, 1, 1, 3, 3, 3],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-maj7-3",
        frets: [-1, 9, 8, 6, 6, 6],
        fingers: [0, 4, 3, 1, 1, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 3,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-maj7-4",
        frets: [9, 9, 11, 10, 11, 9],
        fingers: [1, 1, 3, 2, 4, 1],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "F#-m7",
    root: "F#",
    quality: "m7",
    displayName: "F#m7",
    positions: [
      {
        id: "F#-m7-1",
        frets: [2, -1, 2, 2, 2, -1],
        fingers: [2, 0, 3, 3, 3, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "F#-m7-2",
        frets: [14, -1, 14, 14, 14, -1],
        fingers: [2, 0, 3, 3, 3, 0],
        baseFret: 14,
        barres: [],
      },
      {
        id: "F#-m7-3",
        frets: [2, 4, 2, 2, 2, 2],
        fingers: [1, 3, 1, 1, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-m7-4",
        frets: [-1, -1, 4, 6, 5, 5],
        fingers: [0, 0, 1, 4, 2, 3],
        baseFret: 4,
        barres: [],
      },
      {
        id: "F#-m7-5",
        frets: [9, 9, 11, 9, 10, 9],
        fingers: [1, 1, 3, 1, 2, 1],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "F#-m7-6",
        frets: [-1, -1, 11, 11, 10, 12],
        fingers: [0, 0, 2, 3, 1, 4],
        baseFret: 10,
        barres: [],
      },
    ],
  },
  {
    id: "G-major",
    root: "G",
    quality: "major",
    displayName: "G",
    positions: [
      {
        id: "G-major-1",
        frets: [3, 2, 0, 0, 0, 3],
        fingers: [2, 1, 0, 0, 0, 3],
        baseFret: 1,
        barres: [],
      },
      {
        id: "G-major-3",
        frets: [3, 5, 5, 4, 3, 3],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "G-major-4",
        frets: [-1, -1, 5, 7, 8, 7],
        fingers: [0, 0, 1, 2, 4, 3],
        baseFret: 5,
        barres: [],
      },
      {
        id: "G-major-5",
        frets: [7, 10, 9, 7, 8, 7],
        fingers: [1, 4, 3, 1, 2, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "G-minor",
    root: "G",
    quality: "minor",
    displayName: "Gm",
    positions: [
      {
        id: "G-minor-1",
        frets: [3, 1, 0, 0, 3, 3],
        fingers: [2, 1, 0, 0, 3, 4],
        baseFret: 1,
        barres: [],
      },
      {
        id: "G-minor-2",
        frets: [3, 5, 5, 3, 3, 3],
        fingers: [1, 3, 4, 1, 1, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "G-minor-3",
        frets: [-1, -1, 5, 7, 8, 6],
        fingers: [0, 0, 1, 3, 4, 2],
        baseFret: 5,
        barres: [],
      },
      {
        id: "G-minor-4",
        frets: [10, 10, 12, 12, 11, 10],
        fingers: [1, 1, 3, 4, 2, 1],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "G-dim",
    root: "G",
    quality: "dim",
    displayName: "Gdim",
    positions: [
      {
        id: "G-dim-1",
        frets: [3, 1, -1, 3, 2, -1],
        fingers: [3, 1, 0, 4, 2, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "G-dim-2",
        frets: [-1, -1, 5, 6, -1, 6],
        fingers: [0, 0, 1, 2, 0, 3],
        baseFret: 5,
        barres: [],
      },
      {
        id: "G-dim-4",
        frets: [-1, 10, 11, 12, 11, -1],
        fingers: [0, 1, 2, 4, 3, 0],
        baseFret: 10,
        barres: [],
      },
    ],
  },
  {
    id: "G-sus2",
    root: "G",
    quality: "sus2",
    displayName: "Gsus2",
    positions: [
      {
        id: "G-sus2-1",
        frets: [3, 0, 0, 0, 3, 3],
        fingers: [1, 0, 0, 0, 2, 3],
        baseFret: 1,
        barres: [],
      },
      {
        id: "G-sus2-2",
        frets: [5, 5, 5, 7, 8, 5],
        fingers: [1, 1, 1, 3, 4, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "G-sus2-3",
        frets: [-1, 10, 7, 7, 8, 10],
        fingers: [0, 3, 1, 1, 2, 4],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
      {
        id: "G-sus2-4",
        frets: [10, 10, 12, 12, 10, 10],
        fingers: [1, 1, 3, 4, 1, 1],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "G-sus4",
    root: "G",
    quality: "sus4",
    displayName: "Gsus4",
    positions: [
      {
        id: "G-sus4-1",
        frets: [3, 3, 0, 0, 1, 3],
        fingers: [2, 3, 0, 0, 1, 4],
        baseFret: 1,
        barres: [],
      },
      {
        id: "G-sus4-2",
        frets: [3, 5, 5, 5, 3, 3],
        fingers: [1, 2, 3, 4, 1, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "G-sus4-3",
        frets: [-1, 5, 5, 7, 8, 8],
        fingers: [0, 1, 1, 3, 4, 4],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
          {
            fret: 8,
            fromString: 4,
            toString: 5,
            finger: 4,
          },
        ],
      },
      {
        id: "G-sus4-4",
        frets: [10, 10, 12, 12, 13, 10],
        fingers: [1, 1, 2, 3, 4, 1],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "G-5",
    root: "G",
    quality: "5",
    displayName: "G5",
    positions: [
      {
        id: "G-5-1",
        frets: [3, 5, -1, -1, -1, -1],
        fingers: [1, 3, 0, 0, 0, 0],
        baseFret: 3,
        barres: [],
      },
      {
        id: "G-5-2",
        frets: [-1, 10, 12, -1, -1, -1],
        fingers: [0, 1, 3, 0, 0, 0],
        baseFret: 10,
        barres: [],
      },
      {
        id: "G-5-3",
        frets: [3, 5, 5, -1, -1, -1],
        fingers: [1, 3, 4, 0, 0, 0],
        baseFret: 3,
        barres: [],
      },
    ],
  },
  {
    id: "G-7",
    root: "G",
    quality: "7",
    displayName: "G7",
    positions: [
      {
        id: "G-7-1",
        frets: [3, 2, 0, 0, 0, 1],
        fingers: [3, 2, 0, 0, 0, 1],
        baseFret: 1,
        barres: [],
      },
      {
        id: "G-7-2",
        frets: [3, 5, 3, 4, 3, 3],
        fingers: [1, 3, 1, 2, 1, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "G-7-3",
        frets: [-1, 5, 5, 7, 6, 7],
        fingers: [0, 1, 1, 3, 2, 4],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "G-7-4",
        frets: [10, 10, 12, 10, 12, 10],
        fingers: [1, 1, 3, 1, 4, 1],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "G-maj7",
    root: "G",
    quality: "maj7",
    displayName: "Gmaj7",
    positions: [
      {
        id: "G-maj7-1",
        frets: [3, 2, 0, 0, 0, 2],
        fingers: [3, 2, 0, 0, 0, 1],
        baseFret: 1,
        barres: [],
      },
      {
        id: "G-maj7-2",
        frets: [3, 5, 4, 4, 3, 3],
        fingers: [1, 4, 2, 3, 1, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "G-maj7-3",
        frets: [-1, 5, 5, 7, 7, 7],
        fingers: [0, 1, 1, 3, 3, 3],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
          {
            fret: 7,
            fromString: 3,
            toString: 5,
            finger: 3,
          },
        ],
      },
      {
        id: "G-maj7-4",
        frets: [-1, 10, 12, 11, 12, 10],
        fingers: [0, 1, 3, 2, 4, 1],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "G-m7",
    root: "G",
    quality: "m7",
    displayName: "Gm7",
    positions: [
      {
        id: "G-m7-1",
        frets: [3, -1, 3, 3, 3, -1],
        fingers: [2, 0, 3, 3, 3, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "G-m7-2",
        frets: [3, 5, 3, 3, 3, 3],
        fingers: [1, 3, 1, 1, 1, 1],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "G-m7-3",
        frets: [-1, 5, 5, 7, 6, 6],
        fingers: [0, 1, 1, 4, 2, 3],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "G-m7-4",
        frets: [-1, 10, 8, 10, 8, 10],
        fingers: [0, 2, 1, 3, 1, 4],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "G-m7-5",
        frets: [10, 10, 12, 10, 11, 10],
        fingers: [1, 1, 3, 1, 2, 1],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Ab-major",
    root: "Ab",
    quality: "major",
    displayName: "Ab",
    positions: [
      {
        id: "Ab-major-1",
        frets: [4, 3, 1, 1, 1, -1],
        fingers: [3, 2, 1, 1, 1, 0],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-major-2",
        frets: [4, 6, 6, 5, 4, 4],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-major-3",
        frets: [-1, 6, 6, 8, 9, 8],
        fingers: [0, 1, 1, 2, 4, 3],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-major-4",
        frets: [8, 11, 10, 8, 9, 8],
        fingers: [1, 4, 3, 1, 2, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Ab-minor",
    root: "Ab",
    quality: "minor",
    displayName: "Abm",
    positions: [
      {
        id: "Ab-minor-1",
        frets: [4, 6, 6, 4, 4, 4],
        fingers: [1, 3, 4, 1, 1, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-minor-2",
        frets: [-1, -1, 6, 8, 9, 7],
        fingers: [0, 0, 1, 3, 4, 2],
        baseFret: 6,
        barres: [],
      },
      {
        id: "Ab-minor-3",
        frets: [-1, -1, 9, 8, 9, 7],
        fingers: [0, 0, 3, 2, 4, 1],
        baseFret: 7,
        barres: [],
      },
      {
        id: "Ab-minor-4",
        frets: [11, 11, 13, 13, 12, 11],
        fingers: [1, 1, 3, 4, 2, 1],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Ab-dim",
    root: "Ab",
    quality: "dim",
    displayName: "Abdim",
    positions: [
      {
        id: "Ab-dim-1",
        frets: [4, 2, -1, 4, 3, -1],
        fingers: [3, 1, 0, 4, 2, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "Ab-dim-2",
        frets: [-1, -1, 6, 7, -1, 7],
        fingers: [0, 0, 1, 2, 0, 3],
        baseFret: 6,
        barres: [],
      },
      {
        id: "Ab-dim-3",
        frets: [-1, 11, 9, -1, 9, 10],
        fingers: [0, 4, 1, 0, 2, 3],
        baseFret: 9,
        barres: [],
      },
      {
        id: "Ab-dim-4",
        frets: [-1, 11, 12, 13, 12, -1],
        fingers: [0, 1, 2, 4, 3, 0],
        baseFret: 11,
        barres: [],
      },
    ],
  },
  {
    id: "Ab-sus2",
    root: "Ab",
    quality: "sus2",
    displayName: "Absus2",
    positions: [
      {
        id: "Ab-sus2-1",
        frets: [4, -1, -1, 3, 4, 4],
        fingers: [2, 0, 0, 1, 3, 4],
        baseFret: 1,
        barres: [],
      },
      {
        id: "Ab-sus2-3",
        frets: [6, 6, 6, 8, 9, 6],
        fingers: [1, 1, 1, 3, 4, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-sus2-4",
        frets: [11, 11, 13, 13, 11, 11],
        fingers: [1, 1, 3, 4, 1, 1],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Ab-sus4",
    root: "Ab",
    quality: "sus4",
    displayName: "Absus4",
    positions: [
      {
        id: "Ab-sus4-1",
        frets: [-1, -1, 1, 1, 2, 4],
        fingers: [0, 0, 1, 1, 2, 4],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-sus4-2",
        frets: [4, 6, 6, 6, 4, 4],
        fingers: [1, 2, 3, 4, 1, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-sus4-3",
        frets: [-1, 6, 6, 8, 9, 9],
        fingers: [0, 1, 1, 2, 3, 4],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-sus4-4",
        frets: [11, 11, 13, 13, 14, 11],
        fingers: [1, 1, 2, 3, 4, 1],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Ab-5",
    root: "Ab",
    quality: "5",
    displayName: "Ab5",
    positions: [
      {
        id: "Ab-5-1",
        frets: [4, 6, -1, -1, -1, -1],
        fingers: [1, 3, 0, 0, 0, 0],
        baseFret: 4,
        barres: [],
      },
      {
        id: "Ab-5-2",
        frets: [-1, 11, 13, -1, -1, -1],
        fingers: [0, 1, 3, 0, 0, 0],
        baseFret: 11,
        barres: [],
      },
      {
        id: "Ab-5-3",
        frets: [4, 6, 6, -1, -1, -1],
        fingers: [1, 3, 4, 0, 0, 0],
        baseFret: 4,
        barres: [],
      },
    ],
  },
  {
    id: "Ab-7",
    root: "Ab",
    quality: "7",
    displayName: "Ab7",
    positions: [
      {
        id: "Ab-7-1",
        frets: [-1, -1, 1, 1, 1, 2],
        fingers: [0, 0, 1, 1, 1, 2],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-7-2",
        frets: [4, 6, 4, 5, 4, 4],
        fingers: [1, 3, 1, 2, 1, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-7-3",
        frets: [-1, 6, 6, 8, 7, 8],
        fingers: [0, 1, 1, 3, 2, 4],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-7-4",
        frets: [11, 11, 13, 11, 13, 11],
        fingers: [1, 1, 3, 1, 4, 1],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Ab-maj7",
    root: "Ab",
    quality: "maj7",
    displayName: "Abmaj7",
    positions: [
      {
        id: "Ab-maj7-1",
        frets: [4, 6, 5, 5, 4, 4],
        fingers: [1, 4, 2, 3, 1, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-maj7-2",
        frets: [-1, 6, 6, 8, 8, 8],
        fingers: [0, 1, 1, 3, 3, 3],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-maj7-3",
        frets: [-1, 11, 10, 12, 9, -1],
        fingers: [0, 3, 2, 4, 1, 0],
        baseFret: 9,
        barres: [],
      },
      {
        id: "Ab-maj7-4",
        frets: [11, 11, 13, 12, 13, 11],
        fingers: [1, 1, 3, 2, 4, 1],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Ab-m7",
    root: "Ab",
    quality: "m7",
    displayName: "Abm7",
    positions: [
      {
        id: "Ab-m7-1",
        frets: [4, -1, 4, 4, 4, -1],
        fingers: [2, 0, 3, 3, 3, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "Ab-m7-2",
        frets: [4, 6, 4, 4, 4, 4],
        fingers: [1, 3, 1, 1, 1, 1],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-m7-3",
        frets: [-1, 6, 6, 8, 7, 7],
        fingers: [0, 1, 1, 4, 2, 3],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-m7-4",
        frets: [-1, 11, 9, 11, 9, -1],
        fingers: [0, 2, 1, 3, 1, 0],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "Ab-m7-5",
        frets: [11, 11, 13, 11, 12, 11],
        fingers: [1, 1, 3, 1, 2, 1],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "A-major",
    root: "A",
    quality: "major",
    displayName: "A",
    positions: [
      {
        id: "A-major-1",
        frets: [-1, 0, 2, 2, 2, 0],
        fingers: [0, 0, 1, 2, 3, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "A-major-2",
        frets: [-1, 0, 2, 2, 2, 5],
        fingers: [0, 0, 1, 1, 1, 4],
        baseFret: 2,
        barres: [
          {
            fret: 2,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "A-major-3",
        frets: [5, 7, 7, 6, 5, 5],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "A-major-4",
        frets: [-1, 0, 7, 9, 10, 9],
        fingers: [0, 0, 1, 2, 4, 3],
        baseFret: 7,
        barres: [],
      },
    ],
  },
  {
    id: "A-minor",
    root: "A",
    quality: "minor",
    displayName: "Am",
    positions: [
      {
        id: "A-minor-1",
        frets: [-1, 0, 2, 2, 1, 0],
        fingers: [0, 0, 2, 3, 1, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "A-minor-2",
        frets: [-1, 0, 2, 5, 5, 5],
        fingers: [0, 0, 1, 4, 4, 4],
        baseFret: 2,
        barres: [
          {
            fret: 5,
            fromString: 3,
            toString: 5,
            finger: 4,
          },
        ],
      },
      {
        id: "A-minor-3",
        frets: [5, 7, 7, 5, 5, 5],
        fingers: [1, 3, 4, 1, 1, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "A-minor-4",
        frets: [-1, 0, 7, 9, 10, 8],
        fingers: [0, 0, 1, 3, 4, 2],
        baseFret: 7,
        barres: [],
      },
    ],
  },
  {
    id: "A-dim",
    root: "A",
    quality: "dim",
    displayName: "Adim",
    positions: [
      {
        id: "A-dim-1",
        frets: [-1, 0, 1, 2, 1, -1],
        fingers: [0, 0, 1, 3, 2, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "A-dim-3",
        frets: [-1, -1, 7, 8, -1, 8],
        fingers: [0, 0, 1, 2, 0, 3],
        baseFret: 7,
        barres: [],
      },
      {
        id: "A-dim-4",
        frets: [-1, 12, 10, -1, 10, 11],
        fingers: [0, 4, 1, 0, 2, 3],
        baseFret: 10,
        barres: [],
      },
    ],
  },
  {
    id: "A-sus2",
    root: "A",
    quality: "sus2",
    displayName: "Asus2",
    positions: [
      {
        id: "A-sus2-1",
        frets: [-1, 0, 2, 2, 0, 0],
        fingers: [0, 0, 2, 3, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "A-sus2-2",
        frets: [-1, 0, 2, 4, 0, 0],
        fingers: [0, 0, 1, 4, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "A-sus2-3",
        frets: [7, 7, 7, 9, 10, 7],
        fingers: [1, 1, 1, 3, 4, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "A-sus2-4",
        frets: [-1, 0, 9, 9, 0, 0],
        fingers: [0, 0, 1, 2, 0, 0],
        baseFret: 9,
        barres: [],
      },
    ],
  },
  {
    id: "A-sus4",
    root: "A",
    quality: "sus4",
    displayName: "Asus4",
    positions: [
      {
        id: "A-sus4-1",
        frets: [-1, 0, 2, 2, 3, 0],
        fingers: [0, 0, 1, 2, 3, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "A-sus4-2",
        frets: [-1, 0, 0, -1, 3, 0],
        fingers: [0, 0, 0, 0, 1, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "A-sus4-4",
        frets: [-1, 7, 7, 9, 10, 10],
        fingers: [0, 1, 1, 2, 3, 4],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "A-5",
    root: "A",
    quality: "5",
    displayName: "A5",
    positions: [
      {
        id: "A-5-1",
        frets: [5, 7, -1, -1, -1, -1],
        fingers: [1, 3, 0, 0, 0, 0],
        baseFret: 5,
        barres: [],
      },
      {
        id: "A-5-2",
        frets: [-1, 0, 2, -1, -1, -1],
        fingers: [0, 0, 1, 0, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "A-5-3",
        frets: [5, 7, 7, -1, -1, -1],
        fingers: [1, 3, 4, 0, 0, 0],
        baseFret: 5,
        barres: [],
      },
    ],
  },
  {
    id: "A-7",
    root: "A",
    quality: "7",
    displayName: "A7",
    positions: [
      {
        id: "A-7-1",
        frets: [-1, 0, 2, 0, 2, 0],
        fingers: [0, 0, 2, 0, 3, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "A-7-2",
        frets: [-1, 0, 2, 2, 2, 3],
        fingers: [0, 0, 1, 1, 1, 2],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "A-7-3",
        frets: [5, 7, 5, 6, 5, 5],
        fingers: [1, 3, 1, 2, 1, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "A-7-4",
        frets: [-1, 0, 7, 9, 8, 9],
        fingers: [0, 0, 1, 3, 2, 4],
        baseFret: 7,
        barres: [],
      },
    ],
  },
  {
    id: "A-maj7",
    root: "A",
    quality: "maj7",
    displayName: "Amaj7",
    positions: [
      {
        id: "A-maj7-1",
        frets: [-1, 0, 2, 1, 2, 0],
        fingers: [0, 0, 2, 1, 3, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "A-maj7-2",
        frets: [-1, 0, 2, 2, 2, 4],
        fingers: [0, 0, 1, 1, 1, 4],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "A-maj7-3",
        frets: [5, 7, 6, 6, 5, 5],
        fingers: [1, 4, 2, 3, 1, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "A-maj7-4",
        frets: [-1, 0, 7, 9, 9, 9],
        fingers: [0, 0, 1, 3, 3, 3],
        baseFret: 7,
        barres: [
          {
            fret: 9,
            fromString: 3,
            toString: 5,
            finger: 3,
          },
        ],
      },
    ],
  },
  {
    id: "A-m7",
    root: "A",
    quality: "m7",
    displayName: "Am7",
    positions: [
      {
        id: "A-m7-1",
        frets: [-1, 0, 2, 0, 1, 0],
        fingers: [0, 0, 2, 0, 1, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "A-m7-2",
        frets: [-1, 0, 2, 2, 1, 3],
        fingers: [0, 0, 2, 3, 1, 4],
        baseFret: 1,
        barres: [],
      },
      {
        id: "A-m7-3",
        frets: [5, -1, 5, 5, 5, -1],
        fingers: [2, 0, 3, 3, 3, 0],
        baseFret: 5,
        barres: [],
      },
      {
        id: "A-m7-4",
        frets: [-1, 0, 5, 5, 5, 5],
        fingers: [0, 0, 1, 1, 1, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 2,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "A-m7-5",
        frets: [5, 7, 5, 5, 5, 5],
        fingers: [1, 3, 1, 1, 1, 1],
        baseFret: 5,
        barres: [
          {
            fret: 5,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "A-m7-6",
        frets: [-1, 7, 7, 9, 8, 8],
        fingers: [0, 1, 1, 4, 2, 3],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Bb-major",
    root: "Bb",
    quality: "major",
    displayName: "Bb",
    positions: [
      {
        id: "Bb-major-1",
        frets: [-1, 1, 3, 3, 3, 1],
        fingers: [0, 1, 2, 3, 4, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-major-2",
        frets: [6, 5, 3, 3, 3, -1],
        fingers: [4, 3, 1, 1, 1, 0],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-major-3",
        frets: [6, 8, 8, 7, 6, 6],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-major-4",
        frets: [-1, 8, 8, 10, 11, 10],
        fingers: [0, 1, 1, 2, 4, 3],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Bb-minor",
    root: "Bb",
    quality: "minor",
    displayName: "Bbm",
    positions: [
      {
        id: "Bb-minor-1",
        frets: [-1, 1, 3, 3, 2, 1],
        fingers: [0, 1, 3, 4, 2, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-minor-2",
        frets: [6, 8, 8, 6, 6, 6],
        fingers: [1, 3, 4, 1, 1, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-minor-3",
        frets: [-1, -1, 8, 6, 6, 6],
        fingers: [0, 0, 3, 1, 1, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 3,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-minor-4",
        frets: [-1, -1, 8, 10, 11, 9],
        fingers: [0, 0, 1, 3, 4, 2],
        baseFret: 8,
        barres: [],
      },
    ],
  },
  {
    id: "Bb-dim",
    root: "Bb",
    quality: "dim",
    displayName: "Bbdim",
    positions: [
      {
        id: "Bb-dim-1",
        frets: [-1, 1, 2, 3, 2, -1],
        fingers: [0, 1, 2, 4, 3, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "Bb-dim-2",
        frets: [6, 4, -1, 6, 5, -1],
        fingers: [3, 1, 0, 4, 2, 0],
        baseFret: 4,
        barres: [],
      },
      {
        id: "Bb-dim-3",
        frets: [-1, -1, 8, 9, -1, 9],
        fingers: [0, 0, 1, 2, 0, 3],
        baseFret: 8,
        barres: [],
      },
      {
        id: "Bb-dim-4",
        frets: [-1, 13, 11, -1, 11, 12],
        fingers: [0, 4, 1, 0, 2, 3],
        baseFret: 11,
        barres: [],
      },
    ],
  },
  {
    id: "Bb-sus2",
    root: "Bb",
    quality: "sus2",
    displayName: "Bbsus2",
    positions: [
      {
        id: "Bb-sus2-1",
        frets: [1, 1, 3, 3, 1, 1],
        fingers: [1, 1, 3, 4, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-sus2-2",
        frets: [6, 3, 3, 5, 6, -1],
        fingers: [3, 1, 1, 2, 4, 0],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-sus2-3",
        frets: [8, 8, 8, 10, 11, 8],
        fingers: [1, 1, 1, 3, 4, 1],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-sus2-4",
        frets: [-1, 13, 10, 10, 11, 13],
        fingers: [0, 3, 1, 1, 2, 4],
        baseFret: 10,
        barres: [
          {
            fret: 10,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Bb-sus4",
    root: "Bb",
    quality: "sus4",
    displayName: "Bbsus4",
    positions: [
      {
        id: "Bb-sus4-1",
        frets: [-1, 1, 3, 3, 4, 1],
        fingers: [0, 1, 2, 3, 4, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-sus4-2",
        frets: [-1, -1, 3, 3, 4, 6],
        fingers: [0, 0, 1, 1, 2, 4],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-sus4-3",
        frets: [6, 8, 8, 8, 6, 6],
        fingers: [1, 3, 3, 3, 1, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-sus4-4",
        frets: [-1, 8, 8, 10, 11, 11],
        fingers: [0, 1, 1, 2, 3, 4],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Bb-5",
    root: "Bb",
    quality: "5",
    displayName: "Bb5",
    positions: [
      {
        id: "Bb-5-1",
        frets: [6, 8, -1, -1, -1, -1],
        fingers: [1, 3, 0, 0, 0, 0],
        baseFret: 6,
        barres: [],
      },
      {
        id: "Bb-5-2",
        frets: [-1, 1, 3, -1, -1, -1],
        fingers: [0, 1, 3, 0, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "Bb-5-3",
        frets: [6, 8, 8, -1, -1, -1],
        fingers: [1, 3, 4, 0, 0, 0],
        baseFret: 6,
        barres: [],
      },
    ],
  },
  {
    id: "Bb-7",
    root: "Bb",
    quality: "7",
    displayName: "Bb7",
    positions: [
      {
        id: "Bb-7-1",
        frets: [-1, 1, 3, 1, 3, 1],
        fingers: [0, 1, 3, 1, 4, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-7-2",
        frets: [6, 8, 6, 7, 6, 6],
        fingers: [1, 3, 1, 2, 1, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-7-3",
        frets: [-1, 8, 8, 10, 9, 10],
        fingers: [0, 1, 1, 3, 2, 4],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-7-4",
        frets: [-1, 13, 12, 13, 11, -1],
        fingers: [0, 3, 2, 4, 1, 0],
        baseFret: 11,
        barres: [],
      },
    ],
  },
  {
    id: "Bb-maj7",
    root: "Bb",
    quality: "maj7",
    displayName: "Bbmaj7",
    positions: [
      {
        id: "Bb-maj7-1",
        frets: [-1, 1, 3, 2, 3, 1],
        fingers: [0, 1, 3, 2, 4, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-maj7-2",
        frets: [-1, -1, 3, 3, 3, 5],
        fingers: [0, 0, 1, 1, 1, 4],
        baseFret: 3,
        barres: [
          {
            fret: 3,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-maj7-3",
        frets: [6, 8, 7, 7, 6, 6],
        fingers: [1, 4, 2, 3, 1, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-maj7-4",
        frets: [-1, 8, 8, 10, 10, 10],
        fingers: [0, 1, 1, 3, 3, 3],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
          {
            fret: 10,
            fromString: 3,
            toString: 5,
            finger: 3,
          },
        ],
      },
    ],
  },
  {
    id: "Bb-m7",
    root: "Bb",
    quality: "m7",
    displayName: "Bbm7",
    positions: [
      {
        id: "Bb-m7-2",
        frets: [-1, 1, 3, 1, 2, 1],
        fingers: [0, 1, 3, 1, 2, 1],
        baseFret: 1,
        barres: [
          {
            fret: 1,
            fromString: 1,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-m7-3",
        frets: [-1, -1, 3, 3, 2, 4],
        fingers: [0, 0, 2, 3, 1, 4],
        baseFret: 1,
        barres: [],
      },
      {
        id: "Bb-m7-4",
        frets: [6, 8, 6, 6, 6, 6],
        fingers: [1, 3, 1, 1, 1, 1],
        baseFret: 6,
        barres: [
          {
            fret: 6,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "Bb-m7-5",
        frets: [-1, 8, 8, 10, 9, 9],
        fingers: [0, 1, 1, 4, 2, 3],
        baseFret: 8,
        barres: [
          {
            fret: 8,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "B-major",
    root: "B",
    quality: "major",
    displayName: "B",
    positions: [
      {
        id: "B-major-1",
        frets: [2, 2, 4, 4, 4, 2],
        fingers: [1, 1, 2, 3, 4, 1],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "B-major-2",
        frets: [-1, -1, 4, 4, 4, 7],
        fingers: [0, 0, 1, 1, 1, 4],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "B-major-3",
        frets: [7, 9, 9, 8, 7, 7],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "B-major-4",
        frets: [-1, 9, 9, 11, 12, 11],
        fingers: [0, 1, 1, 2, 4, 3],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "B-minor",
    root: "B",
    quality: "minor",
    displayName: "Bm",
    positions: [
      {
        id: "B-minor-1",
        frets: [2, 2, 4, 4, 3, 2],
        fingers: [1, 1, 3, 4, 2, 1],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "B-minor-2",
        frets: [7, 9, 9, 7, 7, 7],
        fingers: [1, 3, 4, 1, 1, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "B-minor-3",
        frets: [-1, -1, 9, 11, 12, 10],
        fingers: [0, 0, 1, 3, 4, 2],
        baseFret: 9,
        barres: [],
      },
      {
        id: "B-minor-4",
        frets: [-1, -1, 12, 11, 12, 10],
        fingers: [0, 0, 3, 2, 4, 1],
        baseFret: 10,
        barres: [],
      },
    ],
  },
  {
    id: "B-dim",
    root: "B",
    quality: "dim",
    displayName: "Bdim",
    positions: [
      {
        id: "B-dim-1",
        frets: [-1, 2, 0, -1, 0, 1],
        fingers: [0, 3, 0, 0, 0, 2],
        baseFret: 1,
        barres: [],
      },
      {
        id: "B-dim-2",
        frets: [-1, 2, 3, 4, 3, -1],
        fingers: [0, 1, 2, 4, 3, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "B-dim-3",
        frets: [7, 5, -1, 7, 6, -1],
        fingers: [3, 1, 0, 4, 2, 0],
        baseFret: 5,
        barres: [],
      },
      {
        id: "B-dim-4",
        frets: [-1, -1, 9, 10, -1, 10],
        fingers: [0, 0, 1, 2, 0, 3],
        baseFret: 9,
        barres: [],
      },
    ],
  },
  {
    id: "B-sus2",
    root: "B",
    quality: "sus2",
    displayName: "Bsus2",
    positions: [
      {
        id: "B-sus2-1",
        frets: [2, 2, 4, 4, 2, 2],
        fingers: [1, 1, 3, 4, 1, 1],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "B-sus2-2",
        frets: [7, -1, -1, 6, 7, 7],
        fingers: [2, 0, 0, 1, 3, 4],
        baseFret: 6,
        barres: [],
      },
      {
        id: "B-sus2-3",
        frets: [9, 9, 9, 11, 12, 9],
        fingers: [1, 1, 1, 3, 4, 1],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "B-sus2-4",
        frets: [-1, 14, 11, 11, 12, 14],
        fingers: [0, 3, 1, 1, 2, 4],
        baseFret: 11,
        barres: [
          {
            fret: 11,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "B-sus4",
    root: "B",
    quality: "sus4",
    displayName: "Bsus4",
    positions: [
      {
        id: "B-sus4-1",
        frets: [2, 2, 4, 4, 5, 2],
        fingers: [1, 1, 2, 3, 4, 1],
        baseFret: 2,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "B-sus4-2",
        frets: [-1, -1, 4, 4, 5, 7],
        fingers: [0, 0, 1, 1, 2, 4],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 2,
            toString: 3,
            finger: 1,
          },
        ],
      },
      {
        id: "B-sus4-3",
        frets: [7, 9, 9, 9, 7, 7],
        fingers: [1, 2, 3, 4, 1, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "B-sus4-4",
        frets: [-1, 9, 9, 11, 12, 12],
        fingers: [0, 1, 1, 3, 4, 4],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
          {
            fret: 12,
            fromString: 4,
            toString: 5,
            finger: 4,
          },
        ],
      },
    ],
  },
  {
    id: "B-5",
    root: "B",
    quality: "5",
    displayName: "B5",
    positions: [
      {
        id: "B-5-1",
        frets: [7, 9, -1, -1, -1, -1],
        fingers: [1, 3, 0, 0, 0, 0],
        baseFret: 7,
        barres: [],
      },
      {
        id: "B-5-2",
        frets: [-1, 2, 4, -1, -1, -1],
        fingers: [0, 1, 3, 0, 0, 0],
        baseFret: 1,
        barres: [],
      },
      {
        id: "B-5-3",
        frets: [7, 9, 9, -1, -1, -1],
        fingers: [1, 3, 4, 0, 0, 0],
        baseFret: 7,
        barres: [],
      },
    ],
  },
  {
    id: "B-7",
    root: "B",
    quality: "7",
    displayName: "B7",
    positions: [
      {
        id: "B-7-1",
        frets: [-1, 2, 1, 2, 0, 2],
        fingers: [0, 2, 1, 3, 0, 4],
        baseFret: 1,
        barres: [],
      },
      {
        id: "B-7-2",
        frets: [2, 2, 4, 2, 4, 2],
        fingers: [1, 1, 3, 1, 4, 1],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "B-7-3",
        frets: [-1, -1, 4, 4, 4, 5],
        fingers: [0, 0, 1, 1, 1, 2],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "B-7-4",
        frets: [7, 9, 7, 8, 7, 7],
        fingers: [1, 3, 1, 2, 1, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
    ],
  },
  {
    id: "B-maj7",
    root: "B",
    quality: "maj7",
    displayName: "Bmaj7",
    positions: [
      {
        id: "B-maj7-1",
        frets: [2, 2, 4, 3, 4, 2],
        fingers: [1, 1, 3, 2, 4, 1],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "B-maj7-2",
        frets: [-1, -1, 4, 4, 4, 6],
        fingers: [0, 0, 1, 1, 1, 4],
        baseFret: 4,
        barres: [
          {
            fret: 4,
            fromString: 2,
            toString: 4,
            finger: 1,
          },
        ],
      },
      {
        id: "B-maj7-3",
        frets: [7, 9, 8, 8, 7, 7],
        fingers: [1, 4, 2, 3, 1, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "B-maj7-4",
        frets: [-1, 9, 9, 11, 11, 11],
        fingers: [0, 1, 1, 3, 3, 3],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
          {
            fret: 11,
            fromString: 3,
            toString: 5,
            finger: 3,
          },
        ],
      },
    ],
  },
  {
    id: "B-m7",
    root: "B",
    quality: "m7",
    displayName: "Bm7",
    positions: [
      {
        id: "B-m7-1",
        frets: [7, -1, 7, 7, 7, -1],
        fingers: [2, 0, 3, 3, 3, 0],
        baseFret: 7,
        barres: [],
      },
      {
        id: "B-m7-2",
        frets: [2, 2, 4, 2, 3, 2],
        fingers: [1, 1, 3, 1, 2, 1],
        baseFret: 1,
        barres: [
          {
            fret: 2,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "B-m7-3",
        frets: [-1, -1, 4, 4, 3, 5],
        fingers: [0, 0, 2, 3, 1, 4],
        baseFret: 3,
        barres: [],
      },
      {
        id: "B-m7-4",
        frets: [7, 9, 7, 7, 7, 7],
        fingers: [1, 3, 1, 1, 1, 1],
        baseFret: 7,
        barres: [
          {
            fret: 7,
            fromString: 0,
            toString: 5,
            finger: 1,
          },
        ],
      },
      {
        id: "B-m7-5",
        frets: [-1, 9, 9, 11, 10, 10],
        fingers: [0, 1, 1, 4, 2, 3],
        baseFret: 9,
        barres: [
          {
            fret: 9,
            fromString: 1,
            toString: 2,
            finger: 1,
          },
        ],
      },
    ],
  },
] as const satisfies readonly GuitarChord[];
