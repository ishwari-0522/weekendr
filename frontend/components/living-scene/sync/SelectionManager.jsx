'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Selection Manager: Displays a tiny contextual details panel when a specific stop is selected in the scene.
 */
export default function SelectionManager({ 
  selectedSpot = null, 
  x, 
  y, 
  onClose 
}) {
  if (!selectedSpot) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y - 12}%`,
          transform: 'translate(-50%, -100%)'
        }}
        className="absolute z-50 bg-[#111622]/95 border border-border/80 p-3.5 rounded-lg shadow-high w-48 text-left pointer-events-auto"
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xs font-bold text-foreground truncate pr-2">
            {selectedSpot.name}
          </h4>
          <button 
            onClick={onClose}
            className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1.5 text-[10px] text-muted-foreground">
          <div className="flex justify-between">
            <span>Spend:</span>
            <span className="font-bold text-foreground">₹{selectedSpot.estimated_cost}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span className="font-bold text-foreground">
              {selectedSpot.arrival_time} - {selectedSpot.departure_time}
            </span>
          </div>
          
          <div className="border-t border-border/40 pt-1.5 mt-1.5 leading-relaxed text-foreground/80 font-medium italic">
            "Selected for its quiet corners and welcoming service."
          </div>
        </div>

        {/* Arrow pointer */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 border-r border-b border-border bg-[#111622] rotate-45 -mt-1" />
      </motion.div>
    </AnimatePresence>
  );
}
export { SelectionManager };
