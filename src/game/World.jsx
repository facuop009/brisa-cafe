import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Building } from '../three/Room'
import { EspressoBar } from '../three/EspressoBar'
import { Lighting } from '../three/Lighting'
import { Neighborhood } from '../three/Neighborhood'
import { Stool, Chair, RoundTable, OliveTree } from '../three/Furniture'
import { WINDOW_BAR, WINDOW_STOOLS, CAFE_TABLES, COUNTER } from '../three/layout'
import { getMaterials, oakFor } from '../three/materials'
import { store as siteStore } from '../store'
import { state, useSceneKey, tapCustomer, tapStation, walkTo, arrived, sunTime } from './engine'
import { input, moveVector } from './input'
import { Person, DrinkModel } from './People'
import { bubbleEls } from './ui/Bubbles'

/* ---------------- the café floor (no counter stools: that is where the barista works) ---------------- */

function CafeFloor() {
  const m = getMaterials()
  const len = WINDOW_BAR.z1 - WINDOW_BAR.z0
  return (
    <group>
      <EspressoBar />
      <mesh material={oakFor('windowbar', [2.4, 0.2])} position={[WINDOW_BAR.x, 1.0, (WINDOW_BAR.z0 + WINDOW_BAR.z1) / 2]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.045, len]} />
      </mesh>
      {[WINDOW_BAR.z0 + 0.2, WINDOW_BAR.z1 - 0.2].map((z) => (
        <mesh key={z} material={m.lacquerYellow} position={[WINDOW_BAR.x + 0.05, 0.5, z]} castShadow>
          <boxGeometry args={[0.3, 0.98, 0.05]} />
        </mesh>
      ))}
      {WINDOW_STOOLS.map(([x, z]) => (
        <Stool key={z} position={[x, 0, z]} />
      ))}
      {CAFE_TABLES.map((t, i) => (
        <group key={i}>
          <RoundTable position={[t.x, 0, t.z]} />
          {t.chairs.map(([x, z, r], k) => (
            <Chair key={k} position={[x, 0, z]} rotation={r} />
          ))}
        </group>
      ))}
      <OliveTree position={[5.2, 0, -3.95]} />
    </group>
  )
}

/* ---------------- collisions ---------------- */

const R = 0.28
const BOXES = [
  { x0: -3.55, x1: 1.75, z0: -4.6, z1: -2.55 }, // counter + back bar
  { x0: -6.2, x1: -3.75, z0: -0.9, z1: 3.45 }, // stair
  { x0: 4.55, x1: 6.2, z0: -2.85, z1: 2.85 }, // window bar and stools
]
const CIRCLES = [
  { x: 1.4, z: 1.6, r: 1.0 }, // table and chairs
  { x: 5.2, z: -3.95, r: 0.6 }, // olive tree
]
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
function collide(p) {
  p.x = clamp(p.x, -5.72, 5.72)
  p.z = clamp(p.z, -4.25, 4.3)
  for (const b of BOXES) {
    const x0 = b.x0 - R
    const x1 = b.x1 + R
    const z0 = b.z0 - R
    const z1 = b.z1 + R
    if (p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1) {
      const d = [p.x - x0, x1 - p.x, p.z - z0, z1 - p.z]
      const i = d.indexOf(Math.min(...d))
      if (i === 0) p.x = x0
      else if (i === 1) p.x = x1
      else if (i === 2) p.z = z0
      else p.z = z1
    }
  }
  for (const c of CIRCLES) {
    const dx = p.x - c.x
    const dz = p.z - c.z
    const d = Math.hypot(dx, dz)
    const r = c.r + R
    if (d < r && d > 1e-4) {
      p.x = c.x + (dx / d) * r
      p.z = c.z + (dz / d) * r
    }
  }
}

/* ---------------- camera ---------------- */

export const cam = { yaw: 0, pitch: 0.42 }

function CameraRig() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const target = useMemo(() => new THREE.Vector3(), [])
  const desired = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    const portrait = size.width < size.height
    camera.fov = portrait ? 64 : 50
    camera.updateProjectionMatrix()
  }, [camera, size])

  useFrame((st, dt) => {
    if (state.screen === 'start') {
      const a = Math.sin(st.clock.elapsedTime * 0.12) * 0.7
      target.set(0, 1.5, -1)
      desired.set(a * 4.5, 2.9, 7.4)
    } else {
      cam.yaw -= input.lookX * 0.0055
      cam.pitch = clamp(cam.pitch + input.lookY * 0.0045, 0.12, 1.15)
      const p = state.player
      const d = size.width < size.height ? 4.9 : 4.2
      target.set(p.x, 1.25, p.z)
      desired.set(
        p.x + Math.sin(cam.yaw) * Math.cos(cam.pitch) * d,
        1.25 + Math.sin(cam.pitch) * d,
        p.z + Math.cos(cam.yaw) * Math.cos(cam.pitch) * d,
      )
      desired.x = clamp(desired.x, -5.75, 5.75)
      desired.z = clamp(desired.z, -4.3, 7.5)
      desired.y = clamp(desired.y, 0.5, 3.95)
    }
    input.lookX = 0
    input.lookY = 0
    camera.position.lerp(desired, 1 - Math.exp(-dt * 9))
    camera.lookAt(target)
  })
  return null
}

/* Drag on the 3D view to turn the camera (touch: right side or anywhere off the joystick; mouse: any button). */
function LookDrag() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const el = gl.domElement
    const ptrs = new Map()
    const down = (e) => ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const move = (e) => {
      const p = ptrs.get(e.pointerId)
      if (!p) return
      input.lookX += e.clientX - p.x
      input.lookY += e.clientY - p.y
      p.x = e.clientX
      p.y = e.clientY
    }
    const up = (e) => ptrs.delete(e.pointerId)
    const noMenu = (e) => e.preventDefault()
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    el.addEventListener('contextmenu', noMenu)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      el.removeEventListener('contextmenu', noMenu)
    }
  }, [gl])
  return null
}

/* ---------------- barista ---------------- */

const BARISTA = { shirt: '#f4efe6', pants: '#2d3138', skin: '#e0ac88', hair: '#2a1d16', long: false }
const SPEED = 2.7

function Player() {
  useSceneKey()
  const moving = useRef(false)
  const stuck = useRef({ t: 0, x: 0, z: 0 })
  const hand = state.player.hand

  useFrame((_, dt) => {
    const p = state.player
    moving.current = false
    if (state.screen !== 'playing' || state.panel) return
    dt = Math.min(dt, 0.1)
    const [ix, iy] = moveVector()
    let vx = 0
    let vz = 0
    if (ix || iy) {
      state.walk = null
      const s = Math.sin(cam.yaw)
      const c = Math.cos(cam.yaw)
      vx = c * ix - s * iy
      vz = -s * ix - c * iy
    } else if (state.walk) {
      const dx = state.walk.x - p.x
      const dz = state.walk.z - p.z
      const d = Math.hypot(dx, dz)
      if (d < 0.18) return arrived()
      vx = dx / d
      vz = dz / d
      const k = stuck.current
      k.t += dt
      if (k.t > 0.6) {
        if (Math.hypot(p.x - k.x, p.z - k.z) < 0.25) state.walk = null
        k.t = 0
        k.x = p.x
        k.z = p.z
      }
    }
    const len = Math.hypot(vx, vz)
    if (len < 0.05) return
    p.x += vx * SPEED * dt
    p.z += vz * SPEED * dt
    collide(p)
    p.heading = Math.atan2(vx, vz)
    moving.current = true
  })

  const read = () => ({ x: state.player.x, z: state.player.z, heading: state.player.heading, moving: moving.current, carrying: !!state.player.hand })
  return (
    <Person look={BARISTA} read={read} barista>
      {hand && <DrinkModel drink={hand} scale={1.9} />}
    </Person>
  )
}

/* ---------------- customers ---------------- */

const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
const seated = (c) => c.state === 'ready' || c.state === 'waiting' || c.state === 'served'

function Customer({ c }) {
  const hit = useRef()
  useFrame(() => hit.current?.position.set(c.x, 0.9, c.z))
  const read = () => ({ x: c.x, z: c.z, heading: c.heading, moving: !seated(c), sit: seated(c) ? c.seat.sit : null })
  return (
    <>
      <Person look={c.look} read={read}>
        {c.state === 'served' && c.lastDrink && <DrinkModel drink={c.lastDrink} scale={1.6} />}
      </Person>
      <mesh
        ref={hit}
        material={hitMat}
        onClick={(e) => {
          if (e.delta > 10) return
          e.stopPropagation()
          tapCustomer(c.id)
        }}
      >
        <cylinderGeometry args={[0.45, 0.45, 1.9, 10]} />
      </mesh>
    </>
  )
}

function Customers() {
  useSceneKey()
  return state.customers.map((c) => <Customer key={c.id} c={c} />)
}

/* Screen-space position for each customer's speech bubble. */
function BubbleProjector() {
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, size }) => {
    for (const c of state.customers) {
      const el = bubbleEls.get(c.id)
      if (!el) continue
      v.set(c.x, seated(c) ? c.seat.sit.h + 1.32 : 2.2, c.z).project(camera)
      if (v.z > 1) {
        el.style.opacity = '0'
        continue
      }
      el.style.opacity = '1'
      el.style.transform = `translate3d(${(v.x * 0.5 + 0.5) * size.width}px, ${(-v.y * 0.5 + 0.5) * size.height}px, 0)`
    }
  })
  return null
}

/* ---------------- counter: tap targets, finished drinks, focus ring ---------------- */

const SLOTS = [-0.36, -0.06, 0.24]

function Counter() {
  useSceneKey()
  const zones = [
    ['prep', -3.4, -0.55],
    ['pickup', -0.55, 0.45],
    ['pastry', 0.45, 1.65],
  ]
  return (
    <group>
      {zones.map(([kind, x0, x1]) => (
        <mesh
          key={kind}
          material={hitMat}
          position={[(x0 + x1) / 2, 0.75, COUNTER.z]}
          onClick={(e) => {
            if (e.delta > 10) return
            e.stopPropagation()
            tapStation(kind)
          }}
        >
          <boxGeometry args={[x1 - x0, 1.5, 1.0]} />
        </mesh>
      ))}
      {state.pickup.map((d, i) => (
        <group key={i} position={[SLOTS[i], COUNTER.h, COUNTER.z + 0.18]}>
          <DrinkModel drink={d} scale={1.6} />
        </group>
      ))}
    </group>
  )
}

function Floor() {
  return (
    <mesh
      material={hitMat}
      position={[0, 0.01, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        if (e.delta > 10 || state.screen !== 'playing' || state.panel) return
        e.stopPropagation()
        walkTo(clamp(e.point.x, -5.6, 5.6), clamp(e.point.z, -2.5, 4.2))
      }}
    >
      <planeGeometry args={[12, 9]} />
    </mesh>
  )
}

function Markers() {
  const ring = useRef()
  const dot = useRef()
  const mats = useMemo(
    () => ({
      ring: new THREE.MeshBasicMaterial({ color: '#f2c53d', transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false }),
      dot: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6, depthWrite: false, toneMapped: false }),
    }),
    [],
  )
  useFrame((st) => {
    const f = state.focus
    const show = state.screen === 'playing' && f && f.kind !== 'none'
    ring.current.visible = !!show
    if (show) {
      ring.current.position.set(f.x, 0.025, f.z > -2.5 ? f.z : -2.3)
      ring.current.scale.setScalar(1 + Math.sin(st.clock.elapsedTime * 5) * 0.08)
    }
    const w = state.walk
    dot.current.visible = !!w
    if (w) dot.current.position.set(w.x, 0.02, w.z)
  })
  return (
    <>
      <mesh ref={ring} material={mats.ring} rotation={[-Math.PI / 2, 0, 0]} renderOrder={5}>
        <ringGeometry args={[0.42, 0.52, 40]} />
      </mesh>
      <mesh ref={dot} material={mats.dot} rotation={[-Math.PI / 2, 0, 0]} renderOrder={5}>
        <ringGeometry args={[0.12, 0.2, 24]} />
      </mesh>
    </>
  )
}

/* The sun follows the shift: 08:00 when the doors open, 18:00 at closing. */
function SunSync() {
  const acc = useRef(1)
  useFrame((_, dt) => {
    acc.current += dt
    if (acc.current < 0.4) return
    acc.current = 0
    siteStore.set({ time: state.screen === 'start' ? 9.5 : sunTime() })
  })
  return null
}

export function World({ quality }) {
  return (
    <>
      <Lighting shadowMapSize={quality.shadowMap} />
      <Building />
      <CafeFloor />
      {quality.city && <Neighborhood />}
      <Floor />
      <Counter />
      <Markers />
      <Player />
      <Customers />
      <CameraRig />
      <LookDrag />
      <BubbleProjector />
      <SunSync />
    </>
  )
}
