'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AssemblyTimeline from './AssemblyTimeline';

const EDITORIAL_CAPTIONS = [
  "Finding places worth remembering.",
  "Balancing travel and time.",
  "Connecting moments.",
  "Putting the finishing touches on your day."
];

/**
 * Assembly Controller: Manages assembly timers, cycles the editorial captions,
 * and handles reduced-motion fallbacks.
 */
export default function AssemblyController({ 
  isActive = false, 
  onStageChange,
  onComplete 
}) {
  const [stage, setStage] = useState(0);
  const [captionIdx, setCaptionIdx] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // 1. Reduced-motion media queries
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // 2. Caption rotater loop
  useEffect(() => {
    if (!isActive) {
      setCaptionIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setCaptionIdx((prev) => (prev + 1) % EDITORIAL_CAPTIONS.length);
    }, 750); // Rotate every 750ms to align with assembly sequence

    return () => clearInterval(interval);
  }, [isActive]);

  const handleStageChange = (nextStage) => {
    setStage(nextStage);
    if (onStageChange) onStageChange(nextStage);
    
    // Complete sequence after stage 8
    if (nextStage === 8 && onComplete) {
      const timer = setTimeout(onComplete, 400); // minor delay
      return () => clearTimeout(timer);
    }
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 bg-[#0c101b]/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 z-50 rounded-xl select-none">
      
      {/* 1. Timer sequence manager */}
      <AssemblyTimeline 
        isActive={isActive} 
        onStageChange={handleStageChange} 
      />

      {/* 2. Editorial captions overlay text */}
      <div className="text-center max-w-sm space-y-4">
        
        {/* Abstract loading progress ring bar */}
        <div className="w-8 h-8 rounded-full border border-primary/20 border-t-primary animate-spin mx-auto" />
        
        <div className="h-6 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={captionIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="text-xs font-semibold text-foreground tracking-wide italic leading-normal"
            >
              {EDITORIAL_CAPTIONS[captionIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Development stage tags */}
        <span className="caption-text text-muted-foreground/40 font-bold uppercase tracking-widest block scale-90">
          Stage {stage} of 8 • {reducedMotion ? 'Fade Mode Active' : 'Assembly Active'}
        </span>
      </div>

    </div>
  );
}
export { EDITORIAL_CAPTIONS };
