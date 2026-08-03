'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Light System: Animates street lamps with irregular breathing brightness levels (no obvious pulsing or synchronizations).
 */
export default function LightSystem({ enabled = true, lamps = [] }) {
  if (!enabled || !lamps || lamps.length === 0) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {lamps.map((l, idx) => {
        // Vary breathing loop offsets and speeds based on lamp index
        const pulseDuration = 5 + (idx % 3) * 1.5; // 5s, 6.5s, 8s loops
        const delay = idx * 0.8;

        return (
          <div
            key={l.id || idx}
            style={{
              position: 'absolute',
              left: `${l.x}%`,
              top: `${l.y}%`
            }}
            className="flex flex-col items-center -translate-x-1/2 -translate-y-full"
          >
            {/* Pulsing Light Glow Core Overlay */}
            <motion.div
              animate={{ 
                opacity: [0.65, 0.9, 0.7, 0.95, 0.65] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: pulseDuration, 
                delay,
                ease: 'easeInOut' 
              }}
              className="w-2.5 h-2.5 bg-yellow-500/95 rounded-full border border-yellow-300 shadow-[0_0_9px_rgba(234,179,8,0.75)]"
            />
            {/* Lamp post bar */}
            <div className="w-[1.5px] h-6 bg-slate-600/70" />
          </div>
        );
      })}
    </div>
  );
}
