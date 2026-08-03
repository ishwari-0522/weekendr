'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import WorldPreview from './WorldPreview';

/**
 * WorldCard: Curated presets world previews showcasing title descriptions, quotes.
 */
export default function WorldCard({ world }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!world) return null;

  return (
    <Link href={`/explore/world/${world.id}`} className="block h-full shrink-0">
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-[280px] sm:w-[320px] bg-[#111622] border border-border hover:border-border-highlight/50 rounded-xl overflow-hidden shadow-low hover:shadow-medium hover:-translate-y-1 transition-all duration-300 ease-[var(--ease-premium-out)] flex flex-col h-full text-left relative group cursor-pointer"
      >
        
        {/* Cover Canvas / Mini Living Scene container */}
        <div className="aspect-video w-full relative bg-gradient-to-br from-indigo-950/20 via-slate-900 to-indigo-900/10 flex items-center justify-center border-b border-border/60">
          <div className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest relative z-10">
            {world.title} Presets
          </div>
          
          {/* Subtle live animations overlay */}
          <WorldPreview worldId={world.id} isHovered={isHovered} />
        </div>

        {/* World Card Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-bold tracking-widest text-primary">
              Curated World
            </span>
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition duration-150">
              {world.title}
            </h3>
            <p className="text-[10px] italic text-highlight font-medium leading-relaxed">
              "{world.hero_quote || world.subtitle}"
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {world.description}
            </p>
          </div>

          <div className="border-t border-border/40 pt-3 flex justify-between items-center text-xs font-semibold text-muted-foreground">
            <span>⏱️ {world.default_duration} mins</span>
            <span className="text-[10px] text-primary">Explore World →</span>
          </div>
        </div>

      </div>
    </Link>
  );
}
export { WorldCard };
