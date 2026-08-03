'use client';

import React, { useEffect } from 'react';

export default function Drawer({ isOpen, title, onClose, position = 'right', children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = {
    right: 'right-0 top-0 bottom-0 border-l border-border',
    left: 'left-0 top-0 bottom-0 border-r border-border',
  };

  return (
    <div className="fixed inset-0 z-40 flex bg-black/50">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div
        className={`absolute z-50 w-full max-w-sm p-6 bg-card text-foreground shadow-overlay transition duration-[var(--duration-medium)] ${positionClasses[position]}`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <h3 className="section-title text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-bold focus:outline-none cursor-pointer transition duration-[var(--duration-hover)]"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>
        <div className="body-text">{children}</div>
      </div>
    </div>
  );
}
