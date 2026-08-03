'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneCamera from './SceneCamera';
import SceneLighting from './SceneLighting';
import GroundLayer from './GroundLayer';
import BuildingLayer from './BuildingLayer';
import NatureLayer from './NatureLayer';
import CharacterBehaviour from './ambient/CharacterBehaviour';
import AmbientController from './ambient/AmbientController';
import SceneTransition from './SceneTransition';
import { InteractionController } from './interaction';
import { PathBuilder, SceneReveal, AssemblyController } from './assembly';
import { 
  SelectionProvider, 
  useSelection, 
  FocusController, 
  RouteHighlighter, 
  MarkerSystem, 
  SelectionManager, 
  getSpotDetails 
} from './sync';
import { DEFAULT_SCENE_CONFIG } from './sceneConfig';

function LivingSceneEngineContent({ 
  config, 
  scale, 
  interactive, 
  weather, 
  assembling, 
  onAssemblyComplete,
  // Props fallbacks
  activeSpotIdx: propsActiveSpotIdx,
  hoveredSpotIdx: propsHoveredSpotIdx,
  onSelectSpot: propsOnSelectSpot
}) {
  const engineRef = useRef(null);

  // Memoize configuration to optimize render sweeps
  const activeConfig = useMemo(() => config || DEFAULT_SCENE_CONFIG, [config]);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedConfig, setDisplayedConfig] = useState(activeConfig);
  const [cameraEaseScale, setCameraEaseScale] = useState(1);
  const [activeMoment, setActiveMoment] = useState(null);
  
  // Track dynamic stages. Stage 8 represents a fully assembled world.
  const [assemblyStage, setAssemblyStage] = useState(assembling ? 0 : 8);

  // Reset stage when assembly status changes
  useEffect(() => {
    setAssemblyStage(assembling ? 0 : 8);
  }, [assembling]);

  // Read synchronized values from SelectionContext with fallback to props
  let context = { activeSpotIdx: null, hoveredSpotIdx: null, selectSpot: null };
  try {
    context = useSelection();
  } catch (e) {
    // SelectionProvider context missing (e.g. on landing page showcase)
  }

  const activeSpotIdx = propsActiveSpotIdx !== null ? propsActiveSpotIdx : (context ? context.activeSpotIdx : null);
  const hoveredSpotIdx = propsHoveredSpotIdx !== null ? propsHoveredSpotIdx : (context ? context.hoveredSpotIdx : null);
  const onSelectSpot = propsOnSelectSpot || (context ? context.selectSpot : null);

  // Transition through fog when config flips
  useEffect(() => {
    if (activeConfig.sceneName !== displayedConfig.sceneName) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayedConfig(activeConfig);
        setIsTransitioning(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [activeConfig, displayedConfig]);

  const handleCtaClick = () => {
    if (interactive && typeof window !== 'undefined') {
      // Step into the world zoom effect
      setCameraEaseScale(1.10);
      
      // Delay navigation slightly to let zoom transition run
      setTimeout(() => {
        window.location.href = '/design?template=Coffee%20%26%20Conversations';
      }, 950);
    }
  };

  // Get active spot details coordinate for FocusTransition
  const activeSpot = useMemo(() => {
    if (activeSpotIdx === null) return null;
    return getSpotDetails(activeSpotIdx, displayedConfig);
  }, [activeSpotIdx, displayedConfig]);

  // Extract route path coordinates sequentially
  const routePoints = useMemo(() => {
    if (!displayedConfig.paths || displayedConfig.paths.length === 0) return [];
    const points = [];
    displayedConfig.paths.forEach((p, idx) => {
      if (idx === 0) {
        points.push({ x: p.fromX, y: p.fromY });
      }
      points.push({ x: p.toX, y: p.toY });
    });
    return points;
  }, [displayedConfig.paths]);

  // Combine parent duration scale with CTA zoom scale
  const combinedScale = scale * cameraEaseScale;

  return (
    <div 
      ref={engineRef}
      className="w-full max-w-full aspect-[4/3] relative bg-[#0c101b] border border-border rounded-xl overflow-hidden shadow-overlay flex items-center justify-center p-4"
    >
      
      {/* Sky Base Gradients (Layer 1) */}
      <div className={`absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-slate-900`} />

      {/* Transitional fog wrapping layer */}
      <SceneTransition isTransitioning={isTransitioning}>
        
        {/* Scale constraints platform wrapper */}
        <div 
          className="w-full h-full relative transition-transform duration-[1000ms] ease-out"
          style={{ transform: `scale(${combinedScale})` }}
        >
          {/* Floating camera wrappers (Layer 2) */}
          <SceneCamera enabled={assemblyStage >= 5} config={displayedConfig.camera}>
            
            {/* Camera shift offset toward active spot (Maximum shift: 20px) */}
            <FocusController config={displayedConfig} enabled={assemblyStage >= 8}>

              {/* 3. Ground slabs & curved paths */}
              <div className={`w-full h-full relative transition-transform duration-700 ease-out ${
                assemblyStage >= 2 ? 'translate-y-0' : 'translate-y-6 opacity-80'
              }`}>
                <GroundLayer groundType={displayedConfig.groundType} paths={[]} />
              </div>

              {/* 4. Stroke drawing walkways pathways builder (Stage 3 & Route Stage 6) */}
              {assemblyStage < 8 ? (
                <PathBuilder 
                  stage={assemblyStage} 
                  paths={displayedConfig.paths || []} 
                  routePoints={routePoints} 
                />
              ) : (
                /* Permanent Glowing Journey Route Trail with pulses (Stage 8+) */
                <RouteHighlighter
                  routePoints={routePoints}
                  stage={assemblyStage}
                />
              )}

              {/* 5. Buildings assembly stubs (Stage 4) */}
              <SceneReveal stage={assemblyStage} targetStage={4}>
                <BuildingLayer buildings={displayedConfig.buildings} />
                
                {/* Localized Bookstore banner swing reaction when Bookstore is focused */}
                <NatureLayer nature={displayedConfig.nature} />
              </SceneReveal>

              {/* 6. Dynamic Character Behaviour Silhouettes (Stage 5) */}
              <SceneReveal stage={assemblyStage} targetStage={5} delay={0.15}>
                <CharacterBehaviour enabled={assemblyStage >= 5} characters={displayedConfig.characters} />
              </SceneReveal>

              {/* 7. Reusable Viewport-tracked Ambient Controller (Stage 5) */}
              {/* Localized Steam/Ripple intensity upgrade reaction when Cafe/Fountain is focused */}
              <AmbientController 
                enabled={assemblyStage >= 5} 
                config={displayedConfig} 
                weather={weather}
                containerRef={engineRef}
              />

              {/* 8. Numbered Destination Markers pins (Stage 7+) */}
              <MarkerSystem config={displayedConfig} stage={assemblyStage} />

              {/* 9. Contextual Stop Details popover (Stage 8+) */}
              {assemblyStage >= 8 && activeSpot && (
                <SelectionManager
                  selectedSpot={activeSpot}
                  x={activeSpot.x}
                  y={activeSpot.y}
                  onClose={() => onSelectSpot && onSelectSpot(null)}
                />
              )}

              {/* 10. Interaction Controller Layer (Hover zones, tooltips, click zooms, and moments) */}
              {assemblyStage >= 8 && activeSpotIdx === null && (
                <InteractionController
                  enabled={!isTransitioning}
                  interactive={interactive}
                  config={displayedConfig}
                  onTriggerMoment={setActiveMoment}
                  onCtaClick={handleCtaClick}
                />
              )}

              {/* 11. Environmental Storytelling Moments overlays (Rendered inline) */}
              {assemblyStage >= 8 && (
                <AnimatePresence>
                  {activeMoment === 'cyclist' && (
                    <motion.div
                      initial={{ left: '-10%', top: '65%', opacity: 0 }}
                      animate={{ left: '38%', top: '65%', opacity: [0, 1, 1, 1] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 4, ease: 'easeOut' }}
                      className="absolute z-25 w-4 h-3 border border-slate-600 bg-slate-800/80 rounded-sm flex items-center justify-center -translate-x-1/2 -translate-y-full"
                    >
                      <span className="text-[6px] text-slate-400 font-bold">🚲</span>
                    </motion.div>
                  )}

                  {activeMoment === 'newspaper' && (
                    <motion.div
                      initial={{ left: '25%', top: '70%', rotate: 0, opacity: 0 }}
                      animate={{
                        left: '80%',
                        top: '64%',
                        rotate: [0, 45, -15, 90],
                        opacity: [0, 0.45, 0.45, 0]
                      }}
                      transition={{ duration: 5.5, ease: 'easeInOut' }}
                      className="absolute z-25 w-2 h-1.5 bg-slate-200/50 rounded-[1px] -translate-x-1/2 -translate-y-1/2"
                    />
                  )}

                  {activeMoment === 'bird-land' && (
                    <motion.div
                      initial={{ left: '110%', top: '10%', opacity: 0, scale: 0.7 }}
                      animate={{
                        left: ['110%', '82%', '82%', '115%'],
                        top: ['10%', '42%', '42%', '-15%'],
                        opacity: [0, 0.5, 0.5, 0]
                      }}
                      transition={{ duration: 6, times: [0, 0.3, 0.7, 1], ease: 'easeInOut' }}
                      className="absolute z-25 text-[8px] -translate-x-1/2 -translate-y-full pointer-events-none"
                    >
                      🐦
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* 12. Lighting masks overlay (Layer 2.5 overlay) */}
              <SceneLighting presetName={displayedConfig.lighting} />

            </FocusController>
          </SceneCamera>
        </div>

      </SceneTransition>

      {/* 13. World Assembly Timed Overlay Controller */}
      <AssemblyController 
        isActive={assembling} 
        onStageChange={setAssemblyStage}
        onComplete={onAssemblyComplete}
      />

    </div>
  );
}

/**
 * LivingSceneEngine wrapper managing context bindings safely.
 */
export function LivingSceneEngine(props) {
  return (
    <LivingSceneEngineContent {...props} />
  );
}

export default LivingSceneEngine;
