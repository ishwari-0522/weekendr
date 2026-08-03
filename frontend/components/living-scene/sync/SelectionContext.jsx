'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

const SelectionContext = createContext(null);

/**
 * SelectionProvider: Shared React context provider mapping active and hovered indices.
 */
export function SelectionProvider({ children }) {
  const [activeSpotIdx, setActiveSpotIdx] = useState(null);
  const [hoveredSpotIdx, setHoveredSpotIdx] = useState(null);

  const selectSpot = useCallback((idx) => {
    setActiveSpotIdx((prev) => (prev === idx ? null : idx));
  }, []);

  const hoverSpot = useCallback((idx) => {
    setHoveredSpotIdx(idx);
  }, []);

  const clearHover = useCallback(() => {
    setHoveredSpotIdx(null);
  }, []);

  const value = {
    activeSpotIdx,
    hoveredSpotIdx,
    selectSpot,
    hoverSpot,
    clearHover,
    setActiveSpotIdx,
    setHoveredSpotIdx
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

/**
 * useSelection: Returns context if wrapped inside SelectionProvider, else null.
 */
export function useSelection() {
  const context = useContext(SelectionContext);
  return context; // Safe fallback (returns null instead of throwing)
}
