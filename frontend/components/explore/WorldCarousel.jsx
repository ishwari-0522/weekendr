'use client';

import React from 'react';
import WorldCard from './WorldCard';

/**
 * WorldCarousel: Horizontal track supporting snapping scroll indexes sways.
 */
export default function WorldCarousel({ worlds = [] }) {
  if (worlds.length === 0) return null;

  return (
    <div className="w-full text-left space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
          Experience Worlds
        </h3>
        <span className="text-[10px] text-muted-foreground">Swipe to browse →</span>
      </div>

      {/* Snap Scroll track */}
      <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 scroll-smooth">
        {worlds.map((w) => (
          <div key={w.id} className="snap-start shrink-0">
            <WorldCard world={w} />
          </div>
        ))}
      </div>

      {/* Styled scrollbar hider */}
      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
export { WorldCarousel };
