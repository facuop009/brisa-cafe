import * as THREE from 'three'
import { useMemo } from 'react'
import { RoundedBox } from './helpers'
import { getMaterials, oakFor } from './materials'
import { COUNTER, BACK_COUNTER, ROOM } from './layout'
import { Cup, HandPour, CardamomKnot, Croissant, Cookie, CoffeeBag, Plate } from './Tableware'
import { Ikebana } from './Furniture'

function useInstances(count, place) {
  return (mesh) => {
    if (!mesh) return
    const o = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      place(o, i)
      o.updateMatrix()
      mesh.setMatrixAt(i, o.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }
}

function tube(points, radius = 0.007) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
  return new THREE.TubeGeometry(curve, 24, radius, 8, false)
}

/* ---------------- Espresso machine (two groups, faces the guests) ---------------- */
export function EspressoMachine(props) {
  const m = getMaterials()
  const oak = oakFor('machine', [0.4, 0.4], 'oakDark')
  const wandL = useMemo(() => tube([[-0.36, 0.34, 0.2], [-0.4, 0.32, 0.29], [-0.42, 0.22, 0.32], [-0.42, 0.12, 0.31]]), [])
  const wandR = useMemo(() => tube([[0.36, 0.34, 0.2], [0.4, 0.32, 0.29], [0.42, 0.22, 0.32], [0.42, 0.12, 0.31]]), [])
  return (
    <group {...props}>
      {[[-0.34, -0.2], [0.34, -0.2], [-0.34, 0.2], [0.34, 0.2]].map(([x, z], i) => (
        <mesh key={i} material={m.blackMetal} position={[x, 0.025, z]}>
          <cylinderGeometry args={[0.018, 0.018, 0.05, 12]} />
        </mesh>
      ))}
      <RoundedBox args={[0.76, 0.34, 0.5]} radius={0.025} smoothness={4} position={[0, 0.22, 0]} material={m.brushedSteel} castShadow receiveShadow />
      {[-0.39, 0.39].map((x) => (
        <RoundedBox key={x} args={[0.03, 0.34, 0.5]} radius={0.01} smoothness={2} position={[x, 0.22, 0]} material={oak} castShadow />
      ))}
      {/* top cup rail and warming cups */}
      <mesh material={m.steel} position={[0, 0.395, 0]}>
        <boxGeometry args={[0.7, 0.012, 0.44]} />
      </mesh>
      {[-0.22, -0.08, 0.06, 0.2].map((x) => (
        <group key={x} position={[x, 0.46, -0.05]} rotation={[Math.PI, 0, 0]}>
          <Cup size={1} saucer={false} surface="surfCrema" />
        </group>
      ))}
      {/* gauges */}
      {[-0.1, 0.1].map((x) => (
        <group key={x} position={[x, 0.33, 0.252]}>
          <mesh material={m.blackMetal} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.01, 32]} />
          </mesh>
          <mesh material={m.paper} position={[0, 0, 0.006]}>
            <circleGeometry args={[0.027, 32]} />
          </mesh>
          <mesh material={m.blackMetal} position={[0.006, 0.006, 0.008]} rotation={[0, 0, -0.8]}>
            <boxGeometry args={[0.002, 0.022, 0.001]} />
          </mesh>
        </group>
      ))}
      {/* group heads and portafilters */}
      {[-0.2, 0.2].map((x) => (
        <group key={x} position={[x, 0, 0.27]}>
          <mesh material={m.steel} position={[0, 0.215, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.055, 0.07, 32]} />
          </mesh>
          <mesh material={m.steel} position={[0, 0.165, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.035, 32]} />
          </mesh>
          <mesh material={m.steel} position={[0, 0.17, 0.08]} rotation={[Math.PI / 2 - 0.12, 0, 0]}>
            <cylinderGeometry args={[0.009, 0.009, 0.06, 10]} />
          </mesh>
          <mesh material={oak} position={[0, 0.162, 0.16]} rotation={[Math.PI / 2 - 0.12, 0, 0]} castShadow>
            <cylinderGeometry args={[0.014, 0.017, 0.11, 16]} />
          </mesh>
          <group position={[0, 0.088, -0.005]}>
            <Cup size={1} saucer={false} surface="surfCrema" />
          </group>
        </group>
      ))}
      {/* drip tray */}
      <mesh material={m.steel} position={[0, 0.07, 0.31]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.035, 0.16]} />
      </mesh>
      <mesh material={m.blackMetal} position={[0, 0.089, 0.31]}>
        <boxGeometry args={[0.66, 0.003, 0.13]} />
      </mesh>
      <mesh geometry={wandL} material={m.steel} castShadow />
      <mesh geometry={wandR} material={m.steel} castShadow />
      <mesh material={m.brass} position={[0, 0.12, 0.252]}>
        <boxGeometry args={[0.12, 0.03, 0.004]} />
      </mesh>
    </group>
  )
}

export function Grinder(props) {
  const m = getMaterials()
  return (
    <group {...props}>
      <RoundedBox args={[0.19, 0.36, 0.27]} radius={0.02} smoothness={3} position={[0, 0.18, 0]} material={m.ceramicCharcoal} castShadow receiveShadow />
      <mesh material={m.steel} position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.03, 32]} />
      </mesh>
      <mesh material={m.beans} position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.075, 0.042, 0.11, 32]} />
      </mesh>
      <mesh material={m.glass} position={[0, 0.48, 0]} renderOrder={2}>
        <cylinderGeometry args={[0.1, 0.048, 0.2, 32, 1, true]} />
      </mesh>
      <mesh material={m.blackMetal} position={[0, 0.585, 0]}>
        <cylinderGeometry args={[0.102, 0.102, 0.012, 32]} />
      </mesh>
      <mesh material={m.steel} position={[0, 0.2, 0.15]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.04, 0.05, 0.04]} />
      </mesh>
      <mesh material={m.steel} position={[0, 0.03, 0.12]} receiveShadow>
        <boxGeometry args={[0.17, 0.012, 0.1]} />
      </mesh>
    </group>
  )
}

function Kettle(props) {
  const m = getMaterials()
  const spout = useMemo(() => tube([[0.05, 0.03, 0], [0.11, 0.06, 0], [0.15, 0.13, 0], [0.19, 0.155, 0], [0.205, 0.15, 0]], 0.005), [])
  const handle = useMemo(() => tube([[-0.05, 0.12, 0], [-0.1, 0.12, 0], [-0.105, 0.06, 0], [-0.065, 0.03, 0]], 0.009), [])
  return (
    <group {...props}>
      <mesh material={m.ceramicCharcoal} position={[0, 0.065, 0]} castShadow>
        <cylinderGeometry args={[0.062, 0.07, 0.13, 32]} />
      </mesh>
      <mesh material={m.ceramicCharcoal} position={[0, 0.135, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.06, 0.02, 32]} />
      </mesh>
      <mesh material={oakFor('knob', [0.1, 0.1])} position={[0, 0.155, 0]}>
        <sphereGeometry args={[0.014, 16, 12]} />
      </mesh>
      <mesh geometry={spout} material={m.ceramicCharcoal} castShadow />
      <mesh geometry={handle} material={m.ceramicCharcoal} castShadow />
    </group>
  )
}

function PastryCase(props) {
  const m = getMaterials()
  const oak = oakFor('case', [0.5, 0.3])
  const W = 0.95
  const D = 0.48
  const H = 0.38
  return (
    <group {...props}>
      <mesh material={oak} position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, 0.04, D]} />
      </mesh>
      <mesh material={m.glass} position={[0, 0.04 + H / 2, 0]} renderOrder={3}>
        <boxGeometry args={[W - 0.01, H, D - 0.01]} />
      </mesh>
      <mesh material={oak} position={[0, 0.04 + H + 0.012, 0]} castShadow>
        <boxGeometry args={[W, 0.024, D]} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} material={oak} position={[(sx * (W - 0.02)) / 2, 0.04 + H / 2, (sz * (D - 0.02)) / 2]}>
          <boxGeometry args={[0.02, H, 0.02]} />
        </mesh>
      ))}
      <mesh material={m.glass} position={[0, 0.23, 0]}>
        <boxGeometry args={[W - 0.04, 0.008, D - 0.04]} />
      </mesh>
      {/* lower tier: cardamom knots and croissants */}
      <group position={[0, 0.04, 0]}>
        <group position={[-0.24, 0, 0.06]}>
          <Plate scale={1.4} />
          <CardamomKnot position={[-0.05, 0.008, 0.02]} rotation={[0, 0.4, 0]} />
          <CardamomKnot position={[0.06, 0.008, -0.01]} rotation={[0, 1.6, 0]} />
          <CardamomKnot position={[0.0, 0.008, -0.08]} rotation={[0, 2.5, 0]} />
        </group>
        <group position={[0.2, 0, 0.04]}>
          <Plate scale={1.4} />
          <Croissant position={[-0.04, 0.008, 0.02]} rotation={[0, 0.3, 0]} />
          <Croissant position={[0.05, 0.008, -0.05]} rotation={[0, -0.6, 0]} />
        </group>
      </group>
      {/* upper tier: cookies */}
      <group position={[0, 0.235, 0]}>
        {[-0.3, -0.18, -0.06, 0.06, 0.18, 0.3].map((x, i) => (
          <Cookie key={x} position={[x, 0.0055, (i % 2) * 0.05 - 0.02]} />
        ))}
      </group>
    </group>
  )
}

/* ---------------- The counter and the back bar ---------------- */
export function EspressoBar() {
  const m = getMaterials()
  const len = COUNTER.x1 - COUNTER.x0
  const cx = (COUNTER.x0 + COUNTER.x1) / 2
    const top = COUNTER.h
  const counterTop = oakFor('countertop', [3, 0.35])
  const cabinet = oakFor('cabinet', [2.6, 0.5])
  const shelf = oakFor('shelf', [1.4, 0.1])

  const bcLen = BACK_COUNTER.x1 - BACK_COUNTER.x0
  const bcx = (BACK_COUNTER.x0 + BACK_COUNTER.x1) / 2
  const wallZ = -ROOM.d / 2

  return (
    <group>
      {/* front counter */}
      <mesh material={m.void} position={[cx, 0.05, COUNTER.z - 0.02]}>
        <boxGeometry args={[len - 0.1, 0.1, COUNTER.depth - 0.12]} />
      </mesh>
      <mesh material={[m.concrete, m.concrete, m.concrete, m.concrete, m.tileYellow, m.concrete]} position={[cx, 0.54, COUNTER.z]} castShadow receiveShadow>
        <boxGeometry args={[len, 0.88, COUNTER.depth - 0.04]} />
      </mesh>
      <mesh material={counterTop} position={[cx, top - 0.02, COUNTER.z + 0.02]} castShadow receiveShadow>
        <boxGeometry args={[len + 0.08, 0.04, COUNTER.depth + 0.1]} />
      </mesh>

      <group position={[0, top, 0]}>
        <EspressoMachine position={[-2.35, 0, COUNTER.z - 0.06]} />
        <Grinder position={[-1.7, 0, COUNTER.z - 0.12]} />
        <CoffeeBag position={[-1.42, 0, COUNTER.z + 0.05]} rotation={[0, -0.25, 0]} />
        <CoffeeBag position={[-1.3, 0, COUNTER.z - 0.14]} rotation={[0, 0.15, 0]} />
        {/* pour-over station */}
        <group position={[-0.72, 0, COUNTER.z - 0.02]}>
          <mesh material={m.rubber} position={[0, 0.01, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.15, 0.02, 0.15]} />
          </mesh>
          <group position={[0, 0.02, 0]}>
            <HandPour />
          </group>
          <group position={[0.2, 0, -0.04]}>
            <HandPour />
          </group>
          <Kettle position={[-0.24, 0, -0.06]} rotation={[0, 0.5, 0]} />
        </group>
        <PastryCase position={[0.75, 0, COUNTER.z]} />
        <Ikebana position={[1.42, 0, COUNTER.z - 0.15]} />
        <group position={[-3.05, 0, COUNTER.z + 0.08]}>
          {[0, 1, 2].map((i) => (
            <group key={i} position={[0, i * 0.018, 0]}>
              <Plate />
            </group>
          ))}
        </group>
      </group>

      {/* back counter: oak cabinets with a concrete top */}
      <mesh material={cabinet} position={[bcx, 0.45, BACK_COUNTER.z]} castShadow receiveShadow>
        <boxGeometry args={[bcLen, 0.86, BACK_COUNTER.depth]} />
      </mesh>
      <mesh material={m.concrete} position={[bcx, BACK_COUNTER.h, BACK_COUNTER.z + 0.01]} castShadow receiveShadow>
        <boxGeometry args={[bcLen, 0.05, BACK_COUNTER.depth + 0.02]} />
      </mesh>
      <group position={[0, BACK_COUNTER.h + 0.025, BACK_COUNTER.z]}>
        {[-3.3, -3.1, -2.9].map((x, i) => (
          <group key={x} position={[x, 0, (i % 2) * 0.08]}>
            {[0, 1, 2, 3].map((k) => (
              <group key={k} position={[0, k * 0.047, 0]}>
                <Cup size={1.4} saucer={false} surface="surfLatte" />
              </group>
            ))}
          </group>
        ))}
        <Grinder position={[-0.3, 0, 0]} rotation={[0, Math.PI, 0]} />
      </group>

      {/* floating shelves */}
      {[1.62, 2.18].map((y, row) => (
        <group key={y} position={[-3.9, y, wallZ + 0.14]}>
          <mesh material={shelf} castShadow receiveShadow>
            <boxGeometry args={[3.4, 0.04, 0.26]} />
          </mesh>
          <group position={[0, 0.02, 0]}>
            {row === 0 ? (
              <>
                {[-1.4, -1.2, -1.0].map((x) => (
                  <group key={x} position={[x, 0, 0]}>
                    <Jar />
                  </group>
                ))}
                <CoffeeBag position={[-0.6, 0, 0]} />
                <CoffeeBag position={[-0.45, 0, 0.02]} rotation={[0, 0.2, 0]} />
                <group position={[0.2, 0, 0]}>
                  {[0, 1, 2, 3, 4].map((k) => (
                    <group key={k} position={[0, k * 0.015, 0]}>
                      <Plate scale={1.1} material={m.ceramicCharcoal} />
                    </group>
                  ))}
                </group>
                <Vase position={[1.0, 0, 0]} h={0.3} r={0.07} material={m.ceramicSand} />
                <Vase position={[1.3, 0, 0.02]} h={0.18} r={0.06} material={m.ceramicWhite} />
              </>
            ) : (
              <>
                <Vase position={[-1.3, 0, 0]} h={0.24} r={0.08} material={m.ceramicCharcoal} />
                {[-0.6, -0.48, -0.36, -0.24].map((x) => (
                  <group key={x} position={[x, 0, 0]}>
                    <Cup size={1.4} saucer={false} surface="surfLatte" material={m.ceramicSand} />
                  </group>
                ))}
                {[0.4, 0.58, 0.76].map((x) => (
                  <group key={x} position={[x, 0, 0]}>
                    <Jar tall />
                  </group>
                ))}
                <Vase position={[1.35, 0, 0]} h={0.36} r={0.05} material={m.ceramicWhite} />
              </>
            )}
          </group>
        </group>
      ))}

    </group>
  )
}

function Jar({ tall }) {
  const m = getMaterials()
  const h = tall ? 0.24 : 0.17
  return (
    <group>
      <mesh material={m.beans} position={[0, h * 0.35, 0]}>
        <cylinderGeometry args={[0.052, 0.052, h * 0.66, 24]} />
      </mesh>
      <mesh material={m.glass} position={[0, h / 2, 0]} renderOrder={2}>
        <cylinderGeometry args={[0.058, 0.058, h, 24]} />
      </mesh>
      <mesh material={oakFor('jarlid', [0.1, 0.1])} position={[0, h + 0.012, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.024, 24]} />
      </mesh>
    </group>
  )
}

function Vase({ h, r, material, position }) {
  const pts = useMemo(
    () =>
      [
        [0.0001, 0], [r * 0.7, 0], [r, h * 0.3], [r * 0.85, h * 0.75], [r * 0.45, h * 0.92], [r * 0.5, h], [r * 0.4, h], [0.0001, h * 0.9],
      ].map(([a, b]) => new THREE.Vector2(a, b)),
    [h, r]
  )
  return (
    <mesh position={position} material={material} castShadow receiveShadow>
      <latheGeometry args={[pts, 32]} />
    </mesh>
  )
}
