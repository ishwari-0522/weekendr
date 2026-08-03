'use client';

import React from 'react';

/**
 * NextStopCard: Small preview card displaying upcoming stop travel indices.
 */
export default function NextStopCard({ stop = null }) {
  if (!stop) {
    return (
      <div className="w-full bg-[#111622] border border-border/60 rounded-xl p-5 text-center text-xs text-muted-foreground italic text-left">
        No upcoming destination. This is your final stop.
      </div>
    );
  }

  return (
    <div className="w-full bg-[#111622]/50 border border-border rounded-xl p-5 space-y-3.5 text-left shadow-low hover:border-border-highlight/40 transition duration-200">
      <div className="space-y-1">
        <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground block">
          Next Destination
        </span>
        <h4 className="text-sm font-bold text-foreground truncate">
          {stop.name || 'Upcoming Stop'}
        </h4>
        <p className="text-xs text-muted-foreground">
          ⏰ Scheduled: {stop.planned_start}
        </p>
      </div>

      <div className="text-[10px] text-muted-foreground bg-secondary/15 px-3 py-2.5 rounded border border-border/40 italic font-semibold max-w-[280px]">
        💬 Only a short walk away.
      </div>
    </div>
  );
}
export { NextStopCard };
