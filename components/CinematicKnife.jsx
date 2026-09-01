'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CinematicKnife() {
  const [lightning, setLightning] = useState([]);
  const [pulseKey, setPulseKey] = useState(0);

  // Random lightning energy arcs every 5-12 seconds
  useEffect(() => {
    let timeoutId;

    const triggerLightning = () => {
      const id = Date.now();
      const randomY = Math.random() * 260 + 60; // Along blade height
      const randomSide = Math.random() > 0.5 ? 1 : -1;
      const arcWidth = Math.random() * 30 + 20;

      const newArc = {
        id,
        path: `M 150 ${randomY} Q ${150 + randomSide * arcWidth} ${randomY + (Math.random() * 30 - 15)} ${150 + randomSide * (arcWidth * 0.4)} ${randomY + 35}`,
      };

      setLightning((prev) => [...prev, newArc]);

      setTimeout(() => {
        setLightning((prev) => prev.filter((item) => item.id !== id));
      }, 280);

      const nextDelay = Math.random() * 7000 + 5000; // 5-12s
      timeoutId = setTimeout(triggerLightning, nextDelay);
    };

    timeoutId = setTimeout(triggerLightning, 4000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Energy pulse interval every 4 seconds
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseKey((k) => k + 1);
    }, 4500);
    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <div className="knife-container knife-interactive-zone" aria-label="Legendary Blaze Knife">
      {/* Background Energy Aura Glow */}
      <div className="knife-aura-glow" />

      {/* Layer 1: Slow Background Atmospheric Fog Plumes */}
      <div className="smoke-layer smoke-layer--back">
        <div className="smoke-puff smoke-puff-1" />
        <div className="smoke-puff smoke-puff-2" />
        <div className="smoke-puff smoke-puff-3" />
      </div>

      {/* Main Floating Knife Assembly */}
      <motion.div
        className="knife-floating-assembly"
        animate={{
          y: [-3, 3, -3],
        }}
        transition={{
          duration: 7.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Layer 2: Medium Swirling Smoke Around Blade */}
        <div className="smoke-layer smoke-layer--mid">
          <div className="smoke-swirl smoke-swirl-1" />
          <div className="smoke-swirl smoke-swirl-2" />
        </div>

        {/* High-Detail Legendary Knife SVG Art */}
        <svg
          viewBox="0 0 300 620"
          className="knife-svg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Filter for Emerald Blade Glow */}
            <filter id="blade-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#39FF14" floodOpacity="0.9" />
              <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#18D62B" floodOpacity="0.5" />
            </filter>

            {/* Filter for Lightning Spark */}
            <filter id="spark-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FFFFFF" floodOpacity="1" />
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#39FF14" floodOpacity="0.9" />
            </filter>

            {/* Metallic Steel Blade Gradients */}
            <linearGradient id="blade-steel-grad" x1="120" y1="50" x2="180" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E2820" />
              <stop offset="35%" stopColor="#2E3F32" />
              <stop offset="50%" stopColor="#4A614E" />
              <stop offset="65%" stopColor="#1C271E" />
              <stop offset="100%" stopColor="#0B120D" />
            </linearGradient>

            <linearGradient id="blade-edge-grad" x1="120" y1="50" x2="180" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A3FFA3" />
              <stop offset="40%" stopColor="#39FF14" />
              <stop offset="80%" stopColor="#18D62B" />
              <stop offset="100%" stopColor="#00FF55" />
            </linearGradient>

            <linearGradient id="hilt-gold-grad" x1="130" y1="400" x2="170" y2="530" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38493B" />
              <stop offset="50%" stopColor="#162218" />
              <stop offset="100%" stopColor="#080E09" />
            </linearGradient>

            <linearGradient id="energy-crack-grad" x1="150" y1="120" x2="150" y2="360" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#39FF14" />
              <stop offset="85%" stopColor="#18D62B" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            <linearGradient id="stone-grad" x1="50" y1="460" x2="250" y2="580" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#151C17" />
              <stop offset="45%" stopColor="#0D130E" />
              <stop offset="100%" stopColor="#040605" />
            </linearGradient>
          </defs>

          {/* ================================================= */}
          {/* KNIFE BLADE (Embedded Tip into Base)              */}
          {/* ================================================= */}
          <g filter="url(#blade-glow)">
            {/* Outer Blade Glow Contour */}
            <path
              d="M 150 40 L 168 180 L 164 420 L 136 420 L 132 180 Z"
              fill="url(#blade-steel-grad)"
              stroke="url(#blade-edge-grad)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Knife Spine / Fuller Bevel */}
            <path
              d="M 150 40 L 150 420"
              stroke="#A3FFA3"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />

            {/* Glowing Edge Highlights */}
            <path
              d="M 150 40 L 168 180 L 164 420"
              stroke="#39FF14"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 150 40 L 132 180 L 136 420"
              stroke="#39FF14"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Neon Green Energy Cracks down the Blade */}
            <path
              d="M 150 90 L 154 130 L 147 165 L 153 210 L 148 270 L 152 330 L 150 390"
              stroke="url(#energy-crack-grad)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="blade-energy-crack"
            />
            <path
              d="M 154 130 L 160 145 M 147 165 L 140 180 M 153 210 L 161 228 M 148 270 L 141 292"
              stroke="#39FF14"
              strokeWidth="1"
              strokeOpacity="0.7"
              strokeLinecap="round"
            />

            {/* Ancient Glowing Runes along blade */}
            <g className="blade-runes" fill="#39FF14" opacity="0.85">
              <path d="M 148 150 L 152 150 M 150 146 L 150 154" stroke="#39FF14" strokeWidth="1.2" />
              <circle cx="150" cy="190" r="2" fill="#D4FF00" />
              <path d="M 147 235 L 153 235 L 150 242 Z" stroke="#39FF14" strokeWidth="1" />
              <path d="M 148 280 L 152 280 M 149 277 L 151 283" stroke="#39FF14" strokeWidth="1.2" />
              <circle cx="150" cy="325" r="1.8" fill="#D4FF00" />
            </g>
          </g>

          {/* ================================================= */}
          {/* TSUBA / GUARD                                     */}
          {/* ================================================= */}
          <g filter="url(#blade-glow)">
            {/* Guard Base */}
            <path
              d="M 112 420 Q 150 412 188 420 Q 192 426 186 432 Q 150 426 114 432 Q 108 426 112 420 Z"
              fill="#18241B"
              stroke="#39FF14"
              strokeWidth="1.8"
            />
            {/* Guard Gem Inlay */}
            <circle cx="150" cy="423" r="3.5" fill="#D4FF00" stroke="#003300" strokeWidth="1" />
          </g>

          {/* ================================================= */}
          {/* HILT / TSUKA (Wrapped Handle)                     */}
          {/* ================================================= */}
          <g>
            <path
              d="M 141 432 L 138 525 L 162 525 L 159 432 Z"
              fill="#0E1610"
              stroke="#2C3D2F"
              strokeWidth="1.5"
            />
            {/* Diamond pattern ito wraps */}
            <path
              d="M 140 445 L 150 452 L 160 445 M 139 465 L 150 472 L 161 465 M 139 485 L 150 492 L 161 485 M 138 505 L 150 512 L 162 505"
              stroke="#39FF14"
              strokeWidth="1.2"
              strokeOpacity="0.6"
            />

            {/* Pommel / Kashira */}
            <path
              d="M 136 525 Q 150 535 164 525 L 161 538 Q 150 545 139 538 Z"
              fill="#1A281E"
              stroke="#39FF14"
              strokeWidth="1.5"
            />
            <circle cx="150" cy="533" r="2.5" fill="#39FF14" />
          </g>

          {/* ================================================= */}
          {/* DYNAMIC LIGHTNING ARCS                            */}
          {/* ================================================= */}
          <AnimatePresence>
            {lightning.map((arc) => (
              <motion.path
                key={arc.id}
                d={arc.path}
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                filter="url(#spark-glow)"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: [0, 1, 1, 0], pathLength: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              />
            ))}
          </AnimatePresence>
        </svg>

        {/* Layer 3: Fast Subtle Energy Smoke Wisps near Blade Edge */}
        <div className="smoke-layer smoke-layer--front">
          <div className="smoke-wisp smoke-wisp-1" />
          <div className="smoke-wisp smoke-wisp-2" />
        </div>
      </motion.div>

      {/* ================================================= */}
      {/* DARK RUNE STONE PLATFORM (Base)                   */}
      {/* ================================================= */}
      <div className="knife-stone-platform">
        <svg
          viewBox="0 0 360 140"
          className="stone-platform-svg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stone Altar Geometry */}
          <path
            d="M 30 110 L 80 45 L 150 35 L 210 35 L 280 45 L 330 110 L 300 135 L 60 135 Z"
            fill="url(#stone-grad)"
            stroke="#1B281E"
            strokeWidth="2"
          />

          {/* Stone Top Surface Highlight */}
          <path
            d="M 80 45 L 150 35 L 210 35 L 280 45 L 215 55 L 145 55 Z"
            fill="#162018"
            stroke="#2A3D2E"
            strokeWidth="1.2"
          />

          {/* Glowing Green Fissure Cracks (Where blade is lodged) */}
          <g filter="url(#blade-glow)">
            <path
              d="M 150 40 L 140 60 L 115 72 L 90 90 M 150 40 L 162 58 L 195 70 L 230 85 M 150 40 L 148 85 L 155 115"
              stroke="#39FF14"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stone-energy-fissure"
            />
            {/* Base impact glow ring */}
            <ellipse cx="150" cy="45" rx="22" ry="6" fill="rgba(57, 255, 20, 0.4)" filter="blur(3px)" />
          </g>
        </svg>

        {/* Ambient Ground Mist */}
        <div className="ground-mist" />
      </div>
    </div>
  );
}
