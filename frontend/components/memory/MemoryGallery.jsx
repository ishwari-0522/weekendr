'use client';

import React, { useState } from 'react';

/**
 * MemoryGallery: Responsive grid displays photos and caption inputs overlays.
 */
export default function MemoryGallery({ photos = [], onAddPhoto, onDeletePhoto }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    if (onAddPhoto) {
      onAddPhoto(imageUrl, caption);
    }
    setImageUrl('');
    setCaption('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center border-b border-border/40 pb-2">
        <h4 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
          Photo Scrapbook
        </h4>
        <button
          onClick={() => setModalOpen(true)}
          className="text-xs font-bold text-primary hover:underline cursor-pointer transition"
        >
          + Add Photo
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="py-8 border border-dashed border-border rounded-xl flex items-center justify-center text-xs text-muted-foreground italic">
          No snapshots recorded yet. Capture your favorite moments!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-square bg-secondary/20 border border-border rounded-lg overflow-hidden group">
              <img 
                src={p.image_url} 
                alt={p.caption || 'Memory snapshot'} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              
              {/* Deletion hover overlap */}
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col justify-between p-2.5">
                <button
                  onClick={() => onDeletePhoto && onDeletePhoto(p.id)}
                  className="self-end text-[10px] text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 px-2 py-0.5 rounded cursor-pointer transition"
                >
                  Delete
                </button>
                {p.caption && (
                  <p className="text-[10px] text-foreground font-medium leading-relaxed line-clamp-2">
                    {p.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mock Add Photo Modal overlay */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-border p-6 rounded-xl shadow-high w-full max-w-sm text-left space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Add Photo Snapshot</h4>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="photo-url">
                  Image URL
                </label>
                <input
                  id="photo-url"
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 bg-secondary/15 border border-border rounded text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="photo-caption">
                  Caption (Optional)
                </label>
                <input
                  id="photo-caption"
                  type="text"
                  placeholder="Sunny Sunday mornings..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-2.5 bg-secondary/15 border border-border rounded text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full p-2.5 bg-primary text-primary-foreground text-xs font-bold rounded hover:opacity-90 transition cursor-pointer"
              >
                Save Photo
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export { MemoryGallery };
