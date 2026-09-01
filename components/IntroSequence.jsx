'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function IntroSequence({ onComplete }) {
  const [showIntro, setShowIntro] = useState(false);
  const [stage, setStage] = useState(0); // 0: initial spark, 1: laser sweep, 2: fade out

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasVisited = sessionStorage.getItem('blaze_knife_visited');

    if (hasVisited || prefersReducedMotion) {
      onComplete?.();
      return;
    }

    setShowIntro(true);
    sessionStorage.setItem('blaze_knife_visited', 'true');

    // Sequence stages
    const t1 = setTimeout(() => setStage(1), 500); // Trigger laser sweep
    const t2 = setTimeout(() => setStage(2), 1200); // Fade out overlay
    const t3 = setTimeout(() => {
      setShowIntro(false);
      onComplete?.();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (!showIntro) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="intro-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 2 ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Central Energy Core Spark */}
        {stage < 2 && (
          <motion.div
            className="intro-spark"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.4, 0.9, 2.5],
              opacity: [0, 1, 0.9, 0],
            }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        )}

        {/* Laser Energy Sweep Line */}
        {stage >= 1 && stage < 2 && (
          <motion.div
            className="intro-laser-sweep"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
