'use client';

import React from 'react';
import { SelectionProvider } from './SelectionContext';

/**
 * SceneTimelineSync: Orchestrator component providing SelectionContext wrapper.
 */
export default function SceneTimelineSync({ children }) {
  return (
    <SelectionProvider>
      {children}
    </SelectionProvider>
  );
}
