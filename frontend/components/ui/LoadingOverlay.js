'use client';

import React from 'react';

export default function LoadingOverlay({ isLoading, message = 'Loading experience...' }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 text-white">
      <div className="flex flex-col items-center gap-4 p-6 bg-card border border-border rounded shadow-overlay max-w-xs text-center">
        <div className="w-8 h-8 border-4 border-t-primary border-muted rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-foreground">{message}</p>
      </div>
    </div>
  );
}
