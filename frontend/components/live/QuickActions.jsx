'use client';

import React from 'react';

/**
 * QuickActions: Layout container for maps redirects, skips, reflections, and snapshot triggers.
 */
export default function QuickActions({ 
  onSkip, 
  onAddReflection, 
  onUploadPhoto, 
  disableActions = false 
}) {
  const handleMapsClick = () => {
    // Redirect to mock Google Maps navigation
    window.open('https://maps.google.com', '_blank');
  };

  return (
    <div className="w-full bg-[#111622] border border-border rounded-xl p-5 space-y-4 text-left shadow-low">
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        Quick Outing Shortcuts
      </h4>

      <div className="grid grid-cols-2 gap-3.5">
        <button
          onClick={handleMapsClick}
          className="p-3 bg-secondary/20 hover:bg-secondary/40 border border-border hover:border-primary/45 rounded-lg flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition duration-150"
        >
          <span className="text-sm">🗺️</span>
          <span className="text-[10px] font-bold text-foreground">Open in Maps</span>
        </button>

        <button
          disabled={disableActions}
          onClick={onSkip}
          className="p-3 bg-secondary/20 hover:bg-secondary/40 border border-border hover:border-destructive/35 rounded-lg flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="text-sm">⏭️</span>
          <span className="text-[10px] font-bold text-foreground">Skip Stop</span>
        </button>

        <button
          onClick={onAddReflection}
          className="p-3 bg-secondary/20 hover:bg-secondary/40 border border-border hover:border-primary/45 rounded-lg flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition duration-150"
        >
          <span className="text-sm">💬</span>
          <span className="text-[10px] font-bold text-foreground">Add Reflection</span>
        </button>

        <button
          onClick={onUploadPhoto}
          className="p-3 bg-secondary/20 hover:bg-secondary/40 border border-border hover:border-primary/45 rounded-lg flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition duration-150"
        >
          <span className="text-sm">📸</span>
          <span className="text-[10px] font-bold text-foreground">Upload Photo</span>
        </button>
      </div>

    </div>
  );
}
export { QuickActions };
