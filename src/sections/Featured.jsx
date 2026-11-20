import { FEATURED } from '../content'
import { Parallax } from '../components/Parallax'
import { Reveal } from '../components/Reveal'

/* Three things to take home, each a full-screen close-up with its card one column further along. */
export function Featured() {
  return (
    <section id="featured" aria-labelledby="featured-0">
      {FEATURED.map((f, i) => {
        const H = i === 0 ? 'h2' : 'h3'
        return (
          <article className="feature" key={f.id}>
            <Parallax className="feature__img" amount={6}>
              <img src={f.image} alt={f.alt} width="1920" height="1080" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Parallax>
            <div className="feature__grid">
              <Reveal className="card" style={{ gridColumn: i + 2 }} y={40}>
                <H className="card__name" id={`featured-${i}`}>
                  {f.name}
                </H>
                <p className="card__variant">{f.variant}</p>
                <p className="card__fact">{f.fact}</p>
                <img className="card__thumb" src={f.thumb} alt="" width="900" height="600" loading="lazy" />
                <p className="card__body">{f.body}</p>
                <span className="card__spacer" />
                <a className="btn btn--ink" href={f.action.href}>
                  {f.action.label} <span className="arrow" aria-hidden="true">→</span>
                </a>
              </Reveal>
            </div>
          </article>
        )
      })}
    </section>
  )
}
