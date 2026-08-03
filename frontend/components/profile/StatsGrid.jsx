'use client';

import React from 'react';

/**
 * StatsGrid: Renders a lightweight, visual 3-column stats panel.
 */
export default function StatsGrid({ stats }) {
  if (!stats) return null;

  const statItems = [
    { label: 'Days Designed', value: stats.daysDesigned, icon: '🗓️' },
    { label: 'Memories Created', value: stats.memoriesCreated, icon: '📖' },
    { label: 'Places Visited', value: stats.placesVisited, icon: '📍' },
    { label: 'Cities Explored', value: stats.citiesExplored, icon: '🗺️' },
    { label: 'Favorite Preset', value: stats.favoriteTemplate, icon: '✨' },
    { label: 'Average Rating', value: `${stats.averageRating} ★`, icon: '★' }
  ];

  return (
    <div className="w-full text-left space-y-4">
      <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
        Journey Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4.5">
        {statItems.map((s) => (
          <div key={s.label} className="bg-[#111622] border border-border rounded-xl p-5 space-y-1.5 shadow-low">
            <span className="text-sm">{s.icon}</span>
            <div className="space-y-0.5">
              <span className="text-lg font-black text-foreground block">
                {s.value}
              </span>
              <span className="text-[9px] uppercase font-bold text-muted-foreground block tracking-wider">
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export { StatsGrid };
