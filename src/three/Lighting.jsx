import * as THREE from 'three'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { LightformerEnvironment } from './helpers'
import { store } from '../store'
import { getMaterials } from './materials'
import { PaperPendant, CylinderPendant } from './Furniture'
import { LONG_TABLE, LOUNGE_TABLES, CAFE_TABLES, FLORIST, ROOM, LEVEL, BUILDING_H } from './layout'
import { LIGHT_MIN, LIGHT_MAX } from '../lib/time'

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

const C = {
  sunLow: new THREE.Color('#ff9f5e'),
  sunHigh: new THREE.Color('#fff2e2'),
  skyDawn: new THREE.Color('#f7d2c8'),
  skyNoon: new THREE.Color('#f3ecea'),
  skyNight: new THREE.Color('#6e5566'),
  hemiSky: new THREE.Color('#f1e9ee'),
  hemiGround: new THREE.Color('#c79a86'),
}

export function sunAt(time) {
  const t = Math.min(1, Math.max(0, (time - LIGHT_MIN) / (LIGHT_MAX - LIGHT_MIN)))
  const el = 0.07 + Math.sin(t * Math.PI) * 0.88
  const az = 0.95 - 1.9 * t
  const day = smooth(6.6, 7.6, time) * (1 - smooth(17.6, 19.0, time))
  return { el, az, day }
}

const y1 = LEVEL
const y2 = 2 * LEVEL
// [position, kind, light?]
const LAMPS = [
  ...[-2.6, -0.9, 0.8].map((x) => ({ p: [x, 2.55, -3.0], kind: 'cyl', light: true })),
  ...CAFE_TABLES.map((t) => ({ p: [t.x, 2.45, t.z], kind: 'paper', r: 0.22 })),
  ...[-1.2, 0.3, 1.8].map((dz) => ({ p: [LONG_TABLE.x, y1 + 2.35, LONG_TABLE.z + dz], kind: 'paper', r: 0.28, light: true })),
  ...LOUNGE_TABLES.map((t) => ({ p: [t.x, y1 + 2.45, t.z], kind: 'paper', r: 0.2 })),
  ...[-0.5, 1.7].map((dx) => ({ p: [FLORIST.table.x + dx, y2 + 2.5, FLORIST.table.z], kind: 'paper', r: 0.32, light: true })),
]

export function Lighting({ shadowMapSize = 2048 }) {
  const m = getMaterials()
  const sun = useRef()
  const hemi = useRef()
  const lamps = useRef([])
  const { scene, gl } = useThree()
  const current = useRef(store.get().time)
  const target = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(0, BUILDING_H * 0.4, 0)
    return o
  }, [])
  const sky = useMemo(() => new THREE.Color(), [])
  const fog = useMemo(() => new THREE.Fog('#f3ecea', 34, 150), [])
  // Fog and background must exist before shaders compile, or every program recompiles on frame one.
  useLayoutEffect(() => {
    scene.fog = fog
    scene.background = sky
    return () => {
      scene.fog = null
      scene.background = null
    }
  }, [scene, fog, sky])

  useFrame((_, dt) => {
    const goal = store.get().time
    current.current += (goal - current.current) * (1 - Math.exp(-dt * 4))
    const time = current.current
    const { el, az, day } = sunAt(time)

    if (sun.current) {
      const R = 30
      sun.current.position.set(Math.cos(el) * Math.cos(az) * R, target.position.y + Math.sin(el) * R, Math.cos(el) * Math.sin(az) * R)
      const warmth = 1 - smooth(0.12, 0.7, el)
      sun.current.color.copy(C.sunHigh).lerp(C.sunLow, warmth)
      sun.current.intensity = 5.2 * day * (0.5 + 0.5 * Math.min(1, el * 2.2))
    }
    if (hemi.current) hemi.current.intensity = 0.12 + 0.3 * day

    const night = 1 - day
    scene.environmentIntensity = 0.12 + 0.3 * day
    gl.toneMappingExposure = 1.0 + 0.25 * night

    const dawnness = 1 - smooth(0.15, 0.6, el)
    sky.copy(C.skyNoon).lerp(C.skyDawn, dawnness * day).lerp(C.skyNight, night * smooth(18.4, 19.4, time))
    m.sky.color.copy(sky)
    fog.color.copy(sky)

    m.paperLamp.emissiveIntensity = 0.35 + 2.6 * night
    m.bulbWarm.color.setRGB(1, 0.85, 0.65).multiplyScalar(0.6 + 0.6 * night)
    lamps.current.forEach((l) => {
      if (l) l.intensity = 0.7 + 4 * night
    })
  })

  let li = 0
  return (
    <>
      <primitive object={target} />
      <directionalLight
        ref={sun}
        target={target}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={13}
        shadow-camera-bottom={-13}
        shadow-camera-near={5}
        shadow-camera-far={70}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <hemisphereLight ref={hemi} args={[C.hemiSky, C.hemiGround, 0.4]} />

      {LAMPS.map((l, i) => {
        const ceiling = Math.floor(l.p[1] / LEVEL) * LEVEL + ROOM.h
        const drop = ceiling - l.p[1] - 0.15
        const idx = l.light ? li++ : -1
        return (
          <group key={i}>
            {l.kind === 'cyl' ? <CylinderPendant position={l.p} drop={drop} /> : <PaperPendant position={l.p} radius={l.r} drop={drop} />}
            {l.light && (
              <pointLight
                ref={(el) => (lamps.current[idx] = el)}
                position={[l.p[0], l.p[1] - 0.15, l.p[2]]}
                distance={5}
                decay={2}
                color={l.kind === 'cyl' ? '#ffc887' : '#ffd09a'}
              />
            )}
          </group>
        )
      })}

      <LightformerEnvironment
        intensity={0.5}
        cards={[
          { intensity: 3, color: '#fff4ea', position: [8, 6, 0], rotation: [0, -Math.PI / 2, 0], scale: [14, 12] },
          { intensity: 1.2, color: '#f8ece6', position: [0, 16, 0], rotation: [Math.PI / 2, 0, 0], scale: [14, 10] },
          { intensity: 1, color: '#f3e3df', position: [0, 6, 10], rotation: [0, Math.PI, 0], scale: [14, 12] },
          { intensity: 0.5, color: '#d9b9ae', position: [-8, 4, 0], rotation: [0, Math.PI / 2, 0], scale: [10, 10] },
          { intensity: 0.35, color: '#a07c6c', position: [0, -3, 0], rotation: [-Math.PI / 2, 0, 0], scale: [14, 12] },
        ]}
      />
    </>
  )
}
