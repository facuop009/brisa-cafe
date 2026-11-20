import { useRef } from 'react'
import { input } from '../input'

const RADIUS = 56

/* Floating thumbstick: it appears wherever the left thumb lands inside its zone. */
export function Joystick() {
  const zone = useRef()
  const base = useRef()
  const knob = useRef()
  const active = useRef(null)

  const place = (x, y) => {
    const rect = zone.current.getBoundingClientRect()
    const s = base.current.style
    s.left = `${x - rect.left}px`
    s.top = `${y - rect.top}px`
    s.bottom = 'auto'
  }
  const reset = () => {
    active.current = null
    input.stickX = 0
    input.stickY = 0
    knob.current.style.transform = 'translate(-50%, -50%)'
    const s = base.current.style
    s.left = s.top = s.bottom = ''
    base.current.classList.remove('is-active')
  }

  return (
    <div
      ref={zone}
      className="stick-zone"
      onPointerDown={(e) => {
        if (active.current) return
        e.currentTarget.setPointerCapture(e.pointerId)
        active.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
        place(e.clientX, e.clientY)
        base.current.classList.add('is-active')
      }}
      onPointerMove={(e) => {
        const a = active.current
        if (!a || a.id !== e.pointerId) return
        let dx = e.clientX - a.x
        let dy = e.clientY - a.y
        const d = Math.hypot(dx, dy)
        if (d > RADIUS) {
          dx = (dx / d) * RADIUS
          dy = (dy / d) * RADIUS
        }
        knob.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
        const n = Math.min(1, d / RADIUS)
        const dead = n < 0.15
        input.stickX = dead ? 0 : dx / RADIUS
        input.stickY = dead ? 0 : -dy / RADIUS
      }}
      onPointerUp={(e) => active.current?.id === e.pointerId && reset()}
      onPointerCancel={reset}
    >
      <div ref={base} className="stick">
        <div className="stick__base" />
        <div ref={knob} className="stick__knob" />
      </div>
    </div>
  )
}
