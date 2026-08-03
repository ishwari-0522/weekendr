'use client';

import React, { useState } from 'react';

/**
 * ThemeSwitcher: Switcher displaying choices for dark/light themes.
 */
export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('dark');

  const themes = [
    { key: 'dark', label: 'Dark Mode', icon: '🌙' },
    { key: 'light', label: 'Light Mode', icon: '☀️' },
    { key: 'glass', label: 'Glassmorphism', icon: '💎' }
  ];

  return (
    <div className="space-y-2 text-left">
      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
        App Theme Interface
      </span>

      <div className="flex gap-2">
        {themes.map((t) => (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            className={`flex-1 p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer select-none ${
              theme === t.key
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-secondary/10 border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
export { ThemeSwitcher };
