'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Timeline Reveal: Slides the itinerary timeline complementary into view (Stage 8)
 * without overlapping or hiding the Living Scene.
 */
export default function TimelineReveal({ visible = false, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ 
        opacity: visible ? 1 : 0, 
        y: visible ? 0 : 40 
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      className="w-full relative"
    >
      {children}
    </motion.div>
  );
}
