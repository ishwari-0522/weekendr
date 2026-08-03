'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Bird System: Spawns 1 or 2 birds flying across the sky at irregular intervals (20-45 seconds).
 */
export default function BirdSystem({ enabled = true, weather = 'Sunny' }) {
  const [birds, setBirds] = useState([]);

  useEffect(() => {
    if (!enabled) return;

    let activeTimeout = null;

    const spawnBirdCycle = () => {
      // Determine number of birds (0, 1, or 2)
      const rand = Math.random();
      const count = rand < 0.25 ? 0 : rand < 0.75 ? 1 : 2;

      if (count > 0) {
        const newBirds = Array.from({ length: count }).map((_, idx) => {
          const startY = 10 + Math.random() * 30;
          const endY = startY + (Math.random() * 20 - 10);
          
          return {
            id: `bird-${Date.now()}-${idx}-${Math.random()}`,
            startY,
            endY,
            startX: -15,
            endX: 115,
            duration: 9 + Math.random() * 6, // 9s to 15s transit
            delay: idx * (Math.random() * 1.5 + 0.5) // staggered stagger
          };
        });

        setBirds((prev) => [...prev, ...newBirds]);
      }

      // Schedule next flight interval (20s to 45s)
      const nextInterval = 20000 + Math.random() * 25000;
      activeTimeout = setTimeout(spawnBirdCycle, nextInterval);
    };

    // First trigger delay
    const initialDelay = 8000 + Math.random() * 12000;
    activeTimeout = setTimeout(spawnBirdCycle, initialDelay);

    return () => {
      if (activeTimeout) clearTimeout(activeTimeout);
    };
  }, [enabled]);

  // Clean up birds after transit finishes
  const handleAnimationComplete = (id) => {
    setBirds((prev) => prev.filter((b) => b.id !== id));
  };

  if (!enabled || birds.length === 0) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <AnimatePresence>
        {birds.map((b) => (
          <motion.div
            key={b.id}
            initial={{ left: `${b.startX}%`, top: `${b.startY}%`, opacity: 0 }}
            animate={{ 
              left: `${b.endX}%`, 
              top: `${b.endY}%`, 
              opacity: [0, 0.45, 0.45, 0] 
            }}
            transition={{
              duration: b.duration,
              delay: b.delay,
              ease: 'linear'
            }}
            onAnimationComplete={() => handleAnimationComplete(b.id)}
            className="absolute flex items-center gap-0.5"
          >
            {/* Minimal abstract double wing shapes (flapping animation) */}
            <motion.div
              animate={{ rotateX: [0, 65, 0] }}
              transition={{ repeat: Infinity, duration: 0.3, ease: 'easeInOut' }}
              className="w-1.5 h-0.5 bg-slate-400/50 rounded-full origin-right"
            />
            <motion.div
              animate={{ rotateX: [0, -65, 0] }}
              transition={{ repeat: Infinity, duration: 0.3, ease: 'easeInOut' }}
              className="w-1.5 h-0.5 bg-slate-400/50 rounded-full origin-left"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
