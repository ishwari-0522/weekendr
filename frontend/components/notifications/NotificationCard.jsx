'use client';

import React from 'react';
import Link from 'next/link';

/**
 * NotificationCard: Editorial card displaying alert descriptions and CTA links.
 */
export default function NotificationCard({ 
  notification, 
  onMarkRead, 
  onDismiss,
  onClosePanel 
}) {
  if (!notification) return null;

  const isUnread = notification.status === 'unread';

  // Map type to emoji
  const getIcon = (type) => {
    switch (type) {
      case 'upcoming_outing': return '🗓️';
      case 'starting_soon': return '⏰';
      case 'reflection_reminder': return '💬';
      case 'weekly_inspiration': return '✨';
      case 'explore_recommendation': return '📍';
      default: return '✉️';
    }
  };

  // Determine button title from action_url
  const getActionLabel = (url) => {
    if (!url) return '';
    if (url.includes('/memories/')) return 'Write Reflection';
    if (url.includes('/live')) return 'Open Live Day';
    if (url.includes('/explore')) return 'Explore';
    return 'Continue Planning';
  };

  const handleCardClick = () => {
    if (isUnread && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  const handleActionClick = () => {
    handleCardClick();
    if (onClosePanel) onClosePanel();
  };

  const actionLabel = getActionLabel(notification.action_url);

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative bg-[#111622] border rounded-xl p-4.5 space-y-3 shadow-low transition-all duration-300 text-left cursor-pointer hover:border-border-highlight/40 ${
        isUnread ? 'border-primary/25 bg-[#12192c]/40' : 'border-border/60'
      }`}
    >
      {/* Glow dot indicator for unread */}
      {isUnread && (
        <span className="absolute top-4.5 right-4.5 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(99,102,241,0.8)] animate-pulse" />
      )}

      {/* Detail header */}
      <div className="flex gap-3 items-start pr-4">
        <span className="text-sm shrink-0 bg-secondary/15 p-1.5 rounded border border-border/40">
          {getIcon(notification.type)}
        </span>
        
        <div className="space-y-1.5 flex-1 min-w-0">
          <h4 className="text-xs font-bold text-foreground truncate pr-2">
            {notification.title}
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {notification.message}
          </p>
        </div>
      </div>

      {/* Action triggers row */}
      <div className="flex justify-between items-center border-t border-border/20 pt-2.5 text-[9px] font-bold">
        
        <span className="text-muted-foreground">
          ⏰ Outing Reminder
        </span>

        <div className="flex items-center gap-3">
          {notification.action_url && actionLabel && (
            <Link href={notification.action_url} onClick={handleActionClick}>
              <span className="text-primary hover:underline transition">
                {actionLabel} →
              </span>
            </Link>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDismiss) onDismiss(notification.id);
            }}
            className="text-muted-foreground hover:text-destructive transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>

      </div>

    </div>
  );
}
export { NotificationCard };
