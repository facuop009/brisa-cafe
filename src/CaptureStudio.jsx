import * as THREE from 'three'
import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Scene } from './three/Scene'
import ProductStage from './three/ProductStage'
import { store } from './store'

// Dev tool: renders stills of the room for the page's pictures.
// /?capture=room&w=1920&h=1080  or  /?capture=stage&item=knot&w=1200&h=800
// Then in the console: __cam([x,y,z],[tx,ty,tz],fov); __time(7.3); await __save('name')

function Api() {
  const { camera, gl } = useThree()
  useEffect(() => {
    window.__cam = (pos, target, fov) => {
      camera.position.set(...pos)
      camera.lookAt(...target)
      if (fov) {
        camera.fov = fov
        camera.updateProjectionMatrix()
      }
    }
    window.__time = (t) => store.set({ time: t })
    window.__ready = true
  }, [camera, gl])
  return null
}

async function save(name, quality = 0.88) {
  const canvas = document.querySelector('canvas')
  const data = canvas.toDataURL('image/jpeg', quality)
  const res = await fetch(`/__save-render?name=${name}`, { method: 'POST', body: data })
  return res.json()
}

export default function CaptureStudio() {
  const q = new URLSearchParams(location.search)
  const mode = q.get('capture')
  const w = Number(q.get('w') || 1920)
  const h = Number(q.get('h') || 1080)
  useEffect(() => {
    window.__save = save
    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'
  }, [])
  return (
    <div style={{ width: w, height: h, position: 'absolute', left: 0, top: 0, background: mode === 'stage' ? '#F1ECE4' : '#000' }}>
      {mode === 'stage' ? (
        <ProductStage item={q.get('item') || 'knot'} spin={false} preserve background={q.get('bg') ? '#' + q.get('bg') : '#f4d3d0'} />
      ) : (
        <Canvas
          shadows
          dpr={1}
          camera={{ fov: 40, near: 0.03, far: 200, position: [3.6, 1.75, 4.05] }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          onCreated={({ gl, camera }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            camera.lookAt(-1.3, 1.05, -2.4)
          }}
        >
          <Scene shadowMapSize={4096} />
          <Api />
        </Canvas>
      )}
    </div>
  )
}
