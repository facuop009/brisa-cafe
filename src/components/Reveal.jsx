import { motion, useReducedMotion } from 'framer-motion'

// Entrance for the parts of a section: rises 24px with opacity, once, staggered by `i`.
export function Reveal({ as = 'div', i = 0, y = 24, children, className, ...rest }) {
  const reduce = useReducedMotion()
  const Tag = motion[as] || motion.div
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

// A picture that drifts slightly against the scroll.
export { motion }
