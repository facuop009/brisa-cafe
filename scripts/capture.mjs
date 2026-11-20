// Renders the page's stills from the 3D model with headless Chrome.
// Usage: npm run dev (port 5173) then: node scripts/capture.mjs [filter]
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.BASE || 'http://localhost:5173'
const PORT = 9333
const filter = process.argv[2]

// [name, pos, target, fov, hour]
const ROOM = {
  '1920x1080': [
    ['hero-poster', [12.5, 9.5, 23], [0, 6.4, 0], 38, 9],
    ['hero-detail', [0.6, 1.55, -0.6], [-1.8, 1.15, -3.1], 40, 8.2],
    ['feat-blend', [-0.7, 1.35, -2.25], [-1.5, 1.15, -3.1], 35, 8.6],
    ['feat-knot', [1.3, 1.26, -2.0], [0.7, 1.12, -3.05], 32, 9.2],
    ['feat-bouquet', [0.8, 10.2, -1.6], [-0.3, 9.75, -3.6], 40, 10],
    ['gallery-cafe', [4.6, 1.7, 3.9], [-2, 1.0, -2.8], 45, 7.4],
    ['gallery-lounge', [-1.6, 6.2, 3.9], [4.2, 5.3, -0.8], 45, 12.7],
    ['gallery-florist', [-2.4, 10.8, 4.1], [1.0, 9.9, -3.0], 45, 18.9],
    ['visit-dusk', [9.5, 1.7, 17], [0, 5.6, 0], 45, 19.1],
  ],
  '1600x1000': [
    ['house-morning', [13.5, 8.5, 21], [0, 6.3, 0], 40, 7.6],
    ['house-noon', [13.5, 8.5, 21], [0, 6.3, 0], 40, 12.6],
    ['house-dusk', [13.5, 8.5, 21], [0, 6.3, 0], 40, 19.0],
  ],
  '1200x1500': [
    ['flowers-floor', [3.2, 10.5, 3.4], [-0.6, 9.8, -2.6], 50, 10.5],
    ['footer-crop', [1.9, 10.3, -1.6], [0.6, 9.7, -3.8], 40, 11],
    ['brew-serve', [3.3, 5.75, -0.25], [4.07, 5.3, -0.9], 35, 9.5],
  ],
  '900x900': [['flowers-detail', [-1.5, 10.0, -2.2], [-1.6, 9.6, -3.6], 35, 10]],
}
const STAGE = {
  '1200x1500': ['espresso', 'cortado', 'flatwhite', 'handpour', 'colddrip', 'hojicha', 'matcha', 'icedlatte'].map((v) => [`menu-${v}`, `drink:${v}`]),
  '900x600': [
    ['thumb-blend', 'bag'],
    ['thumb-knot', 'knot'],
    ['thumb-bouquet', 'bouquet'],
  ],
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function cdp() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = list.find((t) => t.type === 'page')
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await sleep(250)
  }
  throw new Error('chrome did not start')
}

function client(url) {
  const ws = new WebSocket(url)
  let id = 0
  const pending = new Map()
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    }
  }
  const send = (method, params = {}) =>
    new Promise((res) => {
      const i = ++id
      pending.set(i, res)
      ws.send(JSON.stringify({ id: i, method, params }))
    })
  return new Promise((res) => (ws.onopen = () => res({ send, close: () => ws.close() })))
}

async function evaluate(c, expr) {
  const r = await c.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'eval error')
  return r.result?.result?.value
}

async function waitFor(c, expr, ms = 30000) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (await evaluate(c, `!!(${expr})`).catch(() => false)) return
    await sleep(300)
  }
  throw new Error('timeout waiting for ' + expr)
}

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'asa-cap-'))
const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--enable-gpu',
  '--use-angle=d3d11',
  '--ignore-gpu-blocklist',
  '--window-size=1920,1500',
  '--hide-scrollbars',
  'about:blank',
])

try {
  const c = await client(await cdp())
  await c.send('Page.enable')
  await c.send('Runtime.enable')
  const jobs = []
  for (const [size, shots] of Object.entries(ROOM)) jobs.push({ size, mode: 'room', shots })
  for (const [size, shots] of Object.entries(STAGE)) for (const s of shots) jobs.push({ size, mode: 'stage', shots: [s] })

  for (const job of jobs) {
    const shots = job.shots.filter((s) => !filter || s[0].includes(filter))
    if (!shots.length) continue
    const [w, h] = job.size.split('x').map(Number)
    await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false })
    const extra = job.mode === 'stage' ? `&item=${encodeURIComponent(shots[0][1])}` : ''
    await c.send('Page.navigate', { url: `${BASE}/?capture=${job.mode}&w=${w}&h=${h}${extra}&t=${Date.now()}` })
    await waitFor(c, job.mode === 'room' ? 'window.__time' : 'window.__save && document.querySelector("canvas")')
    await sleep(job.mode === 'room' ? 2500 : 2500)
    for (const s of shots) {
      if (job.mode === 'room') {
        const [name, pos, target, fov, hour] = s
        await evaluate(c, `__time(${hour}); __cam(${JSON.stringify(pos)}, ${JSON.stringify(target)}, ${fov})`)
        await sleep(3200)
        const r = await evaluate(c, `__save('${name}')`)
        console.log(name, r?.ok ? 'saved' : r)
      } else {
        const r = await evaluate(c, `__save('${s[0]}')`)
        console.log(s[0], r?.ok ? 'saved' : r)
      }
    }
  }
  c.close()
} catch (e) {
  console.error(e)
  process.exitCode = 1
} finally {
  chrome.kill()
}
