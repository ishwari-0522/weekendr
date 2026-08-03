'use client';

import React from 'react';

/**
 * NotificationBell: Replaces static bell displaying glowing unread dot indicators.
 */
export default function NotificationBell({ unreadCount = 0, onClick }) {
  const hasUnread = unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/15 rounded-full transition cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-primary/30"
      aria-label="View notifications inbox"
    >
      {/* Editorial Bell Icon Emoji */}
      <span className="text-sm">🔔</span>
      
      {/* Subtle unread glowing beacon dot */}
      {hasUnread && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-[#080b11] shadow-[0_0_6px_rgba(99,102,241,0.8)] animate-pulse" />
      )}
    </button>
  );
}
export { NotificationBell };
