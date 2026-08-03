'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Water System: Triggers subtle concentric ripples on pond coordinates at irregular intervals.
 */
export default function WaterSystem({ enabled = true, ponds = [] }) {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    if (!enabled || !ponds || ponds.length === 0) return;

    let activeInterval = null;

    const triggerRippleCycle = () => {
      // Trigger a ripple on a random pond element
      const targetPond = ponds[Math.floor(Math.random() * ponds.length)];
      
      const newRipple = {
        id: `ripple-${Date.now()}-${Math.random()}`,
        // Center ripple within the bounds of the pond
        x: targetPond.x + (targetPond.width || 10) / 2,
        y: targetPond.y + (targetPond.height || 10) / 2,
        width: targetPond.width || 12,
        height: targetPond.height || 8
      };

      setRipples((prev) => [...prev, newRipple]);
    };

    activeInterval = setInterval(triggerRippleCycle, 2800); // Check/Trigger every 2.8s

    return () => {
      if (activeInterval) clearInterval(activeInterval);
    };
  }, [enabled, ponds]);

  const handleAnimationComplete = (id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  if (!enabled || ripples.length === 0) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            style={{
              position: 'absolute',
              left: `${r.x}%`,
              top: `${r.y}%`
            }}
            initial={{ scale: 0.3, opacity: 0.4 }}
            animate={{
              scale: 1.6,
              opacity: 0
            }}
            transition={{
              duration: 3.5,
              ease: 'easeOut'
            }}
            onAnimationComplete={() => handleAnimationComplete(r.id)}
            className="absolute border border-blue-400/10 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              width: `${r.width * 2.8}px`,
              height: `${r.height * 2.2}px`
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
