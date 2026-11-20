import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MENU } from '../content'
import { useInView } from '../lib/useInView'
import { Reveal } from '../components/Reveal'
import { hasWebGL } from './Hero'

const ProductStage = lazy(() => import('../three/ProductStage'))

/* The whole drinks menu. The cup on the left is live 3D and follows the active row. */
export function Menu() {
  const [active, setActive] = useState(0)
  const stageRef = useRef(null)
  const listRef = useRef(null)
  const near = useInView(stageRef, { rootMargin: '600px' })
  const visible = useInView(stageRef, { rootMargin: '100px', once: false })
  const [webgl] = useState(hasWebGL)
  const item = MENU[active]

  // Scrolling a row to the middle of the screen makes it active.
  useEffect(() => {
    const rows = listRef.current.querySelectorAll('.row')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.i))),
      { rootMargin: '-45% 0px -45% 0px' }
    )
    rows.forEach((r) => io.observe(r))
    return () => io.disconnect()
  }, [])

  return (
    <section className="menu" id="menu" aria-labelledby="menu-title">
      <div className="grid">
        <div className="menu__stage" ref={stageRef}>
          <div className="stage">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={item.id}
                className="stage__poster"
                src={`renders/menu-${item.id}.jpg`}
                alt={`${item.name}, served on an oak board`}
                width="1200"
                height="1500"
                loading="lazy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
            {webgl && near && (
              <Suspense fallback={null}>
                <ProductStage item={`drink:${item.vessel}`} active={visible} />
              </Suspense>
            )}
          </div>
          <p className="stage__caption">
            <strong>{item.name}</strong>
            <span>{item.price}</span>
          </p>
        </div>

        <div className="menu__list">
          <Reveal as="h2" className="head" id="menu-title">
            El menú
          </Reveal>
          <Reveal as="p" i={1} className="menu__intro">
            Espresso y pour manual desde la barra de la planta baja, servido abajo o subido al salón.
          </Reveal>
          <ul ref={listRef}>
            {MENU.map((m, i) => (
              <li key={m.id}>
                <button
                  type="button"
                  className={`row${i === active ? ' is-active' : ''}`}
                  data-i={i}
                  aria-expanded={i === active}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <span className="row__head">
                    <span className="row__name">{m.name}</span>
                    <span className="row__price">{m.price}</span>
                  </span>
                  <AnimatePresence initial={false}>
                    {i === active && (
                      <motion.span
                        className="row__note"
                        style={{ display: 'block' }}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <span style={{ display: 'block' }} className="row__text">
                          {m.note}
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </li>
            ))}
          </ul>
          <Reveal as="p" className="menu__foot">
            Leche de avena, entera o sin lactosa sin coste adicional. La bollería se hornea aquí desde las 06:00 y se vende hasta agotarse.
          </Reveal>
        </div>
      </div>
    </section>
  )
}
