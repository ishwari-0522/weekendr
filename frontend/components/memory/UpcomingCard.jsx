'use client';

import React from 'react';
import Link from 'next/link';

/**
 * UpcomingCard: Features the next chronological planned outing with template details.
 */
export default function UpcomingCard({ memory }) {
  if (!memory) return null;

  // Calculate day difference countdown
  const getDaysCountdown = (dateStr) => {
    if (!dateStr) return 'Upcoming';
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const target = new Date(dateStr);
      target.setHours(0, 0, 0, 0);
      const diffTime = target - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays > 1) return `In ${diffDays} days`;
      return 'Completed recently';
    } catch (e) {
      return 'Upcoming';
    }
  };

  const countdown = getDaysCountdown(memory.planned_date);

  return (
    <div className="w-full bg-[#111622] border border-[#6366f1]/25 hover:border-[#6366f1]/40 rounded-xl p-6 sm:p-8 space-y-6 text-left shadow-medium transition-all duration-300 relative overflow-hidden group">
      
      {/* Decorative background pulse glow */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
      
      <div className="flex flex-wrap justify-between items-start gap-4 border-b border-border/40 pb-4 relative z-10">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded">
            {countdown}
          </span>
          <h2 className="text-xl font-bold text-foreground mt-2">
            {memory.title}
          </h2>
          <p className="text-xs text-muted-foreground">
            {memory.experience_template} Outing • {memory.city}
          </p>
        </div>

        <div className="text-right text-xs font-semibold text-muted-foreground">
          ⏰ {memory.planned_date} at {memory.planned_time || '10:00'}
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 relative z-10">
        <div className="text-xs text-muted-foreground italic max-w-md">
          "A quiet day holds the promise of discoveries. Prepare to slow down and wander."
        </div>

        <Link href={`/memories/${memory.id}`} className="shrink-0">
          <button className="px-4.5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded hover:opacity-90 active:scale-[0.98] transition duration-200 cursor-pointer shadow-low">
            Continue Planning
          </button>
        </Link>
      </div>

    </div>
  );
}
export { UpcomingCard };
