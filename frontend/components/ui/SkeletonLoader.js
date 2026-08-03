'use client';

import React from 'react';

export default function SkeletonLoader({ lines = 3 }) {
  const lineItems = Array.from({ length: lines });

  return (
    <div className="w-full space-y-3 animate-pulse max-w-sm mx-auto p-4 border border-border bg-card/30 rounded">
      {lineItems.map((_, idx) => {
        const widths = ['w-3/4', 'w-full', 'w-5/6', 'w-2/3'];
        const wClass = widths[idx % widths.length];
        
        return (
          <div
            key={idx}
            className={`h-3 bg-muted rounded ${wClass}`}
          ></div>
        );
      })}
    </div>
  );
}
