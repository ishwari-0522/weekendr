'use client';

import React, { useState, useMemo } from 'react';
import HoverZones from './HoverZones';
import FocusManager from './FocusManager';
import SceneTooltip from './SceneTooltip';
import SceneMoments from './SceneMoments';

const TOOLTIP_LABELS = {
  cafe: { label: 'Café Corner', sublabel: 'Warm coffee. Better conversations.' },
  bookstore: { label: 'Bookstore', sublabel: 'Quiet pages. Infinite journeys.' },
  fountain: { label: 'The Fountain', sublabel: 'Cascading waters. Slow rhythms.' },
  bench1: { label: 'Plaza Bench', sublabel: 'Pause here. Observe the day.' },
  bench2: { label: 'Fountain Bench', sublabel: 'Sit close. Share the silence.' },
  bench3: { label: 'Tree Bench', sublabel: 'Quiet shade. Deep breaths.' },
  lamp1: { label: 'Street Lamp', sublabel: 'Soft glow. Warm guidance.' },
  lamp2: { label: 'Street Lamp', sublabel: 'Subtle light. Night breathing.' }
};

/**
 * Interaction Controller: Orchestrates hover zones, focus highlights, tooltips,
 * and handles click transitions for the pre-selected redirects.
 */
export default function InteractionController({
  enabled = true,
  interactive = false,
  config = {},
  onTriggerMoment,
  onCtaClick
}) {
  const [focusedZoneId, setFocusedZoneId] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);

  // Extract hover zones matching ground coordinates
  const hoverZones = useMemo(() => {
    const zones = [];

    // Map buildings (cafe, bookstore)
    config.buildings?.forEach((b) => {
      zones.push({
        id: b.id,
        label: b.name,
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height
      });
    });

    // Map fountain pond
    config.nature?.forEach((n) => {
      if (n.type === 'pond') {
        zones.push({
          id: n.id,
          label: 'Fountain',
          x: n.x,
          y: n.y,
          width: n.width,
          height: n.height
        });
      }
      if (n.type === 'bench') {
        zones.push({
          id: n.id,
          label: 'Bench',
          x: n.x,
          y: n.y,
          width: n.width,
          height: n.height
        });
      }
    });

    return zones;
  }, [config]);

  const handleZoneHover = (id) => {
    if (!enabled) return;
    setFocusedZoneId(id);

    // Fetch editorial label data
    const tip = TOOLTIP_LABELS[id];
    if (tip) {
      // Find center coordinate of the zone to place tooltip
      const targetZone = hoverZones.find((z) => z.id === id);
      if (targetZone) {
        setTooltipData({
          ...tip,
          x: targetZone.x + (targetZone.width || 10) / 2,
          y: targetZone.y
        });
      }
    }
  };

  const handleZoneLeave = (id) => {
    if (focusedZoneId === id) {
      setFocusedZoneId(null);
      setTooltipData(null);
    }
  };

  const handleZoneClick = (id) => {
    if (interactive && (id === 'cafe' || id === 'chalkboard-cta')) {
      if (onCtaClick) onCtaClick();
    }
  };

  return (
    <div className="absolute inset-0 z-45 pointer-events-none">
      
      {/* 1. Backdrop focus softening layer */}
      <FocusManager focusedZoneId={focusedZoneId} />

      {/* 2. Invisible keyboard-navigable Hover Zones */}
      <div className="absolute inset-0 pointer-events-auto z-45">
        <HoverZones
          zones={hoverZones}
          focusedZoneId={focusedZoneId}
          onZoneHover={handleZoneHover}
          onZoneLeave={handleZoneLeave}
          onZoneClick={handleZoneClick}
        />
      </div>

      {/* 3. Editorial Tooltips Layer */}
      {tooltipData && (
        <SceneTooltip
          label={tooltipData.label}
          sublabel={tooltipData.sublabel}
          x={tooltipData.x}
          y={tooltipData.y}
          visible={!!tooltipData}
          onClose={() => setTooltipData(null)}
        />
      )}

      {/* 4. Background Story Moments Trigger */}
      <SceneMoments
        enabled={enabled}
        onTriggerMoment={onTriggerMoment}
      />

    </div>
  );
}
