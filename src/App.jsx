import { useEffect } from 'react'
import { Hero, Rail } from './sections/Hero'
import { Menu } from './sections/Menu'
import { Featured } from './sections/Featured'
import { Brewing } from './sections/Brewing'
import { House } from './sections/House'
import { Flowers } from './sections/Flowers'
import { Gallery } from './sections/Gallery'
import { Visit } from './sections/Visit'
import { Footer } from './sections/Footer'
import { Parallax } from './components/Parallax'
import { startSmoothScroll } from './lib/scroll'

export default function App() {
  useEffect(() => {
    startSmoothScroll()
  }, [])
  return (
    <>
      <a className="skip" href="#menu">
        Skip to the menu
      </a>
      <div className="page">
        <Rail />
        <Hero />
        <figure className="detail">
          <Parallax amount={6}>
            <img
              src="renders/hero-detail.jpg"
              alt="The ground-floor espresso bar in yellow glazed tile, morning sun across the counter"
              width="1920"
              height="1080"
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Parallax>
          <span className="scrim-bottom" aria-hidden="true" />
          <figcaption className="caption">Ground floor, 08:10. Two groups, one grinder and the Morning Blend.</figcaption>
        </figure>
        <main id="main">
          <Menu />
          <Featured />
          <Brewing />
          <House />
          <Flowers />
          <Gallery />
          <Visit />
        </main>
        <Footer />
      </div>
    </>
  )
}
