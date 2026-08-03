'use client';

import React from 'react';

/**
 * Focus Manager: Softens elements elsewhere in the scene when a region is hovered/focused.
 * Inserts a dimming backdrop mask at z-35, elevating the focused elements above it to z-50.
 */
export default function FocusManager({ focusedZoneId = null }) {
  return (
    <div 
      className={`absolute inset-0 bg-[#080b11]/35 pointer-events-none transition-opacity duration-[500ms] ${
        focusedZoneId ? 'opacity-100 z-35' : 'opacity-0 z-0'
      }`}
      aria-hidden="true"
    />
  );
}
