'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getAbsolutePositionStyles, getTransformStyles } from '../sceneUtils';

function CharacterSlot({ character }) {
  const [posX, setPosX] = useState(character.x);
  const [posY, setPosY] = useState(character.y);
  const [direction, setDirection] = useState(character.direction || 'right');
  const [currState, setCurrState] = useState(character.state || 'idle');
  const basePosition = useRef({ x: character.x, y: character.y });

  useEffect(() => {
    let activeTimeout = null;

    const runBehaviorLoop = () => {
      // Roll random states: idle (50%), walking (30%), observing (20%)
      const rand = Math.random();
      let nextState = 'idle';
      let delay = 3500 + Math.random() * 4000;

      if (character.state === 'walking' || rand > 0.5) {
        nextState = 'walking';
        // Drift position slightly (+/- 3%) around base coordinate
        const drift = Math.random() * 6 - 3;
        const targetX = Math.max(10, Math.min(90, basePosition.current.x + drift));
        setPosX(targetX);
        setDirection(targetX > posX ? 'right' : 'left');
        delay = 4000 + Math.random() * 3000;
      } else if (rand > 0.3) {
        nextState = 'observing';
        // Flip direction look vector
        setDirection((prev) => (prev === 'left' ? 'right' : 'left'));
        delay = 2000 + Math.random() * 2000;
      } else {
        nextState = 'idle';
      }

      setCurrState(nextState);
      activeTimeout = setTimeout(runBehaviorLoop, delay);
    };

    const initialDelay = 1000 + Math.random() * 4000;
    activeTimeout = setTimeout(runBehaviorLoop, initialDelay);

    return () => {
      if (activeTimeout) clearTimeout(activeTimeout);
    };
  }, [character, posX]);

  const styles = getAbsolutePositionStyles(posX, posY);
  const transformStyles = getTransformStyles(direction, character.scale || 1);

  return (
    <motion.div
      style={{ ...styles, ...transformStyles }}
      animate={{ x: 0 }}
      transition={{ duration: currState === 'walking' ? 3.5 : 0.5, ease: 'easeInOut' }}
      className="flex flex-col items-center -translate-x-1/2 -translate-y-full transition-all duration-[2000ms]"
    >
      {/* Silhouette Head */}
      <div className="w-2 h-2 rounded-full bg-slate-400 border border-slate-500 shadow-low" />
      {/* Silhouette Torso */}
      <div className="w-3 h-4 bg-slate-500 border border-slate-600 rounded-t-sm" />
    </motion.div>
  );
}

/**
 * Character Behaviour System: Drives abstract silhouettes through irregular state machines.
 */
export default function CharacterBehaviour({ enabled = true, characters = [] }) {
  if (!enabled || !characters || characters.length === 0) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {characters.map((c) => (
        <CharacterSlot key={c.id} character={c} />
      ))}
    </div>
  );
}
