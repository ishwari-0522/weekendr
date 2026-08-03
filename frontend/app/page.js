'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LivingSceneEngine, SCENE_CONFIGS } from '../components/living-scene';

export default function ExplorePage() {
  const containerRef = useRef(null);

  // Track scroll progress across the 400vh page height
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 1. Background deepening mask (sky gets darker as user scrolls)
  const bgDarkness = useTransform(scrollYProgress, [0, 0.85], [0.15, 0.92]);

  // 2. Opening scene logo, statement & indicator opacities/offsets (0.0 to 0.22)
  const logoOpacity = useTransform(scrollYProgress, [0, 0.15, 0.22], [1, 1, 0]);
  const logoY = useTransform(scrollYProgress, [0, 0.22], [0, -30]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.08], [0.8, 0]);

  // 3. Statement 1: "Every city is full of places." (0.25 to 0.46)
  const stmt1Opacity = useTransform(scrollYProgress, [0.22, 0.28, 0.4, 0.46], [0, 1, 1, 0]);
  const stmt1Y = useTransform(scrollYProgress, [0.22, 0.28, 0.4, 0.46], [25, 0, 0, -25]);

  // 4. Statement 2: "They become unforgettable only when shared." (0.48 to 0.70)
  const stmt2Opacity = useTransform(scrollYProgress, [0.46, 0.52, 0.64, 0.7], [0, 1, 1, 0]);
  const stmt2Y = useTransform(scrollYProgress, [0.46, 0.52, 0.64, 0.7], [25, 0, 0, -25]);

  // 5. Statement 3: "WEEKENDR designs those moments." (0.72 to 0.90)
  const stmt3Opacity = useTransform(scrollYProgress, [0.7, 0.76, 0.86, 0.92], [0, 1, 1, 0]);
  const stmt3Y = useTransform(scrollYProgress, [0.7, 0.76, 0.86, 0.92], [25, 0, 0, -25]);

  // 6. First Living Scene emergence (0.90 to 1.0)
  const sceneOpacity = useTransform(scrollYProgress, [0.88, 0.96], [0, 1]);
  const sceneY = useTransform(scrollYProgress, [0.88, 1.0], [100, 0]);

  // Tiny floating dust particles seeds (adds to sky wonder feeling)
  const particleSeeds = [
    { x: '15%', y: '40%', size: 3, duration: 14 },
    { x: '35%', y: '60%', size: 4, duration: 18 },
    { x: '55%', y: '30%', size: 3, duration: 15 },
    { x: '75%', y: '50%', size: 5, duration: 22 },
    { x: '85%', y: '25%', size: 3, duration: 16 },
  ];

  // Retrieve the first living scene config
  const coffeeConfig = SCENE_CONFIGS['Coffee & Conversations'];

  return (
    <div ref={containerRef} className="relative w-full min-h-[400vh] bg-[#0c101b] overflow-x-hidden">
      
      {/* --------------------------------------------------
         CINEMATIC BACKDROP LAYERS (Viewport-Locked)
         -------------------------------------------------- */}
      <div className="fixed inset-0 pointer-events-none select-none z-0">
        
        {/* Soft twilight background sky gradients */}
        <div className="absolute inset-0 bg-[#0c101b]" />
        
        <motion.div
          animate={{
            opacity: [0.12, 0.22, 0.12],
            scale: [0.97, 1.03, 0.97]
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: 'easeInOut'
          }}
          className="absolute -right-24 -top-24 w-[650px] h-[650px] bg-primary/20 blur-[130px] rounded-full"
        />

        <motion.div
          animate={{
            opacity: [0.06, 0.12, 0.06],
            scale: [1.02, 0.98, 1.02]
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: 'easeInOut'
          }}
          className="absolute left-1/4 bottom-12 w-[550px] h-[550px] bg-highlight/10 blur-[110px] rounded-full"
        />

        {/* Scroll-linked background darkening overlay mask */}
        <motion.div
          style={{ opacity: bgDarkness }}
          className="absolute inset-0 bg-black"
        />

        {/* Soft Vignette Masking frame */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_45%,#080b11_95%] opacity-90" />
      </div>

      {/* Floating sky dust particles */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {particleSeeds.map((pt, idx) => (
          <motion.div
            key={idx}
            style={{
              left: pt.x,
              top: pt.y,
              width: pt.size,
              height: pt.size
            }}
            animate={{
              y: [0, -180],
              opacity: [0, 0.35, 0]
            }}
            transition={{
              duration: pt.duration,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute bg-white/10 rounded-full"
          />
        ))}
      </div>

      {/* --------------------------------------------------
         STICKY SCENE CONTROLLER (Centered Content Viewport)
         -------------------------------------------------- */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] w-full overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 z-20">
        
        {/* ==================================================
            STAGE 1: LOGO, STATEMENT & SCROLL INDICATOR
            ================================================== */}
        <motion.div
          style={{ opacity: logoOpacity, y: logoY }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
        >
          <div className="space-y-6 max-w-2xl">
            <h1 className="display-xl text-foreground tracking-[0.25em] font-extrabold uppercase pl-[0.25em]">
              WEEKENDR
            </h1>
            <p className="body-large text-muted-foreground max-w-md mx-auto leading-relaxed italic">
              Every great memory starts with a day worth remembering.
            </p>
          </div>

          {/* Minimal Scroll Indicator */}
          <motion.div
            style={{ opacity: scrollIndicatorOpacity }}
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="absolute bottom-12 flex flex-col items-center gap-2 text-muted-foreground/60 text-xs font-bold tracking-widest uppercase"
          >
            <span>Scroll</span>
            <span>↓</span>
          </motion.div>
        </motion.div>

        {/* ==================================================
            STAGE 2: STATEMENT 1
            ================================================== */}
        <motion.div
          style={{ opacity: stmt1Opacity, y: stmt1Y }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none"
        >
          <h2 className="display-large text-foreground leading-tight max-w-3xl italic font-normal">
            "Every city is full of places."
          </h2>
        </motion.div>

        {/* ==================================================
            STAGE 3: STATEMENT 2
            ================================================== */}
        <motion.div
          style={{ opacity: stmt2Opacity, y: stmt2Y }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none"
        >
          <h2 className="display-large text-foreground leading-tight max-w-3xl italic font-normal">
            "They become unforgettable only when shared."
          </h2>
        </motion.div>

        {/* ==================================================
            STAGE 4: STATEMENT 3
            ================================================== */}
        <motion.div
          style={{ opacity: stmt3Opacity, y: stmt3Y }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none"
        >
          <h2 className="display-large text-foreground leading-tight max-w-3xl italic font-normal">
            "WEEKENDR designs those moments."
          </h2>
        </motion.div>

        {/* ==================================================
            STAGE 5: FIRST LIVING SCENE EMERGENCE
            ================================================== */}
        <motion.div
          style={{ opacity: sceneOpacity, y: sceneY }}
          className="absolute inset-0 w-full h-full flex items-center justify-center p-6"
        >
          {/* Responsive 2-column Layout (Desktop: 35% Text / 65% Living Scene) */}
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            
            {/* Left side text block (35% / col-span-4 or 5) */}
            <div className="lg:col-span-5 text-left space-y-6 order-2 lg:order-1">
              <span className="caption-text text-primary uppercase tracking-widest font-extrabold">
                Experience World
              </span>
              <h3 className="display-large text-foreground font-extrabold leading-tight">
                Coffee & Conversations
              </h3>
              <p className="body-large text-muted-foreground leading-relaxed italic">
                "The best conversations usually begin with one cup of coffee."
              </p>
            </div>

            {/* Right side Living Scene board (65% / col-span-7 or 8) */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <LivingSceneEngine config={coffeeConfig} scale={1} interactive={true} />
            </div>

          </div>
        </motion.div>

      </div>

    </div>
  );
}
