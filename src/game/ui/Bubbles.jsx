import { RECIPES, tapCustomer, useGame } from '../engine'
import { Icon } from './Icon'

// DOM elements positioned every frame by the 3D world (see BubbleProjector).
export const bubbleEls = new Map()

const register = (id) => (el) => (el ? bubbleEls.set(id, el) : bubbleEls.delete(id))

export function Bubbles() {
  const g = useGame()
  return (
    <div className="bubbles">
      {g.customers.map((c) => {
        if (c.state === 'entering' || c.state === 'leaving') return null
        const frac = c.patience / c.patienceMax
        const urgent = frac < 0.3
        const r = RECIPES[c.order]
        return (
          <div key={c.id} ref={register(c.id)} className="bubble-anchor" style={{ opacity: 0 }}>
            {c.state === 'ready' && (
              <button type="button" className={`bubble bubble--ready${urgent ? ' is-urgent' : ''}`} style={{ '--p': frac }} onClick={() => tapCustomer(c.id)} aria-label="Cliente quiere pedir">
                <span className="bubble__ring" />
                <span className="bubble__mark">!</span>
              </button>
            )}
            {c.state === 'waiting' && (
              <button type="button" className={`bubble bubble--order${urgent ? ' is-urgent' : ''}`} onClick={() => tapCustomer(c.id)} aria-label={`Pidió ${r.name}`}>
                <Icon name={r.pastry ? 'lazo' : r.vessel} size={26} />
                <span className="bubble__name">{r.name}</span>
                <span className="bubble__bar">
                  <i style={{ transform: `scaleX(${frac})` }} />
                </span>
              </button>
            )}
            {c.state === 'served' && <span className="bubble bubble--happy">¡Gracias!</span>}
            {c.state === 'angry' && <span className="bubble bubble--angry">¡Qué lento!</span>}
          </div>
        )
      })}
    </div>
  )
}
