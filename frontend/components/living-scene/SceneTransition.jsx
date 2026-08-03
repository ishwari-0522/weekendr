'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Handles transition fades through an atmospheric fog mask to prevent direct scene overlays.
 */
export default function SceneTransition({ isTransitioning, children }) {
  return (
    <div className="relative w-full h-full">
      {/* Target Children Scene */}
      {children}

      {/* Fullscreen Atmospheric Fog Layer Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isTransitioning ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute inset-0 bg-slate-900 pointer-events-none z-50 flex items-center justify-center"
      >
        {/* Soft mist glow core */}
        <div className="w-32 h-32 bg-primary/10 blur-[30px] rounded-full animate-pulse" />
      </motion.div>
    </div>
  );
}
