// The building's plan in metres. Shared by the 3D scene and the section drawing.
// x: left (-) to the window wall (+). z: back wall (-) to the open glass front (+).
// Three floors: café (0), lounge (1), florist (2).
export const ROOM = { w: 12, d: 9, h: 4.2, t: 0.3 }
export const SLAB = 0.3
export const LEVEL = ROOM.h + SLAB // 4.5 m floor to floor
export const levelY = (i) => i * LEVEL
export const FLOORS = 3
export const BUILDING_H = FLOORS * LEVEL

export const WINDOW = { z0: -3.9, z1: 3.9, y0: 0.45, y1: 3.55 }
export const DOOR = { x: 2.7, w: 1.1, h: 2.3 } // kitchen doorway on the café floor, with noren

// Switchback oak stair along the left wall.
// Flight A: café → lounge, lane A, rising towards the back.
// Flight B: lounge → florist, lane B, rising towards the front.
export const STAIR = {
  laneA: { x0: -6, x1: -4.95 },
  laneB: { x0: -4.9, x1: -3.85 },
  zLow: 3.2,
  zHigh: -0.8,
  steps: 22,
}

/* café floor */
export const COUNTER = { x0: -3.4, x1: 1.6, z: -3.05, depth: 0.75, h: 1.02 }
export const BACK_COUNTER = { x0: -3.6, x1: 1.6, z: -4.2, depth: 0.6, h: 0.9 }
export const STOOLS = [-2.7, -2.0, -0.35, 0.35].map((x) => [x, -2.25])
export const WINDOW_BAR = { x: 5.35, z0: -2.6, z1: 2.6 }
export const WINDOW_STOOLS = [-2, -0.7, 0.6, 1.9].map((z) => [4.85, z])
export const CAFE_TABLES = [{ x: 1.4, z: 1.6, chairs: [[1.4, 0.88, 0], [1.4, 2.32, Math.PI]] }]

/* lounge floor */
export const LONG_TABLE = { x: 3.95, z: 0.3, len: 3.8, width: 0.9 }
export const LONG_TABLE_CHAIRS = [-1.1, 0.3, 1.7].flatMap((dz) => [
  [LONG_TABLE.x - 0.72, LONG_TABLE.z + dz, Math.PI / 2],
  [LONG_TABLE.x + 0.72, LONG_TABLE.z + dz, -Math.PI / 2],
])
export const LOUNGE_BENCH = { z: -4.15, x0: -3.2, x1: 2.6 }
export const LOUNGE_TABLES = [
  { x: -2.0, z: -3.15, chairs: [[-2.0, -2.4, Math.PI]] },
  { x: 0.9, z: -3.15, chairs: [[0.9, -2.4, Math.PI]] },
  { x: -0.6, z: 1.6, chairs: [[-0.6, 0.88, 0], [-0.6, 2.32, Math.PI]] },
]

/* florist floor */
export const FLORIST = {
  standZ: -4.0, // tiered bucket stand along the back wall
  standX0: -3.4,
  standX1: 3.6,
  table: { x: 0.6, z: 0.6, len: 2.6, width: 1.0 },
  counter: { x: 4.3, z: 2.3 },
}

export const SEATS = 28
