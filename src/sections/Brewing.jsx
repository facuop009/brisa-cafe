import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { BREWING } from '../content'
import { Reveal } from '../components/Reveal'

/* From cherry to cup: a row of moments you can drag, swipe or step through. */
export function Brewing() {
  const row = useRef(null)
  const progress = useMotionValue(0)
  const scaleX = useSpring(progress, { stiffness: 200, damping: 30 })
  const [edges, setEdges] = useState({ start: true, end: false })

  useEffect(() => {
    const el = row.current
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      const p = max > 0 ? el.scrollLeft / max : 0
      progress.set(0.12 + p * 0.88)
      setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft > max - 4 })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    // mouse drag to scroll
    let down = false
    let x0 = 0
    let s0 = 0
    let moved = false
    const onDown = (e) => {
      if (e.pointerType !== 'mouse') return
      down = true
      moved = false
      x0 = e.clientX
      s0 = el.scrollLeft
    }
    const onMove = (e) => {
      if (!down) return
      const dx = e.clientX - x0
      if (Math.abs(dx) > 4 && !moved) {
        moved = true
        el.classList.add('is-dragging')
      }
      if (moved) el.scrollLeft = s0 - dx
    }
    const onUp = () => {
      if (!down) return
      down = false
      el.classList.remove('is-dragging')
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [progress])

  const step = (dir) => row.current.scrollBy({ left: dir * 312, behavior: 'smooth' })

  return (
    <section className="brew" id="brewing" aria-labelledby="brew-title">
      <div className="brew__top">
        <div>
          <Reveal as="h2" className="head" id="brew-title">
            De la cereza a la taza
          </Reveal>
          <Reveal as="p" i={1}>
            Cada pour manual en ASA lleva unos cuatro minutos. Esto es lo que ocurre antes y durante.
          </Reveal>
        </div>
        <div className="brew__buttons">
          <button type="button" className="square" aria-label="Momento anterior" disabled={edges.start} onClick={() => step(-1)}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M11 3 5 9l6 6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
          </button>
          <button type="button" className="square" aria-label="Momento siguiente" disabled={edges.end} onClick={() => step(1)}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="m7 3 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
          </button>
        </div>
      </div>
      <div className="progress" aria-hidden="true">
        <motion.span style={{ scaleX }} />
      </div>
      <ol className="brew__row" ref={row} tabIndex={0} aria-label="Momentos de elaborar un café" data-lenis-prevent-touch>
        {BREWING.map((b, i) => (
          <Reveal as="li" className="moment" key={b.caption} i={i}>
            <h3>{b.caption}</h3>
            <p>{b.text}</p>
            <span className="moment__gap" style={{ display: 'block', height: b.gap, flex: '0 0 auto' }} />
            <div className="moment__img">
              <img src={b.image} alt={b.alt} width={b.w} height={b.h} loading="lazy" draggable="false" />
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
