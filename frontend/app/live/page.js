'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../middleware/ProtectedRoute';
import { useLiveDay } from '../../hooks/useLiveDay';
import { useMemories } from '../../hooks/useMemories';
import LiveHeader from '../../components/live/LiveHeader';
import CurrentStopCard from '../../components/live/CurrentStopCard';
import NextStopCard from '../../components/live/NextStopCard';
import LiveTimeline from '../../components/live/LiveTimeline';
import QuickActions from '../../components/live/QuickActions';
import ReflectionSheet from '../../components/live/ReflectionSheet';
import PhotoCaptureCard from '../../components/live/PhotoCaptureCard';
import EndDayDialog from '../../components/live/EndDayDialog';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

/**
 * LiveDayPage: Real-time outing tracking screen coordinating stops check-ins, skips,
 * inline reflections and finish-day transfers.
 */
export default function LiveDayPage() {
  const router = useRouter();
  const { 
    session, 
    loading, 
    error, 
    loadSession, 
    next, 
    previous, 
    completeCurrentStop, 
    skipCurrentStop, 
    endDay 
  } = useLiveDay();

  const { addPhoto } = useMemories();

  // Overlay states
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [endDayOpen, setEndDayOpen] = useState(false);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleCheckIn = async () => {
    if (!session) return;
    const res = await completeCurrentStop();
    if (res.success) {
      // Advance to next stop automatically if there is one
      const totalStops = session.stops.length;
      if (session.current_stop_index < totalStops - 1) {
        await next();
      }
    }
  };

  const handleSkip = async () => {
    if (!window.confirm("Skip this destination and move to the next?")) return;
    await skipCurrentStop();
  };

  const handleSaveReflection = async (text) => {
    await completeCurrentStop(text);
  };

  const handleUploadPhoto = async (url, caption) => {
    if (!session) return;
    // Add photo metadata to associated memory
    await addPhoto(session.memory_id, url, caption);
  };

  const handleConfirmEndDay = async () => {
    const res = await endDay();
    if (res.success) {
      setEndDayOpen(false);
      router.push('/memories');
    }
  };

  if (loading && !session) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
          <SkeletonLoader count={1} className="h-10 w-1/3" />
          <SkeletonLoader count={3} className="h-40 w-full" />
        </div>
      </ProtectedRoute>
    );
  }

  const hasActiveSession = session && session.status === 'active';
  const stops = session?.stops || [];
  const currentIdx = session?.current_stop_index || 0;
  
  const currentStop = stops.length > currentIdx ? stops[currentIdx] : null;
  const nextStop = stops.length > currentIdx + 1 ? stops[currentIdx + 1] : null;

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 min-h-[85vh] text-left">
        
        {/* Typographic Greeting Header */}
        <LiveHeader />

        {error && (
          <div className="p-3.5 bg-destructive/10 border border-destructive/25 text-destructive rounded text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {!hasActiveSession ? (
          /* Empty Active Outing State Layout */
          <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border/80 rounded-xl bg-card/20 text-center max-w-lg mx-auto space-y-5 animate-fade-in">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">No outing is active right now.</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Start your day by choosing an upcoming itinerary from your Memory Book or design a new day.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/memories">
                <button className="px-5 py-3 bg-secondary/25 hover:bg-secondary/40 border border-border text-foreground text-xs font-bold rounded transition cursor-pointer">
                  Browse Memories
                </button>
              </Link>
              <Link href="/design">
                <button className="px-5 py-3 bg-primary hover:opacity-90 active:scale-[0.98] text-primary-foreground text-xs font-bold rounded transition cursor-pointer shadow-low">
                  Design My Day
                </button>
              </Link>
            </div>
          </div>
        ) : (
          /* Active Outing Split Grid Dashboard */
          <div className="space-y-8 animate-fade-in">
            
            <div className="grid md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Check-ins, Actions, Next preview (7/12 cols) */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Section 1: Current Destination Check-In card */}
                <CurrentStopCard 
                  stop={currentStop} 
                  onCheckIn={handleCheckIn} 
                />

                {/* Section 2: Next destination preview card */}
                <NextStopCard stop={nextStop} />

                {/* Section 4: Quick Actions panel shortcut actions */}
                <QuickActions
                  onSkip={handleSkip}
                  onAddReflection={() => setReflectionOpen(true)}
                  onUploadPhoto={() => setPhotoOpen(true)}
                  disableActions={currentStop?.status === 'completed'}
                />

              </div>

              {/* Right Column: Timeline checklist progress indicators (5/12 cols) */}
              <div className="md:col-span-5 space-y-6">
                <div className="bg-[#111622] border border-border rounded-xl p-6 space-y-4 shadow-low">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Today's Journey Progress
                  </h4>
                  <LiveTimeline 
                    stops={stops} 
                    currentStopIndex={currentIdx} 
                  />
                </div>
              </div>

            </div>

            {/* Section 5: End day triggers */}
            <div className="flex justify-center border-t border-border/40 pt-6">
              <button
                onClick={() => setEndDayOpen(true)}
                className="px-6 py-3.5 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] text-xs font-bold rounded-lg transition duration-200 cursor-pointer shadow-medium uppercase tracking-widest"
              >
                Finish My Day
              </button>
            </div>

          </div>
        )}

        {/* State sheet reflection popup overlay */}
        <ReflectionSheet
          isOpen={reflectionOpen}
          onClose={() => setReflectionOpen(false)}
          initialText={currentStop?.reflection || ''}
          onSave={handleSaveReflection}
        />

        {/* State photo upload overlay */}
        <PhotoCaptureCard
          isOpen={photoOpen}
          onClose={() => setPhotoOpen(false)}
          onUpload={handleUploadPhoto}
        />

        {/* State End Outing overlay */}
        <EndDayDialog
          isOpen={endDayOpen}
          onClose={() => setEndDayOpen(false)}
          onConfirm={handleConfirmEndDay}
        />

      </div>
    </ProtectedRoute>
  );
}
