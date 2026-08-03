'use client';

import React from 'react';
import NotificationGroup from './NotificationGroup';
import NotificationEmptyState from './NotificationEmptyState';
import NotificationSkeleton from './NotificationSkeleton';

/**
 * NotificationPanel: Right-side slide-over drawer containing alerts feed.
 */
export default function NotificationPanel({ 
  isOpen = false, 
  onClose,
  notifications = [],
  unreadCount = 0,
  loading = false,
  onMarkRead,
  onReadAll,
  onDismiss
}) {
  if (!isOpen) return null;

  // Group notifications into Today, This Week, Earlier
  const getBuckets = () => {
    const today = [];
    const thisWeek = [];
    const earlier = [];

    const now = new Date();
    notifications.forEach((n) => {
      if (!n.sent_at) {
        earlier.push(n);
        return;
      }
      try {
        const sentDate = new Date(n.sent_at);
        const diffTime = Math.abs(now - sentDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          today.push(n);
        } else if (diffDays <= 7) {
          thisWeek.push(n);
        } else {
          earlier.push(n);
        }
      } catch (e) {
        earlier.push(n);
      }
    });

    return { today, thisWeek, earlier };
  };

  const { today, thisWeek, earlier } = getBuckets();
  const hasNotifications = notifications.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      
      {/* Click outside backdrop close layer */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 transition-opacity duration-300" 
      />

      {/* Main Slide-Over Drawer Container */}
      <div className="relative w-full max-w-[420px] h-full bg-[#111622] border-l border-border/80 flex flex-col z-10 shadow-high animate-slide-left">
        
        {/* Header Action row */}
        <div className="p-5 border-b border-border/40 flex justify-between items-center shrink-0">
          <div className="space-y-1 text-left">
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
              Inbox Notifications
            </h3>
            {unreadCount > 0 && (
              <p className="text-[10px] font-semibold text-primary">
                {unreadCount} unread note{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={onReadAll}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer transition"
              >
                Read All
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable notifications feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-none">
          {loading ? (
            <NotificationSkeleton />
          ) : !hasNotifications ? (
            <NotificationEmptyState />
          ) : (
            <div className="space-y-6">
              <NotificationGroup
                title="Today"
                items={today}
                onMarkRead={onMarkRead}
                onDismiss={onDismiss}
                onClosePanel={onClose}
              />
              <NotificationGroup
                title="This Week"
                items={thisWeek}
                onMarkRead={onMarkRead}
                onDismiss={onDismiss}
                onClosePanel={onClose}
              />
              <NotificationGroup
                title="Earlier"
                items={earlier}
                onMarkRead={onMarkRead}
                onDismiss={onDismiss}
                onClosePanel={onClose}
              />
            </div>
          )}
        </div>

      </div>

      {/* Styled scrollbar hider */}
      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </div>
  );
}
export { NotificationPanel };
