'use client';

import { motion } from 'framer-motion';

export function LandingAnimations({ 
  children, 
  type = 'fade-up',
  delay = 0 
}: { 
  children: React.ReactNode;
  type?: 'fade-up' | 'scale-up' | 'fade';
  delay?: number;
}) {
  const variants = {
    'fade-up': {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
    },
    'scale-up': {
      initial: { opacity: 0, scale: 0.95, y: 40 },
      animate: { opacity: 1, scale: 1, y: 0 },
    },
    'fade': {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    }
  };

  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      variants={variants[type]}
    >
      {children}
    </motion.div>
  );
}
