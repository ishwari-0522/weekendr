'use client';

import React, { useState, useEffect } from 'react';

/**
 * ReflectionSheet: Bottom drawer sheet managing reflection text updates and blur triggers.
 */
export default function ReflectionSheet({ 
  isOpen = false, 
  onClose, 
  initialText = '', 
  onSave 
}) {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleClose = () => {
    // Autosave on close
    if (onSave) {
      onSave(text);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-end justify-center">
      <div className="w-full max-w-lg bg-[#111622] border-t border-border rounded-t-2xl p-6 space-y-4 animate-slide-up text-left">
        
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Record Reflection
          </h4>
          <button 
            onClick={handleClose}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition"
          >
            Done
          </button>
        </div>

        <div className="space-y-3.5">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Record thoughts, feelings, or favorite details from this stop. These will be copied to your Memory Book once you complete the day.
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What made this stop memorable?"
            className="w-full min-h-[140px] p-3 bg-secondary/15 border border-border rounded-lg text-xs leading-relaxed text-foreground focus:outline-none focus:border-primary transition"
          />
        </div>

        <button
          onClick={handleClose}
          className="w-full p-3 bg-primary text-primary-foreground text-xs font-bold rounded hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
        >
          Save & Close
        </button>

      </div>
    </div>
  );
}
export { ReflectionSheet };
