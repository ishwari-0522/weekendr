'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getAbsolutePositionStyles } from './sceneUtils';

/**
 * Renders block buildings with spring-damping entry assembly animations.
 */
export default function BuildingLayer({ buildings = [] }) {
  if (!buildings || buildings.length === 0) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {buildings.map((b, idx) => {
        const styles = getAbsolutePositionStyles(b.x, b.y, b.width, b.height);
        return (
          <motion.div
            key={b.id}
            style={styles}
            initial={{ y: -60, scale: 0, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 10,
              delay: idx * 0.15
            }}
            className={`border rounded flex flex-col items-center justify-center p-2 text-center shadow-low ${b.color || 'bg-slate-800 border-slate-700'}`}
          >
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate max-w-full">
              {b.name || 'Building block'}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
