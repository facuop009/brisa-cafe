// Offline support for the game: hashed build assets are cached forever, the page itself network-first.
// Paths are relative to wherever the game is hosted (site root or a GitHub Pages subfolder).
const CACHE = 'asa-cafe-juego-v2'
const BASE = self.location.pathname.replace(/[^/]*$/, '')
const PAGE = `${BASE}juego.html`

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([PAGE, `${BASE}juego.webmanifest`, `${BASE}game-icons/icon-192.png`])))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))))
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET' || url.origin !== location.origin) return
  if (url.pathname.startsWith(`${BASE}assets/`)) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) =>
          hit ||
          fetch(e.request).then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(CACHE).then((c) => c.put(e.request, copy))
            }
            return res
          }),
      ),
    )
    return
  }
  if (url.pathname === PAGE) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(PAGE, copy))
          return res
        })
        .catch(() => caches.match(PAGE)),
    )
  }
})
