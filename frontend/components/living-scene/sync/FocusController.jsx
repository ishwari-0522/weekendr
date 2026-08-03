'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSelection } from './SelectionContext';
import { getSpotDetails } from './TimelineSync';

/**
 * Focus Controller: Gently offsets camera translations (leaning in effect) towards the active spot
 * by reading values from SelectionContext.
 */
export default function FocusController({ config = {}, enabled = true, children }) {
  const context = useSelection();
  const activeSpotIdx = context ? context.activeSpotIdx : null;
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  const activeSpot = useMemo(() => {
    if (activeSpotIdx === null) return null;
    return getSpotDetails(activeSpotIdx, config);
  }, [activeSpotIdx, config]);

  // Center alignment offset coordinates (dx/dy percentage scaling shifts)
  const offsetX = activeSpot ? (50 - activeSpot.x) * 0.12 : 0;
  const offsetY = activeSpot ? (55 - activeSpot.y) * 0.12 : 0;
  const scale = activeSpot ? 1.04 : 1;

  if (!enabled || reducedMotion) {
    return <div className="w-full h-full relative">{children}</div>;
  }

  return (
    <motion.div
      animate={{
        x: `${offsetX}%`,
        y: `${offsetY}%`,
        scale
      }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className="w-full h-full relative origin-center"
    >
      {children}
    </motion.div>
  );
}
export { FocusController };
