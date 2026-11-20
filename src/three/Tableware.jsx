import * as THREE from 'three'
import { useMemo } from 'react'
import { getMaterials } from './materials'

// Cups, glasses, pastries — modelled in metres, each sitting on y = 0.
const geoCache = new Map()
function geo(key, make) {
  if (!geoCache.has(key)) geoCache.set(key, make())
  return geoCache.get(key)
}
const lathe = (key, pts, seg = 48) =>
  geo(key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg))

const CUP = [
  [0.0001, 0], [0.024, 0], [0.027, 0.003], [0.031, 0.02], [0.036, 0.05], [0.0372, 0.056],
  [0.0345, 0.0565], [0.033, 0.05], [0.028, 0.02], [0.022, 0.01], [0.0001, 0.009],
]
const SAUCER = [[0.0001, 0], [0.04, 0], [0.062, 0.008], [0.067, 0.012], [0.064, 0.0135], [0.04, 0.0065], [0.0001, 0.0065]]
const PLATE = [[0.0001, 0], [0.06, 0], [0.095, 0.01], [0.1, 0.014], [0.096, 0.015], [0.06, 0.006], [0.0001, 0.006]]

function Handle({ x, y, s = 1, material }) {
  const g = geo('handle', () => new THREE.TorusGeometry(0.012, 0.0032, 10, 24, Math.PI * 1.25))
  return <mesh geometry={g} material={material} position={[x * s, y * s, 0]} rotation={[0, 0, -Math.PI * 0.62]} scale={s} castShadow />
}

export function Saucer({ scale = 1, material }) {
  const m = getMaterials()
  return <mesh geometry={lathe('saucer', SAUCER)} material={material || m.ceramicWhite} scale={scale} castShadow receiveShadow />
}

export function Plate({ scale = 1, material }) {
  const m = getMaterials()
  return <mesh geometry={lathe('plate', PLATE)} material={material || m.ceramicWhite} scale={scale} castShadow receiveShadow />
}

// A ceramic cup on its saucer with a liquid surface. size 1 = espresso, ~1.4 = flat white.
export function Cup({ size = 1, surface = 'surfCrema', material, saucer = true, fill = 0.8 }) {
  const m = getMaterials()
  const mat = material || m.ceramicWhite
  const sy = 0.0065
  const surfGeo = geo('cupSurf', () => new THREE.CircleGeometry(1, 40))
  const innerR = 0.028 + (0.033 - 0.028) * ((fill * 0.05 - 0.02) / 0.03)
  return (
    <group>
      {saucer && <Saucer scale={size} material={mat} />}
      <group position={[0, saucer ? sy * size : 0, 0]} scale={size}>
        <mesh geometry={lathe('cup', CUP)} material={mat} castShadow receiveShadow />
        <mesh geometry={surfGeo} material={m[surface]} position={[0, fill * 0.05 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={innerR} />
        <Handle x={0.041} y={0.033} material={mat} />
      </group>
    </group>
  )
}

function GlassShell({ k, r0, r1, h, base = 0.008, glass }) {
  const pts = [
    [0.0001, 0], [r0, 0], [r1, h], [r1 - 0.0022, h], [r0 - 0.0022, base], [0.0001, base],
  ]
  return <mesh geometry={lathe(`glass-${k}`, pts, 40)} material={glass} castShadow={false} renderOrder={2} />
}

function LiquidColumn({ r, y0, y1, material, top }) {
  const m = getMaterials()
  const g = geo('liqcyl', () => new THREE.CylinderGeometry(1, 1, 1, 36))
  const disc = geo('cupSurf', () => new THREE.CircleGeometry(1, 40))
  return (
    <group>
      <mesh geometry={g} material={material} position={[0, (y0 + y1) / 2, 0]} scale={[r, y1 - y0, r]} />
      {top && <mesh geometry={disc} material={m[top]} position={[0, y1 + 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={r} />}
    </group>
  )
}

const tanMilk = new THREE.MeshStandardMaterial({ color: '#b08259', roughness: 0.35 })

export function Cortado({ hq }) {
  const m = getMaterials()
  const glass = hq ? m.glassThick : m.glass
  return (
    <group>
      <GlassShell k="cortado" r0={0.031} r1={0.035} h={0.085} glass={glass} />
      <LiquidColumn r={0.0305} y0={0.0085} y1={0.035} material={m.coffeeGlass} />
      <LiquidColumn r={0.0315} y0={0.035} y1={0.07} material={tanMilk} top="surfLatte" />
    </group>
  )
}

export function ColdDrip({ hq }) {
  const m = getMaterials()
  const glass = hq ? m.glassThick : m.glass
  const sphere = geo('icesphere', () => new THREE.SphereGeometry(0.029, 32, 24))
  return (
    <group>
      <GlassShell k="rocks" r0={0.042} r1={0.046} h={0.082} base={0.014} glass={glass} />
      <LiquidColumn r={0.041} y0={0.0145} y1={0.05} material={m.coffeeGlass} top="surfBlack" />
      <mesh geometry={sphere} material={hq ? m.ice : m.glass} position={[0, 0.046, 0]} />
    </group>
  )
}

export function IcedLatte({ hq }) {
  const m = getMaterials()
  const glass = hq ? m.glassThick : m.glass
  const cube = geo('icecube', () => new THREE.BoxGeometry(0.022, 0.022, 0.022))
  const cubes = useMemo(
    () => [
      [0.008, 0.118, 0.006, 0.4], [-0.01, 0.105, -0.008, 1.1], [0.006, 0.096, -0.012, 2.1], [-0.006, 0.128, 0.01, 0.7],
    ],
    []
  )
  return (
    <group>
      <GlassShell k="tall" r0={0.033} r1={0.04} h={0.155} base={0.01} glass={glass} />
      <LiquidColumn r={0.034} y0={0.0105} y1={0.075} material={m.milk} />
      <LiquidColumn r={0.0365} y0={0.075} y1={0.125} material={tanMilk} />
      {cubes.map(([x, y, z, r], i) => (
        <mesh key={i} geometry={cube} material={hq ? m.ice : m.glass} position={[x, y, z]} rotation={[r, r * 1.3, r * 0.7]} />
      ))}
    </group>
  )
}

const SERVER = [[0.0001, 0], [0.044, 0], [0.054, 0.025], [0.052, 0.06], [0.04, 0.095], [0.036, 0.11], [0.039, 0.118]]
const SERVER_LIQ = [[0.0001, 0.004], [0.042, 0.004], [0.051, 0.025], [0.05, 0.05], [0.0001, 0.05]]
const DRIPPER = [
  [0.0001, 0], [0.032, 0], [0.032, 0.007], [0.034, 0.012], [0.064, 0.08], [0.067, 0.084], [0.063, 0.085],
  [0.032, 0.02], [0.0001, 0.02],
]

export function HandPour({ hq }) {
  const m = getMaterials()
  const glass = useMemo(() => {
    const g = (hq ? m.glassThick : m.glass).clone()
    g.side = THREE.DoubleSide
    return g
  }, [hq, m])
  const plate = geo('dripplate', () => new THREE.CylinderGeometry(0.05, 0.05, 0.006, 40))
  return (
    <group>
      <mesh geometry={lathe('server', SERVER, 40)} material={glass} renderOrder={2} />
      <mesh geometry={lathe('serverliq', SERVER_LIQ, 40)} material={m.coffeeGlass} />
      <group position={[0, 0.118, 0]}>
        <mesh geometry={plate} material={m.ceramicWhite} position={[0, 0.003, 0]} castShadow />
        <mesh geometry={lathe('dripper', DRIPPER)} material={m.ceramicWhite} position={[0, 0.006, 0]} castShadow />
        <Handle x={0.07} y={0.05} s={1.3} material={m.ceramicWhite} />
      </group>
    </group>
  )
}

const BOWL = [
  [0.0001, 0], [0.03, 0], [0.032, 0.008], [0.056, 0.032], [0.062, 0.068], [0.0585, 0.07], [0.054, 0.036],
  [0.03, 0.015], [0.0001, 0.014],
]
export function MatchaBowl() {
  const m = getMaterials()
  const disc = geo('cupSurf', () => new THREE.CircleGeometry(1, 40))
  return (
    <group>
      <mesh geometry={lathe('bowl', BOWL)} material={m.ceramicCharcoal} castShadow receiveShadow />
      <mesh geometry={disc} material={m.surfMatcha} position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.0545} />
    </group>
  )
}

export function CardamomKnot(props) {
  const m = getMaterials()
  const g = geo('knot', () => new THREE.TorusKnotGeometry(0.028, 0.012, 140, 14, 2, 3))
  return (
    <group {...props}>
      <mesh geometry={g} material={m.pastry} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 0.55]} position={[0, 0.018, 0]} castShadow receiveShadow />
    </group>
  )
}

export function Croissant(props) {
  const m = getMaterials()
  const s = geo('sphere16', () => new THREE.SphereGeometry(1, 20, 14))
  const parts = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const a = -1.15 + (i / 6) * 2.3
        const r = 0.017 + 0.012 * Math.cos(a * 1.25)
        return { p: [Math.sin(a) * 0.05, r * 0.75, -Math.cos(a) * 0.05 + 0.03], r, rot: a }
      }),
    []
  )
  return (
    <group {...props}>
      {parts.map((q, i) => (
        <mesh key={i} geometry={s} material={m.croissant} position={q.p} rotation={[0, -q.rot, 0]} scale={[q.r * 1.15, q.r * 0.82, q.r * 1.5]} castShadow />
      ))}
    </group>
  )
}

export function Cookie(props) {
  const g = geo('cookie', () => new THREE.CylinderGeometry(0.034, 0.035, 0.011, 28))
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b98a55', roughness: 0.85, map: getMaterials().pastry.map }), [])
  return <mesh geometry={g} material={mat} position={[0, 0.0055, 0]} castShadow {...props} />
}

export function CoffeeBag(props) {
  const m = getMaterials()
  const g = geo('bag', () => new THREE.BoxGeometry(0.12, 0.19, 0.065))
  const fold = geo('bagfold', () => new THREE.BoxGeometry(0.122, 0.03, 0.02))
  const mats = [m.kraft, m.kraft, m.kraft, m.kraft, m.bagFront, m.kraft]
  return (
    <group {...props}>
      <mesh geometry={g} material={mats} position={[0, 0.095, 0]} castShadow receiveShadow />
      <mesh geometry={fold} material={m.kraft} position={[0, 0.2, 0]} castShadow />
    </group>
  )
}

export function Board({ w = 0.26, d = 0.16, children, ...props }) {
  const m = getMaterials()
  return (
    <group {...props}>
      <mesh material={m.oak} position={[0, 0.009, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.018, d]} />
      </mesh>
      <group position={[0, 0.018, 0]}>{children}</group>
    </group>
  )
}

// One menu drink by id, as served.
export function Drink({ vessel, hq = false }) {
  switch (vessel) {
    case 'espresso':
      return <Cup size={1} surface="surfCrema" />
    case 'cortado':
      return <Cortado hq={hq} />
    case 'flatwhite':
      return <Cup size={1.4} surface="surfLatte" />
    case 'handpour':
      return <HandPour hq={hq} />
    case 'colddrip':
      return <ColdDrip hq={hq} />
    case 'hojicha':
      return <Cup size={1.45} surface="surfHojicha" material={getMaterials().ceramicSand} />
    case 'matcha':
      return <MatchaBowl />
    case 'icedlatte':
      return <IcedLatte hq={hq} />
    default:
      return null
  }
}
