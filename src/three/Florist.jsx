import * as THREE from 'three'
import { useMemo } from 'react'
import { RoundedBox } from './helpers'
import { getMaterials, oakFor } from './materials'
import { FLORIST } from './layout'
import { OliveTree } from './Furniture'

// ASA Flowers — the third floor. Everything is instanced: a few draw calls for hundreds of stems.

const PALETTE = {
  pink: '#f2a3b3',
  rose: '#d95a80',
  blush: '#f8d5d8',
  yellow: '#f4cc3a',
  butter: '#f7e08a',
  white: '#f8f3ea',
  green: '#7f9a5a',
}
const UP = new THREE.Vector3(0, 1, 0)
const BUNCHES = ['pink', 'yellow', 'blush', 'rose', 'butter', 'white', 'yellow', 'pink', 'green']

function rng(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

function useInstanced(items, withColor) {
  return (mesh) => {
    if (!mesh) return
    const o = new THREE.Object3D()
    const c = new THREE.Color()
    items.forEach((it, i) => {
      o.position.set(...it.p)
      if (it.q) o.quaternion.copy(it.q)
      else o.rotation.set(...(it.r || [0, 0, 0]))
      o.scale.set(...(it.s || [1, 1, 1]))
      o.updateMatrix()
      mesh.setMatrixAt(i, o.matrix)
      if (withColor) mesh.setColorAt(i, c.set(it.c))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }
}

// Bouquet generator: returns stems and heads for a bunch standing at `base`.
function bunch(base, color, r, { count = 11, height = 0.55, spread = 0.09, headR = 0.045 } = {}) {
  const stems = []
  const heads = []
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2
    const d = Math.sqrt(r()) * spread
    const h = height * (0.85 + r() * 0.3)
    const tip = [base[0] + Math.cos(a) * d * 1.8, base[1] + h, base[2] + Math.sin(a) * d * 1.8]
    const mid = [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2, (base[2] + tip[2]) / 2]
    const dir = new THREE.Vector3(tip[0] - base[0], tip[1] - base[1], tip[2] - base[2])
    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize())
    stems.push({ p: mid, q, s: [1, dir.length(), 1] })
    const hr = headR * (0.75 + r() * 0.5)
    const isGreen = color === 'green'
    heads.push({
      p: tip,
      r: [r() * 0.6, r() * 6, r() * 0.6],
      s: isGreen ? [hr * 0.6, hr * 1.6, hr * 0.6] : [hr, hr * 0.72, hr],
      c: isGreen ? (r() > 0.5 ? '#8aa368' : '#6f8c52') : PALETTE[color],
    })
  }
  return { stems, heads }
}

export function Florist() {
  const m = getMaterials()
  const { stand, buckets, stems, heads, dried, driedHeads, blossoms, branches } = useMemo(() => {
    const r = rng(11)
    const stand = []
    const buckets = []
    let stems = []
    let heads = []
    // three oak tiers along the back wall
    const tiers = [
      { h: 0.32, z: FLORIST.standZ + 0.75 },
      { h: 0.64, z: FLORIST.standZ + 0.38 },
      { h: 0.96, z: FLORIST.standZ },
    ]
    const len = FLORIST.standX1 - FLORIST.standX0
    const cx = (FLORIST.standX0 + FLORIST.standX1) / 2
    tiers.forEach((t, ti) => {
      stand.push({ p: [cx, t.h / 2, t.z], s: [len, t.h, 0.36] })
      const n = Math.floor(len / 0.4)
      for (let i = 0; i < n; i++) {
        const x = FLORIST.standX0 + 0.22 + i * 0.4
        const base = [x, t.h, t.z]
        buckets.push({ p: [x, t.h + 0.15, t.z], s: [1, 1, 1] })
        const color = BUNCHES[(i * 3 + ti * 5) % BUNCHES.length]
        const b = bunch([x, t.h + 0.12, t.z], color, r, { count: 12, height: 0.45 + ti * 0.04 })
        stems = stems.concat(b.stems)
        heads = heads.concat(b.heads)
        void base
      }
    })
    // floor buckets by the window and the work table
    ;[
      [4.6, -3.4, 'yellow'], [4.95, -3.0, 'pink'], [4.5, -2.6, 'butter'],
      [-2.6, 2.9, 'rose'], [-2.2, 3.2, 'blush'], [-1.8, 2.85, 'yellow'],
    ].forEach(([x, z, color]) => {
      buckets.push({ p: [x, 0.15, z], s: [1.1, 1, 1.1] })
      const b = bunch([x, 0.12, z], color, r, { count: 16, height: 0.62, spread: 0.11, headR: 0.05 })
      stems = stems.concat(b.stems)
      heads = heads.concat(b.heads)
    })
    // a bouquet in a vase on the work table
    const t = FLORIST.table
    const vb = bunch([t.x + 0.7, 0.75 + 0.2, t.z - 0.1], 'pink', r, { count: 18, height: 0.38, spread: 0.12, headR: 0.05 })
    const vb2 = bunch([t.x + 0.7, 0.75 + 0.2, t.z - 0.1], 'yellow', r, { count: 9, height: 0.42, spread: 0.12, headR: 0.04 })
    stems = stems.concat(vb.stems, vb2.stems)
    heads = heads.concat(vb.heads, vb2.heads)

    // dried bunches hanging from an oak pole
    const dried = []
    const driedHeads = []
    for (let i = 0; i < 12; i++) {
      const x = -2.2 + i * 0.42
      const z = 1.9
      for (let k = 0; k < 7; k++) {
        const dx = (r() - 0.5) * 0.08
        const dz = (r() - 0.5) * 0.08
        const len2 = 0.35 + r() * 0.15
        dried.push({ p: [x + dx, 3.55 - len2 / 2, z + dz], s: [1, len2, 1] })
        const cols = ['#e7c56a', '#d9a7a2', '#efe3c6', '#c98f98', '#e4b54c']
        for (let q = 0; q < 4; q++)
          driedHeads.push({
            p: [x + dx + (r() - 0.5) * 0.05, 3.55 - len2 - r() * 0.06, z + dz + (r() - 0.5) * 0.05],
            s: [0.022, 0.03, 0.022],
            c: cols[(i + q) % cols.length],
          })
      }
    }

    // cherry branches in two tall vases at the window
    const blossoms = []
    const branches = []
    ;[[4.9, 1.6], [4.85, 3.0]].forEach(([vx, vz]) => {
      for (let b = 0; b < 5; b++) {
        const a = r() * Math.PI * 2
        const top = [vx + Math.cos(a) * 0.45, 1.4 + r() * 0.7, vz + Math.sin(a) * 0.45]
        const start = new THREE.Vector3(vx, 0.55, vz)
        const end = new THREE.Vector3(...top)
        branches.push([start, end])
        for (let k = 0; k < 40; k++) {
          const p = start.clone().lerp(end, 0.4 + r() * 0.6)
          p.x += (r() - 0.5) * 0.18
          p.y += (r() - 0.5) * 0.14
          p.z += (r() - 0.5) * 0.18
          blossoms.push({ p: p.toArray(), s: [0.022, 0.016, 0.022], r: [r() * 3, r() * 3, 0], c: r() > 0.3 ? '#f6c3cd' : '#fbe3e6' })
        }
      }
    })
    return { stand, buckets, stems, heads, dried, driedHeads, blossoms, branches }
  }, [])

  const geo = useMemo(
    () => ({
      box: new THREE.BoxGeometry(1, 1, 1),
      bucket: new THREE.CylinderGeometry(0.13, 0.105, 0.3, 20, 1, true),
      stem: new THREE.CylinderGeometry(0.003, 0.004, 1, 5),
      head: new THREE.IcosahedronGeometry(1, 1),
    }),
    []
  )
  const headMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.65 }), [])
  const standMat = oakFor('stand', [2, 0.2])
  const t = FLORIST.table

  return (
    <group>
      <instancedMesh ref={useInstanced(stand)} args={[geo.box, standMat, stand.length]} castShadow receiveShadow />
      <instancedMesh ref={useInstanced(buckets)} args={[geo.bucket, m.galvanised, buckets.length]} castShadow receiveShadow />
      <instancedMesh ref={useInstanced(stems)} args={[geo.stem, m.stem, stems.length]} />
      <instancedMesh ref={useInstanced(heads, true)} args={[geo.head, headMat, heads.length]} castShadow />
      <instancedMesh ref={useInstanced(dried)} args={[geo.stem, m.branch, dried.length]} />
      <instancedMesh ref={useInstanced(driedHeads, true)} args={[geo.head, headMat, driedHeads.length]} castShadow />
      <instancedMesh ref={useInstanced(blossoms, true)} args={[geo.head, headMat, blossoms.length]} castShadow />

      {/* hanging pole */}
      <mesh material={m.oakDark} position={[0.1, 3.58, 1.9]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 5.3, 10]} />
      </mesh>
      {[-2.4, 2.6].map((x) => (
        <mesh key={x} material={m.blackMetal} position={[x, 3.89, 1.9]}>
          <cylinderGeometry args={[0.004, 0.004, 0.62, 5]} />
        </mesh>
      ))}

      {/* cherry branches */}
      {branches.map(([a, b], i) => {
        const mid = a.clone().add(b).multiplyScalar(0.5)
        const dir = b.clone().sub(a)
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
        return (
          <mesh key={i} material={m.branch} position={mid} quaternion={q} castShadow>
            <cylinderGeometry args={[0.006, 0.014, dir.length(), 6]} />
          </mesh>
        )
      })}
      {[[4.9, 1.6], [4.85, 3.0]].map(([x, z]) => (
        <mesh key={z} material={m.ceramicWhite} position={[x, 0.32, z]} castShadow receiveShadow>
          <cylinderGeometry args={[0.13, 0.16, 0.64, 28]} />
        </mesh>
      ))}

      {/* work table: oak top on yellow lacquered legs, kraft paper roll and twine */}
      <group position={[t.x, 0, t.z]}>
        <mesh material={oakFor('worktable', [1.6, 0.6])} position={[0, 0.73, 0]} castShadow receiveShadow>
          <boxGeometry args={[t.len, 0.05, t.width]} />
        </mesh>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
          <mesh key={i} material={m.lacquerYellow} position={[sx * (t.len / 2 - 0.1), 0.355, sz * (t.width / 2 - 0.1)]} castShadow>
            <boxGeometry args={[0.06, 0.71, 0.06]} />
          </mesh>
        ))}
        <mesh material={m.kraft} position={[-0.75, 0.81, -0.32]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.9, 24]} />
        </mesh>
        <mesh material={m.kraft} position={[-0.6, 0.757, 0.05]} rotation={[-Math.PI / 2, 0, 0.2]} receiveShadow>
          <planeGeometry args={[0.8, 0.5]} />
        </mesh>
        {/* a wrapped bouquet lying ready */}
        <group position={[-0.55, 0.82, 0.06]} rotation={[0, 0.3, Math.PI / 2]}>
          <mesh material={m.kraft} castShadow>
            <coneGeometry args={[0.12, 0.42, 20, 1, true]} />
          </mesh>
        </group>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} material={headMat} position={[-0.35 + (i % 3) * 0.04, 0.83 + Math.floor(i / 3) * 0.05, 0.02 + (i % 2) * 0.06]} scale={0.045}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color={i % 2 ? PALETTE.yellow : PALETTE.pink} roughness={0.65} />
          </mesh>
        ))}
        <mesh material={m.ceramicCharcoal} position={[0.7, 0.85, -0.1]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 0.2, 24]} />
        </mesh>
        <mesh material={m.lacquerPink} position={[0.2, 0.775, 0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.04, 0.02, 10, 24]} />
        </mesh>
      </group>

      {/* florist counter by the window */}
      <group position={[FLORIST.counter.x, 0, FLORIST.counter.z]}>
        <RoundedBox args={[0.7, 0.98, 1.6]} radius={0.02} smoothness={3} position={[0, 0.49, 0]} material={m.lacquerYellow} castShadow receiveShadow />
        <mesh material={oakFor('fcounter', [0.6, 0.3])} position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.04, 1.7]} />
        </mesh>
        <mesh material={m.paper} position={[-0.05, 1.03, -0.4]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.22, 0.02, 0.3]} />
        </mesh>
      </group>

      <OliveTree position={[-5.2, 0, -3.8]} />
    </group>
  )
}
