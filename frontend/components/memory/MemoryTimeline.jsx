'use client';

import React from 'react';

/**
 * MemoryTimeline: Chronological activity list layout showing timeline stops details of a memory.
 */
export default function MemoryTimeline({ timelineJson }) {
  const segments = timelineJson?.segments || [];
  const activities = segments.filter((s) => s.type === 'activity');

  if (activities.length === 0) {
    return <div className="text-xs text-muted-foreground">No stops in this itinerary.</div>;
  }

  return (
    <div className="relative border-l border-border ml-2 space-y-5 py-2 text-left">
      {activities.map((act, idx) => (
        <div key={idx} className="relative pl-6 group">
          {/* Index bullet indicator */}
          <div className="absolute left-0 top-1.5 -translate-x-[4.5px] w-2.5 h-2.5 bg-[#111622] border-2 border-primary rounded-full" />
          
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground block">
              ⏰ {act.arrival_time} - {act.departure_time}
            </span>
            <h4 className="text-xs font-bold text-foreground">
              {act.name}
            </h4>
            <span className="text-[9px] uppercase font-bold text-primary tracking-wide">
              {act.category}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
export { MemoryTimeline };
