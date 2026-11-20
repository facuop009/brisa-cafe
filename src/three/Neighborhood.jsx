import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { facadeCanvases, speckleCanvas, toTexture } from './textures'
import { getMaterials } from './materials'
import { sunAt } from './Lighting'
import { store } from '../store'

// Main street runs along x in front of the house (+z):
// sidewalk to 7.5 | bike lane 7.5–9.3 | lane (−x) 9.3–10.75 | lane (+x) 10.75–12.2 | parking 12.2–14 | sidewalk.
const ROAD = { z0: 7.5, z1: 14, bike: 8.4, laneW: 10.05, laneE: 11.5, park: 13.1 }
const BACK_ST = { z0: -27, z1: -22.5 }
const CROSS = [
  [-45, -38.5],
  [54, 60.5],
]
const PARK = { x0: -14, x1: 52, z0: 16, z1: 40 }
const FOUNTAIN = [-2, 28]
const FLOOR_H = 3.2
const SPAN = 130

const PALETTE = ['#e6c27e', '#d8936a', '#efe7d6', '#b8c3a6', '#c9846c', '#e8d6a8', '#a9b7c0', '#f1ebe1', '#d4a77c', '#9fae95', '#e3b9a0', '#c2b59b']
const ACCENTS = ['#2f4f46', '#3a3f4a', '#6b2e2a', '#1f3b5a', '#4b3a2c', '#2b2b2b']
const AWNINGS = ['#2f5d50', '#a8433a', '#d9b44a', '#36435c', '#efe6d6', '#7a8b5c']
const CAR_COLORS = ['#3d4a55', '#e9e4da', '#8a3b32', '#5d6650', '#26282b', '#b9bcbf', '#d9a441', '#2c4a6e']
const SHIRTS = ['#c0392b', '#f2c53d', '#2c6e8f', '#f4efe6', '#3d6b4f', '#e7a1a8']

const inCross = (x, pad = 0) => CROSS.some(([a, b]) => x > a - pad && x < b + pad)

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/* ---------------- layout ---------------- */

function layout() {
  const r = rng(2200)
  const pick = (a) => a[Math.floor(r() * a.length)]
  const houses = []

  const row = (x0, x1, z0, z1, front, fMin, fMax, shops, cap, capR) => {
    let x = x0
    while (x1 - x >= 4.5) {
      let w = 6 + Math.round(r() * 4) * 1.5
      if (x1 - x - w < 4.5) w = x1 - x
      const cx = x + w / 2
      let floors = fMin + Math.floor(r() * (fMax - fMin + 1))
      if (cap && Math.abs(cx) < capR) floors = Math.min(floors, cap)
      const roofRoll = r()
      houses.push({
        x: cx,
        z: (z0 + z1) / 2,
        w: w - 0.03,
        d: z1 - z0,
        front,
        floors,
        color: pick(PALETTE),
        roof: roofRoll < 0.3 ? 'tile' : roofRoll < 0.6 ? 'slate' : 'flat',
        shop: shops && r() < 0.65,
        awning: r() < 0.55,
        awningColor: pick(AWNINGS),
        accent: pick(ACCENTS),
        balconies: r() < 0.4,
        phase: r() < 0.5 ? 0 : 1,
        uOff: Math.floor(r() * 4) / 4,
        vOff: r() < 0.5 ? 0 : 0.5,
        seed: r(),
      })
      x += w
    }
  }
  const segments = (z0, z1, front, fMin, fMax, shops, cap, capR, gaps) => {
    let x = -SPAN
    for (const [a, b] of gaps) {
      row(x, a, z0, z1, front, fMin, fMax, shops, cap, capR)
      x = b
    }
    row(x, SPAN, z0, z1, front, fMin, fMax, shops, cap, capR)
  }
  // The house's own row, with the gravel garden (6.3–14.9) on its east side.
  segments(-4.8, 4.65, 1, 3, 5, true, 3, 26, [CROSS[0], [-6.45, 14.9], CROSS[1]])
  // Across the street, around the park.
  segments(17.5, 27, -1, 3, 5, true, 0, 0, [CROSS[0], [-16, 60.5]])
  // Behind the courtyard, then a side street, then a taller row.
  segments(-21, -11, 1, 4, 6, false, 3, 26, CROSS)
  segments(-38, -28.5, 1, 4, 6, true, 4, 32, CROSS)

  const parked = []
  for (let x = -110; x < 110; x += 6.4) {
    if (inCross(x, 3) || Math.abs(x - FOUNTAIN[0]) < 4 || r() > 0.5) continue
    parked.push({ x: x + (r() - 0.5), z: ROAD.park, dir: r() < 0.5 ? 1 : -1, color: pick(CAR_COLORS) })
  }
  for (let x = -100; x < 100; x += 6.4) {
    if (inCross(x, 3) || r() > 0.35) continue
    parked.push({ x, z: BACK_ST.z1 - 0.95, dir: r() < 0.5 ? 1 : -1, color: pick(CAR_COLORS) })
  }

  const movers = []
  for (const [z, dir, speed] of [
    [ROAD.laneE, 1, 8.5],
    [ROAD.laneW, -1, 7.4],
  ]) {
    for (let i = 0; i < 7; i++) {
      movers.push({ x: -SPAN + i * ((2 * SPAN) / 7) + r() * 12, z, dir, speed, color: pick(CAR_COLORS) })
    }
  }

  const cyclists = Array.from({ length: 7 }, (_, i) => ({
    x: -SPAN + i * ((2 * SPAN) / 7) + r() * 20,
    speed: 4 + r() * 1.4,
    shirt: pick(SHIRTS),
    phase: r() * 6,
  }))

  const trees = []
  const tree = (x, z, kind = r() < 0.75 ? 'round' : 'cone') => trees.push({ x, z, kind, s: 0.85 + r() * 0.4, rot: r() * 6.28, tint: r() })
  const lamps = []
  for (let x = -SPAN + 3; x < SPAN; x += 18) if (!inCross(x, 1.5)) lamps.push({ x, z: ROAD.z0 - 0.45, ry: 0 })
  for (let x = -SPAN + 12; x < SPAN; x += 18) if (!inCross(x, 1.5)) lamps.push({ x, z: ROAD.z1 + 0.45, ry: Math.PI })
  const nearLamp = (x, z) => lamps.some((l) => Math.abs(l.x - x) < 2 && Math.abs(l.z - z) < 2)
  for (let x = -SPAN; x < SPAN; x += 9) {
    if (!inCross(x, 2) && Math.abs(x - 2) > 12 && !nearLamp(x, 6.3)) tree(x, 6.3, 'round')
    const fx = x + 4.5
    if (!inCross(fx, 2) && !nearLamp(fx, 15.3)) tree(fx, 15.3, 'round')
  }
  let tries = 0
  let placed = 0
  while (placed < 34 && tries++ < 600) {
    const x = PARK.x0 + 1.5 + r() * (PARK.x1 - PARK.x0 - 3)
    const z = PARK.z0 + 1.5 + r() * (PARK.z1 - PARK.z0 - 3)
    if (x > -8 && x < 28 && z < 36) continue // keep the view from the street to the house open
    if (Math.abs(x - FOUNTAIN[0]) < 2.4 || Math.abs(z - FOUNTAIN[1]) < 2.4) continue
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 3.4)) continue
    tree(x, z)
    placed++
  }

  return { houses, parked, movers, cyclists, trees, lamps }
}

/* ---------------- geometry helpers ---------------- */

const tmp = new THREE.Color()
function paint(g, hex) {
  tmp.set(hex)
  const n = g.attributes.position.count
  const a = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    a[i * 3] = tmp.r
    a[i * 3 + 1] = tmp.g
    a[i * 3 + 2] = tmp.b
  }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3))
  return g
}
function box(w, h, d, x, y, z) {
  return new THREE.BoxGeometry(w, h, d).translate(x, y, z)
}
function merge(list) {
  return mergeGeometries(list.map((g) => (g.index ? g.toNonIndexed() : g)))
}
function extrudeProfile(points, depth, bevel = 0) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)))
  const core = depth - bevel * 2
  const g = new THREE.ExtrudeGeometry(shape, { depth: core, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2 })
  return g.translate(0, 0, -core / 2)
}
const up = new THREE.Vector3(0, 1, 0)
function limb(a, b, radius) {
  const A = new THREE.Vector3(...a)
  const B = new THREE.Vector3(...b)
  const dir = B.clone().sub(A)
  const len = dir.length()
  const g = new THREE.CapsuleGeometry(radius, Math.max(0.01, len - radius * 2), 4, 8)
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir.normalize()))
  return g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2)
}
function bar(x1, y1, x2, y2, z = 0, t = 0.035) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  return new THREE.BoxGeometry(len, t, t)
    .rotateZ(Math.atan2(y2 - y1, x2 - x1))
    .translate((x1 + x2) / 2, (y1 + y2) / 2, z)
}
function instance(list, place) {
  const o = new THREE.Object3D()
  return (mesh) => {
    if (!mesh) return
    list.forEach((item, i) => {
      o.position.set(0, 0, 0)
      o.rotation.set(0, 0, 0)
      o.scale.set(1, 1, 1)
      place(o, item, i, mesh)
      o.updateMatrix()
      mesh.setMatrixAt(i, o.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }
}

/* ---------------- houses, merged by material ---------------- */

function buildCity(houses) {
  const G = { walls: [], shop: [], trim: [], stone: [], metal: [], painted: [], tile: [], slate: [], flat: [], brick: [] }
  for (const b of houses) {
    const h = b.floors * FLOOR_H
    const f = b.front
    const fz = b.z + (f * b.d) / 2
    const bays = Math.max(1, Math.round(b.w / 3))
    const sideBays = Math.max(1, Math.round(b.d / 3))
    const bayW = b.w / bays

    const wall = new THREE.BoxGeometry(b.w, h, b.d)
    const uv = wall.attributes.uv
    for (let i = 0; i < uv.count; i++) {
      const face = Math.floor(i / 4)
      const su = face < 2 ? sideBays / 4 : face > 3 ? bays / 4 : 0
      const sv = face === 2 || face === 3 ? 0 : b.floors / 2
      uv.setXY(i, uv.getX(i) * su + b.uOff, uv.getY(i) * sv + b.vOff)
    }
    G.walls.push(paint(wall.translate(b.x, h / 2, b.z), b.color))
    G.stone.push(box(b.w, 0.6, b.d + 0.04, b.x, 0.3, b.z))
    G.trim.push(box(b.w, 0.38, b.d + 0.36, b.x, h - 0.19, b.z))
    G.trim.push(box(b.w, 0.16, b.d + 0.12, b.x, FLOOR_H, b.z))

    if (b.shop) {
      const sw = Math.min(b.w - 1.4, 8)
      G.trim.push(box(sw + 0.36, 2.9, 0.12, b.x, 1.55, fz + f * 0.06))
      G.shop.push(box(sw, 2.5, 0.1, b.x, 1.45, fz + f * 0.1))
      const n = Math.max(2, Math.round(sw / 1.8))
      for (let i = 1; i < n; i++) G.metal.push(box(0.06, 2.5, 0.06, b.x - sw / 2 + (i * sw) / n, 1.45, fz + f * 0.16))
      G.metal.push(box(sw, 0.06, 0.06, b.x, 2.25, fz + f * 0.16))
      G.painted.push(paint(box(sw + 0.36, 0.5, 0.16, b.x, 3.0, fz + f * 0.08), b.accent))
      if (b.awning) {
        const a = new THREE.BoxGeometry(sw + 0.2, 0.05, 1.4).rotateX(f * 0.38).translate(b.x, 2.62, fz + f * 0.81)
        G.painted.push(paint(a, b.awningColor))
      }
    } else {
      const dx = b.x - b.w / 2 + bayW / 2
      G.trim.push(box(1.5, 2.65, 0.08, dx, 1.32, fz + f * 0.04))
      G.painted.push(paint(box(1.1, 2.35, 0.1, dx, 1.2, fz + f * 0.07), b.accent))
      G.stone.push(box(1.7, 0.18, 0.6, dx, 0.09, fz + f * 0.3))
    }

    if (b.balconies && b.floors >= 3) {
      for (let fl = 1; fl < b.floors; fl++) {
        for (let i = 0; i < bays; i++) {
          if (i % 2 !== b.phase) continue
          const cx = b.x - b.w / 2 + (i + 0.5) * bayW
          const y = fl * FLOOR_H + 0.06
          const zc = fz + f * 0.4
          const rz = fz + f * 0.78
          G.trim.push(box(1.6, 0.12, 0.8, cx, y, zc))
          G.metal.push(box(1.6, 0.04, 0.04, cx, y + 0.95, rz))
          for (const sx of [-0.78, 0.78]) G.metal.push(box(0.04, 0.04, 0.76, cx + sx, y + 0.95, zc))
          for (let k = 0; k <= 7; k++) G.metal.push(box(0.02, 0.9, 0.02, cx - 0.75 + k * (1.5 / 7), y + 0.5, rz))
        }
      }
    }

    if (b.roof === 'flat') {
      G.flat.push(box(b.w, 0.1, b.d, b.x, h + 0.05, b.z))
      for (const s of [1, -1]) G.trim.push(box(b.w, 0.45, 0.22, b.x, h + 0.22, b.z + s * (b.d / 2 + 0.07)))
      if (b.seed > 0.35) G.metal.push(box(1.4, 0.9, 1.0, b.x + (b.seed - 0.5) * b.w * 0.6, h + 0.55, b.z - b.d * 0.15))
    } else {
      const half = b.d / 2
      const rh = b.d * 0.3
      const slope = Math.hypot(rh, half)
      const L = slope + 0.45
      const t = L / 2 / slope
      const list = b.roof === 'tile' ? G.tile : G.slate
      for (const s of [1, -1]) {
        list.push(
          new THREE.BoxGeometry(b.w, 0.14, L)
            .rotateX(s * Math.atan2(rh, half))
            .translate(b.x, h + rh - rh * t + 0.07, b.z + s * half * t),
        )
      }
      const gable = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-half, 0), new THREE.Vector2(half, 0), new THREE.Vector2(0, rh)]), {
        depth: b.w - 0.04,
        bevelEnabled: false,
      })
      gable.translate(0, 0, -(b.w - 0.04) / 2).rotateY(Math.PI / 2)
      const guv = gable.attributes.uv
      for (let i = 0; i < guv.count; i++) guv.setXY(i, b.uOff + 0.01, b.vOff + 0.25)
      G.walls.push(paint(gable.translate(b.x, h, b.z), b.color))
      const cx = b.x + (b.seed - 0.5) * b.w * 0.6
      const cz = b.z - half * 0.3
      G.brick.push(box(0.7, 1.7, 0.7, cx, h + rh * 0.55 + 0.6, cz))
      G.trim.push(box(0.86, 0.12, 0.86, cx, h + rh * 0.55 + 1.5, cz))
    }
  }
  return Object.fromEntries(Object.entries(G).map(([k, list]) => [k, list.length ? merge(list) : null]))
}

function City({ houses }) {
  const m = getMaterials()
  const geos = useMemo(() => buildCity(houses), [houses])
  const mats = useMemo(() => {
    const { color, glow } = facadeCanvases()
    return {
      walls: new THREE.MeshStandardMaterial({
        map: toTexture(color),
        bumpMap: toTexture(color, { srgb: false }),
        bumpScale: 0.8,
        emissiveMap: toTexture(glow),
        emissive: '#ffffff',
        emissiveIntensity: 0,
        vertexColors: true,
        roughness: 0.88,
      }),
      shop: new THREE.MeshPhysicalMaterial({ color: '#28303a', roughness: 0.06, metalness: 0.3, clearcoat: 1, emissive: '#ffcf91', emissiveIntensity: 0, envMapIntensity: 1.6 }),
      trim: new THREE.MeshStandardMaterial({ color: '#efe9de', roughness: 0.7 }),
      stone: new THREE.MeshStandardMaterial({ color: '#8f8a84', roughness: 0.9 }),
      metal: m.blackMetal,
      painted: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 }),
      tile: new THREE.MeshStandardMaterial({ color: '#9a5340', roughness: 0.75 }),
      slate: new THREE.MeshStandardMaterial({ color: '#4a4f57', roughness: 0.55, metalness: 0.1 }),
      flat: new THREE.MeshStandardMaterial({ color: '#8d8984', roughness: 0.95 }),
      brick: new THREE.MeshStandardMaterial({ color: '#9c5a44', roughness: 0.9 }),
    }
  }, [m])

  useFrame(() => {
    const night = 1 - sunAt(store.get().time).day
    mats.walls.emissiveIntensity = night * 1.1
    mats.shop.emissiveIntensity = 0.06 + night * 1.3
  })

  return (
    <group>
      {Object.entries(geos).map(([k, g]) => g && <mesh key={k} geometry={g} material={mats[k]} castShadow receiveShadow />)}
    </group>
  )
}

/* ---------------- street ---------------- */

function useGroundMaterials() {
  return useMemo(() => {
    const flat = (color, offset, extra = {}) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.92, polygonOffset: true, polygonOffsetFactor: offset, polygonOffsetUnits: offset, ...extra })
    const grassMap = toTexture(speckleCanvas('grass', [112, 138, 82], 34), { repeat: [22, 8] })
    return {
      asphalt: flat('#4d4a47', -1),
      bike: flat('#6a5d57', -2),
      paint: flat('#f2efe8', -3, { roughness: 0.7 }),
      curb: new THREE.MeshStandardMaterial({ color: '#cfc8bf', roughness: 0.9 }),
      grass: flat('#ffffff', -1, { map: grassMap }),
      path: flat('#d8cfc0', -2),
      ring: flat('#cbc2b4', -3),
      hedge: new THREE.MeshStandardMaterial({ color: '#5f7744', roughness: 0.9, flatShading: true }),
      water: new THREE.MeshPhysicalMaterial({ color: '#6f8f9a', roughness: 0.04, metalness: 0.1, clearcoat: 1 }),
      stone: new THREE.MeshStandardMaterial({ color: '#bdb6ab', roughness: 0.85 }),
    }
  }, [])
}

function Street({ mats }) {
  const mid = (ROAD.z0 + ROAD.z1) / 2
  const L = 2 * SPAN + 60
  const flat = (w, d, x, z, mat, key) => (
    <mesh key={key} material={mat} position={[x, -0.01, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w, d]} />
    </mesh>
  )
  const dashes = useMemo(() => Array.from({ length: Math.floor(L / 6) }, (_, i) => -L / 2 + i * 6), [L])
  const ticks = useMemo(() => Array.from({ length: Math.floor(L / 5.5) }, (_, i) => -L / 2 + i * 5.5).filter((x) => !inCross(x)), [L])
  const curbs = useMemo(() => {
    const edges = [-L / 2, ...CROSS.flat(), L / 2]
    const out = []
    for (let i = 0; i < edges.length; i += 2) {
      const [a, b] = [edges[i], edges[i + 1]]
      for (const z of [ROAD.z0, ROAD.z1, BACK_ST.z0, BACK_ST.z1]) out.push({ x: (a + b) / 2, w: b - a, z })
    }
    return out
  }, [L])
  return (
    <group>
      {flat(L, ROAD.z1 - ROAD.z0, 0, mid, mats.asphalt, 'road')}
      {flat(L, 1.8, 0, ROAD.bike, mats.bike, 'bike')}
      {flat(L, 0.12, 0, 9.3, mats.paint, 'bikeline')}
      {flat(L, BACK_ST.z1 - BACK_ST.z0, 0, (BACK_ST.z0 + BACK_ST.z1) / 2, mats.asphalt, 'back')}
      {CROSS.map(([a, b]) => [
        flat(b - a, ROAD.z0 + 45, (a + b) / 2, (ROAD.z0 - 45) / 2, mats.asphalt, `cs${a}`),
        flat(b - a, 31, (a + b) / 2, ROAD.z1 + 15.5, mats.asphalt, `cn${a}`),
      ])}
      <instancedMesh
        args={[null, mats.paint, dashes.length]}
        ref={instance(dashes, (o, x) => {
          o.position.set(x, -0.006, 10.75)
          o.rotation.x = -Math.PI / 2
        })}
      >
        <planeGeometry args={[2.6, 0.14]} />
      </instancedMesh>
      <instancedMesh
        args={[null, mats.paint, ticks.length]}
        ref={instance(ticks, (o, x) => {
          o.position.set(x, -0.006, ROAD.park)
          o.rotation.x = -Math.PI / 2
        })}
      >
        <planeGeometry args={[0.12, 1.8]} />
      </instancedMesh>
      {Array.from({ length: 7 }, (_, i) => flat(3, 0.5, FOUNTAIN[0], ROAD.z0 + 0.6 + i * 0.9, mats.paint, `z${i}`))}
      {curbs.map((c, i) => (
        <mesh key={i} material={mats.curb} position={[c.x, 0.04, c.z]} receiveShadow>
          <boxGeometry args={[c.w, 0.12, 0.22]} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- park ---------------- */

function Park({ mats }) {
  const m = getMaterials()
  const { x0, x1, z0, z1 } = PARK
  const [fx, fz] = FOUNTAIN
  const hedges = useMemo(
    () =>
      merge([
        box(fx - 1.6 - x0, 0.8, 0.6, (x0 + fx - 1.6) / 2, 0.4, z0 + 0.3),
        box(x1 - fx - 1.6, 0.8, 0.6, (x1 + fx + 1.6) / 2, 0.4, z0 + 0.3),
        box(0.6, 0.8, z1 - z0, x0 + 0.3, 0.4, (z0 + z1) / 2),
        box(0.6, 0.8, z1 - z0, x1 - 0.3, 0.4, (z0 + z1) / 2),
        box(x1 - x0, 0.8, 0.6, (x0 + x1) / 2, 0.4, z1 - 0.3),
      ]),
    [fx, x0, x1, z0, z1],
  )
  const benches = useMemo(() => {
    const spots = [
      [-10, fz - 1.4, 0],
      [8, fz - 1.4, 0],
      [18, fz + 1.4, Math.PI],
      [40, fz + 1.4, Math.PI],
      [fx - 1.6, 20, Math.PI / 2],
      [fx + 1.6, 36, -Math.PI / 2],
    ]
    const wood = []
    const legs = []
    for (const [x, z, ry] of spots) {
      const at = (g) => g.rotateY(ry).translate(x, 0, z)
      wood.push(at(box(1.8, 0.07, 0.45, 0, 0.45, 0)), at(box(1.8, 0.35, 0.05, 0, 0.75, -0.24)))
      for (const sx of [-0.75, 0.75]) legs.push(at(box(0.05, 0.45, 0.4, sx, 0.22, 0)), at(box(0.05, 0.5, 0.05, sx, 0.7, -0.24)))
    }
    return { wood: merge(wood), legs: merge(legs) }
  }, [fx, fz])

  return (
    <group>
      <mesh material={mats.grass} position={[(x0 + x1) / 2, -0.01, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[x1 - x0, z1 - z0]} />
      </mesh>
      <mesh material={mats.path} position={[fx, -0.01, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.2, z1 - z0]} />
      </mesh>
      <mesh material={mats.path} position={[(x0 + x1) / 2, -0.01, fz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[x1 - x0, 2.2]} />
      </mesh>
      <mesh material={mats.ring} position={[fx, -0.01, fz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.2, 48]} />
      </mesh>
      <mesh geometry={hedges} material={mats.hedge} castShadow receiveShadow />
      <group position={[fx, 0, fz]}>
        <mesh material={mats.stone} position={[0, 0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.7, 2.8, 0.5, 48]} />
        </mesh>
        <mesh material={mats.water} position={[0, 0.46, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.5, 48]} />
        </mesh>
        <mesh material={mats.stone} position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.3, 1.0, 20]} />
        </mesh>
        <mesh material={mats.stone} position={[0, 1.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 0.35, 0.22, 32]} />
        </mesh>
        <mesh material={mats.water} position={[0, 1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.82, 32]} />
        </mesh>
      </group>
      <mesh geometry={benches.wood} material={m.oakDark} castShadow receiveShadow />
      <mesh geometry={benches.legs} material={m.blackMetal} castShadow />
    </group>
  )
}

/* ---------------- trees and lamps ---------------- */

function Trees({ trees }) {
  const mats = useMemo(
    () => ({
      trunk: new THREE.MeshStandardMaterial({ color: '#5b4a3c', roughness: 0.9 }),
      leaves: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85, flatShading: true }),
    }),
    [],
  )
  const round = trees.filter((t) => t.kind === 'round')
  const cone = trees.filter((t) => t.kind === 'cone')
  const color = new THREE.Color()
  const tint = (t, mesh, i) => mesh.setColorAt(i, color.setHSL(0.2 + t.tint * 0.07, 0.34, 0.3 + t.tint * 0.1, THREE.SRGBColorSpace))
  return (
    <group>
      <instancedMesh
        args={[null, mats.trunk, trees.length]}
        castShadow
        ref={instance(trees, (o, t) => {
          o.position.set(t.x, 1.4 * t.s, t.z)
          o.scale.setScalar(t.s)
        })}
      >
        <cylinderGeometry args={[0.12, 0.17, 2.8, 7]} />
      </instancedMesh>
      <instancedMesh
        args={[null, mats.leaves, round.length]}
        castShadow
        receiveShadow
        ref={instance(round, (o, t, i, mesh) => {
          o.position.set(t.x, 3.9 * t.s, t.z)
          o.rotation.y = t.rot
          o.scale.set(t.s, t.s * 1.12, t.s)
          tint(t, mesh, i)
        })}
      >
        <icosahedronGeometry args={[1.65, 1]} />
      </instancedMesh>
      <instancedMesh
        args={[null, mats.leaves, round.length]}
        castShadow
        ref={instance(round, (o, t, i, mesh) => {
          o.position.set(t.x + Math.cos(t.rot) * 0.7 * t.s, 4.8 * t.s, t.z + Math.sin(t.rot) * 0.7 * t.s)
          o.rotation.y = t.rot * 2
          o.scale.setScalar(t.s)
          tint({ tint: (t.tint + 0.3) % 1 }, mesh, i)
        })}
      >
        <icosahedronGeometry args={[1.05, 1]} />
      </instancedMesh>
      <instancedMesh
        args={[null, mats.leaves, cone.length]}
        castShadow
        receiveShadow
        ref={instance(cone, (o, t, i, mesh) => {
          o.position.set(t.x, 3.9 * t.s, t.z)
          o.rotation.y = t.rot
          o.scale.setScalar(t.s)
          mesh.setColorAt(i, color.setHSL(0.3, 0.3, 0.22 + t.tint * 0.06, THREE.SRGBColorSpace))
        })}
      >
        <coneGeometry args={[1.35, 4.4, 7]} />
      </instancedMesh>
    </group>
  )
}

function Lamps({ lamps }) {
  const m = getMaterials()
  const geo = useMemo(
    () =>
      merge([
        new THREE.CylinderGeometry(0.05, 0.07, 5, 8).translate(0, 2.5, 0),
        new THREE.CylinderGeometry(0.12, 0.15, 0.4, 10).translate(0, 0.2, 0),
        box(0.06, 0.06, 0.95, 0, 5, 0.45),
        box(0.3, 0.12, 0.55, 0, 4.94, 0.92),
      ]),
    [],
  )
  const place = (o, l) => {
    o.position.set(l.x, 0, l.z)
    o.rotation.y = l.ry
  }
  return (
    <group>
      <instancedMesh args={[geo, m.blackMetal, lamps.length]} castShadow ref={instance(lamps, place)} />
      <instancedMesh
        args={[null, m.bulbWarm, lamps.length]}
        ref={instance(lamps, (o, l) => {
          o.position.set(l.x + Math.sin(l.ry) * 0.92, 4.87, l.z + Math.cos(l.ry) * 0.92)
          o.rotation.x = Math.PI / 2
        })}
      >
        <planeGeometry args={[0.22, 0.42]} />
      </instancedMesh>
    </group>
  )
}

/* ---------------- cars ---------------- */

let carGeo = null
function getCarGeo() {
  if (carGeo) return carGeo
  const pair = (x, y) => merge([box(0.06, 0.14, 0.34, x, y, 0.56), box(0.06, 0.14, 0.34, x, y, -0.56)])
  carGeo = {
    body: extrudeProfile(
      [
        [-2.1, 0.32],
        [2.1, 0.32],
        [2.18, 0.62],
        [2.0, 0.82],
        [-1.95, 0.88],
        [-2.15, 0.72],
      ],
      1.74,
      0.06,
    ),
    cabin: extrudeProfile(
      [
        [1.12, 0.84],
        [0.45, 1.3],
        [-0.95, 1.32],
        [-1.72, 0.88],
      ],
      1.58,
      0.03,
    ),
    roof: extrudeProfile(
      [
        [0.47, 1.29],
        [0.4, 1.37],
        [-0.98, 1.39],
        [-1.02, 1.31],
      ],
      1.52,
      0.02,
    ),
    bumpers: merge([box(0.14, 0.16, 1.72, 2.16, 0.38, 0), box(0.14, 0.16, 1.72, -2.16, 0.38, 0)]),
    front: pair(2.2, 0.64),
    rear: pair(-2.2, 0.74),
    wheel: new THREE.CylinderGeometry(0.34, 0.34, 0.24, 18).rotateX(Math.PI / 2),
    hub: new THREE.CylinderGeometry(0.19, 0.19, 0.26, 10).rotateX(Math.PI / 2),
  }
  return carGeo
}

const WHEELS = [
  [-1.35, 0.8],
  [-1.35, -0.8],
  [1.35, 0.8],
  [1.35, -0.8],
]

function useCarMaterials() {
  return useMemo(
    () => ({
      paint: Object.fromEntries(CAR_COLORS.map((c) => [c, new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.28, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 })])),
      glass: new THREE.MeshPhysicalMaterial({ color: '#1b2229', roughness: 0.06, metalness: 0.3, clearcoat: 1, envMapIntensity: 1.6 }),
      head: new THREE.MeshBasicMaterial({ color: '#fff4dc', toneMapped: false }),
      tail: new THREE.MeshBasicMaterial({ color: '#d42a33', toneMapped: false }),
    }),
    [],
  )
}

function Car({ color, mats, groupRef, wheelRef, ...rest }) {
  const m = getMaterials()
  const g = getCarGeo()
  return (
    <group ref={groupRef} {...rest}>
      <mesh geometry={g.body} material={mats.paint[color]} castShadow receiveShadow />
      <mesh geometry={g.roof} material={mats.paint[color]} castShadow />
      <mesh geometry={g.cabin} material={mats.glass} castShadow />
      <mesh geometry={g.bumpers} material={m.rubber} />
      <mesh geometry={g.front} material={mats.head} />
      <mesh geometry={g.rear} material={mats.tail} />
      {WHEELS.map(([x, z], k) => (
        <group key={k} position={[x, 0.34, z]} ref={wheelRef ? (el) => wheelRef(el, k) : undefined}>
          <mesh geometry={g.wheel} material={m.rubber} castShadow />
          <mesh geometry={g.hub} material={m.brushedSteel} />
        </group>
      ))}
    </group>
  )
}

function Traffic({ parked, movers }) {
  const mats = useCarMaterials()
  const groups = useRef([])
  const wheels = useRef([])
  const xs = useRef(movers.map((c) => c.x))
  useFrame((_, dt) => {
    const step = Math.min(dt, 0.1)
    movers.forEach((c, i) => {
      let x = xs.current[i] + c.dir * c.speed * step
      if (x > SPAN) x -= 2 * SPAN
      if (x < -SPAN) x += 2 * SPAN
      xs.current[i] = x
      const g = groups.current[i]
      if (g) g.position.x = x
      for (let k = 0; k < 4; k++) {
        const w = wheels.current[i * 4 + k]
        if (w) w.rotation.z -= (c.speed * step) / 0.34
      }
    })
  })
  return (
    <group>
      {parked.map((c, i) => (
        <Car key={`p${i}`} color={c.color} mats={mats} position={[c.x, 0, c.z]} rotation={[0, c.dir > 0 ? 0 : Math.PI, 0]} />
      ))}
      {movers.map((c, i) => (
        <Car
          key={`m${i}`}
          color={c.color}
          mats={mats}
          position={[c.x, 0, c.z]}
          rotation={[0, c.dir > 0 ? 0 : Math.PI, 0]}
          groupRef={(el) => (groups.current[i] = el)}
          wheelRef={(el, k) => (wheels.current[i * 4 + k] = el)}
        />
      ))}
    </group>
  )
}

/* ---------------- cyclists ---------------- */

let bikeGeo = null
function getBikeGeo() {
  if (bikeGeo) return bikeGeo
  const frame = merge([
    new THREE.TorusGeometry(0.34, 0.03, 8, 24).translate(-0.52, 0.34, 0),
    new THREE.TorusGeometry(0.34, 0.03, 8, 24).translate(0.52, 0.34, 0),
    bar(-0.52, 0.34, -0.15, 0.9),
    bar(-0.15, 0.9, 0.38, 0.92),
    bar(0, 0.36, -0.15, 0.9),
    bar(0, 0.36, 0.38, 0.92),
    bar(0.38, 0.92, 0.52, 0.34),
    bar(-0.52, 0.34, 0, 0.36),
    bar(0.38, 0.92, 0.33, 1.08),
    box(0.04, 0.04, 0.5, 0.33, 1.08, 0),
    box(0.24, 0.05, 0.12, -0.17, 0.94, 0),
  ])
  const shirt = merge([
    limb([-0.12, 1.02, 0], [0.12, 1.5, 0], 0.17),
    limb([0.12, 1.5, 0.17], [0.33, 1.08, 0.22], 0.05),
    limb([0.12, 1.5, -0.17], [0.33, 1.08, -0.22], 0.05),
  ])
  const pants = merge([limb([-0.12, 0.98, 0.1], [0.02, 0.42, 0.14], 0.075), limb([-0.12, 0.98, -0.1], [-0.05, 0.5, -0.14], 0.075)])
  const skin = new THREE.SphereGeometry(0.12, 14, 10).translate(0.2, 1.75, 0)
  bikeGeo = { frame, rider: mergeGeometries([shirt, pants, skin.toNonIndexed()], true) }
  return bikeGeo
}

function Cyclists({ cyclists }) {
  const m = getMaterials()
  const g = getBikeGeo()
  const mats = useMemo(() => {
    const pants = new THREE.MeshStandardMaterial({ color: '#2d3138', roughness: 0.8 })
    const skin = new THREE.MeshStandardMaterial({ color: '#d9ab8f', roughness: 0.7 })
    return Object.fromEntries(SHIRTS.map((c) => [c, [new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 }), pants, skin]]))
  }, [])
  const refs = useRef([])
  const xs = useRef(cyclists.map((c) => c.x))
  useFrame((state, dt) => {
    const step = Math.min(dt, 0.1)
    const t = state.clock.elapsedTime
    cyclists.forEach((c, i) => {
      let x = xs.current[i] - c.speed * step
      if (x < -SPAN) x += 2 * SPAN
      xs.current[i] = x
      const el = refs.current[i]
      if (el) {
        el.position.x = x
        el.position.y = Math.abs(Math.sin(t * 5 + c.phase)) * 0.02
      }
    })
  })
  return (
    <group>
      {cyclists.map((c, i) => (
        <group key={i} ref={(el) => (refs.current[i] = el)} position={[c.x, 0, ROAD.bike]} rotation={[0, Math.PI, 0]}>
          <mesh geometry={g.frame} material={m.blackMetal} castShadow />
          <mesh geometry={g.rider} material={mats[c.shirt]} castShadow />
        </group>
      ))}
    </group>
  )
}

/* ---------------- all together ---------------- */

const LAYOUT = layout()

export function Neighborhood() {
  const ground = useGroundMaterials()
  return (
    <group>
      <Street mats={ground} />
      <Park mats={ground} />
      <City houses={LAYOUT.houses} />
      <Trees trees={LAYOUT.trees} />
      <Lamps lamps={LAYOUT.lamps} />
      <Traffic parked={LAYOUT.parked} movers={LAYOUT.movers} />
      <Cyclists cyclists={LAYOUT.cyclists} />
    </group>
  )
}
