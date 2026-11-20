import { RECIPES, clockLabel, discardHand, interact, lowStock, pause, peso, setPanel, tapCustomer, useGame } from '../engine'
import { Icon } from './Icon'

function Stars({ value }) {
  return (
    <span className="stars" aria-label={`${value.toFixed(1)} de 5 estrellas`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="stars__one">
          <Icon name="star" size={14} />
          <span className="stars__fill" style={{ width: `${Math.max(0, Math.min(1, value - i)) * 100}%` }}>
            <Icon name="star" size={14} />
          </span>
        </span>
      ))}
    </span>
  )
}

function TopBar({ device }) {
  const g = useGame()
  return (
    <div className="topbar">
      <div className="topbar__stats">
        <span className="pill pill--money">
          <Icon name="coin" size={18} /> {peso(g.money)}
        </span>
        <span className="pill">
          Día {g.day} · <b>{clockLabel()}</b>
          {!g.open && <em className="pill__closed">cerrado</em>}
        </span>
        <span className="pill pill--stars">
          <Stars value={g.rating} />
        </span>
      </div>
      <div className="topbar__btns">
        <button type="button" className="icon-btn" onClick={() => setPanel('recipes')} aria-label="Recetas">
          <Icon name="book" size={22} />
          {device !== 'phone' && <span>Recetas</span>}
        </button>
        <button type="button" className="icon-btn" onClick={() => setPanel('inventory')} aria-label="Inventario">
          <Icon name="bag" size={22} />
          {device !== 'phone' && <span>Inventario</span>}
          {lowStock() && <i className="dot" />}
        </button>
        <button type="button" className="icon-btn" onClick={() => pause(true)} aria-label="Pausa">
          <Icon name="pause" size={22} />
        </button>
      </div>
    </div>
  )
}

function Tickets() {
  const g = useGame()
  const orders = g.customers.filter((c) => c.state === 'waiting').sort((a, b) => a.patience - b.patience)
  if (!orders.length) return null
  return (
    <div className="tickets" aria-label="Pedidos">
      {orders.map((c) => {
        const r = RECIPES[c.order]
        const frac = c.patience / c.patienceMax
        return (
          <button key={c.id} type="button" className={`ticket${frac < 0.3 ? ' is-urgent' : ''}`} onClick={() => tapCustomer(c.id)}>
            <i className="ticket__who" style={{ background: c.look.shirt }} />
            <Icon name={r.pastry ? 'lazo' : r.vessel} size={22} />
            <span className="ticket__name">{r.name}</span>
            <span className="ticket__bar">
              <i style={{ transform: `scaleX(${frac})` }} />
            </span>
          </button>
        )
      })}
    </div>
  )
}

function Carry() {
  const g = useGame()
  const h = g.player.hand
  if (!h) return null
  return (
    <div className="carry">
      <Icon name={h.pastry ? 'lazo' : h.vessel} size={22} />
      <span>
        Llevás: <b>{h.label}</b>
      </span>
      <button type="button" className="carry__trash" onClick={discardHand} aria-label="Tirar">
        <Icon name="trash" size={20} />
      </button>
    </div>
  )
}

const ACTION_ICON = { order: 'order', deliver: 'hand', pickup: 'hand', pastry: 'lazo', prep: 'cup', none: 'lazo' }

function ActionButton({ device }) {
  const g = useGame()
  const f = g.focus
  return (
    <div className={`action${f ? ' is-on' : ''}`}>
      <button type="button" className="action__btn" disabled={!f || f.kind === 'none'} onClick={interact} aria-label={f ? f.label : 'Sin acción'}>
        <Icon name={f ? ACTION_ICON[f.kind] : 'hand'} size={device === 'phone' ? 34 : 38} />
      </button>
      <span className="action__label">
        {f ? f.label : 'Acercate a algo'}
        {device === 'desktop' && f && <kbd>E</kbd>}
      </span>
    </div>
  )
}

function Toasts() {
  const g = useGame()
  return (
    <div className="toasts" role="status" aria-live="polite">
      {g.toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind}`}>
          {t.kind === 'coin' && <Icon name="coin" size={18} />}
          {t.text}
        </div>
      ))}
    </div>
  )
}

export function Hud({ device }) {
  return (
    <div className="hud">
      <TopBar device={device} />
      <Tickets />
      <Toasts />
      <Carry />
      <ActionButton device={device} />
      {device === 'desktop' && (
        <p className="keys">
          <kbd>W</kbd>
          <kbd>A</kbd>
          <kbd>S</kbd>
          <kbd>D</kbd> caminar · arrastrá para mirar · clic para ir · <kbd>E</kbd> usar · <kbd>R</kbd> recetas · <kbd>I</kbd> inventario
        </p>
      )}
    </div>
  )
}
