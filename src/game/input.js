// Shared, mutable input read every frame by the 3D world. UI widgets write into it.
export const input = {
  stickX: 0,
  stickY: 0,
  lookX: 0,
  lookY: 0,
  keys: new Set(),
}

const MOVE_KEYS = {
  KeyW: [0, 1],
  ArrowUp: [0, 1],
  KeyS: [0, -1],
  ArrowDown: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
}

export function moveVector() {
  let x = input.stickX
  let y = input.stickY
  for (const k of input.keys) {
    const v = MOVE_KEYS[k]
    if (v) {
      x += v[0]
      y += v[1]
    }
  }
  const len = Math.hypot(x, y)
  if (len > 1) {
    x /= len
    y /= len
  }
  return [x, y]
}

export const isMoveKey = (code) => code in MOVE_KEYS
