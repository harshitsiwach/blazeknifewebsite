'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useBalance, useChainId, useSwitchChain, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveChain, getExplorerAddressUrl, getExplorerTxUrl } from '../lib/chains.js';

const MIN_ETH = 0.01;

function getErrorMessage(err) {
  if (!err) return 'Unknown error';
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  if (lower.includes('user rejected') || lower.includes('user denied') || lower.includes('rejected the request')) return 'Transaction rejected in wallet.';
  if (lower.includes('insufficient funds') || lower.includes('insufficient balance')) return 'Insufficient funds + gas.';
  if (lower.includes('timeout') || lower.includes('timed out')) return 'RPC timeout — try again.';
  return msg.length > 220 ? msg.slice(0, 220) + '...' : msg;
}

function truncateAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

export function PresaleCard({ onRaisedChange }) {
  const activeChain = getActiveChain();
  const receivingAddress = process.env.NEXT_PUBLIC_RECEIVING_ADDRESS || '0xdccbFd7A2562e2263E1036338C83dc79F5a4819D';
  const hasReceivingAddress = receivingAddress && receivingAddress !== '0x0000000000000000000000000000000000000000';

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const { data: userBalance } = useBalance({
    address,
    chainId: activeChain.id,
    query: { enabled: !!address, refetchInterval: 15000 },
  });

  const { data: raiseBalance, refetch: refetchRaise } = useBalance({
    address: receivingAddress,
    chainId: activeChain.id,
    query: { enabled: hasReceivingAddress, refetchInterval: 15000 },
  });

  const raisedEth = raiseBalance ? Number(formatEther(raiseBalance.value)) : 0;

  useEffect(() => {
    onRaisedChange?.(`${raisedEth.toFixed(4)} ETH`);
  }, [raisedEth, onRaisedChange]);

  const isWrongNetwork = isConnected && chainId !== activeChain.id;

  const [amount, setAmount] = useState('');
  const [touched, setTouched] = useState(false);
  const [recordStatus, setRecordStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  const { data: txHash, error: sendError, isPending: isSending, sendTransaction, reset: resetSend } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({ hash: txHash, chainId: activeChain.id });

  const validation = useMemo(() => {
    if (!amount) return { valid: false, error: null };
    let parsed;
    try {
      parsed = parseEther(amount);
    } catch {
      return { valid: false, error: 'Invalid amount.' };
    }
    const num = Number(amount);
    if (Number.isNaN(num)) return { valid: false, error: 'Invalid number.' };
    if (num < MIN_ETH) return { valid: false, error: `Minimum is ${MIN_ETH} ETH.` };
    if (userBalance) {
      const gasReserve = parseEther('0.001');
      const available = userBalance.value > gasReserve ? userBalance.value - gasReserve : BigInt(0);
      if (parsed > available) {
        return { valid: false, error: `Exceeds balance ~${formatEther(available)} ETH (gas reserved).` };
      }
    }
    return { valid: true, error: null, parsed };
  }, [amount, userBalance]);

  const isProcessing = isSending || isConfirming;
  const canSubmit = isConnected && !isWrongNetwork && validation.valid && !isProcessing && hasReceivingAddress;

  useEffect(() => {
    if (!isConfirmed || !txHash || !address || !amount) return;
    let cancelled = false;
    queueMicrotask(() => { if (!cancelled) setRecordStatus('Verifying on-chain...'); });
    fetch('/api/record-deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: address, amountEth: amount, txHash }),
    })
      .then(async (r) => {
        if (cancelled) return;
        const j = await r.json().catch(() => ({}));
        if (r.ok) setRecordStatus('Recorded ✓');
        else setRecordStatus(j.error || 'Recording failed — tx still on-chain.');
      })
      .catch(() => { if (!cancelled) setRecordStatus('Network error — tx still on-chain.'); })
      .finally(() => { if (!cancelled) refetchRaise(); });
    return () => { cancelled = true; };
  }, [isConfirmed, txHash, address, amount, refetchRaise]);

  const handleDonate = () => {
    setTouched(true);
    if (!validation.valid || !validation.parsed) return;
    if (!hasReceivingAddress) return;
    setRecordStatus(null);
    sendTransaction({ to: receivingAddress, value: validation.parsed, chainId: activeChain.id });
  };

  const explorerTxUrl = txHash ? getExplorerTxUrl(txHash) : null;
  const explorerAddrUrl = hasReceivingAddress ? getExplorerAddressUrl(receivingAddress) : null;

  const copyVault = async () => {
    if (!hasReceivingAddress) return;
    try {
      await navigator.clipboard.writeText(receivingAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="terminal-panel-wrap">
      {/* Top Row: RAISED + Amount */}
      <div className="terminal-raised-card">
        <div className="terminal-raised-inner">
          <span className="terminal-raised-label">RAISED</span>
          <span className="terminal-raised-value font-mono">
            {hasReceivingAddress ? `${raisedEth.toFixed(4)} ETH` : '0.0000 ETH'}
          </span>
        </div>
      </div>

      {/* Wallet Address Field with COPY & BLOCKSCOUT */}
      <div className="terminal-vault-field">
        <div className="vault-addr-display">
          <span className="vault-addr-text font-mono" title={receivingAddress}>
            {truncateAddress(receivingAddress)}
          </span>
        </div>
        <div className="vault-action-buttons">
          <button
            onClick={copyVault}
            className={`vault-action-btn vault-action-btn--copy interactive-hover ${copied ? 'vault-action-btn--copied' : ''}`}
            type="button"
          >
            {copied ? 'COPIED ✓' : 'COPY'}
          </button>
          <a
            href={explorerAddrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="vault-action-btn vault-action-btn--explorer interactive-hover"
          >
            BLOCKSCOUT ↗
          </a>
        </div>
      </div>

      {/* Subtext: Funds info */}
      <div className="terminal-meta-note">
        <span>Funds → Pons Launchpad. </span>
        <a href={explorerAddrUrl} target="_blank" rel="noopener noreferrer" className="neon-link">
          Audit inflows live ↗
        </a>
      </div>

      {/* Wrong Network Notice / Switch Button */}
      {isConnected && isWrongNetwork && (
        <button
          onClick={() => switchChain({ chainId: activeChain.id })}
          disabled={isSwitching}
          className="switch-network-btn interactive-hover"
          type="button"
        >
          {isSwitching ? 'Switching Network...' : `Switch to ${activeChain.name}`}
        </button>
      )}

      {/* Donation Amount Stack */}
      <div className="terminal-amount-stack">
        <div className="terminal-input-container">
          <input
            className="terminal-amount-input font-mono"
            type="text"
            inputMode="decimal"
            placeholder="0.05"
            value={amount}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) setAmount(v);
            }}
            onBlur={() => setTouched(true)}
            aria-label="Donation amount in ETH"
          />
          <span className="terminal-currency-suffix">ETH</span>
        </div>

        {/* Quick Amount Buttons: 0.01, 0.1, 0.5, 1, MAX */}
        <div className="quick-amount-row">
          {['0.01', '0.1', '0.5', '1'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setAmount(v);
                setTouched(true);
              }}
              className={`quick-amount-btn font-mono interactive-hover ${amount === v ? 'quick-amount-btn--active' : ''}`}
            >
              {v}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              if (userBalance) {
                const avail = userBalance.value - parseEther('0.001');
                if (avail > 0) setAmount(formatEther(avail));
                setTouched(true);
              }
            }}
            className="quick-amount-btn font-mono interactive-hover"
          >
            MAX
          </button>
        </div>

        {/* Inline Validations & Hints */}
        {touched && validation.error && (
          <motion.div
            className="terminal-inline-error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {validation.error}
          </motion.div>
        )}

        {!isConnected && (
          <div className="terminal-inline-hint">
            Connect wallet to donate. Min {MIN_ETH} ETH — no max.
          </div>
        )}
        {isWrongNetwork && (
          <div className="terminal-inline-hint">
            Switch to {activeChain.name} to continue.
          </div>
        )}
        {!hasReceivingAddress && (
          <div className="terminal-inline-error">
            Vault address not set — donations disabled.
          </div>
        )}
      </div>

      {/* Main Wide DONATE Button */}
      <button
        onClick={handleDonate}
        disabled={!canSubmit}
        className={`terminal-donate-btn interactive-hover ${
          validation.valid && isConnected && !isWrongNetwork ? 'terminal-donate-btn--ready' : ''
        } ${isProcessing ? 'terminal-donate-btn--loading' : ''}`}
        type="button"
      >
        {isProcessing && <div className="donate-laser-scan" />}
        {isProcessing ? (
          <span className="donate-btn-text">
            <span className="loading-spinner" /> PROCESSING...
          </span>
        ) : (
          <span className="donate-btn-text">DONATE</span>
        )}
      </button>

      {/* Send Error Notice */}
      {sendError && (
        <motion.div
          className="terminal-inline-error error-shake"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>{getErrorMessage(sendError)}</span>{' '}
          <button
            onClick={() => resetSend()}
            className="error-dismiss-btn"
            type="button"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Success Confirmation Card */}
      {txHash && (
        <motion.div
          className="terminal-success-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="success-header">
            <div className="success-check-badge">✓</div>
            <span className="success-title font-display">
              {isConfirmed ? 'DONATION CONFIRMED' : isConfirming ? 'SUBMITTED — CONFIRMING...' : 'TRANSACTION SENT'}
            </span>
          </div>

          <a
            href={explorerTxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="success-tx-link font-mono"
          >
            View on Explorer: {txHash.slice(0, 16)}...{txHash.slice(-8)} ↗
          </a>

          {receipt && (
            <div className="success-meta-info font-mono">
              Block #{receipt.blockNumber.toString()} · Status: {receipt.status}
            </div>
          )}

          {recordStatus && <div className="success-meta-info">{recordStatus}</div>}

          {isConfirmed && (
            <button
              onClick={() => {
                setAmount('');
                setTouched(false);
                setRecordStatus(null);
                resetSend();
              }}
              className="donate-again-btn"
              type="button"
            >
              Donate again ↺
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}

