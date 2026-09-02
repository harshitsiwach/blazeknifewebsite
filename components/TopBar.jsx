'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ConnectButton,
  useAccountModal,
  useChainModal,
  useConnectModal,
} from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { getActiveChain } from '../lib/chains.js';
import { captureReferrerFromUrl } from '../lib/referral.js';

export function TopBar() {
  const activeChain = getActiveChain();
  const receivingAddress = process.env.NEXT_PUBLIC_RECEIVING_ADDRESS || '0xdccbFd7A2562e2263E1036338C83dc79F5a4819D';
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [origin, setOrigin] = useState('');

  const { openAccountModal: hookOpenAccountModal } = useAccountModal();
  const { openChainModal: hookOpenChainModal } = useChainModal();
  const { openConnectModal: hookOpenConnectModal } = useConnectModal();

  useEffect(() => {
    queueMicrotask(() => {
      setIsClient(true);
      if (typeof window !== 'undefined') {
        setOrigin(window.location.origin);
        captureReferrerFromUrl();
      }
    });
  }, []);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const copyVault = async () => {
    try {
      await navigator.clipboard.writeText(receivingAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const copyReferral = async (addr) => {
    if (!addr || !origin) return;
    const link = `${origin}?ref=${addr}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 1500);
    } catch {}
  };

  return (
    <>
      <header className="top-bar" aria-label="Main Navigation">
        <div className="top-bar-inner">
          {/* LEFT CORNER: ROBINHOOD CHAIN text badge (Desktop) + Leaderboard */}
          <div className="top-bar-left" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="top-brand-pill interactive-hover top-control-btn--desktop-only">
              <span className="live-pulse-dot" />
              <span className="top-brand-text">ROBINHOOD CHAIN</span>
            </div>
            <Link href="/leaderboard" className="top-control-btn top-control-btn--leaderboard interactive-hover" title="Referral Leaderboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v9a6 6 0 0 0 12 0V2Z" />
              </svg>
              <span className="control-text">Leaderboard</span>
            </Link>
          </div>

          {/* RIGHT: Controls */}
          <div className="top-bar-right">
            {isClient ? (
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus || authenticationStatus === 'authenticated');

                  const handleConnectClick = (e) => {
                    e?.preventDefault?.();
                    if (openConnectModal) openConnectModal();
                    else if (hookOpenConnectModal) hookOpenConnectModal();
                  };

                  const handleChainClick = (e) => {
                    e?.preventDefault?.();
                    if (openChainModal) openChainModal();
                    else if (hookOpenChainModal) hookOpenChainModal();
                  };

                  const handleAccountClick = (e) => {
                    e?.preventDefault?.();
                    if (chain?.unsupported) {
                      if (openChainModal) openChainModal();
                      else if (hookOpenChainModal) hookOpenChainModal();
                    } else {
                      if (openAccountModal) openAccountModal();
                      else if (hookOpenAccountModal) hookOpenAccountModal();
                      else if (openChainModal) openChainModal();
                      else if (hookOpenChainModal) hookOpenChainModal();
                    }
                  };

                  return (
                    <div
                      className="top-controls-group"
                      {...(!ready && {
                        'aria-hidden': true,
                        style: {
                          opacity: 0.8,
                          pointerEvents: ready ? 'auto' : 'none',
                        },
                      })}
                    >
                      {/* Desktop Chain Switcher (when connected) */}
                      {connected && chain && !chain.unsupported && (
                        <button
                          onClick={handleChainClick}
                          className="top-control-btn top-control-btn--chain top-control-btn--desktop-only interactive-hover"
                          type="button"
                          title="Switch Chain"
                        >
                          {chain.hasIcon && chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              className="chain-icon-img"
                            />
                          )}
                          <span className="control-text">{chain.name ?? 'Chain'}</span>
                          <svg
                            className="chevron-icon"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      )}

                      {/* Wallet Button */}
                      {!connected ? (
                        <button
                          onClick={handleConnectClick}
                          className="top-control-btn top-control-btn--wallet top-control-btn--connect interactive-hover"
                          type="button"
                        >
                          <span className="wallet-status-dot" />
                          <span className="control-text">Connect Wallet</span>
                        </button>
                      ) : chain?.unsupported ? (
                        <button
                          onClick={handleChainClick}
                          className="top-control-btn top-control-btn--wrong-network interactive-hover"
                          type="button"
                          title="Wrong network — click to switch"
                        >
                          <span className="wrong-network-dot" />
                          <span className="control-text">Switch Network</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleAccountClick}
                          className="top-control-btn top-control-btn--wallet top-control-btn--connected interactive-hover"
                          type="button"
                          title={account?.address}
                        >
                          <svg
                            className="wallet-svg-icon"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="M7 15h0M2 10h20" />
                          </svg>
                          <span className="control-text font-mono">
                            {account?.displayName || (account?.address ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : 'Connected')}
                          </span>
                        </button>
                      )}

                      {/* Twitter / X Button (Desktop & Mobile) */}
                      <a
                        href="https://x.com/blazeknifehood"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="top-control-btn top-control-btn--x interactive-hover"
                        aria-label="Blaze Knife on X"
                        title="X / Twitter"
                      >
                        <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
                        </svg>
                      </a>

                      {/* Katana Hamburger Button (Mobile Only) */}
                      <button
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className={`katana-hamburger-btn katana-hamburger-btn--mobile-only interactive-hover ${menuOpen ? 'katana-hamburger-btn--active' : ''}`}
                        type="button"
                        aria-label="Toggle Navigation Menu"
                        aria-expanded={menuOpen}
                      >
                        <span className="katana-slash katana-slash-1" />
                        <span className="katana-slash katana-slash-2" />
                        <span className="katana-slash katana-slash-3" />
                      </button>
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            ) : (
              <div className="top-controls-group" style={{ opacity: 0 }}>
                <div className="top-control-btn" style={{ width: 120, height: 38 }} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE ONLY HAMBURGER DRAWER MENU */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              className="cyber-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Floating Cyber Glass Drawer */}
            <motion.aside
              className="cyber-menu-drawer"
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              aria-label="Mobile Navigation Menu"
            >
              {/* Drawer Top Header */}
              <div className="cyber-menu-header">
                <div className="cyber-menu-brand">
                  <span className="cyber-menu-logo-spark" />
                  <span className="cyber-menu-brand-title font-display">BLAZE KNIFE</span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="cyber-menu-close-btn interactive-hover"
                  type="button"
                  aria-label="Close Menu"
                >
                  ✕
                </button>
              </div>

              <div className="cyber-menu-body">
                {/* 1. Network / Chain Info Card (Clickable to switch chain) */}
                <button
                  type="button"
                  className="cyber-status-card cyber-status-card--btn interactive-hover"
                  onClick={() => {
                    if (hookOpenChainModal) hookOpenChainModal();
                  }}
                  title="Switch Chain"
                >
                  <div className="cyber-status-row">
                    <span className="cyber-status-indicator" />
                    <span className="cyber-status-chain font-mono">
                      {activeChain.name.toUpperCase()}
                    </span>
                  </div>
                  <span className="cyber-status-badge font-mono">
                    ID: {activeChain.id}
                  </span>
                </button>

                {/* 2. Leaderboard Link in Drawer */}
                <Link
                  href="/leaderboard"
                  className="cyber-drawer-twitter-btn interactive-hover"
                  onClick={() => setMenuOpen(false)}
                  style={{ borderColor: 'var(--neon-green)' }}
                >
                  <div className="cyber-drawer-twitter-left">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                      <path d="M4 22h16" />
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                      <path d="M18 2H6v9a6 6 0 0 0 12 0V2Z" />
                    </svg>
                    <span className="font-mono">LEADERBOARD</span>
                  </div>
                  <span className="cyber-nav-arrow">→</span>
                </Link>

                {/* 3. Twitter / X Community Button in Drawer */}
                <a
                  href="https://x.com/blazeknifehood"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-drawer-twitter-btn interactive-hover"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="cyber-drawer-twitter-left">
                    <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
                    </svg>
                    <span className="font-mono">TWITTER / X</span>
                  </div>
                  <span className="cyber-nav-arrow">↗</span>
                </a>

                {/* 3. Presale Vault Address Widget */}
                <div className="cyber-vault-widget">
                  <div className="cyber-vault-label font-mono">PRESALE VAULT</div>
                  <div className="cyber-vault-box">
                    <span className="cyber-vault-address font-mono" title={receivingAddress}>
                      {receivingAddress.slice(0, 10)}...{receivingAddress.slice(-8)}
                    </span>
                    <button
                      onClick={copyVault}
                      type="button"
                      className={`cyber-vault-copy-btn interactive-hover ${copied ? 'cyber-vault-copy-btn--copied' : ''}`}
                    >
                      {copied ? 'COPIED ✓' : 'COPY'}
                    </button>
                  </div>
                </div>

                {/* 4. Referral Widget */}
                <div className="cyber-vault-widget">
                  <div className="cyber-vault-label font-mono">YOUR REFERRAL LINK — 1% REWARD</div>
                  {wagmiConnected && wagmiAddress && origin ? (
                    <div className="cyber-vault-box" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                      <span className="cyber-vault-address font-mono" title={`${origin}?ref=${wagmiAddress}`} style={{ fontSize: '0.68rem', wordBreak: 'break-all' }}>
                        {origin}?ref={wagmiAddress.slice(0, 6)}...{wagmiAddress.slice(-4)}
                      </span>
                      <button
                        onClick={() => copyReferral(wagmiAddress)}
                        type="button"
                        className={`cyber-vault-copy-btn interactive-hover ${copiedReferral ? 'cyber-vault-copy-btn--copied' : ''}`}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {copiedReferral ? 'COPIED ✓' : 'COPY REFERRAL LINK'}
                      </button>
                      <span style={{ fontSize: '0.62rem', color: 'var(--muted-gray)', textAlign: 'center' }}>
                        Earn 1% of your referrals&apos; token allocation — forever
                      </span>
                    </div>
                  ) : (
                    <div className="cyber-vault-box" style={{ justifyContent: 'center', fontSize: '0.72rem', color: 'var(--muted-gray)', textAlign: 'center' }}>
                      Connect wallet to get your referral link
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="cyber-menu-footer">
                <span className="cyber-footer-tag font-mono">POWERED BY</span>
                <Image
                  src="/RH_lockup_neon.png"
                  alt="Robinhood"
                  width={110}
                  height={28}
                  className="cyber-footer-rh-logo"
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
