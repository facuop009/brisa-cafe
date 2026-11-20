import { NAV, SITE } from '../content'
import { scrollToId } from '../lib/scroll'

export function Footer() {
  const go = (id) => (e) => {
    e.preventDefault()
    scrollToId(id)
  }
  return (
    <footer className="footer">
      <div className="footer__photo">
        <img src="renders/footer-crop.jpg" alt="Close view of the flower buckets on the oak stand, pink and yellow ranunculus" width="1200" height="1500" loading="lazy" />
      </div>
      <div className="footer__body">
        <p className="display footer__mark">ASA</p>
        <nav aria-label="Footer">
          <ul className="footer__nav">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={go(n.id)}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer__blocks">
          <div>
            <h2 className="footer__h">Contacto</h2>
            <p>
              {SITE.address[0]}, {SITE.address[1]}
              <br />
              <a className="link" href={SITE.phoneHref}>
                {SITE.phone}
              </a>
              <br />
              <a className="link" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
            </p>
          </div>
          <div>
            <h2 className="footer__h">Encuéntranos</h2>
            <p>
              <a className="link" href={SITE.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
              <br />
              <a className="link" href="mailto:flowers@asa-coffee.dk">
                Pedidos de flores
              </a>
            </p>
          </div>
        </div>
        <p className="credits">
          Fotos en &ldquo;De la cereza a la taza&rdquo;: <a className="link" href="https://wordpress.org/photos/photo/27469e5224/">cerezas de café maduras</a> de Brandon Cespedes Morales,{' '}
          <a className="link" href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a>; <a className="link" href="https://commons.wikimedia.org/w/index.php?curid=74064010">granos tostados en un cuenco blanco</a> de
          Alorin, <a className="link" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; <a className="link" href="https://commons.wikimedia.org/w/index.php?curid=87521821">equipo de pour-over</a> y{' '}
          <a className="link" href="https://commons.wikimedia.org/w/index.php?curid=87521822">preparación con hervidor y báscula</a> de HungryHuy, <a className="link" href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a>;{' '}
          <a className="link" href="https://commons.wikimedia.org/w/index.php?curid=70214599">café de goteo manual</a> de Kim Sanso, <a className="link" href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a>. Vía
          Wikimedia Commons y el WordPress Photo Directory. Todas las demás imágenes están renderizadas desde el modelo 3D de la casa.
        </p>
        <p className="legal">© 2026 ASA coffee &amp; flowers, Copenhague</p>
      </div>
    </footer>
  )
}
