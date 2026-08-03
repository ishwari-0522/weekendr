'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * ReflectionEditor: Inline click-to-edit auto-saving text area component.
 */
export default function ReflectionEditor({ initialReflection = '', onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [reflection, setReflection] = useState(initialReflection);
  const textareaRef = useRef(null);

  useEffect(() => {
    setReflection(initialReflection);
  }, [initialReflection]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (onSave) {
      onSave(reflection);
    }
  };

  return (
    <div className="space-y-2 text-left">
      <div className="flex justify-between items-center border-b border-border/40 pb-2">
        <h4 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
          Reflections
        </h4>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-primary hover:underline cursor-pointer transition"
          >
            Edit Reflection
          </button>
        )}
      </div>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          onBlur={handleBlur}
          placeholder="What made this day memorable?"
          className="w-full min-h-[120px] p-3 bg-secondary/10 border border-primary/40 rounded-lg text-xs leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition duration-150"
        />
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="p-3.5 bg-secondary/5 border border-border/40 hover:border-primary/25 rounded-lg text-xs leading-relaxed text-foreground/90 italic cursor-pointer min-h-[60px]"
        >
          {reflection.trim() ? `"${reflection}"` : 'What made this day memorable? Tap to write a memory.'}
        </div>
      )}
    </div>
  );
}
export { ReflectionEditor };
