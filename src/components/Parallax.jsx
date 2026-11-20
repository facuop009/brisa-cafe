import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

// Wraps a full-bleed picture so it moves a little slower than the page.
export function Parallax({ children, amount = 8, className }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`])
  return (
    <div ref={ref} className={className} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <motion.div style={{ position: 'absolute', inset: `-${amount}% 0`, y: reduce ? 0 : y }}>{children}</motion.div>
    </div>
  )
}
