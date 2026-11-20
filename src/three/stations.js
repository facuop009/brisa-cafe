import { LEVEL } from './layout'

// Camera stations of the hero. Plain data so the DOM can list them without loading three.js.
const L = LEVEL
export const STATIONS = {
  building: { label: 'La casa', short: 'Casa', pos: [15, 10.5, 28], target: [-0.5, 6.4, 0], posMobile: [11, 7, 33], targetMobile: [0, 10.8, 0] },
  cafe: { label: 'Café, planta baja', short: 'Café', pos: [3.4, 1.75, 4.1], target: [-1.4, 1.1, -2.6] },
  lounge: { label: 'Salón, primera planta', short: 'Salón', pos: [-1.6, L + 1.7, 3.9], target: [4.2, L + 0.8, -0.8] },
  florist: { label: 'Florista, segunda planta', short: 'Florista', pos: [-2.4, 2 * L + 1.8, 4.1], target: [1.0, 2 * L + 0.9, -3.0] },
}
