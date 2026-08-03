'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../middleware/ProtectedRoute';
import { useProfile } from '../../hooks/useProfile';
import SettingsSection from '../../components/profile/SettingsSection';

/**
 * SettingsPage: Standalone settings route coordinate displaying theme switchers,
 * notification preferences and Danger Zone account deletions.
 */
export default function SettingsPage() {
  const { deleteUserAccount, loading } = useProfile();

  const handleDeleteAccount = async () => {
    await deleteUserAccount();
  };

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto py-6 px-4 space-y-6 min-h-[80vh] text-left">
        
        {/* Back Link */}
        <Link href="/profile" className="text-xs text-muted-foreground hover:text-foreground font-bold transition">
          ← Back to Journey
        </Link>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight uppercase">
            Settings
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure theme aesthetics and notification channels.
          </p>
        </div>

        {/* Settings options */}
        <SettingsSection onDeleteAccount={handleDeleteAccount} />

      </div>
    </ProtectedRoute>
  );
}
