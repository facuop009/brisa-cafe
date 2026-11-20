import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { LightformerEnvironment } from './helpers'
import gsap from 'gsap'
import { Drink, Board, CardamomKnot, CoffeeBag, HandPour, Plate, Croissant } from './Tableware'
import { getMaterials } from './materials'

const S = 5 // stage scale: real-world metres × 5

function Item({ item }) {
  if (item.startsWith('drink:')) {
    return (
      <Board w={0.24} d={0.15}>
        <Drink vessel={item.slice(6)} hq />
      </Board>
    )
  }
  if (item === 'bag')
    return (
      <group>
        <CoffeeBag rotation={[0, -0.35, 0]} position={[-0.03, 0, 0]} />
        <Board w={0.14} d={0.1} position={[0.11, 0, 0.05]}>
          <mesh position={[0, 0.006, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.012, 24]} />
            <meshStandardMaterial color="#4a2c19" roughness={0.6} />
          </mesh>
        </Board>
      </group>
    )
  if (item === 'knot')
    return (
      <group>
        <Plate scale={1.25} />
        <group position={[0, 0.008, 0]}>
          <CardamomKnot position={[-0.045, 0, 0.02]} rotation={[0, 0.4, 0]} />
          <CardamomKnot position={[0.05, 0, -0.01]} rotation={[0, 1.9, 0]} />
          <CardamomKnot position={[0.0, 0, -0.07]} rotation={[0, 2.8, 0]} />
        </group>
      </group>
    )
  if (item === 'set')
    return (
      <Board w={0.3} d={0.17}>
        <group position={[-0.06, 0, 0]}>
          <HandPour hq />
        </group>
        <group position={[0.085, 0, 0.02]}>
          <Plate scale={0.62} />
          <group position={[0, 0.006, 0]}>
            <CardamomKnot />
          </group>
        </group>
      </Board>
    )
  if (item === 'bouquet') return <Bouquet />
  if (item === 'croissant')
    return (
      <group>
        <Plate />
        <group position={[0, 0.006, 0]}>
          <Croissant />
        </group>
      </group>
    )
  return null
}

// A morning bunch wrapped in kraft paper, lying on the oak board.
const HEADS = Array.from({ length: 15 }, (_, i) => {
  const a = i * 2.4
  const r = 0.012 + (i % 5) * 0.009
  return { p: [Math.cos(a) * r, 0.02 + (i % 3) * 0.012, Math.sin(a) * r], s: 0.022 + (i % 4) * 0.004, c: i % 3 === 0 ? '#f4cc3a' : i % 3 === 1 ? '#f2a3b3' : '#d95a80' }
})
function Bouquet() {
  const m = getMaterials()
  return (
    <Board w={0.32} d={0.18}>
      <group rotation={[0, 0.5, 0]}>
        <group position={[-0.03, 0.045, 0]} rotation={[0, 0, Math.PI / 2 - 0.12]}>
          <mesh material={m.kraft} castShadow>
            <coneGeometry args={[0.07, 0.26, 24, 1, true]} />
          </mesh>
        </group>
        <group position={[0.09, 0.045, 0]} rotation={[0, 0, -Math.PI / 2 + 0.2]}>
          {HEADS.map((h, i) => (
            <mesh key={i} position={h.p} scale={[h.s, h.s * 0.75, h.s]} castShadow>
              <icosahedronGeometry args={[1, 1]} />
              <meshStandardMaterial color={h.c} roughness={0.6} />
            </mesh>
          ))}
        </group>
        {[-0.01, 0.0, 0.012].map((z, i) => (
          <mesh key={i} material={m.stem} position={[-0.17, 0.035, z]} rotation={[0, 0, Math.PI / 2 - 0.1]}>
            <cylinderGeometry args={[0.003, 0.003, 0.12, 5]} />
          </mesh>
        ))}
      </group>
    </Board>
  )
}

const FIT = new THREE.Box3()
const SIZE = new THREE.Vector3()
const CENTER = new THREE.Vector3()
const VIEW_DIR = new THREE.Vector3(0, 0.42, 1).normalize()

function Turntable({ item, spin }) {
  const group = useRef()
  const inner = useRef()
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  useEffect(() => {
    if (!inner.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Frame the item: fit its bounding sphere into the view, whatever the canvas shape.
    inner.current.updateWorldMatrix(true, true)
    FIT.setFromObject(inner.current)
    FIT.getSize(SIZE)
    FIT.getCenter(CENTER)
    const radius = SIZE.length() / 2
    const vfov = THREE.MathUtils.degToRad(camera.fov)
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * (size.width / size.height))
    const dist = (radius * 0.8) / Math.sin(Math.min(vfov, hfov) / 2)
    const to = CENTER.clone().add(VIEW_DIR.clone().multiplyScalar(dist))
    const look = CENTER.clone()
    if (reduced || !camera.userData.framed) {
      camera.position.copy(to)
      camera.lookAt(look)
      camera.userData.framed = true
    } else {
      const from = camera.userData.look || look.clone()
      const st = { t: 0 }
      const p0 = camera.position.clone()
      gsap.to(st, {
        t: 1,
        duration: 0.8,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.position.lerpVectors(p0, to, st.t)
          camera.lookAt(from.clone().lerp(look, st.t))
        },
      })
    }
    camera.userData.look = look
    if (reduced) return
    gsap.fromTo(inner.current.position, { y: -0.12 }, { y: 0, duration: 0.7, ease: 'power3.out' })
    gsap.fromTo(inner.current.scale, { x: 0.92, y: 0.92, z: 0.92 }, { x: 1, y: 1, z: 1, duration: 0.7, ease: 'power3.out' })
    gsap.fromTo(group.current.rotation, { y: group.current.rotation.y - 0.6 }, { y: group.current.rotation.y, duration: 0.9, ease: 'power3.out' })
  }, [item])
  useFrame((_, dt) => {
    if (spin && group.current) group.current.rotation.y += dt * 0.18
  })
  return (
    <group ref={group} rotation={[0, -0.5, 0]}>
      <group ref={inner}>
        <group scale={S}>
          <Item item={item} />
        </group>
      </group>
    </group>
  )
}

export default function ProductStage({ item, active = true, spin = true, preserve = false, camera, background }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      camera={camera || { fov: 26, position: [0, 0.62, 1.55], near: 0.05, far: 20 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: preserve }}
      onCreated={({ gl, camera: cam }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        if (background) gl.setClearColor(background, 1)
        else gl.setClearColor(0x000000, 0)
        cam.lookAt(0, 0.28, 0)
      }}
      aria-hidden="true"
    >
      <directionalLight
        position={[1.6, 2.4, 1.2]}
        intensity={2.6}
        color="#fff1de"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-1}
        shadow-camera-right={1}
        shadow-camera-top={1}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0005}
      />
      <ambientLight intensity={0.15} />
      <Turntable item={item} spin={spin} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <shadowMaterial transparent opacity={0.22} color="#5a2a33" />
      </mesh>
      <LightformerEnvironment
        intensity={0.9}
        cards={[
          { intensity: 2.4, color: '#fff4ea', position: [3, 2, 1], rotation: [0, -Math.PI / 2.5, 0], scale: [4, 3] },
          { intensity: 1.2, color: '#ffffff', position: [0, 4, 0], rotation: [Math.PI / 2, 0, 0], scale: [5, 5] },
          { intensity: 0.8, color: '#f6dcdc', position: [-3, 1, 2], rotation: [0, Math.PI / 3, 0], scale: [4, 2] },
          { intensity: 0.5, color: '#f3d48a', position: [0, 1, -4], rotation: [0, 0, 0], scale: [6, 3] },
        ]}
      />
    </Canvas>
  )
}
