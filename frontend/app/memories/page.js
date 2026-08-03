'use client';

import React, { useEffect } from 'react';
import ProtectedRoute from '../../middleware/ProtectedRoute';
import { useMemories } from '../../hooks/useMemories';
import MemoryHeader from '../../components/memory/MemoryHeader';
import UpcomingCard from '../../components/memory/UpcomingCard';
import MemoryCard from '../../components/memory/MemoryCard';
import EmptyMemoryState from '../../components/memory/EmptyMemoryState';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

/**
 * MemoriesPage: Master scrapbook dashboard list view guarded by authentication token check.
 */
export default function MemoriesPage() {
  const { memories, loading, error, fetchMemories } = useMemories();

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  // Separate upcoming and past memories
  const upcomingMemories = memories.filter((m) => m.status === 'upcoming');
  const pastMemories = memories.filter((m) => m.status === 'completed' || m.status === 'draft');

  // Featured upcoming is the closest first record
  const featuredUpcoming = upcomingMemories.length > 0 ? upcomingMemories[0] : null;

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 min-h-[80vh]">
        
        {/* Page Typography Header */}
        <MemoryHeader />

        {loading ? (
          /* Skeletons loader matching card formats */
          <div className="space-y-6">
            <SkeletonLoader count={1} className="h-32 w-full" />
            <div className="grid sm:grid-cols-2 gap-4">
              <SkeletonLoader count={1} className="h-48 w-full" />
              <SkeletonLoader count={1} className="h-48 w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="p-3.5 bg-destructive/10 border border-destructive/25 text-destructive rounded text-xs font-semibold">
            ⚠️ {error}
          </div>
        ) : memories.length === 0 ? (
          <EmptyMemoryState />
        ) : (
          <div className="space-y-8 animate-fade-in">
            
            {/* Upcoming Outing Block (If any exist) */}
            {featuredUpcoming && (
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground text-left">
                  Upcoming Adventure
                </h3>
                <UpcomingCard memory={featuredUpcoming} />
              </div>
            )}

            {/* Past Scrapbook Memories Grid */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground text-left">
                Past Journeys
              </h3>
              
              {pastMemories.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground border border-border rounded-xl bg-card/10 italic">
                  No past memories saved yet. Check off your upcoming outing to capture details.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {pastMemories.map((m) => (
                    <MemoryCard key={m.id} memory={m} />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
