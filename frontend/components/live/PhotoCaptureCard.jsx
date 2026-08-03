'use client';

import React, { useState } from 'react';

/**
 * PhotoCaptureCard: Simple visual overlay form to post mock photo URLs.
 */
export default function PhotoCaptureCard({ 
  isOpen = false, 
  onClose, 
  onUpload 
}) {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (onUpload) {
      onUpload(url, caption);
    }
    setUrl('');
    setCaption('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111622] border border-border p-6 rounded-xl shadow-high w-full max-w-sm text-left space-y-4">
        
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Upload Day Snapshot
          </h4>
          <button 
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="live-photo-url">
              Image URL
            </label>
            <input
              id="live-photo-url"
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2.5 bg-secondary/15 border border-border rounded text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="live-photo-caption">
              Caption
            </label>
            <input
              id="live-photo-caption"
              type="text"
              placeholder="Good times at the cafe..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-2.5 bg-secondary/15 border border-border rounded text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-primary text-primary-foreground text-xs font-bold rounded hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
          >
            Save Photo
          </button>
        </form>

      </div>
    </div>
  );
}
export { PhotoCaptureCard };
