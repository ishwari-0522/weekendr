'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '../../../middleware/ProtectedRoute';
import { useMemories } from '../../../hooks/useMemories';
import MemoryTimeline from '../../../components/memory/MemoryTimeline';
import MemoryGallery from '../../../components/memory/MemoryGallery';
import ReflectionEditor from '../../../components/memory/ReflectionEditor';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';

/**
 * MemoryDetailPage: Scrapbook journal detail page layout displaying story narration,
 * timelines stops, inline reflections editor, and photo snapshots grids.
 */
export default function MemoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { fetchMemory, updateMemory, deleteMemory, addPhoto, deletePhoto } = useMemories();

  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMemoryDetails = useCallback(async () => {
    setLoading(true);
    const res = await fetchMemory(id);
    if (res.success) {
      setMemory(res.data);
    } else {
      setError(res.message || 'Failed to load memory details.');
    }
    setLoading(false);
  }, [id, fetchMemory]);

  useEffect(() => {
    loadMemoryDetails();
  }, [loadMemoryDetails]);

  // Handle reflection save
  const handleSaveReflection = async (newText) => {
    if (!memory) return;
    const res = await updateMemory(id, { reflection: newText });
    if (res.success) {
      setMemory((prev) => ({ ...prev, reflection: newText }));
    }
  };

  // Handle rating save
  const handleSaveRating = async (ratingVal) => {
    if (!memory) return;
    const res = await updateMemory(id, { rating: ratingVal });
    if (res.success) {
      setMemory((prev) => ({ ...prev, rating: ratingVal }));
    }
  };

  // Handle delete memory
  const handleDeleteMemory = async () => {
    if (!window.confirm("Are you sure you want to remove this memory from your scrapbook?")) return;
    const res = await deleteMemory(id);
    if (res.success) {
      router.push('/memories');
    }
  };

  // Handle photo additions
  const handleAddPhoto = async (url, caption) => {
    if (!memory) return;
    const res = await addPhoto(id, url, caption);
    if (res.success) {
      // Refresh details
      const detailRes = await fetchMemory(id);
      if (detailRes.success) {
        setMemory(detailRes.data);
      }
    }
  };

  // Handle photo removals
  const handleDeletePhoto = async (photoId) => {
    const res = await deletePhoto(photoId);
    if (res.success) {
      setMemory((prev) => ({
        ...prev,
        photos: prev.photos.filter((p) => p.id !== photoId)
      }));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
          <SkeletonLoader count={1} className="h-10 w-1/3" />
          <SkeletonLoader count={4} className="h-40 w-full" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !memory) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
          <div className="p-3.5 bg-destructive/10 border border-destructive/25 text-destructive rounded text-xs font-semibold">
            ⚠️ {error || 'Memory detail failed to load.'}
          </div>
          <Link href="/memories" className="text-primary hover:underline text-xs font-bold">
            ← Back to Memory Book
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const storyTitle = memory.story_json?.title || 'An Unplanned Day';
  const storyIntro = memory.story_json?.intro || 'A collection of serene walking coordinates.';

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 min-h-[85vh] text-left">
        
        {/* Back navigation header link */}
        <div className="flex justify-between items-center">
          <Link href="/memories" className="text-xs text-muted-foreground hover:text-foreground font-bold transition flex items-center gap-1">
            ← Scrapbook
          </Link>

          <button
            onClick={handleDeleteMemory}
            className="text-[10px] text-destructive hover:bg-destructive/10 px-2.5 py-1 rounded transition border border-destructive/20 cursor-pointer"
          >
            Delete Memory
          </button>
        </div>

        {/* Hero Title & Status Indicators */}
        <div className="space-y-3 border-b border-border/40 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded">
              {memory.experience_template || 'Outing'}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              📍 {memory.city || 'Pune'} • {memory.planned_date}
            </span>
            
            {/* Simple status update selectors */}
            <select
              value={memory.status}
              onChange={async (e) => {
                const nextStatus = e.target.value;
                const res = await updateMemory(id, { status: nextStatus });
                if (res.success) {
                  setMemory((prev) => ({ ...prev, status: nextStatus }));
                }
              }}
              className="ml-auto bg-[#1e2638] border border-border text-[10px] font-bold text-foreground px-2 py-1 rounded focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
            {memory.title}
          </h2>
        </div>

        {/* Split Details Section Grid */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Story Narration & Reflections (7/12 cols) */}
          <div className="md:col-span-7 space-y-8">
            
            {/* Story Details Card */}
            <div className="bg-[#111622] border border-border rounded-xl p-6 space-y-4 shadow-low">
              <h3 className="text-xs font-black uppercase text-primary tracking-widest">
                AI Narrative • {storyTitle}
              </h3>
              <p className="body-large text-muted-foreground italic leading-relaxed">
                "{storyIntro}"
              </p>
            </div>

            {/* Inline reflection editor */}
            <ReflectionEditor
              initialReflection={memory.reflection}
              onSave={handleSaveReflection}
            />

            {/* Snapshots Gallery layout */}
            <MemoryGallery
              photos={memory.photos}
              onAddPhoto={handleAddPhoto}
              onDeletePhoto={handleDeletePhoto}
            />

          </div>

          {/* Right Column: Timeline stops & rating stars (5/12 cols) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Rating Stars Card */}
            <div className="bg-[#111622] border border-border rounded-xl p-5 space-y-3.5 shadow-low text-left">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Scrapbook Rating
              </h4>
              <div className="flex gap-1.5 text-highlight">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSaveRating(s)}
                    className="text-xl cursor-pointer hover:scale-110 transition duration-150"
                  >
                    {s <= (memory.rating || 0) ? '★' : '☆'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Rate this day overall to help tune future recommendations.
              </p>
            </div>

            {/* Planned Itinerary Timeline stops */}
            <div className="bg-[#111622] border border-border rounded-xl p-5 space-y-4 shadow-low">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Outing Path Stops
              </h4>
              <MemoryTimeline timelineJson={memory.timeline_json} />
            </div>

          </div>

        </div>

      </div>
    </ProtectedRoute>
  );
}
