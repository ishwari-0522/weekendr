'use client';

import React from 'react';
import Link from 'next/link';

/**
 * MemoryCard: Vertical editorial scrapbook card layout displaying completed outings.
 */
export default function MemoryCard({ memory }) {
  if (!memory) return null;

  // Star rating helper
  const renderStars = (ratingVal) => {
    const val = ratingVal || 0;
    return (
      <div className="flex gap-0.5 text-highlight">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className="text-sm">
            {s <= val ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <Link href={`/memories/${memory.id}`} className="block">
      <div className="bg-[#111622] border border-border hover:border-border-highlight/50 rounded-xl overflow-hidden shadow-low hover:shadow-medium hover:-translate-y-1 transition-all duration-300 ease-[var(--ease-premium-out)] flex flex-col h-full text-left group">
        
        {/* Cover Photo Placeholder / Gradient Visual */}
        <div className="aspect-video w-full relative bg-gradient-to-br from-indigo-950/20 via-slate-900 to-indigo-900/10 flex items-center justify-center border-b border-border/60">
          {memory.cover_photo ? (
            <img 
              src={memory.cover_photo} 
              alt={memory.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          ) : (
            <div className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest">
              📖 Memory Book
            </div>
          )}
          {memory.photo_count > 0 && (
            <span className="absolute bottom-2 right-2 bg-slate-950/75 border border-border/40 text-[9px] font-bold px-2 py-0.5 rounded text-foreground">
              📸 {memory.photo_count} Photo{memory.photo_count > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Content Details */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-2">
              <span className="text-[9px] uppercase font-bold tracking-widest text-primary">
                {memory.experience_template || 'Outing'}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {memory.planned_date}
              </span>
            </div>

            <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition duration-150">
              {memory.title}
            </h3>
            
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {memory.reflection || 'No thoughts recorded yet. Tap to write a memory.'}
            </p>
          </div>

          <div className="border-t border-border/40 pt-3 flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-semibold text-[10px]">
              📍 {memory.city || 'Pune'}
            </span>
            {renderStars(memory.rating)}
          </div>
        </div>

      </div>
    </Link>
  );
}
export { MemoryCard };
