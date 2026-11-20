import * as THREE from 'three'

// Procedural textures painted on canvases at start-up. No image downloads,
// so the room appears as soon as the code has parsed.

function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function toTexture(canvas, { repeat = [1, 1], srgb = true } = {}) {
  const t = new THREE.CanvasTexture(canvas)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  t.needsUpdate = true
  return t
}

const cache = new Map()
function cached(key, fn) {
  if (!cache.has(key)) cache.set(key, fn())
  return cache.get(key)
}

/* ---------- White oak ---------- */
function paintOak(ctx, w, h, r, { planks, hue = 32, sat = 34, light = 66, seams = false, joints = false }) {
  const ph = h / planks
  for (let i = 0; i < planks; i++) {
    const y0 = i * ph
    const l = light + (r() - 0.5) * 7
    const hh = hue + (r() - 0.5) * 4
    ctx.fillStyle = `hsl(${hh},${sat}%,${l}%)`
    ctx.fillRect(0, y0, w, ph)
    // soft tonal streaks
    for (let k = 0; k < 10; k++) {
      ctx.fillStyle = `hsla(${hh},${sat}%,${l + (r() - 0.5) * 10}%,0.18)`
      ctx.fillRect(0, y0 + r() * ph, w, 2 + r() * ph * 0.25)
    }
    // grain lines
    const lines = Math.floor(ph * 0.9)
    for (let k = 0; k < lines; k++) {
      const y = y0 + r() * ph
      const amp = 0.4 + r() * 2.6
      const freq = 0.002 + r() * 0.01
      const phase = r() * 6.28
      ctx.strokeStyle = `hsla(${hh - 3},${sat + 6}%,${l - 14 - r() * 16}%,${0.05 + r() * 0.16})`
      ctx.lineWidth = 0.5 + r() * 1.4
      ctx.beginPath()
      for (let x = 0; x <= w; x += 12) {
        const yy = y + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 3.1 + phase) * amp * 0.3
        if (x === 0) ctx.moveTo(x, yy)
        else ctx.lineTo(x, yy)
      }
      ctx.stroke()
    }
    // medullary rays: short light flecks typical of quarter-sawn oak
    for (let k = 0; k < ph * 0.6; k++) {
      ctx.fillStyle = `hsla(${hh},${sat}%,${l + 8}%,${0.15 + r() * 0.2})`
      ctx.fillRect(r() * w, y0 + r() * ph, 6 + r() * 26, 1 + r() * 1.5)
    }
    if (seams) {
      ctx.fillStyle = 'rgba(60,40,25,0.55)'
      ctx.fillRect(0, y0, w, 2)
      ctx.fillStyle = 'rgba(255,240,220,0.18)'
      ctx.fillRect(0, y0 + 2, w, 1)
    }
    if (joints) {
      const n = 1 + Math.floor(r() * 2)
      for (let j = 0; j < n; j++) {
        const x = r() * w
        ctx.fillStyle = 'rgba(60,40,25,0.45)'
        ctx.fillRect(x, y0, 2, ph)
      }
    }
  }
}

export function oakCanvas(kind = 'furniture') {
  return cached(`oak-${kind}`, () => {
    const [c, ctx] = makeCanvas(1024, 1024)
    const r = rng(kind === 'floor' ? 7 : kind === 'dark' ? 21 : 13)
    if (kind === 'floor') paintOak(ctx, 1024, 1024, r, { planks: 6, seams: true, joints: true, light: 70, sat: 30 })
    else if (kind === 'dark') paintOak(ctx, 1024, 1024, r, { planks: 3, hue: 26, sat: 28, light: 32 })
    else paintOak(ctx, 1024, 1024, r, { planks: 3, light: 68 })
    return c
  })
}

/* ---------- Board-marked concrete ---------- */
export function concreteCanvas(kind = 'wall') {
  return cached(`concrete-${kind}`, () => {
    const S = 1024
    const [c, ctx] = makeCanvas(S, S)
    const r = rng(kind === 'wall' ? 3 : 11)
    const base = kind === 'wall' ? [236, 192, 188] : [226, 178, 174] // pink lime concrete
    ctx.fillStyle = `rgb(${base.join(',')})`
    ctx.fillRect(0, 0, S, S)
    for (let i = 0; i < 2600; i++) {
      const rad = 8 + r() * 90
      const d = (r() - 0.5) * 34
      ctx.fillStyle = `rgba(${base[0] + d},${base[1] + d},${base[2] + d * 0.9},0.05)`
      ctx.beginPath()
      ctx.arc(r() * S, r() * S, rad, 0, Math.PI * 2)
      ctx.fill()
    }
    const img = ctx.getImageData(0, 0, S, S)
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (r() - 0.5) * 14
      img.data[i] += n
      img.data[i + 1] += n
      img.data[i + 2] += n
    }
    ctx.putImageData(img, 0, 0)
    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = `rgba(130,90,86,${0.2 + r() * 0.35})`
      ctx.beginPath()
      ctx.arc(r() * S, r() * S, 0.6 + r() * 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
    if (kind === 'wall') {
      // 2 × 2 formwork panels with seams and tie holes
      ctx.fillStyle = 'rgba(150,100,96,0.3)'
      ctx.fillRect(0, S / 2 - 1, S, 2)
      ctx.fillRect(S / 2 - 1, 0, 2, S)
      ctx.fillRect(0, 0, S, 2)
      ctx.fillRect(0, 0, 2, S)
      for (let px = 0; px < 2; px++)
        for (let py = 0; py < 2; py++)
          for (let i = 0; i < 3; i++)
            for (let j = 0; j < 2; j++) {
              const x = px * (S / 2) + (S / 2) * (0.17 + i * 0.33)
              const y = py * (S / 2) + (S / 2) * (0.25 + j * 0.5)
              ctx.fillStyle = 'rgba(225,220,212,0.5)'
              ctx.beginPath()
              ctx.arc(x, y, 9, 0, Math.PI * 2)
              ctx.fill()
              ctx.fillStyle = 'rgba(120,80,76,0.7)'
              ctx.beginPath()
              ctx.arc(x, y, 5.5, 0, Math.PI * 2)
              ctx.fill()
            }
    }
    return c
  })
}

/* ---------- Plaster, linen, gravel ---------- */
export function speckleCanvas(key, rgb, amount = 10, size = 512) {
  return cached(`speckle-${key}`, () => {
    const [c, ctx] = makeCanvas(size, size)
    const r = rng(key.length * 31)
    ctx.fillStyle = `rgb(${rgb.join(',')})`
    ctx.fillRect(0, 0, size, size)
    const img = ctx.getImageData(0, 0, size, size)
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (r() - 0.5) * amount
      img.data[i] += n
      img.data[i + 1] += n
      img.data[i + 2] += n
    }
    ctx.putImageData(img, 0, 0)
    return c
  })
}

export function gravelCanvas() {
  return cached('gravel', () => {
    const S = 1024
    const [c, ctx] = makeCanvas(S, S)
    const r = rng(99)
    ctx.fillStyle = '#d9d3c8'
    ctx.fillRect(0, 0, S, S)
    for (let i = 0; i < 26000; i++) {
      const l = 70 + r() * 25
      ctx.fillStyle = `hsl(35,${6 + r() * 8}%,${l}%)`
      ctx.beginPath()
      ctx.arc(r() * S, r() * S, 1 + r() * 2.4, 0, Math.PI * 2)
      ctx.fill()
    }
    // raked lines
    for (let y = 0; y < S; y += 18) {
      ctx.fillStyle = 'rgba(120,110,95,0.22)'
      ctx.fillRect(0, y, S, 3)
    }
    return c
  })
}

/* ---------- Liquid surfaces ---------- */
export function liquidCanvas(kind) {
  return cached(`liquid-${kind}`, () => {
    const S = 512
    const [c, ctx] = makeCanvas(S, S)
    const r = rng(kind.length * 17)
    const cx = S / 2
    const fill = (inner, outer) => {
      const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx)
      g.addColorStop(0, inner)
      g.addColorStop(1, outer)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, S, S)
    }
    if (kind === 'crema') {
      fill('#c99560', '#6b3f20')
      for (let i = 0; i < 1400; i++) {
        ctx.fillStyle = `rgba(${r() > 0.5 ? '240,200,150' : '80,45,20'},${0.08 + r() * 0.12})`
        ctx.beginPath()
        ctx.arc(r() * S, r() * S, 1 + r() * 3, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (kind === 'matcha') {
      fill('#a3b860', '#6f8a35')
      for (let i = 0; i < 2500; i++) {
        ctx.fillStyle = `rgba(230,240,190,${0.08 + r() * 0.15})`
        ctx.beginPath()
        ctx.arc(r() * S, r() * S, 0.8 + r() * 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (kind === 'black') {
      fill('#3a2416', '#1c110a')
    } else {
      // latte art: heart, on crema (or hojicha tan)
      const hoji = kind === 'hojicha'
      fill(hoji ? '#b98c62' : '#a76c3c', hoji ? '#7d5634' : '#5a3218')
      const milk = hoji ? '#efe2cf' : '#f4e9d8'
      ctx.fillStyle = milk
      ctx.globalAlpha = 0.96
      // rings of a layered heart
      for (let k = 0; k < 4; k++) {
        const s = 1 - k * 0.2
        ctx.beginPath()
        ctx.moveTo(cx, cx + 120 * s + 30)
        ctx.bezierCurveTo(cx - 170 * s, cx + 10 * s, cx - 120 * s, cx - 150 * s, cx, cx - 70 * s + k * 14)
        ctx.bezierCurveTo(cx + 120 * s, cx - 150 * s, cx + 170 * s, cx + 10 * s, cx, cx + 120 * s + 30)
        ctx.fillStyle = k % 2 ? (hoji ? '#b98c62' : '#9b6234') : milk
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.strokeStyle = hoji ? '#b98c62' : '#9b6234'
      ctx.lineWidth = 7
      ctx.beginPath()
      ctx.moveTo(cx, cx - 190)
      ctx.lineTo(cx, cx + 170)
      ctx.stroke()
    }
    return c
  })
}

/* ---------- Printed things of the shop ---------- */
export function signCanvas() {
  return cached('sign', () => {
    const [c, ctx] = makeCanvas(1024, 512)
    ctx.clearRect(0, 0, 1024, 512)
    ctx.fillStyle = '#efe6d6'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '300 250px "Yu Mincho","Hiragino Mincho ProN","Noto Serif JP",serif'
    ctx.fillText('朝', 512, 210)
    ctx.font = '400 92px Imbue, "Times New Roman", serif'
    ctx.letterSpacing = '30px'
    ctx.fillText('ASA', 527, 420)
    return c
  })
}

export function bagCanvas() {
  return cached('bag', () => {
    const [c, ctx] = makeCanvas(512, 768)
    const r = rng(5)
    ctx.fillStyle = '#c4a47c'
    ctx.fillRect(0, 0, 512, 768)
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? '120,90,55' : '230,210,180'},0.12)`
      ctx.fillRect(r() * 512, r() * 768, 1 + r() * 6, 1)
    }
    ctx.fillStyle = '#f1ece4'
    ctx.fillRect(70, 250, 372, 330)
    ctx.fillStyle = '#221b17'
    ctx.textAlign = 'center'
    ctx.font = '400 120px Imbue, "Times New Roman", serif'
    ctx.fillText('ASA', 256, 380)
    ctx.font = '500 30px "Albert Sans", Arial, sans-serif'
    ctx.fillText('Morning Blend', 256, 450)
    ctx.font = '400 24px "Albert Sans", Arial, sans-serif'
    ctx.fillText('Huila · Guji — 250 g', 256, 500)
    ctx.fillText('Roasted Tuesday', 256, 540)
    return c
  })
}

export function ensoCanvas() {
  return cached('enso', () => {
    const [c, ctx] = makeCanvas(400, 1200)
    const r = rng(42)
    ctx.fillStyle = '#efe8db'
    ctx.fillRect(0, 0, 400, 1200)
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(150,130,100,${r() * 0.05})`
      ctx.fillRect(r() * 400, r() * 1200, 2, 2)
    }
    // ensō brush circle
    const cx = 200
    const cy = 520
    const R = 120
    for (let a = 0.35; a < Math.PI * 2 - 0.15; a += 0.012) {
      const t = a / (Math.PI * 2)
      const w = 26 * Math.sin(Math.min(1, t * 1.4) * Math.PI * 0.95) + 4
      ctx.fillStyle = `rgba(28,24,22,${0.65 + r() * 0.25})`
      ctx.beginPath()
      ctx.arc(cx + Math.cos(a - 1.4) * R, cy + Math.sin(a - 1.4) * R, w * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }
    // a small red seal
    ctx.fillStyle = '#9c3b2a'
    ctx.fillRect(250, 760, 34, 34)
    return c
  })
}

export function norenCanvas() {
  return cached('noren', () => {
    const [c, ctx] = makeCanvas(512, 512)
    const r = rng(8)
    ctx.fillStyle = '#efc7c4'
    ctx.fillRect(0, 0, 512, 512)
    for (let y = 0; y < 512; y += 2) {
      ctx.fillStyle = `rgba(150,135,110,${0.04 + r() * 0.05})`
      ctx.fillRect(0, y, 512, 1)
    }
    for (let x = 0; x < 512; x += 2) {
      ctx.fillStyle = `rgba(150,135,110,${0.03 + r() * 0.04})`
      ctx.fillRect(x, 0, 1, 512)
    }
    ctx.strokeStyle = '#2a2420'
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.arc(256, 210, 60, 0, Math.PI * 2)
    ctx.stroke()
    return c
  })
}

export function pastryCanvas() {
  return cached('pastry', () => {
    const [c, ctx] = makeCanvas(256, 256)
    const r = rng(77)
    ctx.fillStyle = '#c0813f'
    ctx.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 2600; i++) {
      const dark = r() > 0.5
      ctx.fillStyle = dark ? `rgba(110,55,20,${r() * 0.25})` : `rgba(240,190,120,${r() * 0.25})`
      ctx.beginPath()
      ctx.arc(r() * 256, r() * 256, 1 + r() * 5, 0, Math.PI * 2)
      ctx.fill()
    }
    // pearl sugar
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = 'rgba(250,246,238,0.9)'
      ctx.fillRect(r() * 256, r() * 256, 3, 3)
    }
    return c
  })
}

/* ---------- Neighbour facades: 4 bays x 2 floors, tinted by vertex colour; a glow map lights some windows at night ---------- */
export function facadeCanvases() {
  return cached('facade', () => {
    const BW = 256
    const BH = 256
    const NX = 4
    const NY = 2
    const [c, ctx] = makeCanvas(BW * NX, BH * NY)
    const [g, gtx] = makeCanvas(BW * NX, BH * NY)
    const r = rng(404)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, c.width, c.height)
    gtx.fillStyle = '#000000'
    gtx.fillRect(0, 0, g.width, g.height)
    for (let i = 0; i < 12000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${r() * 0.045})`
      ctx.fillRect(r() * c.width, r() * c.height, 1 + r() * 3, 1 + r() * 3)
    }
    for (let j = 0; j < NY; j++) {
      const y = j * BH
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.fillRect(0, y + BH - 8, c.width, 8)
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.fillRect(0, y + BH - 13, c.width, 5)
      for (let i = 0; i < NX; i++) {
        const x = i * BW
        const tall = r() < 0.3
        const w = 92
        const h = tall ? 184 : 138
        const x0 = x + (BW - w) / 2
        const y0 = y + (tall ? 42 : 58)
        ctx.fillStyle = 'rgba(0,0,0,0.28)'
        ctx.fillRect(x0 - 11, y0 - 9, w + 22, h + 20)
        ctx.fillStyle = '#f6f3ec'
        ctx.fillRect(x0 - 6, y0 - 6, w + 12, h + 12)
        const gr = ctx.createLinearGradient(x0, y0, x0 + w, y0 + h)
        gr.addColorStop(0, '#8696a3')
        gr.addColorStop(0.45, '#3b4550')
        gr.addColorStop(1, '#20262d')
        ctx.fillStyle = gr
        ctx.fillRect(x0, y0, w, h)
        ctx.fillStyle = 'rgba(255,255,255,0.12)'
        ctx.beginPath()
        ctx.moveTo(x0, y0 + h * 0.5)
        ctx.lineTo(x0 + w * 0.5, y0)
        ctx.lineTo(x0 + w * 0.78, y0)
        ctx.lineTo(x0, y0 + h * 0.82)
        ctx.fill()
        ctx.fillStyle = '#f6f3ec'
        ctx.fillRect(x0 + w / 2 - 3, y0, 6, h)
        ctx.fillRect(x0, y0 + h * 0.3, w, 5)
        ctx.fillStyle = '#ebe6dc'
        ctx.fillRect(x0 - 12, y0 + h + 6, w + 24, 9)
        ctx.fillStyle = 'rgba(0,0,0,0.25)'
        ctx.fillRect(x0 - 12, y0 + h + 15, w + 24, 6)
        if (!tall) {
          ctx.fillStyle = 'rgba(255,255,255,0.6)'
          ctx.fillRect(x0 - 12, y0 - 24, w + 24, 11)
        }
        if (r() < 0.45) {
          const k = 0.55 + r() * 0.45
          gtx.fillStyle = `rgb(${255 * k | 0},${(195 + r() * 35) * k | 0},${(110 + r() * 60) * k | 0})`
          gtx.fillRect(x0, y0, w, h)
          gtx.fillStyle = '#000000'
          gtx.fillRect(x0 + w / 2 - 3, y0, 6, h)
          gtx.fillRect(x0, y0 + h * 0.3, w, 5)
        }
      }
    }
    return { color: c, glow: g }
  })
}

/* ---------- Yellow glazed tile (zellige) ---------- */
export function tileCanvas() {
  return cached('tile', () => {
    const S = 1024
    const [c, ctx] = makeCanvas(S, S)
    const r = rng(61)
    ctx.fillStyle = '#e8dccb'
    ctx.fillRect(0, 0, S, S)
    const n = 8
    const t = S / n
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const l = 58 + (r() - 0.5) * 12
        const g = ctx.createRadialGradient(i * t + t * r(), j * t + t * r(), 4, i * t + t / 2, j * t + t / 2, t * 0.8)
        g.addColorStop(0, `hsl(${44 + r() * 4},${82 + r() * 8}%,${l + 8}%)`)
        g.addColorStop(1, `hsl(${42 + r() * 4},${78 + r() * 8}%,${l - 4}%)`)
        ctx.fillStyle = g
        ctx.fillRect(i * t + 3, j * t + 3, t - 6, t - 6)
      }
    return c
  })
}
