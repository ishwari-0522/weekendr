'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Steam System: Emits rising steam puffs with varying height, scale, and opacity intensities.
 */
export default function SteamSystem({ enabled = true, emitters = [] }) {
  const [puffs, setPuffs] = useState([]);

  useEffect(() => {
    if (!enabled || !emitters || emitters.length === 0) return;

    let activeInterval = null;

    const spawnPuffCycle = () => {
      // Randomize puff intensity factors
      const intensity = 0.3 + Math.random() * 0.7; // 30% to 100% strength
      
      const newPuffs = emitters.map((em, idx) => ({
        id: `steam-${Date.now()}-${idx}-${Math.random()}`,
        x: em.x + (Math.random() * 1.5 - 0.75), // subtle scatter
        y: em.y,
        height: 25 + Math.random() * 20, // vertical float height
        scale: 0.7 + Math.random() * 0.6,
        opacity: 0.15 * intensity,
        duration: 2.2 + Math.random() * 1.2
      }));

      setPuffs((prev) => [...prev, ...newPuffs]);
    };

    activeInterval = setInterval(spawnPuffCycle, 1600); // Spawn new puff cycle every 1.6s

    return () => {
      if (activeInterval) clearInterval(activeInterval);
    };
  }, [enabled, emitters]);

  const handleAnimationComplete = (id) => {
    setPuffs((prev) => prev.filter((p) => p.id !== id));
  };

  if (!enabled || puffs.length === 0) return null;

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      <AnimatePresence>
        {puffs.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`
            }}
            initial={{ y: 5, opacity: 0, scale: 0.6 }}
            animate={{
              y: -p.height,
              opacity: [0, p.opacity, p.opacity, 0],
              scale: p.scale
            }}
            transition={{
              duration: p.duration,
              ease: 'easeInOut'
            }}
            onAnimationComplete={() => handleAnimationComplete(p.id)}
            className="w-2.5 h-2.5 bg-white/10 blur-[2px] rounded-full"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
