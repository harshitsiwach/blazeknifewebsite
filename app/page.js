'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CustomCursor } from '../components/CustomCursor.jsx';
import { BackgroundCanvas } from '../components/BackgroundCanvas.jsx';
import { IntroSequence } from '../components/IntroSequence.jsx';
import { TopBar } from '../components/TopBar.jsx';
import { PresaleCard } from '../components/PresaleCard.jsx';
import { StatsSection } from '../components/StatsSection.jsx';

export default function HomePage() {
  const [raisedEth, setRaisedEth] = useState('0.0000 ETH');
  const [introReady, setIntroReady] = useState(false);

  return (
    <>
      {/* Custom Desktop Waving Feather Cursor */}
      <CustomCursor />

      {/* Cinematic Intro Sequence */}
      <IntroSequence onComplete={() => setIntroReady(true)} />

      {/* Interactive 60FPS Ambient Particle & Radial Lighting Canvas */}
      <BackgroundCanvas />

      {/* Main Centered Landing Page */}
      <div className="landing-viewport">
        {/* Top Navigation */}
        <TopBar />

        {/* Center Hero Content Container */}
        <main className="hero-center-container">
          <div className="hero-center-content" aria-label="Hero Presale Panel">
            {/* Blaze Knife Logo with subtle float */}
            <motion.div
              className="logo-badge-wrap"
              animate={{ y: [-2, 3, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src="/image.png"
                alt="BLAZE KNIFE Crest"
                width={90}
                height={90}
                className="blaze-crest-logo interactive-hover"
                priority
              />
            </motion.div>

            {/* Main Title: BLAZE KNIFE */}
            <h1 className="hero-main-title font-display">
              <span className="title-blaze">BLAZE</span>{' '}
              <span className="title-knife">KNIFE</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle">
              The ultimate memecoin on{' '}
              <span className="neon-text-highlight">Robinhood Chain</span>.
            </p>

            {/* Large CTA: PLAY Button */}
            <div className="play-button-wrap">
              <a
                href="https://x.com/blazeknifehood/status/2078937846841540747"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-play-cta interactive-hover"
                aria-label="Play Blaze Knife Game"
              >
                <span className="play-text">PLAY</span>
                <span className="play-arrow">▶</span>
              </a>
            </div>

            {/* Donation Terminal Panel */}
            <PresaleCard onRaisedChange={setRaisedEth} />
          </div>
        </main>

        {/* Bottom Statistics Cards */}
        <StatsSection raisedAmount={raisedEth} />

        {/* Footer: Powered By Robinhood */}
        <footer className="footer-bar">
          <div className="powered-by-tag">
            <span className="powered-by-label">POWERED BY</span>
            <Image
              src="/RH_lockup_neon.png"
              alt="Robinhood"
              width={140}
              height={36}
              className="rh-footer-logo"
            />
          </div>
        </footer>
      </div>
    </>
  );
}
