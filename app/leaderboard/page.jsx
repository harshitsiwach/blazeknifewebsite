'use client';

import React from 'react';
import Link from 'next/link';
import { CustomCursor } from '../../components/CustomCursor.jsx';
import { BackgroundCanvas } from '../../components/BackgroundCanvas.jsx';
import { TopBar } from '../../components/TopBar.jsx';
import { Leaderboard } from '../../components/Leaderboard.jsx';

export default function LeaderboardPage() {
  return (
    <>
      <CustomCursor />
      <BackgroundCanvas />
      <div className="landing-viewport">
        <TopBar />
        <main className="hero-center-container" style={{ maxWidth: 640, paddingTop: 8 }}>
          <div className="hero-center-content" style={{ width: '100%' }}>
            <h1 className="hero-main-title font-display" style={{ fontSize: '2.4rem', marginBottom: 6 }}>
              <span className="title-blaze">REFERRAL</span>{' '}
              <span className="title-knife">LEADERBOARD</span>
            </h1>
            <p className="hero-subtitle" style={{ marginBottom: 14 }}>
              Earn <span className="neon-text-highlight">1% of your referrals&apos; token allocation</span> — forever. Share your link, climb the board.
            </p>
            <Leaderboard />
            <Link
              href="/"
              className="terminal-donate-btn interactive-hover"
              style={{ marginTop: 16, textDecoration: 'none', display: 'inline-flex', padding: '10px 22px', fontSize: '0.85rem', width: 'auto', cursor: 'pointer', color: 'var(--neon-green)', background: 'rgba(14,20,15,0.9)', borderColor: 'var(--border-green)' }}
            >
              ← Back to Presale
            </Link>
          </div>
        </main>
        <footer className="footer-bar">
          <div className="powered-by-tag">
            <span className="powered-by-label">POWERED BY</span>
            <img src="/RH_lockup_neon.png" alt="Robinhood" width={140} height={36} className="rh-footer-logo" />
          </div>
        </footer>
      </div>
    </>
  );
}
