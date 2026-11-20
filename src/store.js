import { useSyncExternalStore } from 'react'
import { initialLightTime } from './lib/time'

// A tiny external store shared by the DOM and the WebGL scene.
const listeners = new Set()
let state = {
  time: initialLightTime(), // decimal hours driving the sun
  station: 'building', // camera station in the hero
  explore: false, // full-screen free camera mode
  sceneReady: false, // first frame of the room rendered
  introDone: false, // cinematic intro finished
  heroVisible: true,
}

export const store = {
  get: () => state,
  set(patch) {
    const next = typeof patch === 'function' ? patch(state) : patch
    state = { ...state, ...next }
    listeners.forEach((l) => l())
  },
  subscribe(l) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

export function useStore(selector) {
  return useSyncExternalStore(store.subscribe, () => selector(state), () => selector(state))
}
