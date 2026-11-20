import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FLOORS, HOUSE_FACTS } from '../content'
import { cphNow, formatClock } from '../lib/time'
import { Reveal } from '../components/Reveal'
import { ROOM, SLAB, LEVEL, WINDOW, STAIR } from '../three/layout'

const HOUSE_IMAGES = [
  { src: 'renders/house-morning.jpg', alt: 'The house in morning light, all three floors seen through the glass front' },
  { src: 'renders/house-noon.jpg', alt: 'The house at noon, short shadows under the slatted windows' },
  { src: 'renders/house-dusk.jpg', alt: 'The house at dusk, paper lamps lit on every floor' },
]

/* Section drawing of the house, from the same plan as the 3D model. */
function SectionDrawing() {
  const s = 9 // px per metre
  const W = (ROOM.w + 2 * ROOM.t) * s
  const H = 3 * LEVEL * s
  const pad = 10
  const y = (m) => pad + H - m * s
  const x = (m) => pad + (m + ROOM.w / 2 + ROOM.t) * s
  const slabs = [0, 1, 2, 3].map((k) => k * LEVEL)
  const run = STAIR.zLow - STAIR.zHigh
  return (
    <svg viewBox={`0 0 ${W + pad * 2} ${H + pad * 2 + 6}`} role="img" aria-labelledby="sec-title">
      <title id="sec-title">Sección de la casa: café en la planta baja, salón en la primera, florista en la segunda, con la escalera de roble subiendo por la pared izquierda.</title>
      {/* walls */}
      <rect x={x(-ROOM.w / 2 - ROOM.t)} y={y(3 * LEVEL)} width={ROOM.t * s} height={H} fill="var(--ink)" />
      {[0, 1, 2].map((f) => (
        <g key={f}>
          <rect x={x(ROOM.w / 2)} y={y(f * LEVEL + ROOM.h)} width={ROOM.t * s} height={(ROOM.h - WINDOW.y1) * s} fill="var(--ink)" />
          <rect x={x(ROOM.w / 2)} y={y(f * LEVEL + WINDOW.y0)} width={ROOM.t * s} height={WINDOW.y0 * s} fill="var(--ink)" />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={x(ROOM.w / 2) + 1} y={y(f * LEVEL + WINDOW.y1) + i * ((WINDOW.y1 - WINDOW.y0) * s / 9) + 2} width={ROOM.t * s - 2} height={1.6} fill="var(--ink)" opacity="0.55" />
          ))}
        </g>
      ))}
      {/* slabs */}
      {slabs.map((m, k) => (
        <rect key={k} x={x(-ROOM.w / 2 - ROOM.t)} y={y(m)} width={W} height={SLAB * s} fill="var(--ink)" />
      ))}
      {/* stair flights drawn as filled bands */}
      {[0, 1].map((f) => {
        const x0 = x(-ROOM.w / 2) + (f === 0 ? 0 : 1.2 * s)
        const len = run * s * 0.55
        return (
          <polygon
            key={f}
            points={`${x0},${y(f * LEVEL)} ${x0 + len},${y((f + 1) * LEVEL)} ${x0 + len + 5},${y((f + 1) * LEVEL)} ${x0 + 5},${y(f * LEVEL)}`}
            fill="var(--ink)"
            opacity="0.75"
          />
        )
      })}
      {/* tables and the stand, as simple marks */}
      <rect x={x(-3.4)} y={y(1.02)} width={5 * s} height={1.02 * s} fill="var(--ink)" opacity="0.35" />
      <rect x={x(3.5)} y={y(LEVEL + 0.75)} width={0.9 * s} height={0.75 * s} fill="var(--ink)" opacity="0.35" />
      <rect x={x(-3.4)} y={y(2 * LEVEL + 0.96)} width={7 * s} height={0.96 * s} fill="var(--ink)" opacity="0.35" />
      <circle cx={x(0.6)} cy={y(2 * LEVEL + 2.1)} r="6" fill="var(--accent)" />
      <rect x={pad - 6} y={y(0) + SLAB * s} width={W + 12} height={4} fill="var(--ink)" />
    </svg>
  )
}

function Clock() {
  const [now, setNow] = useState(() => cphNow())
  useEffect(() => {
    const t = setInterval(() => setNow(cphNow()), 15000)
    return () => clearInterval(t)
  }, [])
  return <time>{formatClock(now.decimal)} en Copenhague</time>
}

function Crossfade() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    let t
    const tick = () => {
      t = setTimeout(() => {
        if (!document.hidden) setI((v) => (v + 1) % HOUSE_IMAGES.length)
        tick()
      }, 5600)
    }
    tick()
    return () => clearTimeout(t)
  }, [reduce])
  return (
    <AnimatePresence initial={false}>
      <motion.img
        key={i}
        src={HOUSE_IMAGES[i].src}
        alt={HOUSE_IMAGES[i].alt}
        width="1600"
        height="1000"
        loading="lazy"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ opacity: { duration: 1.6, ease: 'easeInOut' }, scale: { duration: 7, ease: 'linear' } }}
      />
    </AnimatePresence>
  )
}

export function House() {
  return (
    <section className="room" id="house" aria-labelledby="house-title">
      <div className="grid">
        <Reveal as="h2" className="head room__head" id="house-title">
          Tres plantas en Jægersborggade
        </Reveal>
        <Reveal as="p" i={1} className="lead room__lead">
          Una barra de café en la planta baja, un salón tranquilo encima y una florista bajo el tejado. Cada planta tiene el mismo muro de 7,8 m de lamas de roble, para que el sol de la mañana dibuje en las tres.
        </Reveal>

        <div className="room__photo">
          <div className="room__photo-inner">
            <Crossfade />
          </div>
          <p className="room__note">Hormigón de cal rosa, azulejo esmaltado amarillo y roble blanco. La escalera también es de roble, y las flores llegan a las seis.</p>
        </div>

        <div className="room__side">
          <Reveal as="figure" className="plan">
            <SectionDrawing />
            <figcaption>Sección de la casa. El punto marca la florista.</figcaption>
          </Reveal>
          <dl className="facts">
            {HOUSE_FACTS.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value === 'live' ? <Clock /> : f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <ol className="floors">
          {FLOORS.map((f, i) => (
            <Reveal as="li" key={f.id} i={i}>
              <h3 className="floors__name">{f.name}</h3>
              <p>{f.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
