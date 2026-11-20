// Everything time-related runs on Copenhagen time, where the shop is.
export const TZ = 'Europe/Copenhagen'

// 0 = Sunday … 6 = Saturday. Hours as decimal [open, close].
export const HOURS = {
  0: [9, 15],
  1: [7, 18],
  2: [7, 18],
  3: [7, 18],
  4: [7, 18],
  5: [7, 18],
  6: [8, 17],
}

export const HOURS_ROWS = [
  { days: 'Lunes – Viernes', time: '07:00 – 18:00' },
  { days: 'Sábado', time: '08:00 – 17:00' },
  { days: 'Domingo', time: '09:00 – 15:00' },
]

const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

export function cphNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (t) => parts.find((p) => p.type === t)?.value
  const h = Number(get('hour'))
  const m = Number(get('minute'))
  return { h, m, dow: DOW[get('weekday')], decimal: h + m / 60 }
}

export function formatClock(decimal) {
  const h = Math.floor(decimal)
  const m = Math.floor((decimal - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function openState(now = cphNow()) {
  const [o, c] = HOURS[now.dow]
  if (now.decimal >= o && now.decimal < c) return { open: true, label: `Abierto ahora, hasta las ${formatClock(c)}` }
  if (now.decimal < o) return { open: false, label: `Cerrado, abre a las ${formatClock(o)}` }
  const [no] = HOURS[(now.dow + 1) % 7]
  return { open: false, label: `Cerrado, abre mañana a las ${formatClock(no)}` }
}

// Range the light control covers: first light to the lamps.
export const LIGHT_MIN = 6.5
export const LIGHT_MAX = 19.5

export function initialLightTime() {
  const { decimal } = cphNow()
  if (decimal >= 7 && decimal <= 19) return decimal
  return 7.3 // outside opening hours the room opens on first light
}

export function describeLight(t) {
  if (t < 7.5) return 'La primera luz llega a la barra de espresso'
  if (t < 10) return 'Líneas largas y bajas cruzan el mostrador'
  if (t < 12) return 'Las lamas dibujan en el suelo de roble'
  if (t < 14.5) return 'Sol alto, sombras cortas en la ventana'
  if (t < 17) return 'Luz de tarde en la mesa larga'
  if (t < 18.5) return 'El sol se va, las lámparas toman el relevo'
  return 'Solo lámparas de papel, después del cierre'
}
