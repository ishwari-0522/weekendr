'use client';

import React, { useState } from 'react';

/**
 * LiveTimeline: Visual companion vertical progress timeline displaying checks, glowing indices.
 */
export default function LiveTimeline({ stops = [], currentStopIndex = 0 }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (stops.length === 0) return null;

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="relative border-l border-border ml-2 space-y-6 py-2 text-left">
      {stops.map((s, idx) => {
        const isCompleted = idx < currentStopIndex || s.status === 'completed';
        const isCurrent = idx === currentStopIndex && s.status !== 'completed';
        const isUpcoming = idx > currentStopIndex;

        const isExpanded = expandedIndex === idx;

        return (
          <div key={idx} className="relative pl-7 group">
            
            {/* Timeline bullet nodes */}
            <div 
              onClick={() => toggleExpand(idx)}
              className={`absolute left-0 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300 z-10 ${
                isCompleted 
                  ? 'bg-primary border-primary text-[8px] text-primary-foreground font-black' 
                  : isCurrent 
                    ? 'bg-highlight border-highlight shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse'
                    : 'bg-[#080b11] border-border hover:border-primary/50'
              }`}
            >
              {isCompleted ? '✓' : isCurrent ? '●' : '○'}
            </div>

            <div 
              onClick={() => toggleExpand(idx)}
              className="space-y-1 cursor-pointer select-none"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-[9px] text-muted-foreground">
                  ⏰ {s.planned_start}
                </span>
                {isCurrent && (
                  <span className="text-[8px] bg-highlight/10 border border-highlight/20 text-highlight font-black px-1.5 rounded uppercase tracking-wider">
                    Current Stop
                  </span>
                )}
              </div>

              <h4 className={`text-xs font-bold transition duration-150 ${
                isCurrent ? 'text-highlight' : isCompleted ? 'text-muted-foreground' : 'text-foreground hover:text-primary'
              }`}>
                {s.name || `Destination Stop #${idx + 1}`}
              </h4>

              {isExpanded && (
                <div className="p-3 bg-secondary/10 border border-border rounded-lg mt-2 space-y-2 text-[10px] text-muted-foreground animate-fade-in">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-bold text-foreground">45 mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Spend:</span>
                    <span className="font-bold text-foreground">₹500</span>
                  </div>
                  
                  {s.reflection && (
                    <div className="border-t border-border/40 pt-1.5 mt-1.5 italic text-foreground">
                      "{s.reflection}"
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
export { LiveTimeline };
