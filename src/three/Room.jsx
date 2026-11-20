import * as THREE from 'three'
import { useMemo } from 'react'
import { getMaterials, oakFor } from './materials'
import { ROOM, WINDOW, DOOR, SLAB, LEVEL, FLOORS, STAIR } from './layout'
import { RoofSign } from './RoofSign'

const { w: W, d: D, h: H, t: T } = ROOM

function Box({ size, position, material, cast = true, receive = true, ...rest }) {
  return (
    <mesh position={position} material={material} castShadow={cast} receiveShadow={receive} {...rest}>
      <boxGeometry args={size} />
    </mesh>
  )
}

// Pink concrete with its texture scaled to real formwork panels (1.8 × 0.9 m, 2 × 2 per tile).
const concreteFor = (key, u, v) => oakFor(key, [u / 3.6, v / 1.8], 'concreteWall')

function useInstances(count, place) {
  return (mesh) => {
    if (!mesh) return
    const o = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      o.position.set(0, 0, 0)
      o.rotation.set(0, 0, 0)
      o.scale.set(1, 1, 1)
      place(o, i)
      o.updateMatrix()
      mesh.setMatrixAt(i, o.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }
}

// Splits a slab rectangle around an optional stair opening.
function slabPieces(hole) {
  const full = { x0: -W / 2 - T, x1: W / 2 + T, z0: -D / 2 - T, z1: D / 2 + 0.15 }
  if (!hole) return [full]
  const out = []
  if (hole.x0 > full.x0) out.push({ ...full, x1: hole.x0 })
  if (hole.x1 < full.x1) out.push({ ...full, x0: hole.x1 })
  out.push({ x0: hole.x0, x1: hole.x1, z0: full.z0, z1: hole.z0 })
  out.push({ x0: hole.x0, x1: hole.x1, z0: hole.z1, z1: full.z1 })
  return out
}

// A floor slab: oak on top, plaster below, pink concrete on its edges.
function Slab({ top, hole, kind = 'floor' }) {
  const m = getMaterials()
  return slabPieces(hole).map((p, i) => {
    const w = p.x1 - p.x0
    const d = p.z1 - p.z0
    const edge = concreteFor(`slab-edge-${kind}`, 6, 0.3)
    const topMat = kind === 'roof' ? m.concrete : oakFor(`floor-${kind}-${i}-${w.toFixed(1)}-${d.toFixed(1)}`, [w / 3, d / 2], 'oakFloor')
    const bottom = kind === 'ground' ? m.concrete : m.plaster
    const mats = [edge, edge, topMat, bottom, edge, edge]
    return (
      <mesh key={i} material={mats} position={[(p.x0 + p.x1) / 2, top - SLAB / 2, (p.z0 + p.z1) / 2]} castShadow={kind !== 'ground'} receiveShadow>
        <boxGeometry args={[w, SLAB, d]} />
      </mesh>
    )
  })
}

function Shell({ level }) {
  const m = getMaterials()
  const y0 = level * LEVEL
  const wallX = W / 2 + T / 2
  const wallZ = -D / 2 - T / 2
  const winLen = WINDOW.z1 - WINDOW.z0
  const winH = WINDOW.y1 - WINDOW.y0
  const winY = (WINDOW.y0 + WINDOW.y1) / 2
  const doorL = DOOR.x - DOOR.w / 2
  const doorR = DOOR.x + DOOR.w / 2
  const leftLen = doorL + W / 2 + T
  const rightLen = W / 2 + T - doorR
  const hasDoor = level === 0

  return (
    <group position={[0, y0, 0]}>
      {/* left wall */}
      <Box size={[T, H, D + 2 * T]} position={[-wallX, H / 2, 0]} material={concreteFor('wall-left', D, H)} />

      {/* back wall (kitchen doorway on the café floor) */}
      {hasDoor ? (
        <>
          <Box size={[leftLen, H, T]} position={[-W / 2 - T + leftLen / 2, H / 2, wallZ]} material={concreteFor('wall-back-l', leftLen, H)} />
          <Box size={[rightLen, H, T]} position={[doorR + rightLen / 2, H / 2, wallZ]} material={concreteFor('wall-back-r', rightLen, H)} />
          <Box size={[DOOR.w, H - DOOR.h, T]} position={[DOOR.x, DOOR.h + (H - DOOR.h) / 2, wallZ]} material={concreteFor('wall-back-t', DOOR.w, H - DOOR.h)} />
          <mesh material={m.void} position={[DOOR.x, DOOR.h / 2, wallZ - 0.4]}>
            <planeGeometry args={[DOOR.w + 0.4, DOOR.h + 0.2]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} material={m.noren} position={[DOOR.x + s * (DOOR.w / 4 + 0.005), DOOR.h - 0.5, -D / 2 + 0.02]} rotation={[0.02 * s, 0, 0]} castShadow>
              <planeGeometry args={[DOOR.w / 2 - 0.02, 0.98]} />
            </mesh>
          ))}
          <Box size={[DOOR.w + 0.1, 0.03, 0.03]} position={[DOOR.x, DOOR.h, -D / 2 + 0.03]} material={m.oakDark} />
        </>
      ) : (
        <Box size={[W + 2 * T, H, T]} position={[0, H / 2, wallZ]} material={concreteFor('wall-back', W, H)} />
      )}

      {/* right wall around the window opening */}
      <Box size={[T, WINDOW.y0, D + 2 * T]} position={[wallX, WINDOW.y0 / 2, 0]} material={concreteFor('wall-r-b', D, WINDOW.y0)} />
      <Box size={[T, H - WINDOW.y1, D + 2 * T]} position={[wallX, (H + WINDOW.y1) / 2, 0]} material={concreteFor('wall-r-t', D, H - WINDOW.y1)} />
      <Box size={[T, winH, D / 2 - WINDOW.z1 + T]} position={[wallX, winY, (D / 2 + T + WINDOW.z1) / 2]} material={concreteFor('wall-r-e', 1, winH)} />
      <Box size={[T, winH, D / 2 + WINDOW.z0 + T]} position={[wallX, winY, (-D / 2 - T + WINDOW.z0) / 2]} material={concreteFor('wall-r-e', 1, winH)} />

      {/* window glass, steel mullions, oak sill */}
      <mesh material={m.glass} position={[W / 2 + 0.05, winY, 0]} rotation={[0, -Math.PI / 2, 0]} renderOrder={4}>
        <planeGeometry args={[winLen, winH]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={i} size={[0.05, winH, 0.04]} position={[W / 2 + 0.06, winY, WINDOW.z0 + (i * winLen) / 4]} material={m.blackMetal} />
      ))}
      <Box size={[0.05, 0.04, winLen]} position={[W / 2 + 0.06, 2.85, 0]} material={m.blackMetal} />
      <Box size={[0.5, 0.05, winLen]} position={[W / 2 - 0.2, WINDOW.y0 - 0.025, 0]} material={oakFor('sill', [2.5, 0.1])} />
      <Box size={[0.09, 0.05, winLen]} position={[W / 2 - 0.2, WINDOW.y1 - 0.04, 0]} material={oakFor('slat', [0.05, 1])} />

      {/* glass front: the building is drawn open, like an architect's model */}
      <mesh material={m.glass} position={[0, H / 2, D / 2 + 0.12]} renderOrder={4}>
        <planeGeometry args={[W, H]} />
      </mesh>
      {[-6, -2, 2, 6].map((x) => (
        <Box key={x} size={[0.035, H, 0.035]} position={[x, H / 2, D / 2 + 0.12]} material={m.bronze} cast={false} />
      ))}
    </group>
  )
}

// Oak treads on a black steel stringer, one flight per floor.
function Flight({ lane, y0, rising }) {
  const m = getMaterials()
  const { steps, zLow, zHigh } = STAIR
  const run = Math.abs(zLow - zHigh) / steps
  const rise = LEVEL / steps
  const w = lane.x1 - lane.x0
  const cx = (lane.x0 + lane.x1) / 2
  const dir = rising === 'back' ? -1 : 1
  const z0 = rising === 'back' ? zLow : zHigh
  const tread = useMemo(() => new THREE.BoxGeometry(w, 0.045, run + 0.03), [w, run])
  const ref = useInstances(steps, (o, i) => o.position.set(cx, y0 + (i + 1) * rise - 0.022, z0 + dir * (i + 0.5) * run))
  const len = Math.hypot(LEVEL, Math.abs(zLow - zHigh))
  const angle = Math.atan2(LEVEL, Math.abs(zLow - zHigh))
  return (
    <group>
      <instancedMesh ref={ref} args={[tread, oakFor('tread', [0.4, 0.1]), steps]} castShadow receiveShadow />
      {[lane.x0 + 0.02, lane.x1 - 0.02].map((x) => (
        <mesh key={x} material={m.blackMetal} position={[x, y0 + LEVEL / 2 - 0.12, (zLow + zHigh) / 2]} rotation={[-dir * angle, 0, 0]} castShadow>
          <boxGeometry args={[0.02, 0.26, len]} />
        </mesh>
      ))}
    </group>
  )
}

// A glass guard with an oak handrail along an opening edge.
function Guard({ from, to, y }) {
  const m = getMaterials()
  const dx = to[0] - from[0]
  const dz = to[1] - from[1]
  const len = Math.hypot(dx, dz)
  const rot = Math.atan2(dx, dz)
  const cx = (from[0] + to[0]) / 2
  const cz = (from[1] + to[1]) / 2
  return (
    <group position={[cx, y, cz]} rotation={[0, rot, 0]}>
      <mesh material={m.glass} position={[0, 0.5, 0]} renderOrder={4}>
        <boxGeometry args={[0.012, 0.95, len]} />
      </mesh>
      <mesh material={oakFor('rail', [0.1, 0.5])} position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.06, 0.04, len]} />
      </mesh>
    </group>
  )
}

export function Building() {
  const m = getMaterials()
  const { laneA, laneB, zLow, zHigh } = STAIR
  const holeA = { x0: laneA.x0 - 0.01, x1: laneA.x1, z0: zHigh, z1: zLow }
  const holeB = { x0: laneB.x0, x1: laneB.x1, z0: zHigh, z1: zLow }

  const winLen = WINDOW.z1 - WINDOW.z0
  const winH = WINDOW.y1 - WINDOW.y0
  const winY = (WINDOW.y0 + WINDOW.y1) / 2

  // Tategoshi: vertical oak slats inside every window. Their shadows are the hero.
  const slatStep = 0.15
  const perFloor = Math.floor(winLen / slatStep) + 1
  const slatGeo = useMemo(() => new THREE.BoxGeometry(0.07, winH - 0.1, 0.034), [winH])
  const slats = useInstances(perFloor * FLOORS, (o, i) => {
    const f = Math.floor(i / perFloor)
    const k = i % perFloor
    o.position.set(W / 2 - 0.2, f * LEVEL + winY, WINDOW.z0 + 0.04 + k * slatStep)
  })

  const beamsPer = 8
  const beamGeo = useMemo(() => new THREE.BoxGeometry(0.12, 0.2, D), [])
  const beams = useInstances(beamsPer * FLOORS, (o, i) => {
    const f = Math.floor(i / beamsPer)
    o.position.set(-W / 2 + 0.75 + (i % beamsPer) * 1.5, f * LEVEL + H - 0.1, 0)
  })

  return (
    <group>
      <Slab top={0} kind="ground" />
      <Slab top={LEVEL} hole={holeA} kind="l1" />
      <Slab top={2 * LEVEL} hole={holeB} kind="l2" />
      <Slab top={3 * LEVEL} kind="roof" />

      {[0, 1, 2].map((l) => (
        <Shell key={l} level={l} />
      ))}
      <instancedMesh ref={slats} args={[slatGeo, oakFor('slat', [0.05, 1]), perFloor * FLOORS]} castShadow receiveShadow />
      <instancedMesh ref={beams} args={[beamGeo, oakFor('beam', [3, 0.05]), beamsPer * FLOORS]} castShadow receiveShadow />

      <Flight lane={laneA} y0={0} rising="back" />
      <Flight lane={laneB} y0={LEVEL} rising="front" />
      {/* guards on the lounge floor around opening A, and on the florist floor around opening B */}
      <Guard from={[laneA.x1 + 0.02, zHigh + 0.4]} to={[laneA.x1 + 0.02, zLow]} y={LEVEL} />
      <Guard from={[laneA.x0, zLow + 0.02]} to={[laneA.x1, zLow + 0.02]} y={LEVEL} />
      <Guard from={[laneB.x1 + 0.02, zHigh]} to={[laneB.x1 + 0.02, zLow - 0.4]} y={2 * LEVEL} />
      <Guard from={[laneB.x0, zHigh - 0.02]} to={[laneB.x1, zHigh - 0.02]} y={2 * LEVEL} />
      <Guard from={[laneB.x0 - 0.02, zHigh]} to={[laneB.x0 - 0.02, zLow - 0.4]} y={2 * LEVEL} />

      {/* hanging scroll with an ensō in the lounge */}
      <group position={[-0.3, LEVEL + 2.35, -D / 2 + 0.03]}>
        <mesh material={m.scroll} castShadow>
          <planeGeometry args={[0.55, 1.6]} />
        </mesh>
        {[0.82, -0.82].map((y) => (
          <mesh key={y} material={m.oakDark} position={[0, y, 0.01]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.014, 0.014, 0.66, 12]} />
          </mesh>
        ))}
      </group>

      <RoofSign />

      {/* brass sign on the café's back wall */}
      <mesh material={m.sign} position={[-0.9, 2.3, -D / 2 + 0.02]}>
        <planeGeometry args={[1.4, 0.7]} />
      </mesh>

      <Surroundings />
    </group>
  )
}

// Street pavers in front, a raked gravel garden outside the windows.
function Surroundings() {
  const m = getMaterials()
  return (
    <group>
      <mesh material={m.pavers} position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[420, 420]} />
      </mesh>
      <mesh material={m.gravel} position={[10.5, -0.005, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8.4, 16]} />
      </mesh>
      {[
        [8.2, -1.6, 0.55],
        [9.4, 1.4, 0.8],
        [8.8, 2.4, 0.35],
      ].map(([x, z, s], i) => (
        <mesh key={i} material={m.stone} position={[x, s * 0.35, z]} scale={[s * 1.3, s * 0.7, s]} rotation={[0.2, i * 1.3, 0.1]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.6, 1]} />
        </mesh>
      ))}
    </group>
  )
}
