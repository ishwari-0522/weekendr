'use client';

import React from 'react';

export default function SuccessState({
  title = 'Action Completed',
  message = 'Itinerary updated and saved to your profile.'
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 border border-emerald-800/30 bg-emerald-950/20 text-emerald-200 rounded max-w-sm mx-auto text-center">
      <div className="w-8 h-8 flex items-center justify-center bg-emerald-900 text-emerald-100 rounded-full font-bold mb-3">
        ✓
      </div>
      <h4 className="text-sm font-semibold text-emerald-100 mb-1">{title}</h4>
      <p className="caption-text text-emerald-300">{message}</p>
    </div>
  );
}
