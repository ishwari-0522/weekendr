'use client';

import React from 'react';
import { getAbsolutePositionStyles } from '../sceneUtils';

/**
 * Hover Zones: Renders absolute, invisible overlay blocks mapping interaction boundaries.
 * Enables keyboard accessibility focus via tabIndex.
 */
export default function HoverZones({ 
  zones = [], 
  focusedZoneId = null,
  onZoneHover,
  onZoneLeave,
  onZoneClick
}) {
  if (!zones || zones.length === 0) return null;

  return (
    <div className="absolute inset-0 z-45">
      {zones.map((z) => {
        const styles = getAbsolutePositionStyles(z.x, z.y, z.width || 12, z.height || 12);
        const isFocused = focusedZoneId === z.id;

        return (
          <div
            key={z.id}
            style={styles}
            tabIndex={0}
            aria-label={`Interactive ${z.label || 'zone'}`}
            onMouseEnter={() => onZoneHover(z.id)}
            onMouseLeave={() => onZoneLeave(z.id)}
            onFocus={() => onZoneHover(z.id)}
            onBlur={() => onZoneLeave(z.id)}
            onClick={() => onZoneClick && onZoneClick(z.id)}
            className={`cursor-pointer rounded transition duration-[300ms] outline-none ${
              isFocused 
                ? 'border border-primary/20 bg-primary/5 ring-1 ring-primary/10 shadow-medium z-50' 
                : 'border border-transparent z-45'
            }`}
          />
        );
      })}
    </div>
  );
}
