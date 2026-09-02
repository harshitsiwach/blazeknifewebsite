'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomCursor } from '../components/CustomCursor.jsx';
import { BackgroundCanvas } from '../components/BackgroundCanvas.jsx';
import { IntroSequence } from '../components/IntroSequence.jsx';
import { TopBar } from '../components/TopBar.jsx';
import { PresaleCard } from '../components/PresaleCard.jsx';
import { StatsSection } from '../components/StatsSection.jsx';
import { captureReferrerFromUrl } from '../lib/referral.js';

export default function HomePage() {
  const [raisedEth, setRaisedEth] = useState('0.0000 ETH');
  const [introReady, setIntroReady] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    captureReferrerFromUrl();
  }, []);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') setShowComingSoon(false);
    };
    if (showComingSoon) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onEsc);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onEsc);
    };
  }, [showComingSoon]);

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

            {/* Large CTA: PLAY Button — Coming Soon */}
            <div className="play-button-wrap">
              <button
                type="button"
                onClick={() => setShowComingSoon(true)}
                className="hero-play-cta interactive-hover"
                aria-label="Play Blaze Knife Game — Coming Soon"
                aria-haspopup="dialog"
                aria-expanded={showComingSoon}
              >
                <span className="play-text">PLAY</span>
                <span className="play-arrow">▶</span>
              </button>
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

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoon && (
          <>
            <motion.div
              className="coming-soon-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowComingSoon(false)}
              aria-hidden="true"
            />
            <motion.div
              className="coming-soon-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="coming-soon-title"
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="coming-soon-glow" />
              <button
                type="button"
                className="coming-soon-close interactive-hover"
                onClick={() => setShowComingSoon(false)}
                aria-label="Close Coming Soon"
              >
                ✕
              </button>
              <div className="coming-soon-icon">◈</div>
              <h2 id="coming-soon-title" className="coming-soon-title font-display">
                COMING SOON
              </h2>
              <p className="coming-soon-subtitle">
                The arena is being forged. Follow <a href="https://x.com/blazeknifehood" target="_blank" rel="noopener noreferrer" className="neon-link">@blazeknifehood</a> for the drop.
              </p>
              <button type="button" className="coming-soon-cta interactive-hover" onClick={() => setShowComingSoon(false)}>
                GOT IT
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
