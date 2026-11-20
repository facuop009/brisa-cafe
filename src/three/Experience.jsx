import * as THREE from 'three'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, AdaptiveDpr } from './helpers'
import gsap from 'gsap'
import { Scene } from './Scene'
import { store, useStore } from '../store'
import { STATIONS } from './stations'

export { STATIONS }
const pick = (s) => (window.innerWidth < 768 && s.posMobile ? { ...s, pos: s.posMobile, target: s.targetMobile } : s)
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function FirstFrame() {
  const frames = useRef(0)
  useFrame(() => {
    frames.current++
    if (frames.current === 3) {
      store.set({ sceneReady: true })
    }
  })
  return null
}

// Compiles every shader in parallel (KHR_parallel_shader_compile) before the first frame,
// so the page never freezes on a synchronous compile.
function Compiler({ onDone }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    let alive = true
    const run = gl.compileAsync ? gl.compileAsync(scene, camera) : Promise.resolve()
    run.catch(() => {}).then(() => {
      if (alive) onDone()
    })
    return () => {
      alive = false
    }
  }, [gl, scene, camera, onDone])
  return null
}

function CameraRig() {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const station = useStore((s) => s.station)
  const introDone = useStore((s) => s.introDone)
  const sceneReady = useStore((s) => s.sceneReady)
  const tween = useRef()

  // Cinematic opening: from the high corner down to eye level while the sun comes up.
  useEffect(() => {
    if (!controls || !sceneReady || introDone) return
    const s = pick(STATIONS.building)
    if (reducedMotion()) {
      camera.position.set(...s.pos)
      controls.target.set(...s.target)
      controls.update()
      store.set({ introDone: true })
      return
    }
    camera.position.set(30, 22, 44)
    controls.target.set(0, 4, 0)
    controls.update()
    const goalTime = store.get().time
    const sun = { t: Math.max(6.6, goalTime - 1.4) }
    store.set({ time: sun.t })
    const tl = gsap.timeline({ delay: 0.35, onComplete: () => store.set({ introDone: true }) })
    tl.to(camera.position, { x: s.pos[0], y: s.pos[1], z: s.pos[2], duration: 3.8, ease: 'power2.inOut', onUpdate: () => controls.update() }, 0)
    tl.to(controls.target, { x: s.target[0], y: s.target[1], z: s.target[2], duration: 3.8, ease: 'power2.inOut' }, 0)
    tl.to(sun, { t: goalTime, duration: 3.6, ease: 'power1.out', onUpdate: () => store.set({ time: sun.t }) }, 0)
    return () => tl.kill()
  }, [controls, sceneReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // Station changes: a slow dolly of both the camera and its point of interest.
  useEffect(() => {
    if (!controls || !introDone) return
    const s = pick(STATIONS[station])
    tween.current?.kill()
    const dur = reducedMotion() ? 0 : 2.4
    const tl = gsap.timeline()
    tl.to(camera.position, { x: s.pos[0], y: s.pos[1], z: s.pos[2], duration: dur, ease: 'power3.inOut', onUpdate: () => controls.update() }, 0)
    tl.to(controls.target, { x: s.target[0], y: s.target[1], z: s.target[2], duration: dur, ease: 'power3.inOut' }, 0)
    tween.current = tl
  }, [station, introDone, controls, camera])

  // Keep the camera above the street and within the neighbourhood.
  useFrame(() => {
    const p = camera.position
    if (p.y < 0.35) p.y = 0.35
    if (p.length() > 48) p.setLength(48)
  })
  return null
}

function Controls() {
  const explore = useStore((s) => s.explore)
  const introDone = useStore((s) => s.introDone)
  const [fine] = useState(() => window.matchMedia('(pointer: fine)').matches)
  return (
    <OrbitControls
      enabled={introDone}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={explore ? 0.45 : 0.3}
      enableRotate={explore || fine}
      enableZoom={explore}
      enablePan={explore}
      panSpeed={0.6}
      zoomSpeed={0.7}
      minDistance={0.35}
      maxDistance={40}
      minPolarAngle={0.55}
      maxPolarAngle={1.78}
      screenSpacePanning
    />
  )
}

export default function Experience({ active = true }) {
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio, 1.75))
  const [compiled, setCompiled] = useState(false)
  const done = useCallback(() => setCompiled(true), [])
  const small = window.innerWidth < 768
  return (
    <Canvas
      shadows
      dpr={dpr}
      frameloop={active && compiled ? 'always' : 'never'}
      camera={{ fov: small ? 52 : 38, near: 0.03, far: 200, position: STATIONS.building.pos }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.shadowMap.type = THREE.PCFSoftShadowMap
      }}
      aria-hidden="true"
    >
      <AdaptiveDpr onDecline={() => setDpr(1)} />
      <Scene shadowMapSize={small ? 2048 : 4096} />
      <Controls />
      <CameraRig />
      <FirstFrame />
      {!compiled && <Compiler onDone={done} />}
    </Canvas>
  )
}
