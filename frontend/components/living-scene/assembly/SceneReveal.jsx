'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Scene Reveal: Helper wrapper that masks scale, height, and opacities
 * of child elements based on the active assembly stage.
 */
export default function SceneReveal({ stage = 0, targetStage = 1, delay = 0, children }) {
  const isRevealed = stage >= targetStage;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ 
        opacity: isRevealed ? 1 : 0, 
        scale: isRevealed ? 1 : 0.85 
      }}
      transition={{ 
        duration: 0.6, 
        delay, 
        type: 'spring', 
        stiffness: 90, 
        damping: 11 
      }}
      className="w-full h-full relative"
    >
      {children}
    </motion.div>
  );
}
export { SceneReveal };
