import { useRef, useState } from 'react'
import { INGREDIENTS, MAX_PICKUP, RECIPES, VESSELS, addIngredient, chooseVessel, drinkFrom, emptyCup, serveDrink, setPanel, unlocked, useGame } from '../engine'
import { Icon } from './Icon'

const LAYER = { espresso: '#3a2114', leche: '#efe7da', espuma: '#fbf7ef', agua: '#cfe7f1', matcha: '#93ad55', hielo: '#e6f6fd' }
const SHAPES = {
  chica: { d: 'M28 68 H92 V96 Q92 122 66 122 H54 Q28 122 28 96 Z', top: 70, bottom: 122, handle: 'M92 76 h6 a10 10 0 0 1 0 20 h-6', saucer: true },
  grande: { d: 'M24 38 H96 V92 Q96 124 68 124 H52 Q24 124 24 92 Z', top: 40, bottom: 124, handle: 'M96 50 h7 a13 13 0 0 1 0 26 h-7', saucer: true },
  vaso: { d: 'M30 14 H90 L84 126 H36 Z', top: 16, bottom: 126 },
}

function CupArt({ vessel, items, pulling }) {
  if (!vessel) {
    return (
      <svg viewBox="0 0 120 140" className="cupart">
        <path d={SHAPES.grande.d} fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" opacity="0.45" />
        <text x="60" y="88" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7">
          Elegí una taza
        </text>
      </svg>
    )
  }
  const s = SHAPES[vessel]
  const per = (s.bottom - s.top) / 4
  const layers = items.filter((i) => i !== 'hielo')
  const level = s.bottom - layers.length * per
  const id = `clip-${vessel}`
  return (
    <svg viewBox="0 0 120 140" className="cupart">
      <defs>
        <clipPath id={id}>
          <path d={s.d} />
        </clipPath>
      </defs>
      {s.saucer && <ellipse cx="60" cy={s.bottom + 6} rx="46" ry="7" fill="#f4efe6" stroke="#3a2a20" strokeWidth="2" />}
      <path d={s.d} fill={vessel === 'vaso' ? 'rgba(230,244,250,0.55)' : '#fbf8f2'} />
      <g clipPath={`url(#${id})`}>
        {layers.map((ing, i) => (
          <rect key={i} className="cupart__layer" x="0" width="120" y={s.bottom - (i + 1) * per} height={per + 1} fill={LAYER[ing]} />
        ))}
        {layers.at(-1) === 'espuma' &&
          [30, 44, 58, 72, 86].map((x, i) => <circle key={x} cx={x} cy={level + 2} r={6 + (i % 2) * 2} fill="#fffdf8" />)}
        {items.includes('hielo') &&
          [
            [44, 0.35],
            [64, 0.55],
            [52, 0.75],
          ].map(([x, f], i) => (
            <rect key={i} x={x} y={s.top + (s.bottom - s.top) * f - 8} width="16" height="16" rx="3" fill="rgba(255,255,255,0.8)" stroke="#9ccbe0" strokeWidth="1.5" transform={`rotate(${i * 17 - 10} ${x + 8} ${s.top + (s.bottom - s.top) * f})`} />
          ))}
        {pulling && <rect className="cupart__stream" x="57" y="0" width="6" height={level} fill={LAYER[pulling.ing]} />}
      </g>
      <path d={s.d} fill="none" stroke={vessel === 'vaso' ? '#4b7f95' : '#3a2a20'} strokeWidth="2.5" strokeLinejoin="round" />
      {s.handle && <path d={s.handle} fill="none" stroke="#3a2a20" strokeWidth="2.5" />}
      {pulling && (
        <circle
          cx="60"
          cy="70"
          r="64"
          fill="none"
          stroke="#f2c53d"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${(pulling.t / pulling.dur) * 402} 402`}
          transform="rotate(-90 60 70)"
        />
      )}
    </svg>
  )
}

function RecipeHint({ k, vessel, items }) {
  const r = RECIPES[k]
  const has = (i) => items.includes(i)
  return (
    <div className="hint">
      <b>{r.name}</b>
      {r.pastry ? (
        <span className="hint__note">Se agarra de la vitrina, a la derecha de la barra.</span>
      ) : (
        <span className="hint__row">
          <span className={`hint__chip${vessel === r.vessel ? ' is-ok' : ''}`}>
            <Icon name={r.vessel} size={20} /> {VESSELS[r.vessel].name}
          </span>
          {r.items.map((i) => (
            <span key={i} className={`hint__chip${has(i) ? ' is-ok' : ''}`}>
              <Icon name={i} size={20} /> {INGREDIENTS[i].name}
            </span>
          ))}
        </span>
      )}
    </div>
  )
}

export function PrepPanel() {
  const g = useGame()
  const p = g.prep
  const cupRef = useRef()
  const ghostRef = useRef()
  const drag = useRef(null)
  const [dragging, setDragging] = useState(null)
  const [hint, setHint] = useState(null)
  const orders = g.customers.filter((c) => c.state === 'waiting')
  const current = p.vessel && p.items.length ? drinkFrom(p.vessel, p.items) : null

  const overCup = (x, y) => {
    const r = cupRef.current.getBoundingClientRect()
    const pad = 24
    return x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad
  }
  const moveGhost = (x, y) => {
    ghostRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -60%)`
    cupRef.current.classList.toggle('is-over', overCup(x, y))
  }

  const tile = (id, ing) => {
    const left = ing.stock ? g.stock[ing.stock] : null
    const empty = left !== null && left <= 0
    return (
      <button
        key={id}
        type="button"
        className={`ing${empty ? ' is-empty' : ''}`}
        onPointerDown={(e) => {
          if (empty) return
          e.currentTarget.setPointerCapture(e.pointerId)
          drag.current = { id, x: e.clientX, y: e.clientY, moved: false }
          setDragging(id)
          requestAnimationFrame(() => ghostRef.current && moveGhost(e.clientX, e.clientY))
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d) return
          if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) d.moved = true
          moveGhost(e.clientX, e.clientY)
        }}
        onPointerUp={(e) => {
          const d = drag.current
          drag.current = null
          setDragging(null)
          cupRef.current.classList.remove('is-over')
          if (d && (!d.moved || overCup(e.clientX, e.clientY))) addIngredient(d.id)
        }}
        onPointerCancel={() => {
          drag.current = null
          setDragging(null)
          cupRef.current.classList.remove('is-over')
        }}
      >
        <Icon name={id} size={34} />
        <span className="ing__name">{ing.name}</span>
        <span className="ing__left">{left === null ? '∞' : left}</span>
      </button>
    )
  }

  return (
    <aside className="sheet sheet--prep" role="dialog" aria-label="Barra de preparación">
      <header className="sheet__head">
        <h2>Barra</h2>
        <button type="button" className="icon-btn" onClick={() => setPanel('prep')} aria-label="Cerrar">
          <Icon name="close" size={22} />
        </button>
      </header>

      <div className="sheet__body">
        {orders.length > 0 && (
          <div className="prep__orders">
            {orders.map((c) => (
              <button key={c.id} type="button" className={`chip${hint === c.order ? ' is-on' : ''}`} onClick={() => setHint(hint === c.order ? null : c.order)}>
                <i className="ticket__who" style={{ background: c.look.shirt }} />
                {RECIPES[c.order].name}
              </button>
            ))}
          </div>
        )}
        {hint && <RecipeHint k={hint} vessel={p.vessel} items={p.items} />}

        <div className="prep__stage">
          <div ref={cupRef} className="prep__cup">
            <CupArt vessel={p.vessel} items={p.items} pulling={p.pulling} />
          </div>
          <div className="prep__status">
            {p.pulling ? (
              <b>{p.pulling.ing === 'espresso' ? 'Extrayendo espresso…' : 'Espumando leche…'}</b>
            ) : current ? (
              <b className={current.recipe ? 'is-ok' : 'is-bad'}>{current.label}</b>
            ) : (
              <span>{p.vessel ? 'Arrastrá ingredientes a la taza' : 'Elegí una taza para empezar'}</span>
            )}
          </div>
        </div>

        <h3 className="sheet__h">1 · Taza</h3>
        <div className="vessels">
          {unlocked(VESSELS).map(([id, v]) => (
            <button key={id} type="button" className={`vessel${p.vessel === id ? ' is-on' : ''}`} onClick={() => chooseVessel(id)} disabled={!!p.vessel && p.vessel !== id}>
              <Icon name={id} size={34} />
              <span>{v.name}</span>
              <small>{g.stock[v.stock]}</small>
            </button>
          ))}
        </div>

        <h3 className="sheet__h">2 · Ingredientes <small>arrastralos o tocalos</small></h3>
        <div className="ings">{unlocked(INGREDIENTS).map(([id, ing]) => tile(id, ing))}</div>
      </div>

      <footer className="sheet__foot">
        <button type="button" className="btn btn--ghost" onClick={emptyCup} disabled={!p.vessel}>
          <Icon name="trash" size={20} /> Vaciar
        </button>
        <button type="button" className="btn btn--primary" onClick={serveDrink} disabled={!p.vessel || !p.items.length || !!p.pulling}>
          Servir <small>{g.pickup.length}/{MAX_PICKUP} en el mostrador</small>
        </button>
      </footer>

      <div ref={ghostRef} className={`ghost${dragging ? ' is-on' : ''}`} aria-hidden="true">
        {dragging && <Icon name={dragging} size={48} />}
      </div>
    </aside>
  )
}
