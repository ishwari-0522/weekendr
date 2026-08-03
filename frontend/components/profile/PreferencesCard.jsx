'use client';

import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import PreferenceEditor from './PreferenceEditor';

/**
 * PreferencesCard: Displays user preference items and wraps editing toggle views.
 */
export default function PreferencesCard({ onUpdatePrefs }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  const prefs = user.preferences || {};

  const handleSave = async (updated) => {
    if (onUpdatePrefs) {
      await onUpdatePrefs(updated);
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-[#111622] border border-border rounded-xl p-5 text-left shadow-low space-y-4">
      
      <div className="flex justify-between items-center border-b border-border/40 pb-2">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Travel Preferences
        </h4>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <PreferenceEditor
          initialPrefs={prefs}
          onSave={handleSave}
          onClose={() => setIsEditing(false)}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Preferred City</span>
            <p className="font-bold text-foreground">{prefs.preferred_city || 'Pune'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Planned Budget</span>
            <p className="font-bold text-foreground">₹{prefs.preferred_budget || 2000}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Group Type</span>
            <p className="font-bold text-foreground">{prefs.preferred_group_type || 'Couple'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Default Vibe</span>
            <p className="font-bold text-foreground">{prefs.preferred_vibe || 'Cozy'}</p>
          </div>
        </div>
      )}

    </div>
  );
}
export { PreferencesCard };
