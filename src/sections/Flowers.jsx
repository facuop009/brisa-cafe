import { FLOWERS } from '../content'
import { Reveal } from '../components/Reveal'
import { Parallax } from '../components/Parallax'

/* ASA Flowers, the top floor: a whole field of mimosa yellow. */
export function Flowers() {
  return (
    <section className="flowers" id="flowers" aria-labelledby="flowers-title">
      <div className="grid">
        <div className="flowers__text">
          <Reveal as="h2" className="head" id="flowers-title">
            Flores arriba
          </Reveal>
          <Reveal as="p" i={1} className="lead flowers__intro">
            {FLOWERS.intro}
          </Reveal>
          <ul className="flowers__list">
            {FLOWERS.list.map((f, i) => (
              <Reveal as="li" key={f.name} i={i + 2}>
                <span>
                  <strong>{f.name}</strong>
                  <span className="flowers__note">{f.note}</span>
                </span>
                <span className="tabular">{f.price}</span>
              </Reveal>
            ))}
          </ul>
          <Reveal as="p" i={6} className="flowers__hours">
            {FLOWERS.hours}
          </Reveal>
          <Reveal i={7}>
            <a className="btn btn--ink flowers__btn" href={`mailto:${FLOWERS.email}?subject=Pedido%20de%20flores&body=Hola%20ASA%20Flores%2C%0A%0AQuisiera%20pedir%3A%20`}>
              Pedir flores por email <span className="arrow" aria-hidden="true">→</span>
            </a>
          </Reveal>
        </div>
        <div className="flowers__pics">
          <div className="flowers__main">
            <Parallax amount={5}>
              <img src={FLOWERS.image} alt={FLOWERS.alt} width="1200" height="1500" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Parallax>
          </div>
          <Reveal className="flowers__detail" y={40}>
            <img src={FLOWERS.detail} alt={FLOWERS.detailAlt} width="900" height="900" loading="lazy" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
