'use client';

import React, { useState, useEffect, useRef } from 'react';
import BirdSystem from './BirdSystem';
import LeafSystem from './LeafSystem';
import SteamSystem from './SteamSystem';
import WaterSystem from './WaterSystem';
import LightSystem from './LightSystem';

/**
 * Ambient Controller: Orchestrates the individual subsystems.
 * Monitors viewport intersection via IntersectionObserver to freeze updates when off-screen.
 * Applies weather hook overrides (Sunny, Rain, Wind, Cloudy).
 */
export default function AmbientController({ 
  enabled = true, 
  config = {}, 
  weather = 'Sunny',
  containerRef 
}) {
  const [inViewport, setInViewport] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // 1. Accessibility prefers-reduced-motion media query query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // 2. Viewport intersection tracker to pause off-screen rendering loops
  useEffect(() => {
    if (!containerRef || !containerRef.current || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInViewport(entry.isIntersecting);
      },
      { threshold: 0.05 } // Trigger if at least 5% of scene is visible
    );

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  // Pause all animations if offscreen or reduced-motion is active
  const isCurrentlyActive = enabled && inViewport && !reducedMotion;

  // Extract element coordinates from scene configurations
  const emitters = config.buildings
    ?.filter((b) => b.id === 'cafe' || b.id === 'stoves')
    ?.map((b) => ({ x: b.x + (b.width || 10) / 2, y: b.y }));

  const ponds = config.nature?.filter((n) => n.type === 'pond') || [];
  const lamps = config.nature?.filter((n) => n.type === 'lamp') || [];

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      
      {/* Birds System */}
      <BirdSystem 
        enabled={isCurrentlyActive && config.ambientEffects?.birds} 
        weather={weather} 
      />

      {/* Leaves System */}
      <LeafSystem 
        enabled={isCurrentlyActive && config.ambientEffects?.leaves} 
        weather={weather} 
      />

      {/* Steam System */}
      <SteamSystem 
        enabled={isCurrentlyActive && config.ambientEffects?.steam} 
        emitters={emitters} 
      />

      {/* Fountain Water ripples */}
      <WaterSystem 
        enabled={isCurrentlyActive && config.ambientEffects?.waterRipples} 
        ponds={ponds} 
      />

      {/* Lamps System */}
      <LightSystem 
        enabled={isCurrentlyActive} 
        lamps={lamps} 
      />

      {/* Rainy Weather Overlay (Visual Fog effect) */}
      {isCurrentlyActive && weather === 'Rain' && (
        <div className="absolute inset-0 bg-slate-900/10 pointer-events-none z-30 animate-pulse duration-[3000ms]">
          {/* Subtle vertical rain lines representation */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(170deg, transparent 40%, rgba(255,255,255,0.4) 45%, transparent 50%)',
              backgroundSize: '80px 200px',
              animation: 'rain-fall 0.8s linear infinite'
            }}
          />
          <style jsx global>{`
            @keyframes rain-fall {
              0% { background-position: 0px 0px; }
              100% { background-position: 40px 200px; }
            }
          `}</style>
        </div>
      )}

    </div>
  );
}
