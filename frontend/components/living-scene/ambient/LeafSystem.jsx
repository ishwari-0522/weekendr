'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Leaf System: Emits leaves occasionally (not constantly) that drift at randomized directions and wind strengths.
 */
export default function LeafSystem({ enabled = true, weather = 'Sunny' }) {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    if (!enabled) return;

    let activeInterval = null;

    const spawnLeafCycle = () => {
      // Mild wind defaults, weather hook overrides
      let probability = 0.4;
      let leafCount = 1;
      let windStrength = 1.0;

      if (weather === 'Wind') {
        probability = 0.85;
        leafCount = 4;
        windStrength = 1.8;
      } else if (weather === 'Cloudy') {
        probability = 0.55;
      }

      if (Math.random() < probability) {
        const count = Math.ceil(Math.random() * leafCount);
        const newLeaves = Array.from({ length: count }).map((_, idx) => {
          const startX = 15 + Math.random() * 60;
          const startY = 15 + Math.random() * 20;
          
          return {
            id: `leaf-${Date.now()}-${idx}-${Math.random()}`,
            startX,
            startY,
            driftX: (25 + Math.random() * 35) * windStrength,
            driftY: 45 + Math.random() * 25,
            duration: 5.5 + Math.random() * 3.5, // 5s to 9s drift
            delay: idx * 0.4,
            rotation: 120 + Math.random() * 240
          };
        });

        setLeaves((prev) => [...prev, ...newLeaves]);
      }
    };

    activeInterval = setInterval(spawnLeafCycle, 3500); // Check every 3.5s

    return () => {
      if (activeInterval) clearInterval(activeInterval);
    };
  }, [enabled, weather]);

  const handleAnimationComplete = (id) => {
    setLeaves((prev) => prev.filter((l) => l.id !== id));
  };

  if (!enabled || leaves.length === 0) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <AnimatePresence>
        {leaves.map((l) => (
          <motion.div
            key={l.id}
            initial={{ left: `${l.startX}%`, top: `${l.startY}%`, opacity: 0, scale: 0.7 }}
            animate={{
              left: `${l.startX + l.driftX}%`,
              top: `${l.startY + l.driftY}%`,
              opacity: [0, 0.45, 0.45, 0],
              rotate: l.rotation
            }}
            transition={{
              duration: l.duration,
              delay: l.delay,
              ease: 'linear'
            }}
            onAnimationComplete={() => handleAnimationComplete(l.id)}
            className="absolute w-1.5 h-2 bg-emerald-800/35 rounded-full"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
