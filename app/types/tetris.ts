export interface Piece {
  shape: number[][];
  type: number;
  x: number;
  y: number;
  textures: string[][];
  rotations: number[][];
}

export type Board = (number | null)[][];

export const PIECES: { [key: string]: { shape: number[][], type: number, textures: string[][], rotations: number[][] } } = {
  // I-piece (Long Hot Dog) - 4x block.png
  I: {
    shape: [
      [1, 1, 1, 1]
    ],
    type: 0,
    textures: [
      ['block', 'block', 'block', 'block']
    ],
    rotations: [
      [0, 0, 0, 0]  // horizontal orientation - no rotation needed
    ]
  },
  
  // O-piece (Hot Dog Bun) - corner pieces
  O: {
    shape: [
      [3, 3],
      [3, 3]
    ],
    type: 3,
    textures: [
      ['top_left', 'top_right'],
      ['bottom_left', 'bottom_right']
    ],
    rotations: [
      [0, 0],
      [0, 0]
    ]
  },
  
  // T-piece (Hot Dog with Mustard) - t-center + 3x block
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    type: 1,
    textures: [
      ['', 'block', ''],
      ['block', 't-center', 'block']
    ],
    rotations: [
      [0, 270, 0],
      [0, 180, 0]  // t-center rotated 180° to face the correct way
    ]
  },
  
  // S-piece (Wavy Hot Dog) - 2x elbow + 2x block
  S: {
    shape: [
      [0, 2, 2],
      [2, 2, 0]
    ],
    type: 2,
    textures: [
      ['', 'elbow-left', 'block'],    // top row: elbow curves down-to-right, then block continues right
      ['block', 'elbow-right', '']     // bottom row: block continues left, elbow curves up-to-right
    ],
    rotations: [
      [0, 0, 0],    // top elbow: connects down-to-right (default orientation)
      [0, 180, 0]   // bottom elbow: rotate 180° to connect top-to-left
    ]
  },
  
  // Z-piece (Zigzag Hot Dog) - 2x elbow + 2x block
  Z: {
    shape: [
      [4, 4, 0],
      [0, 4, 4]
    ],
    type: 4,
    textures: [
      ['block', 'elbow-right', ''],    // top row: block continues, then elbow curves left-to-down
      ['', 'elbow-left', 'block']     // bottom row: elbow curves up-to-right, then block continues
    ],
    rotations: [
      [180, 90, 0],   // top elbow: rotate 90° to connect left-to-down
      [0, 270, 180]   // bottom elbow: rotate 270° to connect up-to-right
    ]
  },
  
  // J-piece (Curved Hot Dog) - 2x block + 1x elbow + 1x block
  J: {
    shape: [
      [5, 0, 0],
      [5, 5, 5]
    ],
    type: 5,
    textures: [
      ['block', '', ''],           // top row: single block
      ['elbow-left', 'block', 'block']  // bottom row: elbow curves up-to-right, then 2 blocks continue
    ],
    rotations: [
      [90, 0, 0],
      [270, 0, 0] // elbow: rotate 270° to connect up-to-right
    ]
  },
  
  // L-piece (L-shaped Hot Dog) - 2x block + 1x elbow + 1x block (mirrored)
  L: {
    shape: [
      [0, 0, 6],
      [6, 6, 6]
    ],
    type: 6,
    textures: [
      ['', '', 'block'],           // top row: single block
      ['block', 'block', 'elbow-right']  // bottom row: 2 blocks, then elbow curves up-to-left
    ],
    rotations: [
      [0, 0, 270],
      [0, 0, 180] // elbow: rotate 180° to connect up-to-left
    ]
  }
};