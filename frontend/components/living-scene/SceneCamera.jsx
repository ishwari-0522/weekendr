'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Simulates a subtle floating camera effect.
 * Respects prefers-reduced-motion to disable camera float.
 */
export default function SceneCamera({ children, enabled = true, config }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (!enabled || reducedMotion) {
    return <div className="w-full h-full relative">{children}</div>;
  }

  const floatAmplitude = config?.floatAmplitude || 4;
  const rotationAmplitude = config?.rotationAmplitude || 0.4;

  const halfFloat = floatAmplitude / 2;
  const halfRotation = rotationAmplitude / 2;

  return (
    <motion.div
      animate={{
        y: [-halfFloat, halfFloat, -halfFloat],
        rotate: [-halfRotation, halfRotation, -halfRotation]
      }}
      transition={{
        repeat: Infinity,
        duration: 8,
        ease: 'easeInOut'
      }}
      className="w-full h-full relative"
    >
      {children}
    </motion.div>
  );
}
