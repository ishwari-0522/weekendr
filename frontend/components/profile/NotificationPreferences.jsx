'use client';

import React, { useState } from 'react';

/**
 * NotificationPreferences: Switches checkboxes toggling companion alert parameters.
 */
export default function NotificationPreferences() {
  const [ outingReminders, setOutingReminders ] = useState(true);
  const [ weeklySuggestions, setWeeklySuggestions ] = useState(true);
  const [ systemAlerts, setSystemAlerts ] = useState(false);

  return (
    <div className="space-y-4 text-left">
      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
        Notification Channels
      </span>

      <div className="space-y-3 text-xs">
        
        {/* Outing Reminders */}
        <div className="flex justify-between items-center border-b border-border/40 pb-2">
          <div className="space-y-0.5">
            <h5 className="font-bold text-foreground">Outing Reminders</h5>
            <p className="text-[10px] text-muted-foreground">Receive reminders tomorrow or starting soon.</p>
          </div>
          <input
            type="checkbox"
            checked={outingReminders}
            onChange={(e) => setOutingReminders(e.target.checked)}
            className="w-4 h-4 text-primary bg-secondary/15 border-border rounded cursor-pointer accent-primary focus:ring-0 focus:ring-offset-0"
          />
        </div>

        {/* Weekly Suggestions */}
        <div className="flex justify-between items-center border-b border-border/40 pb-2">
          <div className="space-y-0.5">
            <h5 className="font-bold text-foreground">Weekly Inspirations</h5>
            <p className="text-[10px] text-muted-foreground">Get curated worlds recommendations before weekends.</p>
          </div>
          <input
            type="checkbox"
            checked={weeklySuggestions}
            onChange={(e) => setWeeklySuggestions(e.target.checked)}
            className="w-4 h-4 text-primary bg-secondary/15 border-border rounded cursor-pointer accent-primary focus:ring-0 focus:ring-offset-0"
          />
        </div>

        {/* System updates */}
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h5 className="font-bold text-foreground">System messages</h5>
            <p className="text-[10px] text-muted-foreground">Receive account details updates or status updates.</p>
          </div>
          <input
            type="checkbox"
            checked={systemAlerts}
            onChange={(e) => setSystemAlerts(e.target.checked)}
            className="w-4 h-4 text-primary bg-secondary/15 border-border rounded cursor-pointer accent-primary focus:ring-0 focus:ring-offset-0"
          />
        </div>

      </div>

    </div>
  );
}
export { NotificationPreferences };
