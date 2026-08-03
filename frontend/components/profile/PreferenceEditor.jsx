'use client';

import React, { useState } from 'react';

/**
 * PreferenceEditor: Inline form editing preferred cities, budgets, group types.
 */
export default function PreferenceEditor({ initialPrefs = {}, onSave, onClose }) {
  const [city, setCity] = useState(initialPrefs.preferred_city || 'Pune');
  const [budget, setBudget] = useState(initialPrefs.preferred_budget || 2000);
  const [groupType, setGroupType] = useState(initialPrefs.preferred_group_type || 'Couple');
  const [vibe, setVibe] = useState(initialPrefs.preferred_vibe || 'Cozy');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        preferred_city: city,
        preferred_budget: parseFloat(budget) || 2000,
        preferred_group_type: groupType,
        preferred_vibe: vibe
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid grid-cols-2 gap-4">
        
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="pref-city">
            Default City
          </label>
          <input
            id="pref-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-2.5 bg-secondary/15 border border-border rounded text-xs text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="pref-budget">
            Preferred Budget (₹)
          </label>
          <input
            id="pref-budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full p-2.5 bg-secondary/15 border border-border rounded text-xs text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="pref-group">
            Group Type
          </label>
          <select
            id="pref-group"
            value={groupType}
            onChange={(e) => setGroupType(e.target.value)}
            className="w-full p-2.5 bg-secondary/15 border border-border rounded text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="Solo">Solo</option>
            <option value="Couple">Couple</option>
            <option value="Friends">Friends</option>
            <option value="Family">Family</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="pref-vibe">
            Default Vibe
          </label>
          <input
            id="pref-vibe"
            type="text"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            className="w-full p-2.5 bg-secondary/15 border border-border rounded text-xs text-foreground focus:outline-none focus:border-primary"
          />
        </div>

      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-border rounded text-xs text-muted-foreground hover:text-foreground cursor-pointer transition"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-bold hover:opacity-90 transition cursor-pointer"
        >
          Save Changes
        </button>
      </div>

    </form>
  );
}
export { PreferenceEditor };
