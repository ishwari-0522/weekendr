'use client';

import React from 'react';
import LivingSceneEngine from '../living-scene/LivingSceneEngine';
import { DEFAULT_SCENE_CONFIG } from '../living-scene/sceneConfig';

/**
 * AuthLayout: Styled split layout card showcasing a mini Living Scene
 * side-by-side with registration/login form components.
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-5xl bg-card border border-border rounded-xl overflow-hidden shadow-high grid lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Visual Column: Living Scene Preview (Lg only) */}
        <div className="hidden lg:flex lg:col-span-6 bg-secondary/10 flex-col justify-between p-8 border-r border-border">
          <div className="space-y-2">
            <span className="caption-text text-primary uppercase font-bold tracking-wider">WEEKENDR Showcase</span>
            <h3 className="text-xl font-bold text-foreground">{title || 'Designed for curious minds.'}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              {subtitle || 'Slow down and discover handpicked experiences tailored to your style, budget, and location.'}
            </p>
          </div>

          <div className="my-6 scale-95 origin-center">
            <LivingSceneEngine 
              config={DEFAULT_SCENE_CONFIG} 
              scale={0.9} 
              interactive={false} 
              assembling={false} 
            />
          </div>

          <div className="text-[10px] text-muted-foreground/60 italic">
            © WEEKENDR. Handcrafted worlds, quietly alive.
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-6 flex flex-col justify-center p-8 sm:p-12 bg-card/60">
          <div className="w-full max-w-md mx-auto">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
