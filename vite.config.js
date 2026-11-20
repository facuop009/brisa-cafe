import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// Dev-only endpoint used by the capture studio (?capture) to save stills of the
// 3D room into public/renders. It never ships in the production build.
function saveRenders() {
  return {
    name: 'asa-save-renders',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__save-render', (req, res) => {
        if (req.method !== 'POST') return res.end()
        const name = new URL(req.url, 'http://x').searchParams.get('name') || 'shot'
        if (!/^[a-z0-9-]+$/.test(name)) { res.statusCode = 400; return res.end('bad name') }
        let body = ''
        req.on('data', (c) => (body += c))
        req.on('end', () => {
          const b64 = body.replace(/^data:image\/\w+;base64,/, '')
          const out = path.resolve('public/renders', `${name}.jpg`)
          fs.mkdirSync(path.dirname(out), { recursive: true })
          fs.writeFileSync(out, Buffer.from(b64, 'base64'))
          res.end(JSON.stringify({ ok: true, out }))
        })
      })
    },
  }
}

export default defineConfig({
  // Relative URLs so the build works at a domain root and in a GitHub Pages subfolder.
  base: './',
  plugins: [react(), saveRenders()],
  server: {
    watch: { ignored: ["**/public/renders/**", "**/.taste-skill/**"] },
  },
  optimizeDeps: {
    include: ['three', 'three/examples/jsm/controls/OrbitControls.js', 'three/examples/jsm/geometries/RoundedBoxGeometry.js', 'react', 'react-dom/client', '@react-three/fiber', 'gsap', 'gsap/ScrollTrigger', 'framer-motion', 'lenis'],
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: {
        main: path.resolve('index.html'),
        juego: path.resolve('juego.html'),
      },
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber'],
        },
      },
    },
  },
})
