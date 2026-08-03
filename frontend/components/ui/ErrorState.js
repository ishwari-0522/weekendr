'use client';

import React from 'react';

export default function ErrorState({
  message = 'An unexpected connection error occurred.',
  onRetry
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 border border-destructive/20 bg-destructive/10 text-destructive rounded max-w-sm mx-auto text-center">
      <span className="label-text text-red-400 mb-1">Error</span>
      <p className="caption-text text-red-300 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded text-xs font-bold hover:opacity-90 active:scale-95 transition duration-[var(--duration-fast)] cursor-pointer"
        >
          Retry Request
        </button>
      )}
    </div>
  );
}
