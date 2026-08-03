'use client';

import React from 'react';

/**
 * NotificationEmptyState: Blank state screen with editorial typography.
 */
export default function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3.5 max-w-xs mx-auto animate-fade-in">
      <span className="text-xl">✉️</span>
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">No new notes from WEEKENDR.</h4>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          We'll let you know when something worth remembering comes up.
        </p>
      </div>
    </div>
  );
}
export { NotificationEmptyState };
