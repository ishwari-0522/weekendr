'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Editorial Scene Tooltip: Displays tiny, elegant text labels that fade in and fade out automatically.
 */
export default function SceneTooltip({ label, sublabel, x, y, visible, onClose }) {
  useEffect(() => {
    if (!visible) return;

    // Auto-dismiss tooltip after 4 seconds
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -100%)'
          }}
          className="absolute z-50 pointer-events-none -translate-x-1/2 -mt-2 bg-[#111622]/95 border border-border/80 px-3 py-2 rounded shadow-high max-w-[200px] text-center"
        >
          {label && (
            <h4 className="text-[10px] font-bold text-foreground tracking-wider uppercase mb-0.5">
              {label}
            </h4>
          )}
          {sublabel && (
            <p className="text-[9px] text-muted-foreground leading-normal italic font-medium">
              "{sublabel}"
            </p>
          )}
          {/* Small tooltip bottom arrow hook */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 border-r border-b border-border bg-[#111622] rotate-45 -mt-1" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
