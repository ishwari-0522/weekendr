'use client';

import React from 'react';

/**
 * NotificationSkeleton: Loading placeholder matching card shapes.
 */
export default function NotificationSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card/45 border border-border/40 rounded-xl p-4.5 space-y-3 animate-pulse">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-secondary/35 rounded w-1/3" />
              <div className="h-2.5 bg-secondary/25 rounded w-full" />
              <div className="h-2.5 bg-secondary/25 rounded w-5/6" />
            </div>
            <div className="w-2.5 h-2.5 bg-secondary/20 rounded-full shrink-0" />
          </div>
          <div className="h-2 bg-secondary/20 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}
export { NotificationSkeleton };
