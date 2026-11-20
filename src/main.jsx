import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'

const capture = new URLSearchParams(location.search).has('capture')
const Root = lazy(() => (capture ? import('./CaptureStudio') : import('./App')))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Root />
    </Suspense>
  </StrictMode>
)
