'use client';

import React from 'react';

/**
 * HeroSection: Large typography heading for the discovery dashboard.
 */
export default function HeroSection() {
  return (
    <div className="text-left space-y-2 border-b border-border/40 pb-6 mb-8">
      <h1 className="page-title text-foreground tracking-tight text-3xl font-extrabold uppercase">
        Explore
      </h1>
      <p className="text-sm text-muted-foreground italic font-medium">
        "Find your next favorite day."
      </p>
    </div>
  );
}
export { HeroSection };
