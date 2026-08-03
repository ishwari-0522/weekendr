'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSelection } from './SelectionContext';

/**
 * Route Highlighter: Animates a travelling light pulse along journey paths
 * reading active/hovered statuses from SelectionContext.
 */
export default function RouteHighlighter({ routePoints = [], stage = 8 }) {
  const context = useSelection();
  const activeSpotIdx = context ? context.activeSpotIdx : null;
  const hoveredSpotIdx = context ? context.hoveredSpotIdx : null;

  if (stage < 6 || !routePoints || routePoints.length < 2) return null;

  const pathD = generateSvgPathString(routePoints);
  const isAnyFocus = activeSpotIdx !== null || hoveredSpotIdx !== null;
  const baseOpacity = isAnyFocus ? 0.8 : 0.45;

  return (
    <svg className="absolute inset-0 w-full h-full z-15 pointer-events-none">
      
      {/* Underlying base glowing path */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#6366f1"
        strokeWidth="3.5"
        strokeLinecap="round"
        animate={{ opacity: baseOpacity }}
        transition={{ duration: 0.35 }}
      />

      {/* Traveling light pulse animation loop */}
      {stage >= 8 && (
        <path
          d={pathD}
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="12 180"
          strokeDashoffset="192"
          className="opacity-95"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="192;0"
            dur="4.5s"
            repeatCount="indefinite"
          />
        </path>
      )}

    </svg>
  );
}

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
export { RouteHighlighter };
