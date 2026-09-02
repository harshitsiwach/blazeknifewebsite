import { NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { promises as fs } from 'fs';
import path from 'path';
import { getSupabaseService, isSupabaseConfigured } from '../../../lib/supabase.js';

function truncate(addr) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
}

async function readDepositsJson() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'deposits.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function buildLeaderboardFromRows(rows, sortBy) {
  const map = new Map();
  for (const r of rows) {
    const ref = (r.referrer || r.referrer === null ? r.referrer : r.referrer) ?? null;
    // rows from supabase use referrer, json uses referrer
    const referrer = (r.referrer ?? r.referrer) ? String(r.referrer).toLowerCase() : null;
    if (!referrer) continue;
    if (!isAddress(referrer)) continue;
    const amt = Number(r.amount_eth ?? r.amountEth ?? 0);
    const cur = map.get(referrer) || { referrer, count: 0, totalEth: 0 };
    cur.count += 1;
    cur.totalEth += Number.isFinite(amt) ? amt : 0;
    map.set(referrer, cur);
  }
  const list = Array.from(map.values()).map((x) => ({ ...x, display: truncate(x.referrer), totalEth: Number(x.totalEth.toFixed(6)) }));
  if (sortBy === 'count') {
    list.sort((a, b) => b.count - a.count || b.totalEth - a.totalEth);
  } else {
    // default sort by volume
    list.sort((a, b) => b.totalEth - a.totalEth || b.count - a.count);
  }
  return list.map((x, i) => ({ rank: i + 1, ...x }));
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get('sort') === 'count' ? 'count' : 'volume';
  const wallet = searchParams.get('wallet');
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') || '100')));
  const offset = Math.max(0, Number(searchParams.get('offset') || '0'));

  let rows = [];
  if (isSupabaseConfigured) {
    const supabase = getSupabaseService();
    if (supabase) {
      const { data, error } = await supabase.from('deposits').select('referrer, amount_eth').not('referrer', 'is', null);
      if (!error && data) {
        rows = data;
      } else if (error) {
        console.error('referrals supabase error:', error);
        rows = await readDepositsJson();
      }
    } else {
      rows = await readDepositsJson();
    }
  } else {
    rows = await readDepositsJson();
  }

  // If ?wallet=0x... requested, return personal stats alongside leaderboard
  if (wallet && isAddress(wallet)) {
    const w = wallet.toLowerCase();
    const leaderboard = buildLeaderboardFromRows(rows, sort);
    const me = leaderboard.find((x) => x.referrer === w) || { rank: null, referrer: w, display: truncate(w), count: 0, totalEth: 0 };
    // also compute personal referred list count for me (for convenience)
    return NextResponse.json({ leaderboard: leaderboard.slice(offset, offset + limit), total: leaderboard.length, me, sort, source: isSupabaseConfigured ? 'supabase' : 'json' });
  }

  const leaderboard = buildLeaderboardFromRows(rows, sort);
  return NextResponse.json({ leaderboard: leaderboard.slice(offset, offset + limit), total: leaderboard.length, sort, source: isSupabaseConfigured ? 'supabase' : 'json' });
}
