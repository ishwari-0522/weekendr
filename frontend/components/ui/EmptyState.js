'use client';

import React from 'react';

export default function EmptyState({
  title = 'Your next favorite memory starts here.',
  description = 'Choose a neighborhood above and let us design a custom experience for you.',
  actionLabel,
  onActionClick
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded text-center max-w-sm mx-auto bg-card/40">
      <h4 className="text-sm font-bold text-foreground mb-2">{title}</h4>
      <p className="caption-text text-muted-foreground mb-5">{description}</p>
      {actionLabel && onActionClick && (
        <button
          onClick={onActionClick}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-semibold hover:opacity-90 active:scale-95 transition duration-[var(--duration-fast)] cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
