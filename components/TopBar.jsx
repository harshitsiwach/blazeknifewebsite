'use client';

import { useAccount, useBalance, useChainId } from 'wagmi';
import { formatEther } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getActiveChain } from '../lib/chains.js';

function truncate(addr) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
}

export function TopBar() {
  const activeChain = getActiveChain();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const { data: userBalance } = useBalance({
    address,
    chainId: activeChain.id,
    query: { enabled: !!address, refetchInterval: 15000 },
  });

  return (
    <div className="top-bar">
      <div className="top-bar-inner">
        <div className="top-bar-left">
          {/* keep empty for balance, or show chain indicator discreetly */}
          {isConnected && (
            <span className="top-chain-badge">
              {activeChain.name} · {chainId}
            </span>
          )}
        </div>
        <div className="top-bar-right">
          {isConnected && address ? (
            <div className="top-wallet-info">
              <span className="top-wallet-addr">{truncate(address)}</span>
              {userBalance && (
                <span className="top-wallet-bal">
                  {Number(formatEther(userBalance.value)).toFixed(4)} ETH
                </span>
              )}
            </div>
          ) : null}
          <div className="top-connect">
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
              label="Connect Wallet"
            />
          </div>
          <a
            href="https://x.com/blazeknifehood"
            target="_blank"
            rel="noopener noreferrer"
            className="top-x-link"
            aria-label="Blaze Knife on X"
            title="X / Twitter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
