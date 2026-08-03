'use client';

import React from 'react';

/**
 * CurrentStopCard: Large featured check-in card showing active destination details.
 */
export default function CurrentStopCard({ stop = null, onCheckIn }) {
  if (!stop) {
    return (
      <div className="w-full p-8 border border-border rounded-xl bg-card/20 text-center text-xs text-muted-foreground italic text-left">
        No active stop.
      </div>
    );
  }

  const isCheckedIn = stop.status === 'completed';

  return (
    <div className="w-full bg-[#111622] border border-[#6366f1]/25 rounded-xl p-6 sm:p-8 space-y-6 text-left shadow-medium relative overflow-hidden group">
      
      {/* Subtle indicator beacon pulse */}
      <div className="absolute top-6 right-6 flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${
          isCheckedIn ? 'bg-primary shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse' : 'bg-highlight shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse'
        }`} />
        <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">
          {isCheckedIn ? 'Checked In' : 'Active Stop'}
        </span>
      </div>

      <div className="space-y-2">
        <span className="text-[9px] uppercase font-bold tracking-widest text-primary">
          Stop #{stop.order_index + 1}
        </span>
        <h2 className="text-xl font-bold text-foreground leading-snug">
          {stop.name || 'Current Destination'}
        </h2>
        <p className="text-xs text-muted-foreground">
          ⏰ Scheduled: {stop.planned_start} - {stop.planned_end}
        </p>
      </div>

      <div className="border-t border-border/40 pt-4 flex flex-wrap justify-between items-center gap-4">
        <div className="text-xs text-muted-foreground italic max-w-sm">
          {isCheckedIn 
            ? "Enjoy your time here. Capture a snapshot or write a reflection when you are ready."
            : "Once you arrive, tap the check-in button below to mark your progress."
          }
        </div>

        {!isCheckedIn ? (
          <button
            onClick={onCheckIn}
            className="px-5 py-3 bg-primary text-primary-foreground text-xs font-bold rounded hover:opacity-90 active:scale-[0.98] transition duration-200 cursor-pointer shadow-low"
          >
            I'm Here
          </button>
        ) : (
          <span className="text-xs font-bold text-primary italic">
            Enjoy your time.
          </span>
        )}
      </div>

    </div>
  );
}
export { CurrentStopCard };
