'use client';

import React from 'react';
import NotificationCard from './NotificationCard';

/**
 * NotificationGroup: Groups and displays notifications stack under time headers.
 */
export default function NotificationGroup({ 
  title = '', 
  items = [], 
  onMarkRead, 
  onDismiss,
  onClosePanel 
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3.5 text-left">
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
        {title}
      </h4>
      
      <div className="space-y-3">
        {items.map((n) => (
          <NotificationCard
            key={n.id}
            notification={n}
            onMarkRead={onMarkRead}
            onDismiss={onDismiss}
            onClosePanel={onClosePanel}
          />
        ))}
      </div>
    </div>
  );
}
export { NotificationGroup };
