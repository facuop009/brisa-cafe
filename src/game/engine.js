import { useSyncExternalStore } from 'react'

/* ---------------- data ---------------- */

export const RECIPES = {
  espresso: { name: 'Espresso', price: 32, vessel: 'chica', items: ['espresso'], day: 1 },
  cortado: { name: 'Cortado', price: 38, vessel: 'chica', items: ['espresso', 'leche'], day: 1 },
  americano: { name: 'Americano', price: 36, vessel: 'grande', items: ['espresso', 'agua'], day: 1 },
  lazo: { name: 'Lazo de cardamomo', price: 36, pastry: true, day: 1 },
  flatwhite: { name: 'Flat white', price: 44, vessel: 'grande', items: ['espresso', 'leche'], day: 2 },
  latte: { name: 'Latte', price: 46, vessel: 'grande', items: ['espresso', 'leche', 'espuma'], day: 2 },
  iced: { name: 'Iced latte', price: 48, vessel: 'vaso', items: ['hielo', 'espresso', 'leche'], day: 3 },
  matcha: { name: 'Matcha latte', price: 56, vessel: 'grande', items: ['matcha', 'leche', 'espuma'], day: 3 },
}

export const INGREDIENTS = {
  espresso: { name: 'Espresso', stock: 'granos', pull: 1.4, day: 1 },
  leche: { name: 'Leche', stock: 'leche', day: 1 },
  espuma: { name: 'Espuma', stock: 'leche', pull: 0.8, day: 2 },
  agua: { name: 'Agua caliente', day: 1 },
  hielo: { name: 'Hielo', day: 3 },
  matcha: { name: 'Matcha', stock: 'matcha', day: 3 },
}

export const VESSELS = {
  chica: { name: 'Taza chica', stock: 'tazas', day: 1 },
  grande: { name: 'Taza grande', stock: 'tazas', day: 1 },
  vaso: { name: 'Vaso', stock: 'vasos', day: 3 },
}

export const SUPPLIES = {
  granos: { name: 'Granos de café', pack: 10, cost: 40, day: 1 },
  leche: { name: 'Leche', pack: 10, cost: 30, day: 1 },
  tazas: { name: 'Tazas', pack: 10, cost: 20, day: 1 },
  lazos: { name: 'Lazos de cardamomo', pack: 6, cost: 54, day: 1 },
  vasos: { name: 'Vasos', pack: 10, cost: 20, day: 3 },
  matcha: { name: 'Matcha', pack: 5, cost: 45, day: 3 },
}

export const MAX_PICKUP = 3
const MAX_ITEMS = 4
const DAY_LEN = 210
const DAY_START = 8
const DAY_HOURS = 10

// Seats on the café floor. `path` leads from the street to the spot in front of the seat.
const DOOR_OUT = { x: 0, z: 7.5 }
export const SEATS = [
  ...[-2, -0.7, 0.6, 1.9].map((z, i) => ({
    id: `w${i}`,
    path: [{ x: 0, z: 6.2 }, { x: 0, z: 4 }, { x: 3.3, z: 3.4 }, { x: 4.15, z }],
    sit: { x: 4.85, z, h: 0.74, face: Math.PI / 2, leg: -1.0 },
  })),
  { id: 't0', path: [{ x: 0, z: 6.2 }, { x: 0, z: 4 }, { x: 0.25, z: 0.9 }], sit: { x: 1.4, z: 0.86, h: 0.45, face: 0, leg: -1.45 } },
  { id: 't1', path: [{ x: 0, z: 6.2 }, { x: 0, z: 4 }, { x: 0.25, z: 2.4 }], sit: { x: 1.4, z: 2.34, h: 0.45, face: Math.PI, leg: -1.45 } },
]

// Where the barista stands to use each part of the counter.
export const STATIONS = {
  prep: { x: -1.9, z: -2.2, label: 'Preparar' },
  pickup: { x: -0.05, z: -2.2, label: 'Agarrar pedido' },
  pastry: { x: 0.9, z: -2.2, label: 'Agarrar lazo' },
}

const SHIRTS = ['#c0392b', '#2c6e8f', '#3d6b4f', '#f2c53d', '#6c4f8a', '#e07a3f', '#2f3a4a', '#d9d2c3', '#8a3b5c']
const PANTS = ['#2d3138', '#4a3b2c', '#33415c', '#5b5f4a', '#1f1f22']
const SKINS = ['#f1c7a8', '#e0ac88', '#c68a62', '#9a6646', '#6e452e']
const HAIRS = ['#2a1d16', '#5a3a24', '#b88a52', '#d8c08a', '#7a2f1e', '#1b1b1d', '#9a9a9a']

/* ---------------- state ---------------- */

const SAVE_KEY = 'asa-cafe-juego-v1'

function freshProgress() {
  return {
    day: 1,
    money: 150,
    rating: 4,
    best: 0,
    stock: { granos: 12, leche: 10, tazas: 15, lazos: 4, vasos: 0, matcha: 0 },
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    return { ...freshProgress(), ...p, stock: { ...freshProgress().stock, ...p.stock } }
  } catch {
    return null
  }
}

function saveProgress() {
  try {
    const { day, money, rating, best, stock } = state
    localStorage.setItem(SAVE_KEY, JSON.stringify({ day, money, rating, best, stock }))
  } catch {
    /* storage can be unavailable (private mode); the game still runs */
  }
}

export const state = {
  screen: 'start',
  panel: null,
  saved: loadProgress(),
  ...freshProgress(),
  dayTime: 0,
  spawnIn: 3,
  open: true,
  customers: [],
  nextId: 1,
  player: { x: 0, z: 2.2, heading: Math.PI, hand: null },
  walk: null,
  pickup: [],
  prep: { vessel: null, items: [], pulling: null },
  stats: { served: 0, lost: 0, earned: 0, tips: 0, spent: 0 },
  focus: null,
  toasts: [],
  highlight: null,
  version: 0,
  sceneKey: '',
}

/* ---------------- store plumbing ---------------- */

const listeners = new Set()
let lastNotify = 0
function notify() {
  state.version++
  lastNotify = performance.now()
  listeners.forEach((l) => l())
}
function bumpScene() {
  const h = state.player.hand
  state.sceneKey = `${state.customers.map((c) => c.id + c.state).join(',')}|${state.pickup.length}|${h ? h.label : ''}`
}
const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export function useGame() {
  useSyncExternalStore(subscribe, () => state.version)
  return state
}
export function useSceneKey() {
  return useSyncExternalStore(subscribe, () => state.sceneKey)
}

function buzz(ms = 12) {
  if (navigator.vibrate) navigator.vibrate(ms)
}

let toastId = 1
export function toast(text, kind = 'info') {
  state.toasts.push({ id: toastId++, text, kind, t: kind === 'coin' ? 1.6 : 2.4 })
  if (state.toasts.length > 4) state.toasts.shift()
}

/* ---------------- helpers ---------------- */

const pick = (a) => a[Math.floor(Math.random() * a.length)]
const same = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join()

export const unlocked = (obj) => Object.entries(obj).filter(([, v]) => v.day <= state.day)

export function clockLabel() {
  const h = DAY_START + Math.min(1, state.dayTime / DAY_LEN) * DAY_HOURS
  const hh = Math.floor(h)
  const mm = Math.floor((h - hh) * 60 / 5) * 5
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}
export const sunTime = () => DAY_START + Math.min(1, state.dayTime / DAY_LEN) * DAY_HOURS

export function drinkFrom(vessel, items) {
  const match = Object.entries(RECIPES).find(([, r]) => !r.pastry && r.vessel === vessel && same(r.items, items))
  return { recipe: match ? match[0] : null, label: match ? match[1].name : 'Bebida rara', vessel, items: [...items] }
}

const attentionPatience = () => Math.max(24, 36 - state.day)
const orderPatience = () => Math.max(45, 80 - state.day * 5)
const spawnGap = () => Math.max(7, 15 - state.day) * (0.75 + Math.random() * 0.5)

/* ---------------- game flow ---------------- */

export function startGame(fresh) {
  const progress = !fresh && state.saved ? state.saved : freshProgress()
  Object.assign(state, progress)
  beginDay()
}

function beginDay() {
  Object.assign(state, {
    screen: 'playing',
    panel: null,
    dayTime: 0,
    spawnIn: 3,
    open: true,
    customers: [],
    walk: null,
    pickup: [],
    prep: { vessel: null, items: [], pulling: null },
    stats: { served: 0, lost: 0, earned: 0, tips: 0, spent: 0 },
    focus: null,
    toasts: [],
  })
  state.player = { x: 0, z: 2.2, heading: Math.PI, hand: null }
  if (state.day === 2) toast('Nuevo en el menú: Flat white y Latte', 'info')
  if (state.day === 3) {
    state.stock.vasos += 10
    state.stock.matcha += 5
    toast('Nuevo: Iced latte y Matcha latte. Te regalamos vasos y matcha.', 'info')
  }
  bumpScene()
  notify()
}

export function nextDay() {
  state.day++
  saveProgress()
  state.saved = loadProgress()
  beginDay()
}

export function pause(on = true) {
  if (state.screen === 'playing' && on) state.screen = 'paused'
  else if (state.screen === 'paused' && !on) state.screen = 'playing'
  notify()
}

export function quitToMenu() {
  if (state.screen === 'summary') state.day++
  saveProgress()
  state.saved = loadProgress()
  state.screen = 'start'
  state.panel = null
  notify()
}

export function setPanel(panel) {
  state.panel = state.panel === panel ? null : panel
  notify()
}

/* ---------------- customers ---------------- */

function spawnCustomer() {
  const taken = new Set(state.customers.map((c) => c.seat.id))
  const free = SEATS.filter((s) => !taken.has(s.id))
  if (!free.length) return
  const seat = pick(free)
  const menu = unlocked(RECIPES)
  const weighted = menu.flatMap(([k, r]) => (r.pastry ? [k] : [k, k]))
  const start = seat.path[0]
  state.customers.push({
    id: state.nextId++,
    seat,
    order: pick(weighted),
    look: { shirt: pick(SHIRTS), pants: pick(PANTS), skin: pick(SKINS), hair: pick(HAIRS), long: Math.random() < 0.4 },
    x: start.x,
    z: start.z + 1.2,
    heading: Math.PI,
    path: [...seat.path, seat.sit],
    state: 'entering',
    patience: 0,
    patienceMax: 1,
    timer: 0,
    moving: true,
  })
  bumpScene()
}

function leave(c, angry) {
  c.state = angry ? 'angry' : 'leaving'
  c.path = [...[...c.seat.path].reverse(), DOOR_OUT]
  c.moving = true
}

function walkCustomer(c, dt) {
  const target = c.path[0]
  if (!target) return true
  const dx = target.x - c.x
  const dz = target.z - c.z
  const d = Math.hypot(dx, dz)
  const step = 1.35 * dt
  if (d <= step) {
    c.x = target.x
    c.z = target.z
    c.path.shift()
    return c.path.length === 0
  }
  c.x += (dx / d) * step
  c.z += (dz / d) * step
  c.heading = Math.atan2(dx, dz)
  return false
}

function lose(c) {
  state.stats.lost++
  state.rating = Math.max(0, state.rating * 0.85 + 1 * 0.15)
  toast('Un cliente se fue enojado', 'bad')
  leave(c, true)
  buzz(40)
}

function tickCustomers(dt) {
  for (const c of state.customers) {
    if (c.state === 'entering') {
      if (walkCustomer(c, dt)) {
        c.state = 'ready'
        c.moving = false
        c.heading = c.seat.sit.face
        c.patience = c.patienceMax = attentionPatience()
      }
    } else if (c.state === 'ready' || c.state === 'waiting') {
      c.patience -= dt
      if (c.patience <= 0) lose(c)
    } else if (c.state === 'served') {
      c.timer -= dt
      if (c.timer <= 0) leave(c, false)
    } else if (c.state === 'leaving' || c.state === 'angry') {
      if (walkCustomer(c, dt)) c.gone = true
    }
  }
  if (state.customers.some((c) => c.gone)) {
    state.customers = state.customers.filter((c) => !c.gone)
    bumpScene()
  }
}

/* ---------------- interactions ---------------- */

const atCounter = (p) => p.z < -1.55 && p.x > -3.7 && p.x < 1.9

export function findInteraction() {
  const p = state.player
  let best = null
  let bestD = 1.45
  for (const c of state.customers) {
    if (c.state !== 'ready' && c.state !== 'waiting') continue
    const d = Math.hypot(c.x - p.x, c.z - p.z)
    if (d >= bestD) continue
    if (c.state === 'ready') {
      best = { kind: 'order', id: c.id, label: 'Tomar pedido', x: c.x, z: c.z }
      bestD = d
    } else if (p.hand) {
      best = { kind: 'deliver', id: c.id, label: 'Entregar', x: c.x, z: c.z }
      bestD = d
    }
  }
  if (best) return best
  if (!atCounter(p)) return null
  if (p.x > -0.6 && p.x < 0.45 && state.pickup.length && !p.hand) return { kind: 'pickup', label: STATIONS.pickup.label, x: -0.05, z: -2.85 }
  if (p.x >= 0.45 && !p.hand) {
    return state.stock.lazos > 0 ? { kind: 'pastry', label: STATIONS.pastry.label, x: 0.75, z: -2.85 } : { kind: 'none', label: 'Sin lazos', x: 0.75, z: -2.85 }
  }
  return { kind: 'prep', label: STATIONS.prep.label, x: -1.9, z: -2.85 }
}

export function interact() {
  if (state.screen !== 'playing') return
  const f = findInteraction()
  if (!f) return
  if (f.kind === 'prep') state.panel = 'prep'
  else if (f.kind === 'pickup') {
    state.player.hand = state.pickup.shift()
    buzz()
  } else if (f.kind === 'pastry') {
    state.stock.lazos--
    state.player.hand = { recipe: 'lazo', label: 'Lazo de cardamomo', pastry: true }
    buzz()
  } else if (f.kind === 'order') takeOrder(state.customers.find((c) => c.id === f.id))
  else if (f.kind === 'deliver') deliver(state.customers.find((c) => c.id === f.id))
  bumpScene()
  notify()
}

function takeOrder(c) {
  if (!c) return
  c.state = 'waiting'
  c.patience = c.patienceMax = orderPatience()
  toast(`Pedido: ${RECIPES[c.order].name}`)
  buzz()
}

function deliver(c) {
  const hand = state.player.hand
  if (!c || !hand) return
  if (hand.recipe !== c.order) {
    c.patience = Math.max(1, c.patience - 8)
    toast(`No pidió eso: quiere ${RECIPES[c.order].name}`, 'bad')
    buzz(40)
    return
  }
  const r = RECIPES[c.order]
  const frac = Math.max(0, c.patience / c.patienceMax)
  const tip = Math.round(r.price * 0.35 * frac)
  state.money += r.price + tip
  state.stats.served++
  state.stats.earned += r.price + tip
  state.stats.tips += tip
  state.rating = Math.min(5, state.rating * 0.85 + (3 + 2 * frac) * 0.15)
  c.lastDrink = hand
  state.player.hand = null
  c.state = 'served'
  c.timer = 3.2
  toast(tip ? `+${r.price} kr  · propina ${tip} kr` : `+${r.price} kr`, 'coin')
  buzz(25)
}

export function discardHand() {
  if (!state.player.hand) return
  state.player.hand = null
  toast('Lo tiraste')
  bumpScene()
  notify()
}

/* Tap-to-walk: head to a spot and act when there. */
export function walkTo(x, z, act = false) {
  state.walk = { x, z, act }
}
export function tapCustomer(id) {
  const c = state.customers.find((k) => k.id === id)
  if (!c || (c.state !== 'ready' && c.state !== 'waiting')) return
  const p = state.player
  if (Math.hypot(c.x - p.x, c.z - p.z) < 1.4) return interact()
  const a = c.seat.path[c.seat.path.length - 1]
  walkTo(a.x, a.z, true)
}
export function tapStation(kind) {
  const s = STATIONS[kind]
  const p = state.player
  if (Math.hypot(s.x - p.x, s.z - p.z) < 0.6) return interact()
  walkTo(s.x, s.z, true)
}
export function arrived() {
  const act = state.walk?.act
  state.walk = null
  if (act) interact()
}

/* ---------------- prep station ---------------- */

export function chooseVessel(v) {
  const p = state.prep
  if (p.vessel) return toast('Primero vaciá la taza', 'bad'), notify()
  const s = VESSELS[v].stock
  if (state.stock[s] <= 0) return toast(`No quedan ${s}. Comprá en Inventario.`, 'bad'), notify()
  state.stock[s]--
  p.vessel = v
  buzz(8)
  notify()
}

export function addIngredient(i) {
  const p = state.prep
  const ing = INGREDIENTS[i]
  if (!p.vessel) return toast('Elegí una taza primero', 'bad'), notify()
  if (p.pulling) return
  if (p.items.length >= MAX_ITEMS) return toast('La taza está llena', 'bad'), notify()
  if (ing.stock && state.stock[ing.stock] <= 0) return toast(`Sin ${ing.stock}. Comprá en Inventario.`, 'bad'), notify()
  if (ing.stock) state.stock[ing.stock]--
  if (ing.pull) p.pulling = { ing: i, t: 0, dur: ing.pull }
  else p.items.push(i)
  buzz(8)
  notify()
}

export function emptyCup() {
  state.prep = { vessel: null, items: [], pulling: null }
  notify()
}

export function serveDrink() {
  const p = state.prep
  if (!p.vessel || !p.items.length || p.pulling) return
  if (state.pickup.length >= MAX_PICKUP) return toast('El mostrador está lleno: entregá algo primero', 'bad'), notify()
  const d = drinkFrom(p.vessel, p.items)
  state.pickup.push(d)
  state.prep = { vessel: null, items: [], pulling: null }
  toast(`${d.label} listo en el mostrador`, d.recipe ? 'good' : 'bad')
  buzz(15)
  bumpScene()
  notify()
}

/* ---------------- inventory ---------------- */

export function buy(key) {
  const s = SUPPLIES[key]
  if (state.money < s.cost) return toast('No te alcanza la plata', 'bad'), notify()
  state.money -= s.cost
  state.stats.spent += s.cost
  state.stock[key] += s.pack
  toast(`+${s.pack} ${s.name.toLowerCase()}`)
  saveProgress()
  notify()
}

export const lowStock = () => unlocked(SUPPLIES).some(([k]) => state.stock[k] <= 2)

/* ---------------- main loop ---------------- */

export function tick(dt) {
  if (state.screen !== 'playing') return
  dt = Math.min(dt, 0.1)
  state.dayTime += dt

  if (state.open) {
    state.spawnIn -= dt
    if (state.spawnIn <= 0) {
      spawnCustomer()
      state.spawnIn = spawnGap()
    }
    if (state.dayTime >= DAY_LEN) {
      state.open = false
      toast('¡Cerramos! Atendé a los que quedan', 'info')
    }
  }
  tickCustomers(dt)

  const p = state.prep
  if (p.pulling) {
    p.pulling.t += dt
    if (p.pulling.t >= p.pulling.dur) {
      p.items.push(p.pulling.ing)
      p.pulling = null
      buzz(8)
    }
  }

  for (const t of state.toasts) t.t -= dt
  state.toasts = state.toasts.filter((t) => t.t > 0)

  state.focus = findInteraction()
  bumpScene()

  const overtime = state.dayTime > DAY_LEN + 50
  if (!state.open && (!state.customers.length || overtime)) {
    state.best = Math.max(state.best, state.stats.earned)
    state.screen = 'summary'
    saveProgress()
    state.saved = loadProgress()
    notify()
    return
  }

  if (performance.now() - lastNotify > 100) notify()
}

let raf = 0
export function runLoop() {
  let last = performance.now()
  // Fixed sub-steps keep the game at real speed even when frames are slow or throttled.
  const loop = (t) => {
    raf = requestAnimationFrame(loop)
    let dt = Math.min(0.5, (t - last) / 1000)
    last = t
    while (dt > 0) {
      const step = Math.min(dt, 0.1)
      tick(step)
      dt -= step
    }
  }
  raf = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(raf)
}
