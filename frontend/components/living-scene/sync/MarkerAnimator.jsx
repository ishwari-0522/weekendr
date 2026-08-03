'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Marker Animator: Renders minimal, numbered circles (1, 2, 3) at destination coordinates.
 */
export default function MarkerAnimator({ 
  index, 
  x, 
  y, 
  isSelected = false, 
  isHovered = false,
  onClick 
}) {
  const number = index + 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -100%)'
      }}
      onClick={onClick}
      className="z-40 cursor-pointer -mt-1 select-none pointer-events-auto"
    >
      <motion.div
        animate={{
          scale: isSelected ? 1.2 : isHovered ? 1.1 : 1.0,
          y: isSelected ? -4 : 0
        }}
        transition={{
          type: 'spring',
          stiffness: 140,
          damping: 10
        }}
        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 text-[9px] font-black tracking-normal transition-all shadow-medium ${
          isSelected 
            ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_8px_rgba(99,102,241,0.5)]'
            : isHovered 
              ? 'bg-[#1e293b] border-highlight text-highlight shadow-[0_0_8px_rgba(245,158,11,0.4)]'
              : 'bg-[#111622] border-border text-foreground hover:border-primary/50'
        }`}
      >
        {number}
      </motion.div>
      <div className="w-1.5 h-1.5 bg-slate-950/40 rounded-full blur-[1px] mx-auto mt-0.5" />
    </div>
  );
}
