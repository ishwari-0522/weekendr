'use client';

import React from 'react';
import { LIGHTING_PRESETS } from './sceneConfig';

/**
 * Renders overlay masks representing active ambient tint, brightness, and warmth.
 */
export default function SceneLighting({ presetName = 'Afternoon' }) {
  const preset = LIGHTING_PRESETS[presetName] || LIGHTING_PRESETS.Afternoon;

  return (
    <>
      {/* Dynamic ambient overlay tint mask layer */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-colors duration-1000 ${preset.ambientTint}`} />
      
      {/* Preset filters applied over the entire scene */}
      <div className={`absolute inset-0 pointer-events-none z-20 transition-all duration-1000 ${preset.brightness} ${preset.warmth}`} />
      
      {/* Soft vignette shadows overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-1000 bg-radial-[circle_at_center,transparent_55%,#080b11_95%]"
        style={{ opacity: preset.shadowOpacity }}
      />
    </>
  );
}
