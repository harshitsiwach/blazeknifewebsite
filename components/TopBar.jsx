'use client';

import React, { useState, useEffect } from 'react';
import {
  ConnectButton,
  useAccountModal,
  useChainModal,
  useConnectModal,
} from '@rainbow-me/rainbowkit';
import { getActiveChain } from '../lib/chains.js';

export function TopBar() {
  const activeChain = getActiveChain();
  const [isClient, setIsClient] = useState(false);
  const { openAccountModal: hookOpenAccountModal } = useAccountModal();
  const { openChainModal: hookOpenChainModal } = useChainModal();
  const { openConnectModal: hookOpenConnectModal } = useConnectModal();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="top-bar" aria-label="Main Navigation">
      <div className="top-bar-inner">
        {/* LEFT: Monospace Pill Badge */}
        <div className="top-bar-left">
          <div className="top-brand-pill interactive-hover">
            <span className="live-pulse-dot" />
            <span className="top-brand-text">ROBINHOOD CHAIN</span>
          </div>
        </div>

        {/* RIGHT: Exactly 3 Controls */}
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
                      <>
                        {/* Control 1: Chain Selector */}
                        {chain && (
                          <button
                            onClick={handleChainClick}
                            className="top-control-btn top-control-btn--chain interactive-hover"
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

                        {/* Control 2: Connected Wallet Button */}
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
                      </>
                    )}

                    {/* Control 3: Twitter / X Button */}
                    <a
                      href="https://x.com/blazeknifewebsite"
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
  );
}
