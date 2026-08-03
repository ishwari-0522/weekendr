'use client';

import React, { useState, useEffect } from 'react';

/**
 * Assembly Timeline: Manages a timed state machine cycle (Stage 1 to 8) spanning exactly 3 seconds.
 */
export default function AssemblyTimeline({ isActive, onStageChange }) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setCurrentStage(0);
      return;
    }

    // Timeline triggers sequence
    const stageTimeouts = [
      { stage: 1, delay: 0 },       // Stage 1: World pauses, camera settles
      { stage: 2, delay: 400 },     // Stage 2: Platform rises, shadow appears
      { stage: 3, delay: 800 },     // Stage 3: Paths draw
      { stage: 4, delay: 1200 },    // Stage 4: Buildings rise, trees grow
      { stage: 5, delay: 1800 },    // Stage 5: Ambient life, characters arrive
      { stage: 6, delay: 2200 },    // Stage 6: Glowing route draws
      { stage: 7, delay: 2600 },    // Stage 7: Destination markers appear
      { stage: 8, delay: 3000 }     // Stage 8: Timeline slide-in
    ];

    const timeouts = stageTimeouts.map((st) => {
      return setTimeout(() => {
        setCurrentStage(st.stage);
        if (onStageChange) onStageChange(st.stage);
      }, st.delay);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isActive, onStageChange]);

  return null;
}
