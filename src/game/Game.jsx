import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { World } from './World'
import { interact, pause, runLoop, setPanel, state, useGame } from './engine'
import { input, isMoveKey } from './input'
import { Hud } from './ui/Hud'
import { Joystick } from './ui/Joystick'
import { Bubbles } from './ui/Bubbles'
import { PrepPanel } from './ui/PrepPanel'
import { Inventory, Recipes } from './ui/Panels'
import { PauseScreen, StartScreen, SummaryScreen } from './ui/Screens'

const TIERS = {
  low: { dpr: 1.25, shadows: false, shadowMap: 512, city: false, aa: false },
  medium: { dpr: 1.5, shadows: true, shadowMap: 1024, city: true, aa: true },
  high: { dpr: 2, shadows: true, shadowMap: 2048, city: true, aa: true },
}

function detectDevice() {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  if (!coarse) return 'desktop'
  return Math.min(window.innerWidth, window.innerHeight) >= 600 ? 'tablet' : 'phone'
}

function autoTier(device) {
  if (device === 'desktop') return 'high'
  const mem = navigator.deviceMemory || 4
  return device === 'tablet' && mem >= 4 ? 'medium' : 'low'
}

const SETTINGS_KEY = 'asa-cafe-juego-ajustes'
function loadSettings() {
  try {
    return { quality: 'auto', saver: false, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }
  } catch {
    return { quality: 'auto', saver: false }
  }
}

/* Renders on demand at a capped rate, and not at all while hidden behind a full-screen panel or paused. */
function FrameDriver({ fps, active }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!active) return
    let id = 0
    let last = 0
    const gap = 1000 / fps - 2
    const loop = (t) => {
      id = requestAnimationFrame(loop)
      if (t - last >= gap) {
        last = t
        invalidate()
      }
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [fps, active, invalidate])
  return null
}

/* If the first seconds of play are slow, drop the pixel ratio once. */
function PerfMonitor({ onSlow }) {
  const acc = useRef({ t: 0, n: 0, done: false })
  useFrame((_, dt) => {
    const a = acc.current
    if (a.done || state.screen !== 'playing') return
    a.t += dt
    a.n++
    if (a.t > 4) {
      a.done = true
      if (a.t / a.n > 1 / 38) onSlow()
    }
  })
  return null
}

function useDevice() {
  const [device, setDevice] = useState(detectDevice)
  useEffect(() => {
    const on = () => setDevice(detectDevice())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return device
}

function useKeyboard() {
  useEffect(() => {
    const typing = (e) => e.target instanceof HTMLElement && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)
    const down = (e) => {
      if (typing(e)) return
      if (isMoveKey(e.code)) {
        input.keys.add(e.code)
        e.preventDefault()
        return
      }
      if (e.repeat) return
      if (e.code === 'Escape') {
        if (state.panel) setPanel(state.panel)
        else if (state.screen === 'playing') pause(true)
        else if (state.screen === 'paused') pause(false)
        return
      }
      if (state.screen !== 'playing') return
      if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
        if (!state.panel) interact()
        e.preventDefault()
      } else if (e.code === 'KeyR') setPanel('recipes')
      else if (e.code === 'KeyI') setPanel('inventory')
    }
    const up = (e) => input.keys.delete(e.code)
    const clear = () => input.keys.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [])
}

export function Game() {
  const g = useGame()
  const device = useDevice()
  const [settings, setSettingsRaw] = useState(loadSettings)
  const [slow, setSlow] = useState(false)
  const [visible, setVisible] = useState(!document.hidden)
  useKeyboard()

  useEffect(() => runLoop(), [])
  useEffect(() => {
    const on = () => {
      setVisible(!document.hidden)
      if (document.hidden && state.screen === 'playing') pause(true)
    }
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])

  const setSettings = (s) => {
    setSettingsRaw(s)
    setSlow(false)
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
    } catch {
      /* not persisted */
    }
  }

  const tierName = settings.quality === 'auto' ? autoTier(device) : settings.quality
  const tier = TIERS[tierName]
  const dpr = Math.min(window.devicePixelRatio || 1, slow ? 1 : tier.dpr)
  const covered = device === 'phone' && !!g.panel
  const active = visible && !covered && (g.screen === 'playing' || g.screen === 'start')
  const fps = settings.saver || g.screen === 'start' ? 30 : 60

  return (
    <div className="game" data-device={device} data-screen={g.screen}>
      <div className="game__canvas">
        <Canvas
          key={tierName}
          shadows={tier.shadows}
          dpr={dpr}
          frameloop="demand"
          camera={{ fov: 55, near: 0.05, far: 160, position: [0, 2.9, 7.4] }}
          gl={{ antialias: tier.aa, powerPreference: device === 'desktop' ? 'high-performance' : 'default' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.shadowMap.type = THREE.PCFSoftShadowMap
          }}
        >
          <World quality={tier} />
          <FrameDriver fps={fps} active={active} />
          <PerfMonitor onSlow={() => setSlow(true)} />
        </Canvas>
      </div>

      {g.screen === 'playing' && (
        <>
          <Bubbles />
          {device !== 'desktop' && !g.panel && <Joystick />}
          <Hud device={device} />
          {g.panel === 'prep' && <PrepPanel />}
          {g.panel === 'inventory' && <Inventory />}
          {g.panel === 'recipes' && <Recipes />}
        </>
      )}
      {g.screen === 'start' && <StartScreen device={device} settings={settings} setSettings={setSettings} />}
      {g.screen === 'paused' && <PauseScreen settings={settings} setSettings={setSettings} />}
      {g.screen === 'summary' && <SummaryScreen />}
    </div>
  )
}
