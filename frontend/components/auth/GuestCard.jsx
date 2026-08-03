'use client';

import React from 'react';
import Link from 'next/link';

/**
 * GuestCard: Warm modal/dialog prompting guest users to register to save/capture experiences.
 */
export default function GuestCard({ 
  onClose,
  title = "Capture this Outing?",
  message = "Creating a free account lets you save experiences to your memory book, track budgets, and receive quiet notifications."
}) {
  return (
    <div className="p-6 bg-card border border-border rounded-xl max-w-sm w-full space-y-5 text-left shadow-overlay">
      <div className="space-y-1.5">
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
      </div>

      <div className="space-y-2.5">
        <Link href="/register" className="block w-full">
          <button className="w-full p-2.5 bg-primary hover:opacity-90 active:scale-[0.98] text-primary-foreground text-xs font-bold rounded transition-all cursor-pointer shadow-low">
            Create Account
          </button>
        </Link>
        <button 
          onClick={onClose}
          className="w-full p-2.5 border border-border bg-transparent hover:border-primary text-muted-foreground hover:text-foreground text-xs font-semibold rounded transition cursor-pointer"
        >
          Maybe Later
        </button>
      </div>

      <div className="text-center text-[10px] text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline font-bold transition">
          Log In
        </Link>
      </div>
    </div>
  );
}
export { GuestCard };
