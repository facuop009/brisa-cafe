import { createRoot } from 'react-dom/client'
import { Game } from './Game'
import './game.css'

createRoot(document.getElementById('game')).render(<Game />)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('juego-sw.js', { updateViaCache: 'none' }).catch(() => {}))
}
