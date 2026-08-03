'use client';

import React from 'react';

/**
 * EndDayDialog: Confirmation modal displayed when the finish day action triggers.
 */
export default function EndDayDialog({ 
  isOpen = false, 
  onClose, 
  onConfirm 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111622] border border-border p-6 rounded-xl shadow-high w-full max-w-sm text-center space-y-5">
        
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-foreground">
            Finish My Day
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You've reached the end of today's experience. Confirming will copy all recorded stop reflections and snapshots to your Memory Book scrapbook.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border hover:bg-secondary/15 rounded text-xs font-bold text-muted-foreground transition cursor-pointer"
          >
            Go Back
          </button>
          
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] rounded text-xs font-bold transition cursor-pointer"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}
export { EndDayDialog };
