'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getAbsolutePositionStyles } from './sceneUtils';

/**
 * Renders nature and environmental details (trees, benches, street lamps, chalkboards)
 * with spring grow-up animations and glowing lamp elements.
 */
export default function NatureLayer({ nature = [] }) {
  if (!nature || nature.length === 0) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {nature.map((n, idx) => {
        const styles = getAbsolutePositionStyles(n.x, n.y, n.width, n.height);

        // 1. Tree
        if (n.type === 'tree') {
          return (
            <motion.div
              key={n.id}
              style={{
                position: 'absolute',
                left: `${n.x}%`,
                top: `${n.y}%`
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 90,
                damping: 9,
                delay: idx * 0.08
              }}
              className="flex flex-col items-center -translate-x-1/2 -translate-y-full"
            >
              <div 
                className={`rounded-full border border-green-800/40 shadow-low ${n.color || 'bg-emerald-800/80'}`}
                style={{ width: `${n.size || 14}px`, height: `${n.size || 14}px` }}
              />
              <div className="w-[1.5px] h-3.5 bg-amber-900/60" />
            </motion.div>
          );
        }

        // 2. Bush
        if (n.type === 'bush') {
          return (
            <motion.div
              key={n.id}
              style={{
                position: 'absolute',
                left: `${n.x}%`,
                top: `${n.y}%`
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 110,
                damping: 7,
                delay: idx * 0.05
              }}
              className={`rounded-full border border-green-900/20 -translate-x-1/2 -translate-y-full ${n.color || 'bg-emerald-900/60'}`}
              style={{ width: `${n.size || 8}px`, height: `${n.size || 6}px` }}
            />
          );
        }

        // 3. Pond (Fountain)
        if (n.type === 'pond') {
          return (
            <motion.div
              key={n.id}
              style={styles}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className={`border rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 ${n.color || 'bg-blue-900/30 border-blue-800/20'}`}
            >
              <span className="text-[7px] text-blue-300 font-bold uppercase tracking-wider">Water</span>
            </motion.div>
          );
        }

        // 4. Bench
        if (n.type === 'bench') {
          return (
            <motion.div
              key={n.id}
              style={styles}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: idx * 0.1 }}
              className="border border-amber-800/30 bg-amber-900/50 rounded-sm shadow-low flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            >
              {/* Miniature seat backrest plank */}
              <div className="w-[90%] h-[1.5px] bg-amber-800/30 absolute top-[1px]" />
            </motion.div>
          );
        }

        // 5. Street Lamp (Pulsing Glow node)
        if (n.type === 'lamp') {
          return (
            <motion.div
              key={n.id}
              style={{
                position: 'absolute',
                left: `${n.x}%`,
                top: `${n.y}%`
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className="flex flex-col items-center -translate-x-1/2 -translate-y-full"
            >
              {/* Lamp head bulb with breathing pulsing brightness */}
              <motion.div
                animate={{ opacity: [0.65, 0.95, 0.65] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="w-2.5 h-2.5 bg-yellow-500/90 rounded-full border border-yellow-300 shadow-[0_0_8px_rgba(234,179,8,0.7)]"
              />
              {/* Lamp post rod */}
              <div className="w-[1.5px] h-6 bg-slate-600/80" />
            </motion.div>
          );
        }

        // 6. Bicycle parked outline
        if (n.type === 'bicycle') {
          return (
            <motion.div
              key={n.id}
              style={{
                position: 'absolute',
                left: `${n.x}%`,
                top: `${n.y}%`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-4 h-3 border border-slate-600 bg-slate-800/50 rounded-sm -translate-x-1/2 -translate-y-full flex items-center justify-center shadow-low"
            >
              <span className="text-[6px] text-slate-500 font-bold scale-90">🚲</span>
            </motion.div>
          );
        }

        // 7. Chalkboard menu stand
        if (n.type === 'chalkboard') {
          return (
            <motion.div
              key={n.id}
              style={{
                position: 'absolute',
                left: `${n.x}%`,
                top: `${n.y}%`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-3.5 h-5 border border-slate-700 bg-slate-900 rounded-sm -translate-x-1/2 -translate-y-full flex flex-col items-center justify-center p-0.5 shadow-low"
            >
              {/* Slate board */}
              <div className="w-full h-full bg-[#111622] rounded-[1px] border border-amber-900/30 flex items-center justify-center">
                <span className="text-[5px] text-slate-400 font-extrabold uppercase scale-75">Menu</span>
              </div>
            </motion.div>
          );
        }

        return null;
      })}
    </div>
  );
}
