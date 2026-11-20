// QA screenshots: node scripts/shot.mjs <url> <width>x<height> <outDir> [selector...]
// Takes the first screen, then scrolls each selector into view and shoots the viewport.
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const [url, size = '1440x900', outDir = '.taste-skill/qa', ...selectors] = process.argv.slice(2)
const [W, H] = size.split('x').map(Number)
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9334
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
fs.mkdirSync(outDir, { recursive: true })

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'asa-shot-'))
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--enable-gpu', '--use-angle=d3d11', '--hide-scrollbars', `--window-size=${W},${H}`, 'about:blank'])

async function target() {
  for (let i = 0; i < 40; i++) {
    try {
      const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const p = l.find((t) => t.type === 'page')
      if (p) return p.webSocketDebuggerUrl
    } catch {}
    await sleep(250)
  }
}
const ws = new WebSocket(await target())
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = new Map()
const logs = []
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) pending.get(m.id)(m), pending.delete(m.id)
  if (m.method === 'Runtime.exceptionThrown') logs.push('EXC ' + m.params.exceptionDetails.exception?.description)
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') logs.push('ERR ' + m.params.args.map((a) => a.value || a.description).join(' '))
}
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
const ev = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value

try {
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 768 })
  await send('Page.navigate', { url })
  await sleep(Number(process.env.WAIT || 7000))
  const shoot = async (name) => {
    const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 })
    fs.writeFileSync(path.join(outDir, `${name}.jpg`), Buffer.from(r.result.data, 'base64'))
    console.log('shot', name)
  }
  if (process.env.EVAL) console.log('EVAL', JSON.stringify(await ev(process.env.EVAL)))
  await shoot(`${W}-00-fold`)
  let n = 1
  for (const sel of selectors) {
    const [s, off = '0'] = sel.split('@')
    const ok = await ev(`(() => { const el = document.querySelector(${JSON.stringify(s)}); if (!el) return false; const y = el.getBoundingClientRect().top + window.scrollY + ${Number(off)}; if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true }); window.scrollTo(0, y); return true })()`)
    if (!ok) { console.log('missing', s); continue }
    await sleep(1800)
    await shoot(`${W}-${String(n++).padStart(2, '0')}-${s.replace(/[^a-z0-9]/gi, '')}${off !== '0' ? off : ''}`)
  }
  console.log(logs.length ? logs.join('\n') : 'no console errors')
} finally {
  ws.close()
  chrome.kill()
}
