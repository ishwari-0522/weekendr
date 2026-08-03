'use client';

import React, { useEffect } from 'react';

export default function Modal({ isOpen, title, onClose, children }) {
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

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative z-50 w-full max-w-md p-6 bg-card border border-border rounded shadow-overlay text-foreground">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <h3 className="section-title text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-bold focus:outline-none cursor-pointer transition duration-[var(--duration-hover)]"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="body-text">{children}</div>
      </div>
    </div>
  );
}
