import * as THREE from 'three'
import { useMemo } from 'react'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import fontJson from 'three/examples/fonts/helvetiker_bold.typeface.json'
import { getMaterials } from './materials'
import { ROOM, LEVEL } from './layout'

const font = new FontLoader().parse(fontJson)

function useText(text, size, depth) {
  return useMemo(() => {
    const g = new TextGeometry(text, { font, size, depth, curveSegments: 6, bevelEnabled: false })
    g.computeBoundingBox()
    const b = g.boundingBox
    g.translate(-(b.max.x + b.min.x) / 2, -b.min.y, -depth / 2)
    return [g, b.max.x - b.min.x]
  }, [text, size, depth])
}

const letterMat = new THREE.MeshPhysicalMaterial({ color: '#24201d', roughness: 0.4, clearcoat: 0.6 })

export function RoofSign() {
  const m = getMaterials()
  const [top, topW] = useText('brisa amor de mi vida', 0.7, 0.16)
  const [bottom] = useText('coffe', 0.45, 0.16)

  const base = 3 * LEVEL
  const z = ROOM.d / 2 - 0.4
  const lift = 0.9
  const railW = topW + 0.4
  const posts = [-railW / 2 + 0.4, -railW / 4, 0, railW / 4, railW / 2 - 0.4]

  return (
    <group position={[0, base, z]}>
      {posts.map((x) => (
        <mesh key={x} material={m.blackMetal} position={[x, lift / 2, -0.12]} castShadow>
          <boxGeometry args={[0.06, lift, 0.06]} />
        </mesh>
      ))}
      <mesh material={m.blackMetal} position={[0, lift, -0.12]} castShadow>
        <boxGeometry args={[railW, 0.05, 0.08]} />
      </mesh>
      <mesh geometry={top} material={letterMat} position={[0, lift + 0.65, 0]} castShadow />
      <mesh geometry={bottom} material={letterMat} position={[0, lift + 0.05, 0]} castShadow />
    </group>
  )
}
