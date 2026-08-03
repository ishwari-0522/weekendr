'use client';

import React from 'react';
import useAuth from '../../hooks/useAuth';

/**
 * ProfileHeader: Typographic profile avatar title card showing user names and registration offsets.
 */
export default function ProfileHeader({ memoriesCount = 0, favoriteWorld = 'None', favoriteCity = 'None' }) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-[#111622] border border-border rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 text-left shadow-low">
      
      {/* Big avatar bubble */}
      <div className="w-16 h-16 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xl font-black uppercase shrink-0 select-none">
        {user.full_name ? user.full_name[0] : 'U'}
      </div>

      <div className="space-y-2.5 flex-1 min-w-0 text-center sm:text-left">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            {user.full_name || 'Ishwari'}
          </h2>
          <p className="text-xs text-muted-foreground">
            WEEKENDR Voyager • Member since July 2026
          </p>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-[10px] font-bold text-muted-foreground">
          <span className="bg-secondary/15 px-2.5 py-1 rounded border border-border/40">
            📖 {memoriesCount} Memory{memoriesCount !== 1 ? 'ies' : ''}
          </span>
          <span className="bg-secondary/15 px-2.5 py-1 rounded border border-border/40">
            🌎 Fav World: {favoriteWorld}
          </span>
          <span className="bg-secondary/15 px-2.5 py-1 rounded border border-border/40">
            📍 City: {favoriteCity}
          </span>
        </div>
      </div>

    </div>
  );
}
export { ProfileHeader };
