import { GALLERY } from '../content'
import { Reveal } from '../components/Reveal'

/* Three floors, one after another: each picture slides over the last. */
export function Gallery() {
  return (
    <section className="gallery" id="gallery" aria-labelledby="gallery-title">
      <Reveal className="gallery__intro">
        <h2 id="gallery-title">Tres plantas, un día</h2>
        <p>Sube la escalera de roble con el sol: el café con la primera luz, el salón al mediodía y la florista cuando se encienden las lámparas de papel.</p>
      </Reveal>
      {GALLERY.map((g) => (
        <figure className="frame" key={g.image}>
          <img src={g.image} alt={g.alt} width="1920" height="1080" loading="lazy" />
          <span className="scrim-bottom" aria-hidden="true" />
          <figcaption className="caption">{g.caption}</figcaption>
        </figure>
      ))}
    </section>
  )
}
