'use client';

import React from 'react';
import PlaceCard from './PlaceCard';

/**
 * HiddenGemsSection: Displays local hidden gems with local recommendation explanations.
 */
export default function HiddenGemsSection({ places = [] }) {
  if (places.length === 0) return null;

  // Determine why-featured tag based on category
  const getWhyFeaturedTag = (p) => {
    const cat = (p.category || '').toLowerCase();
    if (cat.includes('cafe')) return 'Perfect for quiet afternoons';
    if (cat.includes('bookstore')) return 'Beloved by local readers';
    if (cat.includes('dessert')) return 'Hidden sweet sanctuary';
    if (cat.includes('gaming')) return 'Lively group hangout';
    return 'Beloved by locals';
  };

  return (
    <div className="w-full text-left space-y-4">
      <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
        Hidden Gems
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {places.map((p) => (
          <PlaceCard 
            key={p.id} 
            place={p} 
            highlightTag="Hidden Gem" 
            explanation={getWhyFeaturedTag(p)}
          />
        ))}
      </div>
    </div>
  );
}
export { HiddenGemsSection };
