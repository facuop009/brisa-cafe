import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { store, useStore } from '../store'
import { STATIONS } from '../three/stations'
import { SITE, NAV } from '../content'
import { LIGHT_MIN, LIGHT_MAX, formatClock, describeLight } from '../lib/time'
import { scrollToId, lockScroll, getLenis } from '../lib/scroll'

const Experience = lazy(() => import('../three/Experience'))

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/* The live thing: drag the sun through the slatted windows of all three floors. */
function LightControl() {
  const time = useStore((s) => s.time)
  return (
    <div className="light">
      <div className="light__top">
        <label className="light__label" htmlFor="light">
          Luz en la casa
        </label>
        <output className="light__time" htmlFor="light">
          {formatClock(time)}
        </output>
      </div>
      <input
        id="light"
        className="range"
        type="range"
        min={LIGHT_MIN}
        max={LIGHT_MAX}
        step={1 / 12}
        value={time}
        aria-valuetext={`${formatClock(time)}, ${describeLight(time)}`}
        onChange={(e) => store.set({ time: Number(e.target.value) })}
      />
      <p className="light__desc">{describeLight(time)}</p>
    </div>
  )
}

function Stations({ onExplore }) {
  const station = useStore((s) => s.station)
  const introDone = useStore((s) => s.introDone)
  return (
    <div className="stations" role="group" aria-label="Mover la cámara">
      {Object.entries(STATIONS).map(([id, s]) => (
        <button key={id} type="button" className="chip" aria-pressed={station === id} disabled={!introDone} onClick={() => store.set({ station: id })}>
          {s.short}
        </button>
      ))}
      <button type="button" className="chip chip--explore" onClick={onExplore}>
        Explorar en 3D
      </button>
      <a className="chip chip--play" href="juego.html">
        Jugar
      </a>
    </div>
  )
}

function ExploreOverlay({ onExit }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onExit()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit])
  return (
    <motion.div className="explore-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="explore-ui__top">
        <button type="button" className="btn btn--paper" onClick={onExit} autoFocus>
          Volver a la página
        </button>
      </div>
    </motion.div>
  )
}

/* A quiet progress line while the house is built in WebGL; the page stays readable. */
function Building({ webgl }) {
  const ready = useStore((s) => s.sceneReady)
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 9000)
    return () => clearTimeout(t)
  }, [])
  const show = webgl && !ready && !slow
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="building" role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <span>Construyendo la casa en 3D</span>
          <span className="building__bar" aria-hidden="true">
            <motion.i initial={{ scaleX: 0.08 }} animate={{ scaleX: 0.85 }} transition={{ duration: 6, ease: [0.1, 0.6, 0.3, 1] }} />
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Hero() {
  const ref = useRef(null)
  const [webgl] = useState(hasWebGL)
  const [mount, setMount] = useState(false)
  const explore = useStore((s) => s.explore)
  const visible = useStore((s) => s.heroVisible)
  const ready = useStore((s) => s.sceneReady)
  const station = useStore((s) => s.station)

  // Inside a floor the title steps aside so the room can be seen; the header turns solid.
  useEffect(() => {
    document.documentElement.dataset.station = station
  }, [station])

  useEffect(() => {
    // Build the scene once the fonts are in, so textures that print words use the right faces.
    let done = false
    const go = () => !done && ((done = true), setMount(true))
    document.fonts?.ready.then(go)
    const t = setTimeout(go, 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => store.set({ heroVisible: e.isIntersecting }), { rootMargin: '100px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  const enter = () => {
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
    lockScroll(true)
    document.documentElement.classList.add('is-exploring')
    store.set({ explore: true })
  }
  const exit = () => {
    lockScroll(false)
    document.documentElement.classList.remove('is-exploring')
    store.set({ explore: false })
  }

  return (
    <section className="hero" id="top" ref={ref} aria-labelledby="hero-title">
      <div className="hero__poster">
        <img src="renders/hero-poster.jpg" alt="Cutaway of the three-floor house: café on the ground floor, lounge above, florist at the top" width="1920" height="1080" fetchPriority="high" />
      </div>
      {webgl && mount && (
        <div className={`hero__canvas${ready ? ' is-ready' : ''}`}>
          <Suspense fallback={null}>
            <Experience active={visible || explore} />
          </Suspense>
        </div>
      )}
      <h1 className="sr-only" id="hero-title">
        ASA coffee &amp; flowers
      </h1>
      <Building webgl={webgl} />
      <div className="scrim-corner" aria-hidden="true" />
      <div className="hero__controls">
        {webgl ? <LightControl /> : <p className="light__desc">Abrí esta página en un navegador con WebGL para recorrer la casa.</p>}
        {webgl && <Stations onExplore={enter} />}
      </div>
      <AnimatePresence>{explore && <ExploreOverlay onExit={exit} />}</AnimatePresence>
    </section>
  )
}

/* The header bar: transparent over the house, solid once the page moves on. */
export function Rail() {
  const [docked, setDocked] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setDocked(window.scrollY > window.innerHeight * 0.85)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (open) lockScroll(true)
    return () => open && lockScroll(false)
  }, [open])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    scrollToId(id)
  }

  return (
    <>
      <header className={`rail${docked ? ' is-docked' : ''}`}>
        <a className="display rail__mark" href="#top" onClick={go('top')} aria-label="ASA, volver al inicio">
          ASA
        </a>
        <nav className="rail__nav" aria-label="Principal">
          <a className="link" href="#menu" onClick={go('menu')}>
            Menú
          </a>
          <a className="link" href="#house" onClick={go('house')}>
            La casa
          </a>
          <a className="link" href="#flowers" onClick={go('flowers')}>
            Flores
          </a>
          <a className="link" href="#visit" onClick={go('visit')}>
            Visita
          </a>
          <a className="btn btn--rail" href={SITE.maps} target="_blank" rel="noreferrer">
            Cómo llegar
          </a>
        </nav>
        <button type="button" className="rail__menu" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(true)}>
          Menú
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Principal"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="mobile-nav__top">
              <span className="display" style={{ fontSize: '1.75rem' }}>
                ASA
              </span>
              <button type="button" className="btn btn--paper" onClick={() => setOpen(false)} autoFocus>
                Cerrar
              </button>
            </div>
            <ul>
              {NAV.map((n, i) => (
                <motion.li key={n.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                  <a href={`#${n.id}`} onClick={go(n.id)}>
                    {n.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mobile-nav__foot">
              <p>
                {SITE.address[0]}, {SITE.address[1]}
              </p>
              <a className="btn btn--accent" href={SITE.maps} target="_blank" rel="noreferrer">
                Cómo llegar
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
