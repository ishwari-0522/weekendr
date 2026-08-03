'use client';

import React from 'react';

/**
 * EditorialCollection: Showcases curated thematic collections.
 */
export default function EditorialCollection({ onSelectTag }) {
  const collections = [
    {
      title: 'Slow Sunday Mornings',
      quote: 'Quiet corners, cozy benches, and warm roasts.',
      tag: 'Cozy',
      bgGradient: 'from-amber-950/20 to-amber-900/10'
    },
    {
      title: 'Romantic Twilight Catch-ups',
      quote: 'Views that stretch, dim candles, and twilight whispers.',
      tag: 'Romantic',
      bgGradient: 'from-rose-950/20 to-rose-900/10'
    },
    {
      title: 'Fun competitive meetups',
      quote: 'Arcades, board games, and lively chatter.',
      tag: 'Fun',
      bgGradient: 'from-violet-950/20 to-violet-900/10'
    }
  ];

  return (
    <div className="w-full text-left space-y-4">
      <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
        Curated Collections
      </h3>

      <div className="grid sm:grid-cols-3 gap-4">
        {collections.map((col) => (
          <div
            key={col.title}
            onClick={() => onSelectTag && onSelectTag(col.tag)}
            className={`bg-[#111622] border border-border hover:border-primary/45 rounded-xl p-5 space-y-2.5 shadow-low hover:shadow-medium cursor-pointer transition duration-300 relative overflow-hidden group bg-gradient-to-br ${col.bgGradient}`}
          >
            <div className="space-y-1 relative z-10">
              <span className="text-[8px] uppercase font-black tracking-widest text-primary">
                Collection
              </span>
              <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition duration-150">
                {col.title}
              </h4>
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                "{col.quote}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export { EditorialCollection };
