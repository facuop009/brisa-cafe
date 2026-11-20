import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// One Lenis instance for the page, driven by GSAP's ticker so ScrollTrigger stays in sync.
let lenis = null

export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.9 })
  window.__lenis = lenis
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function getLenis() {
  return lenis
}

export function scrollToId(id, opts = {}) {
  const el = id === 'top' ? 0 : document.getElementById(id)
  if (el === null) return
  if (lenis) lenis.scrollTo(el, { offset: id === 'top' ? 0 : -60, duration: 1.6, ...opts })
  else if (el === 0) window.scrollTo({ top: 0, behavior: 'smooth' })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export function lockScroll(locked) {
  if (lenis) locked ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
