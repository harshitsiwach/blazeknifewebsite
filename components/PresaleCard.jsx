'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useBalance, useChainId, useSwitchChain, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
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

export function PresaleCard() {
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
    // no max — per spec max can be any amount
    if (userBalance) {
      const gasReserve = parseEther('0.001');
      const available = userBalance.value > gasReserve ? userBalance.value - gasReserve : BigInt(0);
      if (parsed > available) {
        return { valid: false, error: `Exceeds balance ~${formatEther(available)} ETH (gas reserved).` };
      }
    }
    return { valid: true, error: null, parsed };
  }, [amount, userBalance]);

  const canSubmit = isConnected && !isWrongNetwork && validation.valid && !isSending && !isConfirming && hasReceivingAddress;

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
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="presale-wrap">
      {/* Raised — only show amount raised, no cap */}
      <div className="raised-card raised-card--single">
        <div className="raised-single">
          <span className="raised-label">Raised</span>
          <span className="raised-value raised-value--large">
            {hasReceivingAddress ? `${raisedEth.toFixed(4)} ETH` : '— ETH'}
          </span>
        </div>
      </div>

      {/* Vault address */}
      <div className="vault-pill">
        <code title={receivingAddress}>{receivingAddress}</code>
        <div className="vault-actions">
          <button onClick={copyVault} className="vault-btn" type="button">
            {copied ? 'Copied' : 'Copy'}
          </button>
          <a
            href={explorerAddrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="vault-btn"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            Blockscout ↗
          </a>
        </div>
      </div>
      <div className="vault-meta">
        Funds → Pons Launchpad. <a href={explorerAddrUrl} target="_blank" rel="noopener noreferrer">Audit inflows live ↗</a>
      </div>

      {isConnected && isWrongNetwork && (
        <button onClick={() => switchChain({ chainId: activeChain.id })} disabled={isSwitching} className="donate-btn" type="button">
          {isSwitching ? 'Switching...' : `Switch to ${activeChain.name}`}
        </button>
      )}

      {/* Amount */}
      <div className="amount-stack">
        <div className="amount-field-wrap">
          <input
            className="amount-input"
            type="text"
            inputMode="decimal"
            placeholder="0.05"
            value={amount}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) setAmount(v);
            }}
            onBlur={() => setTouched(true)}
          />
          <span className="amount-suffix">ETH</span>
        </div>
        <div className="preset-row">
          {['0.01', '0.1', '0.5', '1'].map((v) => (
            <button key={v} type="button" onClick={() => { setAmount(v); setTouched(true); }} className={`preset-btn ${amount === v ? 'active' : ''}`}>
              {v}
            </button>
          ))}
          <button type="button" onClick={() => { if (userBalance) { const avail = userBalance.value - parseEther('0.001'); if (avail > 0) setAmount(formatEther(avail)); setTouched(true); } }} className="preset-btn">
            MAX
          </button>
        </div>
        {touched && validation.error && <div className="inline-error">{validation.error}</div>}
        {!isConnected && <div className="inline-hint">Connect wallet to donate. Min {MIN_ETH} ETH — no max.</div>}
        {isWrongNetwork && <div className="inline-hint">Switch to {activeChain.name} to continue.</div>}
        {!hasReceivingAddress && <div className="inline-error">Vault address not set — donations disabled. Owner: set NEXT_PUBLIC_RECEIVING_ADDRESS.</div>}
      </div>

      <button onClick={handleDonate} disabled={!canSubmit} className="donate-btn" type="button">
        {isSending || isConfirming ? (
          <>
            <span className="spinner" /> {isConfirming ? 'Confirming...' : 'Waiting signature...'}
          </>
        ) : (
          'Donate'
        )}
      </button>

      {sendError && (
        <div className="inline-error">
          {getErrorMessage(sendError)}{' '}
          <button onClick={() => resetSend()} style={{ textDecoration: 'underline', background: 'none', border: 'none', color: '#ff8a8a', cursor: 'pointer' }}>
            Dismiss
          </button>
        </div>
      )}

      {txHash && (
        <div className="success-card">
          <div className="success-title">{isConfirmed ? '✓ Donated!' : isConfirming ? 'Submitted — confirming...' : 'Sent!'}</div>
          <a href={explorerTxUrl} target="_blank" rel="noopener noreferrer" className="success-hash">
            {txHash} ↗
          </a>
          {receipt && <div className="success-meta">Block #{receipt.blockNumber.toString()} · Status: {receipt.status}</div>}
          {recordStatus && <div className="success-meta">{recordStatus}</div>}
          {isConfirmed && (
            <button
              onClick={() => { setAmount(''); setTouched(false); setRecordStatus(null); resetSend(); }}
              style={{ fontSize: '0.7rem', color: '#aaa', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              Donate again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
