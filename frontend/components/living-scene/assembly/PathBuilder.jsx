'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Path Builder: Animates ground roads (Stage 3) and glowing recommended routes (Stage 6)
 * using SVG stroke pathLength drawing loops.
 */
export default function PathBuilder({ stage = 0, paths = [], routePoints = [] }) {
  return (
    <svg className="absolute inset-0 w-full h-full z-15 pointer-events-none">
      
      {/* 1. Stage 3: Standard Walking Paths drawing loop */}
      {paths.map((p) => {
        const ctrlX = (p.fromX + p.toX) / 2;
        const ctrlY = Math.max(p.fromY, p.toY) + 8;
        
        return (
          <motion.path
            key={p.id}
            d={`M ${p.fromX}% ${p.fromY}% Q ${ctrlX}% ${ctrlY}% ${p.toX}% ${p.toY}%`}
            fill="none"
            stroke="var(--border)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="4 8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: stage >= 3 ? 1 : 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        );
      })}

      {/* 2. Stage 6: Glowing Recommended Journey Route path */}
      {stage >= 6 && routePoints && routePoints.length > 1 && (
        <>
          {/* Neon Glow underlay */}
          <motion.path
            d={generateSvgPathString(routePoints)}
            fill="none"
            stroke="#6366f1"
            strokeWidth="5"
            strokeLinecap="round"
            className="blur-[4px] opacity-60"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />

          {/* Core crisp light trail */}
          <motion.path
            d={generateSvgPathString(routePoints)}
            fill="none"
            stroke="#e0e7ff"
            strokeWidth="2"
            strokeLinecap="round"
            className="opacity-95"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        </>
      )}

    </svg>
  );
}

// Convert coordinates to curved SVG path string
function generateSvgPathString(points) {
  if (!points || points.length < 2) return '';
  let d = `M ${points[0].x}% ${points[0].y}%`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const ctrlX = (prev.x + curr.x) / 2;
    const ctrlY = Math.max(prev.y, curr.y) + 6;
    d += ` Q ${ctrlX}% ${ctrlY}% ${curr.x}% ${curr.y}%`;
  }
  
  return d;
}
