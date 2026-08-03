'use client';

import React, { useEffect, useMemo } from 'react';
import ProtectedRoute from '../../middleware/ProtectedRoute';
import { useMemories } from '../../hooks/useMemories';
import { useProfile } from '../../hooks/useProfile';
import ProfileHeader from '../../components/profile/ProfileHeader';
import StatsGrid from '../../components/profile/StatsGrid';
import FavoriteWorldCard from '../../components/profile/FavoriteWorldCard';
import PreferencesCard from '../../components/profile/PreferencesCard';
import AchievementsCard from '../../components/profile/AchievementsCard';
import SettingsSection from '../../components/profile/SettingsSection';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

/**
 * ProfilePage: Central user journey index coordinator guarded by ProtectedRoute.
 */
export default function ProfilePage() {
  const { memories, loading: memoriesLoading, fetchMemories } = useMemories();
  const { updatePrefs, deleteUserAccount, calculateStats, loading: profileLoading } = useProfile();

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  // Calculate statistics from loaded memories
  const stats = useMemo(() => {
    return calculateStats(memories);
  }, [memories, calculateStats]);

  const handleUpdatePreferences = async (newPrefs) => {
    await updatePrefs(newPrefs);
  };

  const handleDeleteAccount = async () => {
    await deleteUserAccount();
  };

  const loading = memoriesLoading || profileLoading;

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 min-h-[85vh] text-left">
        
        {/* Editorial Heading */}
        <div className="space-y-1.5 border-b border-border/40 pb-6 mb-2">
          <h1 className="page-title text-foreground tracking-tight text-3xl font-extrabold uppercase">
            Your Journey
          </h1>
          <p className="text-sm text-muted-foreground italic font-medium">
            "Every memory tells a story."
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <SkeletonLoader count={1} className="h-24 w-full" />
            <div className="grid sm:grid-cols-2 gap-4">
              <SkeletonLoader count={1} className="h-40 w-full" />
              <SkeletonLoader count={1} className="h-40 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            
            {/* Header info */}
            <ProfileHeader 
              memoriesCount={memories.length} 
              favoriteWorld={stats.favoriteTemplate}
              favoriteCity={memories[0]?.city || 'None'}
            />

            {/* Statistics */}
            <StatsGrid stats={stats} />

            {/* Split row: Fav World & preferences */}
            <div className="grid md:grid-cols-2 gap-6 items-start">
              
              <div className="space-y-6">
                
                {/* Favorite World highlighting */}
                <FavoriteWorldCard favoriteWorld={stats.favoriteTemplate} />
                
                {/* Editable preferences */}
                <PreferencesCard onUpdatePrefs={handleUpdatePreferences} />

              </div>

              <div className="space-y-6">
                
                {/* Milestones Card */}
                <AchievementsCard memoriesCount={memories.length} />

                {/* Settings: Theme, notifications and danger actions */}
                <SettingsSection onDeleteAccount={handleDeleteAccount} />

              </div>

            </div>

          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
