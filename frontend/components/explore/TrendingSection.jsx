'use client';

import React from 'react';
import PlaceCard from './PlaceCard';

/**
 * TrendingSection: Displays up to 6 trending local destinations cards.
 */
export default function TrendingSection({ places = [] }) {
  if (places.length === 0) return null;

  // Limit to max 6
  const displayPlaces = places.slice(0, 6);

  return (
    <div className="w-full text-left space-y-4">
      <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
        Trending Destinations
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {displayPlaces.map((p) => (
          <PlaceCard key={p.id} place={p} highlightTag="Trending" />
        ))}
      </div>
    </div>
  );
}
export { TrendingSection };
