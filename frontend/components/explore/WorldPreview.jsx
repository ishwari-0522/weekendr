'use client';

import React from 'react';

/**
 * WorldPreview: Cinematic mini animation visual overlays (steam, lights, leaves) based on worlds presets.
 */
export default function WorldPreview({ worldId = '', isHovered = false }) {
  if (!isHovered) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-xl bg-slate-950/20">
      
      {/* Coffee Steam Animation */}
      {worldId === 'coffee-conversations' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 justify-center">
          <span className="w-1.5 h-6 bg-foreground/10 rounded-full blur-[3px] animate-[steam_2s_infinite_ease-in-out]" />
          <span className="w-1.5 h-6 bg-foreground/10 rounded-full blur-[3px] animate-[steam_2s_infinite_ease-in-out_0.5s]" />
          <span className="w-1.5 h-6 bg-foreground/10 rounded-full blur-[3px] animate-[steam_2s_infinite_ease-in-out_1s]" />
        </div>
      )}

      {/* Date Night Candlelight Glow */}
      {worldId === 'date-night' && (
        <div className="absolute inset-0 bg-rose-500/5 mix-blend-color-dodge animate-[pulse_3s_infinite_ease-in-out]" />
      )}

      {/* Game On Neon Particles */}
      {worldId === 'game-on' && (
        <div className="absolute inset-0">
          <span className="absolute top-4 left-6 w-1 h-1 bg-primary rounded-full animate-ping" />
          <span className="absolute bottom-6 right-10 w-1 h-1 bg-highlight rounded-full animate-ping [animation-delay:0.5s]" />
          <span className="absolute top-10 right-4 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping [animation-delay:1s]" />
        </div>
      )}

      {/* Food Trail Hot Grills */}
      {worldId === 'food-trail' && (
        <div className="absolute bottom-2 left-1/3 right-1/3 h-8 bg-amber-500/5 blur-md rounded animate-pulse" />
      )}

      {/* CSS Keyframes for Steam */}
      <style jsx global>{`
        @keyframes steam {
          0% {
            transform: translateY(0) scaleX(1);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
            transform: translateY(-10px) scaleX(1.2);
          }
          100% {
            transform: translateY(-25px) scaleX(0.8);
            opacity: 0;
          }
        }
      `}</style>

    </div>
  );
}
export { WorldPreview };
