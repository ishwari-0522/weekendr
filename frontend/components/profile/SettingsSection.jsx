'use client';

import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationPreferences from './NotificationPreferences';
import DangerZone from './DangerZone';

/**
 * SettingsSection: Aggregates theme swappers, checkboxes, and danger triggers.
 */
export default function SettingsSection({ onDeleteAccount }) {
  return (
    <div className="bg-[#111622] border border-border rounded-xl p-5 text-left shadow-low space-y-6">
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-2">
        Account Settings
      </h4>

      {/* Theme Toggler */}
      <ThemeSwitcher />

      {/* Notification Switches */}
      <NotificationPreferences />

      {/* Danger Zone Deletions */}
      <DangerZone onDeleteAccount={onDeleteAccount} />

    </div>
  );
}
export { SettingsSection };
