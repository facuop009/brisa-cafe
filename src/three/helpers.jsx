import * as THREE from 'three'
import { forwardRef, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// Small replacements for the helpers this project needs, built on three.js addons only.

/* Rounded box mesh */
const rbCache = new Map()
export const RoundedBox = forwardRef(function RoundedBox({ args = [1, 1, 1], radius = 0.05, smoothness = 3, children, ...props }, ref) {
  const key = `${args.join(',')}|${radius}|${smoothness}`
  if (!rbCache.has(key)) rbCache.set(key, new RoundedBoxGeometry(args[0], args[1], args[2], smoothness, radius))
  return (
    <mesh ref={ref} geometry={rbCache.get(key)} {...props}>
      {children}
    </mesh>
  )
})

/* Orbit controls registered as the scene's default controls */
export function OrbitControls({ enabled = true, ...options }) {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const set = useThree((s) => s.set)
  const controls = useMemo(() => new OrbitControlsImpl(camera, gl.domElement), [camera, gl])
  useEffect(() => {
    set({ controls })
    return () => {
      controls.dispose()
      set({ controls: null })
    }
  }, [controls, set])
  useEffect(() => {
    controls.enabled = enabled
    Object.assign(controls, options)
  })
  useFrame(() => controls.update(), -1)
  return null
}

/* Image-based light from a few emissive cards (like a photo studio), baked once with PMREM */
export function LightformerEnvironment({ cards, intensity = 1 }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const envScene = new THREE.Scene()
    envScene.background = new THREE.Color('#2a2420')
    const geo = new THREE.PlaneGeometry(1, 1)
    cards.forEach((c) => {
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(c.color).multiplyScalar(c.intensity), side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(...c.position)
      mesh.rotation.set(...(c.rotation || [0, 0, 0]))
      mesh.scale.set(c.scale[0], c.scale[1], 1)
      envScene.add(mesh)
    })
    const pmrem = new THREE.PMREMGenerator(gl)
    const rt = pmrem.fromScene(envScene, 0.02)
    scene.environment = rt.texture
    scene.environmentIntensity = intensity
    pmrem.dispose()
    return () => {
      scene.environment = null
      rt.dispose()
      geo.dispose()
    }
  }, [gl, scene]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

/* Lowers the pixel ratio when frames are slow. */
export function AdaptiveDpr({ onDecline }) {
  const acc = useRef({ t: 0, n: 0, done: false })
  useFrame((_, dt) => {
    const a = acc.current
    if (a.done) return
    a.t += dt
    a.n++
    if (a.t > 2.5) {
      if (a.t / a.n > 1 / 40) onDecline()
      a.done = true
    }
  })
  return null
}
