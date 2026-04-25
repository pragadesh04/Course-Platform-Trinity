import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export const springTransition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
};

export const elasticTransition = {
  type: 'spring',
  stiffness: 100,
  damping: 15,
  mass: 0.5,
};

export const smoothTransition = {
  duration: 0.6,
  ease: [0.43, 0.13, 0.23, 0.96],
};

export function SectionTitle({ title, subtitle, centered = true }) {
  return (
    <div className={`section-title ${centered ? 'centered' : ''}`}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ ...elasticTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, direction = 'up', delay = 0 }) {
  const variants = {
    up: { opacity: 0, y: 30 },
    down: { opacity: 0, y: -30 },
    left: { opacity: 0, x: -30 },
    right: { opacity: 0, x: 30 },
  };

  return (
    <motion.div
      initial={variants[direction]}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ ...elasticTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, staggerDelay = 0.1 }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={elasticTransition}
    >
      {children}
    </motion.div>
  );
}
