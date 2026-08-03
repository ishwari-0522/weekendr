'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useExplore } from '../../../../hooks/useExplore';
import PlaceCard from '../../../../components/explore/PlaceCard';
import SkeletonLoader from '../../../../components/ui/SkeletonLoader';

/**
 * WorldDetailPage: Curated world detail page displaying hero quote, description,
 * recommended areas list and matching place cards.
 */
export default function WorldDetailPage() {
  const { id } = useParams();
  const { loadWorldDetail } = useExplore();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    const res = await loadWorldDetail(id);
    if (res.success) {
      setDetail(res.data);
    } else {
      setError(res.message || 'World not found.');
    }
    setLoading(false);
  }, [id, loadWorldDetail]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        <SkeletonLoader count={1} className="h-10 w-1/3" />
        <SkeletonLoader count={3} className="h-44 w-full" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="p-3.5 bg-destructive/10 border border-destructive/25 text-destructive rounded text-xs font-semibold">
          ⚠️ {error || 'Failed to load world.'}
        </div>
        <Link href="/explore" className="text-primary hover:underline text-xs font-bold">
          ← Back to Explore
        </Link>
      </div>
    );
  }

  const { world, featured_places, recommended_areas } = detail;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 min-h-[85vh] text-left animate-fade-in">
      
      {/* Back navigation */}
      <Link href="/explore" className="text-xs text-muted-foreground hover:text-foreground font-bold transition">
        ← Discovery Board
      </Link>

      {/* World header display details */}
      <div className="w-full bg-[#111622] border border-border rounded-xl p-6 sm:p-8 space-y-6 text-left shadow-medium relative overflow-hidden group">
        <div className="space-y-3.5">
          <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded">
            Curated Presets World
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
            {world.title}
          </h2>
          <p className="body-large text-muted-foreground italic leading-relaxed">
            "{world.hero_quote || world.subtitle}"
          </p>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            {world.description}
          </p>
        </div>

        {/* CTA Design My Day preselecting template */}
        <div className="border-t border-border/40 pt-5 flex flex-wrap justify-between items-center gap-4">
          <div className="text-xs text-muted-foreground">
            Default duration: <span className="font-bold text-foreground">{world.default_duration} mins</span>
          </div>

          <Link href={`/design?template=${encodeURIComponent(world.title)}`}>
            <button className="px-5 py-3.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition cursor-pointer shadow-medium uppercase tracking-widest">
              Design My Day
            </button>
          </Link>
        </div>
      </div>

      {/* Grid displays recommended areas and places */}
      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Curated place details cards (8/12 cols) */}
        <div className="md:col-span-8 space-y-6">
          <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
            Featured Destinations ({featured_places.length})
          </h3>

          {featured_places.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground italic border border-dashed border-border rounded-xl">
              No destinations currently featured in this world.
            </div>
          ) : (
            <div className="space-y-4">
              {featured_places.map((p) => (
                <PlaceCard key={p.id} place={p} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recommended districts/areas (4/12 cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-[#111622] border border-border rounded-xl p-5 space-y-3.5 shadow-low">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Recommended Districts
            </h4>
            
            {recommended_areas.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic">No specific areas recommended.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {recommended_areas.map((area) => (
                  <span 
                    key={area}
                    className="text-[9px] bg-secondary/15 border border-border px-2.5 py-1.5 rounded text-foreground font-bold"
                  >
                    📍 {area}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
