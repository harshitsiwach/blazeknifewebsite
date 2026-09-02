'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

function truncate(addr) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
}

export function Leaderboard() {
  const { address } = useAccount();
  const [data, setData] = useState({ leaderboard: [], total: 0, sort: 'volume', source: 'json' });
  const [sort, setSort] = useState('volume'); // volume | count
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [me, setMe] = useState(null);

  const fetchBoard = async (s) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/referrals?sort=${s}&limit=100`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed to fetch');
      setData(j);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const fetchMe = async () => {
    if (!address) {
      setMe(null);
      return;
    }
    try {
      const res = await fetch(`/api/referrals?wallet=${address}&sort=${sort}`);
      const j = await res.json();
      if (j.me) setMe(j.me);
    } catch {}
  };

  useEffect(() => {
    queueMicrotask(() => fetchBoard(sort));
  }, [sort]);

  useEffect(() => {
    queueMicrotask(() => fetchMe());
  }, [address, sort, data.leaderboard]);

  // Poll every 30s
  useEffect(() => {
    const id = setInterval(() => fetchBoard(sort), 30000);
    return () => clearInterval(id);
  }, [sort]);

  return (
    <div className="terminal-panel-wrap" style={{ width: '100%', maxWidth: 580, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="font-display" style={{ fontSize: '0.9rem', letterSpacing: 1, color: 'var(--neon-green)' }}>REFERRAL LEADERBOARD</span>
        <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--muted-gray)' }}>{data.source === 'supabase' ? 'Supabase' : 'Local'} · {data.total} referrers</span>
      </div>

      <div className="quick-amount-row" style={{ marginTop: 4 }}>
        <button
          onClick={() => setSort('volume')}
          className={`quick-amount-btn font-mono interactive-hover ${sort === 'volume' ? 'quick-amount-btn--active' : ''}`}
          type="button"
        >
          By Volume
        </button>
        <button
          onClick={() => setSort('count')}
          className={`quick-amount-btn font-mono interactive-hover ${sort === 'count' ? 'quick-amount-btn--active' : ''}`}
          type="button"
        >
          By Referrals
        </button>
      </div>

      {me && address && me.count > 0 && (
        <div className="terminal-raised-card" style={{ borderColor: 'rgba(57,255,20,0.4)', background: 'rgba(57,255,20,0.06)' }}>
          <div className="terminal-raised-inner">
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--muted-gray)' }}>YOUR RANK #{me.rank ?? '—'} · {truncate(address)}</span>
            <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--neon-green)', fontWeight: 800 }}>
              {me.count} refs · {Number(me.totalEth).toFixed(4)} ETH
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="terminal-inline-hint">Loading leaderboard...</div>
      ) : error ? (
        <div className="terminal-inline-error">{error}</div>
      ) : data.leaderboard.length === 0 ? (
        <div className="terminal-inline-hint">No referrals yet — be the first! Share your link from the drawer or presale card.</div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border-green)', background: 'rgba(3,5,4,0.5)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--muted-gray)', fontFamily: 'Space Mono, monospace', fontSize: '0.68rem', letterSpacing: 0.5, borderBottom: '1px solid var(--border-green)' }}>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}>#</th>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}>Address</th>
                <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Referrals</th>
                <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Volume ETH</th>
              </tr>
            </thead>
            <tbody>
              {data.leaderboard.map((row) => (
                <tr key={row.referrer} style={{ borderBottom: '1px solid rgba(57,255,20,0.08)', background: row.referrer?.toLowerCase() === address?.toLowerCase() ? 'rgba(57,255,20,0.07)' : 'transparent' }}>
                  <td style={{ padding: '8px 10px', fontFamily: 'Space Mono, monospace', color: row.rank <= 3 ? 'var(--neon-green)' : 'var(--white)', fontWeight: row.rank <= 3 ? 800 : 600 }}>{row.rank}</td>
                  <td style={{ padding: '8px 10px', fontFamily: 'Space Mono, monospace', color: 'var(--white)' }} title={row.referrer}>{row.display}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'Space Mono, monospace', color: 'var(--white)', fontWeight: 700 }}>{row.count}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'Space Mono, monospace', color: 'var(--neon-green)', fontWeight: 700 }}>{Number(row.totalEth).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="terminal-meta-note" style={{ fontSize: '0.65rem', lineHeight: 1.4 }}>
        1% of each referee&apos;s token allocation goes to their referrer forever — calculated at TGE from on-chain-verified deposits. No self-referrals.
      </div>
    </div>
  );
}
