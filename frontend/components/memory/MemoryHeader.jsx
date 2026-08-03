'use client';

import React from 'react';

/**
 * MemoryHeader: Scrapbook header display with large typography styles.
 */
export default function MemoryHeader() {
  return (
    <div className="text-left space-y-2 border-b border-border/40 pb-6 mb-8">
      <h1 className="page-title text-foreground tracking-tight text-3xl font-extrabold uppercase">
        Memory Book
      </h1>
      <p className="text-sm text-muted-foreground italic font-medium">
        "Some weekends become stories."
      </p>
    </div>
  );
}
export { MemoryHeader };
