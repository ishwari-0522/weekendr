'use client';

import React from 'react';

/**
 * FavoriteWorldCard: Highlights the favorite world matching user stats with quotes.
 */
export default function FavoriteWorldCard({ favoriteWorld = 'None' }) {
  const getQuote = (world) => {
    switch (world) {
      case 'Coffee & Conversations': return 'A quiet table, a warm cup, and hours that stretch on.';
      case 'Date Night': return 'The evening dims, the city glows, and time slows down.';
      case 'Game On': return 'Level up your night with friends and play.';
      case 'Food Trail': return 'Every bite tells a story of local spices and traditions.';
      default: return 'Some weekends become stories.';
    }
  };

  const getThemeColor = (world) => {
    switch (world) {
      case 'Coffee & Conversations': return 'from-indigo-950/20 to-indigo-900/10 border-indigo-500/20';
      case 'Date Night': return 'from-rose-950/20 to-rose-900/10 border-rose-500/20';
      case 'Game On': return 'from-violet-950/20 to-violet-900/10 border-violet-500/20';
      case 'Food Trail': return 'from-amber-950/20 to-amber-900/10 border-amber-500/20';
      default: return 'from-slate-900/30 to-slate-950/10 border-border';
    }
  };

  const quote = getQuote(favoriteWorld);
  const theme = getThemeColor(favoriteWorld);

  return (
    <div className={`w-full bg-[#111622] border rounded-xl p-6 text-left shadow-low relative overflow-hidden bg-gradient-to-br ${theme}`}>
      <div className="space-y-3.5 relative z-10">
        <span className="text-[9px] uppercase font-bold tracking-widest text-primary">
          Favorite Experience World
        </span>
        
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">
            {favoriteWorld || 'Slow Wandering'}
          </h3>
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            "{quote}"
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground">
          This preset template will be suggested as your default workspace layout.
        </p>
      </div>
    </div>
  );
}
export { FavoriteWorldCard };
