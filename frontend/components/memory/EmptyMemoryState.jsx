'use client';

import React from 'react';
import Link from 'next/link';

/**
 * EmptyMemoryState: Warm, editorial layout shown when the scrapbook list is empty.
 */
export default function EmptyMemoryState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border/80 rounded-xl bg-card/20 text-center max-w-lg mx-auto space-y-5">
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-foreground">You haven't filled your Memory Book yet.</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Some weekends are meant to be remembered. Generate an itinerary on the drawing board and save it to begin writing your stories.
        </p>
      </div>

      <Link href="/design">
        <button className="px-5 py-3 bg-primary hover:opacity-90 active:scale-[0.98] text-primary-foreground text-xs font-bold rounded transition-all cursor-pointer shadow-low">
          Design Your First Day
        </button>
      </Link>
    </div>
  );
}
export { EmptyMemoryState };
