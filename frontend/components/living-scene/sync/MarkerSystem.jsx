'use client';

import React from 'react';
import { useSelection } from './SelectionContext';
import MarkerAnimator from './MarkerAnimator';
import { getSpotDetails } from './TimelineSync';

/**
 * Marker System: Renders list of numbered destination pins bound to SelectionContext values.
 */
export default function MarkerSystem({ config = {}, stage = 8 }) {
  const context = useSelection();
  const activeSpotIdx = context ? context.activeSpotIdx : null;
  const hoveredSpotIdx = context ? context.hoveredSpotIdx : null;
  const selectSpot = context ? context.selectSpot : null;

  if (stage < 7) return null;

  // Numbered circles list matching Bookstore (0), Cafe (1), Fountain (2) coordinates
  const markersList = [0, 1, 2].map((idx) => {
    const details = getSpotDetails(idx, config);
    if (!details) return null;
    return {
      index: idx,
      x: details.x,
      y: details.y
    };
  }).filter(Boolean);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {markersList.map((m) => (
        <MarkerAnimator
          key={m.index}
          index={m.index}
          x={m.x}
          y={m.y}
          isSelected={activeSpotIdx === m.index}
          isHovered={hoveredSpotIdx === m.index}
          onClick={() => selectSpot(m.index)}
        />
      ))}
    </div>
  );
}
export { MarkerSystem };
