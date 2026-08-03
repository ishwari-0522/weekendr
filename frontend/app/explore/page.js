'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useExplore } from '../../hooks/useExplore';
import HeroSection from '../../components/explore/HeroSection';
import WorldCarousel from '../../components/explore/WorldCarousel';
import TrendingSection from '../../components/explore/TrendingSection';
import HiddenGemsSection from '../../components/explore/HiddenGemsSection';
import CitySection from '../../components/explore/CitySection';
import EditorialCollection from '../../components/explore/EditorialCollection';
import SearchBar from '../../components/explore/SearchBar';
import PlaceCard from '../../components/explore/PlaceCard';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

/**
 * ExplorePage: discovery and inspiration landing containing carousel lists,
 * search drawers and district filters.
 */
export default function ExplorePage() {
  const { 
    worlds, 
    trending, 
    gems, 
    searchResults, 
    loading, 
    error, 
    loadExploreLanding, 
    search, 
    setSearchResults 
  } = useExplore();

  useEffect(() => {
    loadExploreLanding();
  }, [loadExploreLanding]);

  const handleSearch = (filters) => {
    search(filters);
  };

  const handleClearSearch = () => {
    setSearchResults(null);
  };

  const handleSelectDistrict = (cityName, districtName) => {
    search({ city: cityName, area: districtName });
  };

  const handleSelectTag = (tagName) => {
    search({ tags: [tagName] });
  };

  const featuredWorld = worlds.length > 0 ? worlds[0] : null;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 min-h-[85vh] text-left">
      
      {/* Title typography */}
      <HeroSection />

      {/* Collapsible search drawer */}
      <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />

      {loading ? (
        <div className="space-y-6">
          <SkeletonLoader count={1} className="h-44 w-full" />
          <div className="grid sm:grid-cols-2 gap-4">
            <SkeletonLoader count={1} className="h-40 w-full" />
            <SkeletonLoader count={1} className="h-40 w-full" />
          </div>
        </div>
      ) : error ? (
        <div className="p-3.5 bg-destructive/10 border border-destructive/25 text-destructive rounded text-xs font-semibold">
          ⚠️ {error}
        </div>
      ) : searchResults ? (
        /* Render Search Results index if search query is active */
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
              Search Results ({searchResults.length} match{searchResults.length !== 1 ? 'es' : ''})
            </h3>
            <button
              onClick={handleClearSearch}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Reset Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl italic">
              No matching curated venues found. Try adjusting filters.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {searchResults.map((p) => (
                <PlaceCard key={p.id} place={p} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Master Explore Inspiration Index */
        <div className="space-y-10 animate-fade-in">
          
          {/* Today's Inspiration featured card */}
          {featuredWorld && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                Today's Inspiration
              </h3>
              
              <div className="w-full bg-[#111622] border border-[#6366f1]/25 rounded-xl p-6 sm:p-8 space-y-6 text-left shadow-medium relative overflow-hidden group">
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
                
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-primary">
                    Featured World Presets
                  </span>
                  <h2 className="text-xl font-bold text-foreground">
                    {featuredWorld.title}
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                    {featuredWorld.description}
                  </p>
                </div>

                <div className="border-t border-border/40 pt-4 flex flex-wrap justify-between items-center gap-4">
                  <div className="text-xs text-muted-foreground italic max-w-sm">
                    "{featuredWorld.hero_quote}"
                  </div>

                  <Link href={`/explore/world/${featuredWorld.id}`}>
                    <button className="px-4.5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded hover:opacity-90 active:scale-[0.98] transition cursor-pointer shadow-low">
                      Step Into This World
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Snapping Experience Worlds track */}
          <WorldCarousel worlds={worlds} />

          {/* Thematic Collections */}
          <EditorialCollection onSelectTag={handleSelectTag} />

          {/* Trending destinations */}
          <TrendingSection places={trending} />

          {/* Hidden Gems listings */}
          <HiddenGemsSection places={gems} />

          {/* City district filters links */}
          <CitySection onSelectDistrict={handleSelectDistrict} />

        </div>
      )}

    </div>
  );
}
