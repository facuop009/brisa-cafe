import { useEffect, useState } from 'react'
import { SITE, FLOWERS } from '../content'
import { HOURS_ROWS, openState, cphNow } from '../lib/time'
import { Reveal } from '../components/Reveal'

export function Visit() {
  const [state, setState] = useState(() => openState(cphNow()))
  useEffect(() => {
    const t = setInterval(() => setState(openState(cphNow())), 30000)
    return () => clearInterval(t)
  }, [])
  return (
    <section className="visit" id="visit" aria-labelledby="visit-title">
      <div className="visit__img">
        <img src="renders/visit-dusk.jpg" alt="The house from the street at dusk, all three floors lit" width="1920" height="1080" loading="lazy" />
      </div>
      <div className="visit__card-wrap">
        <Reveal className="visit__card" y={32}>
          <h2 id="visit-title">Visita ASA</h2>
          <p className={`status${state.open ? '' : ' is-closed'}`}>
            <i aria-hidden="true" />
            {state.label}
          </p>
          <address>
            {SITE.address[0]}
            <br />
            {SITE.address[1]}
          </address>
          <dl className="hours">
            {HOURS_ROWS.map((h) => (
              <div key={h.days}>
                <dt>{h.days}</dt>
                <dd>{h.time}</dd>
              </div>
            ))}
          </dl>
          <p className="visit__florist">{FLOWERS.hours}</p>
          <p className="visit__contact">
            <a className="link" href={SITE.phoneHref}>
              {SITE.phone}
            </a>
            <a className="link" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </p>
          <a className="btn btn--accent" href={SITE.maps} target="_blank" rel="noreferrer">
            Cómo llegar <span className="arrow" aria-hidden="true">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
