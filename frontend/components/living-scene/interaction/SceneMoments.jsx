'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Scene Moments: Triggers single, non-consecutive environmental storytelling clips.
 * Mapped options:
 * - 'cyclist': A cyclist rides in from the left and parks.
 * - 'greet': Two character silhouettes wave/greet each other.
 * - 'bird-land': A small bird lands on the fountain, drinks, then flies away.
 * - 'newspaper': A wind-blown sheet drifts across the sidewalk.
 */
export default function SceneMoments({ enabled = true, onTriggerMoment }) {
  useEffect(() => {
    if (!enabled) return;

    let activeTimeout = null;
    let lastMomentIdx = -1;
    const momentIds = ['cyclist', 'greet', 'bird-land', 'newspaper'];

    const runMomentsLoop = () => {
      // Pick a random moment that is not the same as the last one
      let idx = Math.floor(Math.random() * momentIds.length);
      if (idx === lastMomentIdx) {
        idx = (idx + 1) % momentIds.length;
      }
      lastMomentIdx = idx;

      const activeMoment = momentIds[idx];
      onTriggerMoment(activeMoment);

      // Moment duration runs for 6.5 seconds, then resets
      setTimeout(() => {
        onTriggerMoment(null);
      }, 6500);

      // Schedule next event (20s to 40s)
      const nextInterval = 20000 + Math.random() * 20000;
      activeTimeout = setTimeout(runMomentsLoop, nextInterval);
    };

    const initialDelay = 15000 + Math.random() * 10000;
    activeTimeout = setTimeout(runMomentsLoop, initialDelay);

    return () => {
      if (activeTimeout) clearTimeout(activeTimeout);
    };
  }, [enabled, onTriggerMoment]);

  return null;
}
