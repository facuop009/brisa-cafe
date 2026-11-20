import * as THREE from 'three'
import { useMemo } from 'react'
import { RoundedBox } from './helpers'
import { getMaterials, oakFor } from './materials'

const g = {
  leg: new THREE.CylinderGeometry(0.02, 0.015, 1, 12),
  post: new THREE.CylinderGeometry(0.013, 0.015, 1, 10),
  ring: new THREE.TorusGeometry(0.16, 0.008, 8, 40),
  disc: new THREE.CylinderGeometry(1, 1, 1, 48),
  back: new THREE.CylinderGeometry(0.25, 0.25, 0.1, 32, 1, true, -0.85, 1.7),
  cord: new THREE.CylinderGeometry(0.003, 0.003, 1, 6),
}

// A low oak chair with a curved back rail — a quiet nod to the Danish classics.
export function Chair({ position = [0, 0, 0], rotation = 0 }) {
  const oak = oakFor('chair', [0.3, 0.3])
  const SH = 0.45
  const legs = [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]]
  const backMat = useMemo(() => {
    const m = oak.clone()
    m.side = THREE.DoubleSide
    return m
  }, [oak])
  return (
    <group position={position} rotation={[0, rotation + Math.PI, 0]}>
      <RoundedBox args={[0.44, 0.03, 0.42]} radius={0.012} smoothness={3} position={[0, SH, 0]} material={oak} castShadow receiveShadow />
      {legs.map(([x, z], i) => (
        <mesh key={i} geometry={g.leg} material={oak} position={[x, SH / 2, z]} scale={[1, SH, 1]} rotation={[z * 0.25, 0, -x * 0.25]} castShadow />
      ))}
      {/* back posts and curved rail */}
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} geometry={g.post} material={oak} position={[x, SH + 0.17, 0.18]} scale={[1, 0.34, 1]} castShadow />
      ))}
      <mesh geometry={g.back} material={backMat} position={[0, SH + 0.32, -0.04]} castShadow />
    </group>
  )
}

export function Stool({ position = [0, 0, 0] }) {
  const oak = oakFor('stool', [0.25, 0.25])
  const m = getMaterials()
  const SH = 0.74
  const legs = [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    return [Math.cos(a) * 0.13, Math.sin(a) * 0.13, a]
  })
  return (
    <group position={position}>
      <mesh geometry={g.disc} material={oak} position={[0, SH, 0]} scale={[0.18, 0.035, 0.18]} castShadow receiveShadow />
      {legs.map(([x, z, a], i) => (
        <mesh key={i} geometry={g.leg} material={m.blackMetal} position={[x * 1.15, SH / 2, z * 1.15]} scale={[0.8, SH, 0.8]} rotation={[Math.sin(a) * 0.08, 0, -Math.cos(a) * 0.08]} castShadow />
      ))}
      <mesh geometry={g.ring} material={m.blackMetal} position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

export function RoundTable({ position = [0, 0, 0], r = 0.42, children }) {
  const oak = oakFor('roundtop', [0.6, 0.6])
  const m = getMaterials()
  const H = 0.74
  return (
    <group position={position}>
      <mesh geometry={g.disc} material={oak} position={[0, H - 0.0175, 0]} scale={[r, 0.035, r]} castShadow receiveShadow />
      <mesh geometry={g.disc} material={m.blackMetal} position={[0, H / 2, 0]} scale={[0.035, H - 0.04, 0.035]} castShadow />
      <mesh geometry={g.disc} material={m.concrete} position={[0, 0.02, 0]} scale={[0.24, 0.04, 0.24]} castShadow receiveShadow />
      <group position={[0, H, 0]}>{children}</group>
    </group>
  )
}

export function LongTable({ position, len, width, children }) {
  const oak = oakFor('longtable', [2.2, 0.5])
  const H = 0.75
  return (
    <group position={position}>
      {/* top runs along z */}
      <mesh material={oak} position={[0, H - 0.025, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[len, 0.05, width]} />
      </mesh>
      {/* two slab legs set in from the ends */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={oak} position={[0, (H - 0.05) / 2, s * (len / 2 - 0.35)]} castShadow receiveShadow>
          <boxGeometry args={[width - 0.16, H - 0.05, 0.06]} />
        </mesh>
      ))}
      <mesh material={oak} position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[0.06, 0.05, len - 0.75]} />
      </mesh>
      <group position={[0, H, 0]}>{children}</group>
    </group>
  )
}

export function Bench({ x, z0, z1 }) {
  const oak = oakFor('bench', [2.5, 0.3])
  const m = getMaterials()
  const len = z1 - z0
  const zc = (z0 + z1) / 2
  return (
    <group position={[x, 0, zc]}>
      <mesh material={oak} position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.4, len]} />
      </mesh>
      <RoundedBox args={[0.5, 0.08, len - 0.04]} radius={0.03} smoothness={3} position={[0, 0.44, 0]} material={m.linen} castShadow receiveShadow />
      <RoundedBox args={[0.12, 0.42, len - 0.04]} radius={0.04} smoothness={3} position={[-0.2, 0.69, 0]} rotation={[0, 0, 0.1]} material={m.linen} castShadow />
    </group>
  )
}

// Paper lantern pendant; the light itself is added in Lighting so its intensity follows the clock.
export function PaperPendant({ position, radius = 0.26, drop = 1.6 }) {
  const m = getMaterials()
  return (
    <group position={position}>
      <mesh geometry={g.cord} material={m.blackMetal} position={[0, drop / 2 + radius * 0.8, 0]} scale={[1, drop, 1]} />
      <mesh material={m.paperLamp} scale={[1, 0.82, 1]}>
        <sphereGeometry args={[radius, 32, 20]} />
      </mesh>
      {/* bamboo ribs */}
      {[-0.5, -0.2, 0.1, 0.4].map((y) => (
        <mesh key={y} material={m.oakDark} position={[0, y * radius * 0.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius * Math.sqrt(1 - y * y) * 1.003, 0.0025, 4, 48]} />
        </mesh>
      ))}
    </group>
  )
}

export function CylinderPendant({ position, drop = 1.4 }) {
  const m = getMaterials()
  return (
    <group position={position}>
      <mesh geometry={g.cord} material={m.blackMetal} position={[0, drop / 2 + 0.11, 0]} scale={[1, drop, 1]} />
      <mesh material={m.blackMetal} castShadow>
        <cylinderGeometry args={[0.07, 0.085, 0.24, 32, 1, true]} />
      </mesh>
      <mesh material={m.bulbWarm} position={[0, -0.1, 0]}>
        <circleGeometry args={[0.075, 24]} />
      </mesh>
    </group>
  )
}

// Olive tree in a concrete planter: a few branches with instanced leaves.
export function OliveTree({ position }) {
  const m = getMaterials()
  const { leaves, branches } = useMemo(() => {
    let s = 3
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    const branches = []
    const leaves = []
    for (let b = 0; b < 7; b++) {
      const a = (b / 7) * Math.PI * 2 + r()
      const start = new THREE.Vector3(0, 0.9 + r() * 0.6, 0)
      const end = new THREE.Vector3(Math.cos(a) * (0.35 + r() * 0.35), start.y + 0.5 + r() * 0.7, Math.sin(a) * (0.35 + r() * 0.35))
      branches.push([start, end])
      for (let l = 0; l < 110; l++) {
        const t = 0.25 + r() * 0.85
        const p = start.clone().lerp(end, t)
        p.x += (r() - 0.5) * 0.45
        p.y += (r() - 0.3) * 0.35
        p.z += (r() - 0.5) * 0.45
        leaves.push({ p, rot: [r() * 6, r() * 6, r() * 6] })
      }
    }
    return { leaves, branches }
  }, [])
  const leafGeo = useMemo(() => {
    const geom = new THREE.PlaneGeometry(0.035, 0.11)
    return geom
  }, [])
  const ref = (mesh) => {
    if (!mesh) return
    const o = new THREE.Object3D()
    leaves.forEach((l, i) => {
      o.position.copy(l.p)
      o.rotation.set(...l.rot)
      o.updateMatrix()
      mesh.setMatrixAt(i, o.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }
  return (
    <group position={position}>
      <mesh material={m.concrete} position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.28, 0.6, 32]} />
      </mesh>
      <mesh material={m.branch} position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.045, 0.8, 8]} />
      </mesh>
      {branches.map(([a, b], i) => {
        const mid = a.clone().add(b).multiplyScalar(0.5)
        const dir = b.clone().sub(a)
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
        return (
          <mesh key={i} material={m.branch} position={mid} quaternion={q} castShadow>
            <cylinderGeometry args={[0.008, 0.02, dir.length(), 6]} />
          </mesh>
        )
      })}
      <instancedMesh ref={ref} args={[leafGeo, m.leaf, leaves.length]} castShadow />
    </group>
  )
}

export function Ikebana({ position }) {
  const m = getMaterials()
  return (
    <group position={position}>
      <mesh material={m.ceramicCharcoal} position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 0.22, 24]} />
      </mesh>
      {[
        [[0, 0.2, 0], [-0.12, 0.62, 0.04]],
        [[0, 0.2, 0], [0.16, 0.5, -0.03]],
      ].map(([a, b], i) => {
        const A = new THREE.Vector3(...a)
        const B = new THREE.Vector3(...b)
        const dir = B.clone().sub(A)
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
        return (
          <group key={i}>
            <mesh material={m.branch} position={A.clone().add(B).multiplyScalar(0.5)} quaternion={q} castShadow>
              <cylinderGeometry args={[0.003, 0.005, dir.length(), 5]} />
            </mesh>
            {[0.55, 0.75, 0.95].map((t) => (
              <mesh key={t} material={m.leaf} position={A.clone().lerp(B, t)} rotation={[t * 4, t * 7, 0.6]} castShadow>
                <planeGeometry args={[0.03, 0.07]} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}
