import { useEffect, useState } from 'react'

// True once (or while, with `once: false`) the element is near the viewport.
export function useInView(ref, { rootMargin = '0px', once = true } = {}) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) setInView(false)
      },
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, once])
  return inView
}
