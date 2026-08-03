'use client';

import React from 'react';

/**
 * Renders flat placeholder ground slabs and curved SVG pathways connecting areas.
 */
export default function GroundLayer({ groundType = 'flat-slab', paths = [] }) {
  const getGroundColor = () => {
    switch (groundType) {
      case 'flat-clay':
        return 'bg-amber-950/20 border-amber-900/30';
      case 'concrete':
        return 'bg-slate-800/40 border-slate-700/45';
      case 'garden':
        return 'bg-emerald-950/20 border-emerald-900/30';
      case 'water-bank':
        return 'bg-cyan-950/15 border-cyan-900/25';
      default:
        return 'bg-slate-900/30 border-slate-800/40';
    }
  };

  return (
    <div className="absolute inset-0 z-0">
      
      {/* 1. Curved Pedestrian Paths (SVG layer scaling with aspect-ratio) */}
      {paths && paths.length > 0 && (
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-40">
          {paths.map((p) => {
            // Calculate a control point to curve the path slightly downward
            const ctrlX = (p.fromX + p.toX) / 2;
            const ctrlY = Math.max(p.fromY, p.toY) + 8; // curve dip factor
            
            return (
              <path
                key={p.id}
                d={`M ${p.fromX}% ${p.fromY}% Q ${ctrlX}% ${ctrlY}% ${p.toX}% ${p.toY}%`}
                fill="none"
                stroke="var(--border)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="4 8"
                className="transition-all duration-1000"
              />
            );
          })}
        </svg>
      )}

      {/* 2. Main floating island ground platform (Layer 0 slab bottom) */}
      <div className="absolute bottom-6 inset-x-8 h-24 z-0">
        <div 
          className={`w-full h-full border rounded-xl transition-all duration-1000 shadow-low ${getGroundColor()}`}
          aria-hidden="true"
        />
      </div>

    </div>
  );
}
