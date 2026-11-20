import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CardamomKnot } from '../three/Tableware'

const HIP = 0.85
const geo = {
  leg: new THREE.CapsuleGeometry(0.075, 0.66, 4, 10).translate(0, -0.4, 0),
  torso: new THREE.CapsuleGeometry(0.2, 0.3, 4, 14),
  arm: new THREE.CapsuleGeometry(0.055, 0.48, 4, 8).translate(0, -0.29, 0),
  head: new THREE.SphereGeometry(0.145, 20, 16),
  hair: new THREE.SphereGeometry(0.155, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
  tail: new THREE.CapsuleGeometry(0.07, 0.18, 4, 8),
  eye: new THREE.SphereGeometry(0.018, 8, 6),
  apron: new THREE.BoxGeometry(0.36, 0.56, 0.03),
  cap: new THREE.CylinderGeometry(0.16, 0.16, 0.06, 20),
  shoe: new THREE.BoxGeometry(0.12, 0.08, 0.22),
}

const matCache = new Map()
function mat(color, rough = 0.75) {
  const k = `${color}-${rough}`
  if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color, roughness: rough }))
  return matCache.get(k)
}
const eyeMat = new THREE.MeshBasicMaterial({ color: '#1b1612' })

/* A small stylised person. `read()` returns { x, z, heading, moving, sit, carrying } every frame. */
export function Person({ look, read, barista = false, children }) {
  const root = useRef()
  const body = useRef()
  const legL = useRef()
  const legR = useRef()
  const armL = useRef()
  const armR = useRef()
  const phase = useMemo(() => Math.random() * 6, [])
  const m = useMemo(
    () => ({ shirt: mat(look.shirt), pants: mat(look.pants, 0.85), skin: mat(look.skin, 0.6), hair: mat(look.hair, 0.9), shoe: mat('#231d19', 0.6) }),
    [look],
  )

  useFrame((st, dt) => {
    const s = read()
    if (!s || !root.current) return
    root.current.position.set(s.x, 0, s.z)
    const r = root.current.rotation
    let dh = s.heading - r.y
    dh = Math.atan2(Math.sin(dh), Math.cos(dh))
    r.y += dh * Math.min(1, dt * 12)
    const t = st.clock.elapsedTime * 9 + phase
    const swing = s.moving ? Math.sin(t) * 0.6 : 0
    if (s.sit) {
      body.current.position.y = s.sit.h - HIP + 0.05
      legL.current.rotation.x = legR.current.rotation.x = s.sit.leg
      armL.current.rotation.x = armR.current.rotation.x = -0.55
    } else {
      body.current.position.y = s.moving ? Math.abs(Math.sin(t)) * 0.035 : Math.sin(st.clock.elapsedTime * 2 + phase) * 0.006
      legL.current.rotation.x = swing
      legR.current.rotation.x = -swing
      const a = s.carrying ? -1.15 : 0
      armL.current.rotation.x = s.carrying ? a : -swing * 0.8
      armR.current.rotation.x = s.carrying ? a : swing * 0.8
    }
  })

  return (
    <group ref={root}>
      <group ref={body}>
        {[
          [legL, -0.1],
          [legR, 0.1],
        ].map(([ref, x]) => (
          <group key={x} ref={ref} position={[x, HIP, 0]}>
            <mesh geometry={geo.leg} material={m.pants} castShadow />
            <mesh geometry={geo.shoe} material={m.shoe} position={[0, -0.8, 0.04]} castShadow />
          </group>
        ))}
        <mesh geometry={geo.torso} material={m.shirt} position={[0, 1.2, 0]} castShadow />
        {barista && <mesh geometry={geo.apron} material={mat('#e7a1a8', 0.8)} position={[0, 1.08, 0.19]} castShadow />}
        {[
          [armL, -0.27],
          [armR, 0.27],
        ].map(([ref, x]) => (
          <group key={x} ref={ref} position={[x, 1.44, 0]}>
            <mesh geometry={geo.arm} material={m.shirt} castShadow />
            <mesh geometry={geo.eye} material={m.skin} position={[0, -0.6, 0]} scale={3.6} />
          </group>
        ))}
        <mesh geometry={geo.head} material={m.skin} position={[0, 1.71, 0]} castShadow />
        <mesh geometry={geo.hair} material={m.hair} position={[0, 1.73, -0.015]} rotation={[-0.25, 0, 0]} castShadow />
        {look.long && <mesh geometry={geo.tail} material={m.hair} position={[0, 1.6, -0.14]} rotation={[0.3, 0, 0]} />}
        {barista && <mesh geometry={geo.cap} material={mat('#221b17', 0.7)} position={[0, 1.85, 0]} />}
        {[-0.05, 0.05].map((x) => (
          <mesh key={x} geometry={geo.eye} material={eyeMat} position={[x, 1.73, 0.135]} />
        ))}
        {children && <group position={[0, 1.08, 0.42]}>{children}</group>}
      </group>
    </group>
  )
}

/* ---------------- drinks ---------------- */

const drinkMats = {
  cup: new THREE.MeshPhysicalMaterial({ color: '#f5f1ea', roughness: 0.3, clearcoat: 0.6 }),
  cupSide: new THREE.MeshPhysicalMaterial({ color: '#f5f1ea', roughness: 0.3, clearcoat: 0.6, side: THREE.DoubleSide }),
  glass: new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transparent: true, opacity: 0.35, depthWrite: false }),
  ice: new THREE.MeshPhysicalMaterial({ color: '#f2fbff', roughness: 0.1, transparent: true, opacity: 0.8 }),
  foam: new THREE.MeshStandardMaterial({ color: '#f3eadb', roughness: 0.6 }),
  plate: new THREE.MeshPhysicalMaterial({ color: '#f3efe8', roughness: 0.3, clearcoat: 0.5 }),
}
const liquidCache = new Map()
function liquid(color) {
  if (!liquidCache.has(color)) liquidCache.set(color, new THREE.MeshPhysicalMaterial({ color, roughness: 0.15, clearcoat: 1 }))
  return liquidCache.get(color)
}

export function drinkColor(items) {
  const has = (k) => items.includes(k)
  if (has('matcha')) return '#93ad55'
  if (has('espresso') && (has('leche') || has('espuma'))) return '#b98a5c'
  if (has('espresso')) return '#3a2114'
  if (has('leche') || has('espuma')) return '#efe7da'
  if (has('agua')) return '#c9e3ee'
  return null
}

const cupGeo = {
  chica: new THREE.CylinderGeometry(0.045, 0.036, 0.065, 24, 1, true),
  grande: new THREE.CylinderGeometry(0.056, 0.042, 0.095, 24, 1, true),
  vaso: new THREE.CylinderGeometry(0.048, 0.04, 0.14, 24, 1, true),
  base: new THREE.CircleGeometry(1, 24),
  disc: new THREE.CircleGeometry(1, 24),
  handle: new THREE.TorusGeometry(0.022, 0.006, 8, 16, Math.PI),
  saucer: new THREE.CylinderGeometry(0.08, 0.07, 0.01, 28),
  cube: new THREE.BoxGeometry(0.026, 0.026, 0.026),
  plate: new THREE.CylinderGeometry(0.11, 0.09, 0.012, 28),
}
const DIMS = { chica: [0.065, 0.045], grande: [0.095, 0.056], vaso: [0.14, 0.048] }

export function DrinkModel({ drink, scale = 1 }) {
  if (drink.pastry) {
    return (
      <group scale={scale}>
        <mesh geometry={cupGeo.plate} material={drinkMats.plate} position={[0, 0.006, 0]} castShadow receiveShadow />
        <group position={[0, 0.012, 0]} scale={1.6}>
          <CardamomKnot />
        </group>
      </group>
    )
  }
  const [h, r] = DIMS[drink.vessel]
  const color = drinkColor(drink.items)
  const fill = Math.min(1, 0.35 + drink.items.length * 0.2)
  const glass = drink.vessel === 'vaso'
  const top = drink.items.includes('espuma')
  return (
    <group scale={scale}>
      {!glass && <mesh geometry={cupGeo.saucer} material={drinkMats.cup} position={[0, 0.005, 0]} castShadow receiveShadow />}
      <group position={[0, (glass ? 0 : 0.01) + h / 2, 0]}>
        <mesh geometry={cupGeo[drink.vessel]} material={glass ? drinkMats.glass : drinkMats.cupSide} castShadow={!glass} renderOrder={glass ? 2 : 0} />
        <mesh geometry={cupGeo.base} material={glass ? drinkMats.glass : drinkMats.cup} position={[0, -h / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={r * 0.78} />
        {!glass && <mesh geometry={cupGeo.handle} material={drinkMats.cup} position={[r + 0.012, 0, 0]} rotation={[0, 0, -Math.PI / 2]} />}
        {color && (
          <mesh geometry={cupGeo.disc} material={top ? drinkMats.foam : liquid(color)} position={[0, -h / 2 + h * fill * 0.92, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={r * (0.8 + 0.18 * fill)} />
        )}
        {glass && color && (
          <mesh position={[0, -h / 2 + (h * fill * 0.92) / 2, 0]} material={liquid(color)} renderOrder={1}>
            <cylinderGeometry args={[r * 0.92, 0.038, h * fill * 0.92, 20]} />
          </mesh>
        )}
        {glass &&
          drink.items.includes('hielo') &&
          [
            [-0.015, 0.02, 0.01],
            [0.016, 0.03, -0.012],
            [0.004, 0.045, 0.016],
          ].map((p, i) => <mesh key={i} geometry={cupGeo.cube} material={drinkMats.ice} position={[p[0], -h / 2 + h * fill * 0.6 + p[1] - 0.03, p[2]]} rotation={[i, i * 2, 0]} />)}
      </group>
    </group>
  )
}
