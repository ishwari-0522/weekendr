'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';

/**
 * PlaceCard: Curated place item card displaying ratings and why-featured annotations.
 */
export default function PlaceCard({ place, highlightTag = '' }) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!place) return null;

  // Star rating helper
  const renderStars = (ratingVal) => {
    const val = ratingVal || 0;
    return (
      <div className="flex gap-0.5 text-highlight">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className="text-[10px]">
            {s <= val ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <div 
        onClick={() => setModalOpen(true)}
        className="bg-[#111622] border border-border hover:border-border-highlight/50 rounded-xl overflow-hidden shadow-low hover:shadow-medium transition-all duration-300 flex flex-col sm:flex-row items-stretch text-left group cursor-pointer"
      >
        
        {/* Cover Photo Image */}
        <div className="w-full sm:w-48 aspect-video sm:aspect-square relative bg-secondary/15 shrink-0 overflow-hidden border-b sm:border-b-0 sm:border-r border-border/60">
          {place.cover_photo ? (
            <img 
              src={place.cover_photo} 
              alt={place.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest">
              📍 Place
            </div>
          )}

          {highlightTag && (
            <span className="absolute top-2 left-2 bg-[#6366f1] text-[8px] font-black uppercase tracking-widest text-foreground px-2 py-0.5 rounded shadow">
              {highlightTag}
            </span>
          )}
        </div>

        {/* Content details */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-start gap-2">
              <span className="text-[9px] uppercase font-bold tracking-widest text-primary">
                {place.category || 'Spot'}
              </span>
              <span className="text-[10px] text-muted-foreground">
                📍 {place.area || 'Pune'}
              </span>
            </div>

            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition duration-150">
              {place.name}
            </h3>

            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {place.description || place.vibe_summary || 'A curated destination of quality and character.'}
            </p>
          </div>

          <div className="border-t border-border/40 pt-3 flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-semibold text-[10px]">
              {place.review_count || 0} reviews
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-foreground">{place.rating || 3.5}</span>
              {renderStars(place.rating)}
            </div>
          </div>
        </div>

      </div>

      {/* Detail Modal Overlay */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-6 space-y-4 text-left max-w-sm mx-auto">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold tracking-widest text-primary">
              Curated Destination Detail
            </span>
            <h3 className="text-base font-bold text-foreground">{place.name}</h3>
            <p className="text-xs text-muted-foreground">📍 {place.area || 'Pune'}</p>
          </div>

          <div className="aspect-video w-full rounded-lg bg-secondary/15 overflow-hidden">
            {place.cover_photo && (
              <img src={place.cover_photo} alt={place.name} className="w-full h-full object-cover" />
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {place.description || 'A highly recommended location curated by the WEEKENDR editorial board.'}
          </p>

          <div className="flex justify-between items-center text-xs border-t border-border/40 pt-3">
            <span className="font-bold text-highlight">★ {place.rating}</span>
            <button 
              onClick={() => setModalOpen(false)}
              className="text-xs font-bold text-primary hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
export { PlaceCard };
