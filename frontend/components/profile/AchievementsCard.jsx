'use client';

import React from 'react';

/**
 * AchievementsCard: Clean, calm milestone card that fits the scrapbook aesthetic.
 */
export default function AchievementsCard({ memoriesCount = 0 }) {
  const milestones = [
    { title: 'First Day Out', description: 'Saved your first experience.', unlocked: memoriesCount > 0 },
    { title: 'Local Explorer', description: 'Discovered curated destinations.', unlocked: memoriesCount >= 3 }
  ];

  return (
    <div className="bg-[#111622] border border-border rounded-xl p-5 text-left shadow-low space-y-4">
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        Scrapbook Milestones
      </h4>

      <div className="space-y-3">
        {milestones.map((m) => (
          <div key={m.title} className="flex items-center gap-3">
            <span className={`text-base shrink-0 ${m.unlocked ? 'opacity-100' : 'opacity-20'}`}>
              🏅
            </span>
            <div className="min-w-0">
              <h5 className={`text-xs font-bold ${m.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {m.title}
              </h5>
              <p className="text-[10px] text-muted-foreground">{m.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export { AchievementsCard };
