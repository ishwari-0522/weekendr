'use client';

import React from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const typeStyles = {
    success: 'bg-emerald-950/90 text-emerald-200 border-emerald-800',
    error: 'bg-red-950/90 text-red-200 border-red-800',
    info: 'bg-blue-950/90 text-blue-200 border-blue-800',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 p-4 border rounded shadow-overlay max-w-sm transition duration-[var(--duration-fast)] ${typeStyles[type]}`}
      role="alert"
    >
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-xs font-bold hover:opacity-75 focus:outline-none cursor-pointer"
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}
