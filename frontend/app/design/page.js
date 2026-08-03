'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import useSearchParams from 'next/navigation'; // import just to avoid warnings in next compile
import usePlanner from '../../hooks/usePlanner';
import plannerService from '../../services/planner/plannerService';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
import { LivingSceneEngine, SCENE_CONFIGS, DEFAULT_SCENE_CONFIG } from '../../components/living-scene';
import { TimelineReveal } from '../../components/living-scene/assembly';
import { SelectionProvider, useSelection } from '../../components/living-scene/sync';
import useAuth from '../../hooks/useAuth';
import GuestCard from '../../components/auth/GuestCard';

export function DesignPageContent() {
  const [city, setCity] = useState('Pune');
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState(2000);
  const [durationHours, setDurationHours] = useState(3);
  const [group, setGroup] = useState('Couple');
  const [selectedTemplate, setSelectedTemplate] = useState('Coffee & Conversations');
  const [selectedPrefs, setSelectedPrefs] = useState(['Late Night']);
  const [itinerary, setItinerary] = useState(null);
  const { activeSpotIdx, hoveredSpotIdx, setActiveSpotIdx, setHoveredSpotIdx } = useSelection();
  const { user } = useAuth();
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  
  // Validation errors
  const [validationError, setValidationError] = useState('');
  const [inlineError, setInlineError] = useState('');

  // Toast status alert
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Place detail modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    loading,
    error: apiError,
    templates,
    areas,
    fetchAreas,
    generateExperience,
    editExperience,
  } = usePlanner(city);

  // Automatically refresh areas when city dropdown flips
  useEffect(() => {
    fetchAreas(city);
    setArea(''); // Clear area on city change
  }, [city, fetchAreas]);

  // Read URL query parameter client-side safely to pre-select templates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const templateParam = params.get('template');
      if (templateParam) {
        setSelectedTemplate(templateParam);
      }
    }
  }, []);

  // Toggle selection chips helper
  const handlePrefToggle = (pref) => {
    if (loading) return;
    if (selectedPrefs.includes(pref)) {
      setSelectedPrefs(selectedPrefs.filter((p) => p !== pref));
    } else {
      setSelectedPrefs([...selectedPrefs, pref]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setValidationError('');
    setInlineError('');
    setItinerary(null);
    setActiveSpotIdx(null);
    setHoveredSpotIdx(null);

    // Dynamic field validation checks
    if (!area) {
      setValidationError('Please choose a neighborhood area to explore.');
      return;
    }

    const payload = {
      city,
      area,
      budget,
      duration: durationHours * 60, // Convert hours to minutes
      group,
      experienceTemplate: selectedTemplate,
      preferences: selectedPrefs
    };

    const res = await generateExperience(payload);
    if (res.success) {
      setItinerary(res.data);
      showToast('Itinerary Created! We\'ve optimized stops for your outing.', 'success');
    }
  };

  // Triggers edit actions (replace, remove, move earlier, move later)
  const handleEditAction = async (actionType, idx, newPlaceId = null) => {
    setInlineError('');
    if (!itinerary) return;

    const currentPlaces = itinerary.segments
      .filter((s) => s.type === 'activity')
      .map((s) => ({
        place_id: s.place_id,
        name: s.name,
        category: s.category,
        area: s.area,
        latitude: s.latitude,
        longitude: s.longitude,
        estimated_cost: s.estimated_cost
      }));

    const actionPayload = {
      type: actionType,
      index: idx,
      new_place_id: newPlaceId,
      city,
      itinerary_id: itinerary.metadata?.itinerary_id || 'active_session'
    };

    if (actionType === 'move' && idx === 0 && actionPayload.direction === 'earlier') return;

    const payload = {
      currentPlaces,
      action: actionPayload,
      budget,
      duration: durationHours * 60,
      templateName: itinerary.experience_template
    };

    const res = await editExperience(payload);
    if (res.success) {
      setItinerary(res.data);
      showToast('Experience Updated! Recalculated timeline and travel details.', 'success');
    } else {
      setInlineError(res.message);
      showToast(res.message || 'Edit failed.', 'error');
    }
  };

  // Triggers Undo/Redo edits
  const handleUndoRedo = async (type) => {
    setInlineError('');
    if (!itinerary) return;

    const currentPlaces = itinerary.segments
      .filter((s) => s.type === 'activity')
      .map((s) => ({
        place_id: s.place_id,
        name: s.name,
        category: s.category,
        area: s.area,
        latitude: s.latitude,
        longitude: s.longitude,
        estimated_cost: s.estimated_cost
      }));

    const payload = {
      currentPlaces,
      action: {
        type,
        itinerary_id: itinerary.metadata?.itinerary_id || 'active_session'
      },
      budget,
      duration: durationHours * 60,
      templateName: itinerary.experience_template
    };

    const res = await editExperience(payload);
    if (res.success) {
      setItinerary(res.data);
      showToast(type === 'undo' ? 'Undo applied.' : 'Redo applied.', 'info');
    } else {
      setInlineError(res.message);
    }
  };

  // View Place details modal handler
  const handleViewDetails = async (placeId) => {
    setModalOpen(true);
    setModalLoading(true);
    setSelectedPlaceDetails(null);

    const res = await plannerService.getPlace(placeId);
    setModalLoading(false);
    if (res.success) {
      setSelectedPlaceDetails(res.data);
    } else {
      showToast('Could not fetch place details.', 'error');
      setModalOpen(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  const groupTypes = ['Solo', 'Couple', 'Friends', 'Family'];
  
  const templateList = [
    { name: 'Coffee & Conversations', desc: 'Relaxed cafe discussions, bookstores & quiet spots.' },
    { name: 'Date Night', desc: 'Romantic ambiance, fine food & elegant endings.' },
    { name: 'Game On', desc: 'Active entertainment, arcade games & lively food spots.' },
    { name: 'Food Trail', desc: 'A curated journey focusing on multiple culinary stops.' },
    { name: 'Nature Escape', desc: 'Scenic viewpoints, open parks & peaceful settings.' },
    { name: 'Creative Escape', desc: 'Art museums, custom workshops & quiet thinking spots.' },
    { name: 'Retail Therapy', desc: 'Curated boutique shopping & high-end dessert bars.' },
    { name: 'Rainy Day', desc: 'Cosy indoor venues, warmth & comfort snacks.' }
  ];

  const preferenceOptions = [
    'Indoor', 'Outdoor', 'Pet Friendly', 'Vegetarian', 
    'Live Music', 'Late Night', 'Budget Friendly', 'Instagrammable'
  ];

  // Dynamic Living Scene config generator reacting to selection changes
  const activeSceneConfig = useMemo(() => {
    const baseConfig = SCENE_CONFIGS[selectedTemplate] || {
      ...DEFAULT_SCENE_CONFIG,
      sceneName: selectedTemplate,
      lighting: selectedTemplate === 'Game On' || selectedTemplate === 'Date Night' ? 'Night' : (selectedTemplate === 'Rainy Day' ? 'Rain' : 'Afternoon')
    };

    // 1. Group silhouettes list overrides based on group size
    let characters = [];
    if (group === 'Solo') {
      characters = [{ id: 'solo', x: 50, y: 65, scale: 1, direction: 'right', state: 'idle' }];
    } else if (group === 'Couple') {
      characters = [
        { id: 'c1', x: 42, y: 65, scale: 1, direction: 'right', state: 'idle' },
        { id: 'c2', x: 58, y: 67, scale: 0.95, direction: 'left', state: 'idle' }
      ];
    } else if (group === 'Friends') {
      characters = [
        { id: 'c1', x: 30, y: 65, scale: 0.9, direction: 'right', state: 'idle' },
        { id: 'c2', x: 42, y: 66, scale: 1.0, direction: 'right', state: 'idle' },
        { id: 'c3', x: 56, y: 68, scale: 0.95, direction: 'left', state: 'idle' },
        { id: 'c4', x: 68, y: 65, scale: 0.9, direction: 'left', state: 'idle' }
      ];
    } else { // Family
      characters = [
        { id: 'c1', x: 38, y: 65, scale: 1.0, direction: 'right', state: 'idle' },
        { id: 'c2', x: 48, y: 66, scale: 0.95, direction: 'left', state: 'idle' },
        { id: 'c3', x: 58, y: 68, scale: 0.7, direction: 'right', state: 'idle' }
      ];
    }

    // 2. Budget visual upgrades
    let buildings = [...(baseConfig.buildings || [])];
    if (budget >= 5000) {
      buildings.push({
        id: 'premium-lounge',
        name: 'Luxury Lounge',
        x: 68,
        y: 60,
        width: 14,
        height: 18,
        color: 'bg-yellow-950/20 border-yellow-800/40 text-yellow-200 shadow-medium'
      });
    }

    return {
      ...baseConfig,
      characters,
      buildings
    };
  }, [selectedTemplate, group, budget]);

  // Duration scale factor
  const durationScale = useMemo(() => {
    return 0.85 + (durationHours / 12) * 0.3;
  }, [durationHours]);

  return (
    <div className="max-w-7xl mx-auto py-4">
      
      {/* Toast Notification Alert */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />

      {/* Place Details Modal Popup */}
      <Modal
        isOpen={modalOpen}
        title={selectedPlaceDetails?.name || 'Place Details'}
        onClose={() => setModalOpen(false)}
      >
        {modalLoading ? (
          <div className="p-6 text-center text-sm font-semibold text-muted-foreground bg-card">
            Loading spot details...
          </div>
        ) : selectedPlaceDetails ? (
          <div className="space-y-4 text-left text-sm text-foreground bg-card">
            {selectedPlaceDetails.image_url && (
              <img
                src={selectedPlaceDetails.image_url}
                alt={selectedPlaceDetails.name}
                className="w-full h-48 object-cover rounded border border-border"
              />
            )}
            <div>
              <span className="caption-text text-muted-foreground uppercase">Description</span>
              <p className="mt-1 body-text text-foreground leading-relaxed">{selectedPlaceDetails.description || 'No description available.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
              <div>
                <span className="caption-text text-muted-foreground uppercase">Rating</span>
                <p className="body-text font-bold text-foreground">⭐ {selectedPlaceDetails.rating || 'N/A'}</p>
              </div>
              <div>
                <span className="caption-text text-muted-foreground uppercase">Price Level</span>
                <p className="body-text font-bold text-foreground">
                  {selectedPlaceDetails.price_level !== null ? '₹'.repeat(selectedPlaceDetails.price_level + 1) : 'N/A'}
                </p>
              </div>
            </div>
            {selectedPlaceDetails.website && (
              <div className="border-t border-border pt-3">
                <span className="caption-text text-muted-foreground uppercase">Website</span>
                <a
                  href={selectedPlaceDetails.website}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-xs font-semibold text-primary underline hover:opacity-85"
                >
                  {selectedPlaceDetails.website}
                </a>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Header */}
      <div className="mb-10 text-left border-b border-border pb-6">
        <h1 className="display-large text-foreground mb-2">Design My Day</h1>
        <p className="body-large text-muted-foreground">Tell us a little about your day.</p>
      </div>

      {/* 2-Column Responsive Layout (World remains visible at right side, timeline complements on left) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Form (if itinerary == null) OR Timeline (if itinerary != null) */}
        <div className="lg:col-span-5">
          {!itinerary ? (
            
            /* 1. PLANNER FORM */
            <form onSubmit={handleGenerate} className="space-y-8">
              {(validationError || apiError) && (
                <div className="p-4 bg-red-950/20 border border-red-900 text-red-200 rounded text-sm font-medium">
                  {validationError || apiError}
                </div>
              )}

              {/* City */}
              <div className="space-y-2">
                <label className="block label-text text-foreground">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 border border-border rounded bg-card text-foreground focus:ring-1 focus:ring-primary outline-none transition disabled:opacity-50"
                >
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
              </div>

              {/* Area */}
              <div className="space-y-2">
                <label className="block label-text text-foreground">Neighborhood Area</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 border border-border rounded bg-card text-foreground focus:ring-1 focus:ring-primary outline-none transition disabled:opacity-50"
                >
                  <option value="">Select neighborhood area...</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Type */}
              <div className="space-y-2">
                <label className="block label-text text-foreground">Group Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {groupTypes.map((t) => {
                    const isActive = group === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => !loading && setGroup(t)}
                        disabled={loading}
                        className={`p-3 border rounded button-text transition text-center cursor-pointer ${
                          isActive
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card hover:border-primary text-muted-foreground hover:text-foreground'
                        } disabled:opacity-50`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-muted-foreground">Budget Limit</span>
                  <span className="text-foreground">₹{budget.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  disabled={loading}
                  className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-muted-foreground">Outing Duration</span>
                  <span className="text-foreground">{durationHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                  disabled={loading}
                  className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                />
              </div>

              {/* Experience Template */}
              <div className="space-y-2">
                <label className="block label-text text-foreground">Experience Template</label>
                <div className="space-y-3">
                  {templateList.map((t) => {
                    const isActive = selectedTemplate === t.name;
                    return (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => !loading && setSelectedTemplate(t.name)}
                        disabled={loading}
                        className={`w-full p-4 border rounded text-left transition flex flex-col gap-1 cursor-pointer ${
                          isActive
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card hover:border-primary text-foreground'
                        } disabled:opacity-50`}
                      >
                        <span className="text-sm font-bold text-foreground">{t.name}</span>
                        <span className="caption-text text-muted-foreground font-medium">{t.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-2">
                <label className="block label-text text-foreground">Vibe Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {preferenceOptions.map((p) => {
                    const isSelected = selectedPrefs.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePrefToggle(p)}
                        disabled={loading}
                        className={`px-3 py-1.5 border rounded-full caption-text transition cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card hover:border-primary text-muted-foreground hover:text-foreground'
                        } disabled:opacity-50`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full p-4 bg-primary hover:opacity-90 active:scale-[0.98] text-primary-foreground rounded button-text transition duration-300 ease-[var(--ease-premium-out)] disabled:opacity-50 cursor-pointer shadow-low hover:shadow-medium"
              >
                {loading ? 'Assembling World...' : 'Generate My Day'}
              </button>
            </form>

          ) : (
            
            /* 2. REVEALED TIMELINE VIEW (Slides in side-by-side) */
            <TimelineReveal visible={true}>
              <div className="text-left space-y-8">
                
                {/* AI Storytelling Editorial Layer */}
                {itinerary.story && (
                  <div className="space-y-4 mb-6 border-b border-border/40 pb-6">
                    <h2 className="text-xl font-extrabold text-foreground leading-tight tracking-tight uppercase">
                      {itinerary.story.title}
                    </h2>
                    <p className="body-large text-muted-foreground leading-relaxed italic font-medium">
                      "{itinerary.story.intro}"
                    </p>
                    
                    {/* Highlights */}
                    {itinerary.story.highlights && itinerary.story.highlights.length > 0 && (
                      <ul className="space-y-2 mt-4 pl-3.5 border-l border-primary/30">
                        {itinerary.story.highlights.map((h, i) => (
                          <li key={i} className="text-xs font-semibold text-foreground flex items-center gap-2">
                            <span className="text-primary text-[10px]">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    <p className="text-[11px] text-muted-foreground/80 font-bold tracking-wide italic border-t border-border/20 pt-3">
                      {itinerary.story.ending}
                    </p>
                  </div>
                )}

                {/* Itinerary Header */}
                <div className="border-b border-border pb-4">
                  <h3 className="section-title text-foreground font-black">
                    {itinerary.experience_template}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground font-semibold">
                    <span>👥 {group}</span>
                    <span>•</span>
                    <span>₹{itinerary.total_budget} spend</span>
                  </div>
                </div>

                {/* History state undo/redo */}
                {itinerary.metadata?.history_states_available && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUndoRedo('undo')}
                      disabled={loading || itinerary.metadata.undo_steps === 0}
                      className="px-2.5 py-1.5 border border-border bg-card text-[10px] font-bold text-foreground rounded hover:border-primary transition cursor-pointer disabled:opacity-50"
                    >
                      ⟲ Undo ({itinerary.metadata.undo_steps})
                    </button>
                    <button
                      onClick={() => handleUndoRedo('redo')}
                      disabled={loading || itinerary.metadata.redo_steps === 0}
                      className="px-2.5 py-1.5 border border-border bg-card text-[10px] font-bold text-foreground rounded hover:border-primary transition cursor-pointer disabled:opacity-50"
                    >
                      ⟳ Redo ({itinerary.metadata.redo_steps})
                    </button>
                  </div>
                )}

                {/* Error warning box */}
                {inlineError && (
                  <div className="p-3 bg-red-950/20 border border-red-900 text-red-200 rounded text-[11px] font-semibold">
                    ⚠️ {inlineError}
                  </div>
                )}

                {/* Chronological Timeline Segments list */}
                <div className="relative border-l border-border ml-2 space-y-4 pb-4">
                  {itinerary.segments.map((seg, idx) => {
                    if (seg.type === 'activity') {
                      const activityIdx = itinerary.segments
                        .slice(0, idx)
                        .filter((s) => s.type === 'activity').length;

                      const isSelected = activeSpotIdx === activityIdx;
                      const isHovered = hoveredSpotIdx === activityIdx;

                      return (
                        <div 
                          key={idx} 
                          className="relative pl-6 group"
                          onMouseEnter={() => setHoveredSpotIdx(activityIdx)}
                          onMouseLeave={() => setHoveredSpotIdx(null)}
                          onClick={() => setActiveSpotIdx(activityIdx)}
                        >
                          {/* Chronological dots */}
                          <div className={`absolute left-0 top-3 -translate-x-[4.5px] w-2.5 h-2.5 rounded-full border border-background transition-colors duration-300 ${
                            isSelected ? 'bg-primary shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-border group-hover:bg-primary/60'
                          }`} />

                          <div className={`p-4 bg-card border rounded-lg space-y-3 shadow-low hover:shadow-medium hover:-translate-y-0.5 transition-all duration-300 ease-[var(--ease-premium-out)] cursor-pointer ${
                            isSelected 
                              ? 'bg-secondary/25 border-l-4 border-l-primary border-t-border border-r-border border-b-border shadow-medium' 
                              : isHovered 
                                ? 'border-highlight/50 shadow-medium' 
                                : 'border-border'
                          }`}>
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <span className="text-[10px] text-muted-foreground block">
                                  ⏰ {seg.arrival_time} - {seg.departure_time}
                                </span>
                                <h4 className="text-sm font-bold text-foreground mt-0.5">{seg.name}</h4>
                                <span className="caption-text text-muted-foreground font-semibold uppercase">{seg.category}</span>
                              </div>
                              <span className="text-xs font-bold text-foreground">₹{seg.estimated_cost}</span>
                            </div>

                            {/* Mutator Actions */}
                            <div className="flex items-center justify-between border-t border-border pt-2.5 text-[10px] font-bold">
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditAction('replace', activityIdx);
                                  }}
                                  disabled={loading}
                                  className="text-primary hover:opacity-85 transition cursor-pointer"
                                >
                                  Replace
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(seg.place_id);
                                  }}
                                  className="text-muted-foreground hover:text-foreground transition cursor-pointer"
                                >
                                  Details
                                </button>
                              </div>

                              <div className="flex gap-1 items-center text-muted-foreground">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditAction('move', activityIdx, { direction: 'earlier' });
                                  }}
                                  disabled={loading || activityIdx === 0}
                                  className="p-1 border border-border bg-card rounded hover:text-foreground disabled:opacity-30 transition cursor-pointer"
                                >
                                  ▲
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditAction('move', activityIdx, { direction: 'later' });
                                  }}
                                  disabled={loading || activityIdx === (itinerary.segments.filter(s => s.type === 'activity').length - 1)}
                                  className="p-1 border border-border bg-card rounded hover:text-foreground disabled:opacity-30 transition cursor-pointer"
                                >
                                  ▼
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditAction('remove', activityIdx);
                                  }}
                                  disabled={loading}
                                  className="p-1 text-destructive hover:bg-destructive/10 rounded transition cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // AI Transition Insights rendering block
                      let transitionInsight = "A comfortable, short commute connects these destinations.";
                      if (seg.duration_mins <= 10) {
                        transitionInsight = "Only a short walk separates these two locations.";
                      } else if (selectedTemplate === "Food Trail") {
                        transitionInsight = "We planned dessert nearby so you can avoid extra travel.";
                      } else if (seg.arrival_time && parseInt(seg.arrival_time.split(":")[0]) >= 17) {
                        transitionInsight = "This stop is timed around sunset.";
                      }

                      return (
                        <div key={idx} className="relative pl-6 py-2">
                          <div className="absolute left-[3.5px] top-0 bottom-0 border-l border-dashed border-border" />
                          <div className="text-[10px] text-muted-foreground bg-secondary/15 px-3 py-2.5 rounded border border-border/40 italic font-semibold max-w-[280px]">
                            💬 {transitionInsight}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>

                {/* Final capturing CTAs */}
                <div className="flex gap-2 border-t border-border pt-4 text-xs font-bold">
                  <button
                    onClick={() => setItinerary(null)}
                    className="px-3 py-2 border border-border bg-card rounded hover:border-primary text-muted-foreground transition cursor-pointer"
                  >
                    Edit Outing
                  </button>
                  <button
                    onClick={() => {
                      if (user?.role === 'guest') {
                        setGuestModalOpen(true);
                      } else {
                        showToast('Saved to Memory Book!', 'success');
                      }
                    }}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition cursor-pointer"
                  >
                    Capture Outing
                  </button>
                </div>

              </div>
            </TimelineReveal>
          )}
        </div>

        {/* Right Column: Interactive Living Scene (Desktop 65% width - remains visible in both stages) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <LivingSceneEngine 
              key={loading ? 'assembling' : selectedTemplate} 
              config={activeSceneConfig} 
              scale={durationScale} 
              assembling={loading}
              activeSpotIdx={activeSpotIdx}
              hoveredSpotIdx={hoveredSpotIdx}
              onSelectSpot={setActiveSpotIdx}
            />
          </div>

          {/* Environmental parameters status labels */}
          <div className="w-full bg-card border border-border rounded-lg p-4 text-left space-y-2.5 text-xs text-muted-foreground shadow-low">
            <div className="flex justify-between border-b border-border pb-1.5">
              <span>Environment World:</span>
              <span className="font-bold text-foreground">{selectedTemplate}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span>Scale Factor (Duration):</span>
              <span className="font-bold text-foreground">{durationHours}h ({Math.round(durationScale * 100)}%)</span>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span>Dynamic Upgrades:</span>
              <span className="font-bold text-foreground">
                {budget >= 5000 ? 'Luxury Lounge Activated' : 'Standard Budget'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>People:</span>
              <span className="font-bold text-foreground">{group} ({group === 'Solo' ? '1 Person' : group === 'Couple' ? '2 People' : group === 'Friends' ? '4 People' : '3 People'})</span>
            </div>
          </div>
        </div>

      </div>

      {/* Guest registration prompt modal */}
      <Modal isOpen={guestModalOpen} onClose={() => setGuestModalOpen(false)}>
        <GuestCard onClose={() => setGuestModalOpen(false)} />
      </Modal>

    </div>
  );
}

export default function DesignPage() {
  return (
    <SelectionProvider>
      <DesignPageContent />
    </SelectionProvider>
  );
}
