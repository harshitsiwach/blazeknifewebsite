import { NextResponse } from 'next/server';
import { createPublicClient, http, parseEther, formatEther, isAddress } from 'viem';
import { robinhoodChain, robinhoodTestnet } from '../../../lib/chains.js';
import { promises as fs } from 'fs';
import path from 'path';
import { getSupabaseService, isSupabaseConfigured } from '../../../lib/supabase.js';
import { normalizeAddress } from '../../../lib/referral.js';

const rateMap = new Map();
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

function getClient() {
  const useTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === 'true';
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const chain = useTestnet ? robinhoodTestnet : robinhoodChain;
  const rpcUrl = useTestnet
    ? 'https://rpc.testnet.chain.robinhood.com'
    : alchemyKey
      ? `https://robinhood-mainnet.g.alchemy.com/v2/${alchemyKey}`
      : 'https://rpc.mainnet.chain.robinhood.com';
  return createPublicClient({ chain, transport: http(rpcUrl) });
}

// --- Fallback JSON store (used when Supabase not configured) ---
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
async function writeDepositsJson(arr) {
  const dataDir = path.join(process.cwd(), 'data');
  await fs.mkdir(dataDir, { recursive: true });
  const filePath = path.join(dataDir, 'deposits.json');
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf-8');
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limited. Try again in a minute.' }, { status: 429 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  const { walletAddress, amountEth, txHash, referrer } = body;
  if (!walletAddress || !amountEth || !txHash) {
    return NextResponse.json({ error: 'Missing walletAddress, amountEth, or txHash.' }, { status: 400 });
  }
  if (!isAddress(walletAddress)) return NextResponse.json({ error: 'Invalid walletAddress.' }, { status: 400 });
  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) return NextResponse.json({ error: 'Invalid txHash.' }, { status: 400 });
  let claimedValue;
  try {
    claimedValue = parseEther(amountEth);
  } catch {
    return NextResponse.json({ error: 'Invalid amountEth.' }, { status: 400 });
  }
  if (claimedValue < parseEther('0.01')) {
    return NextResponse.json({ error: 'amountEth must be >= 0.01' }, { status: 400 });
  }

  const receivingAddress = process.env.NEXT_PUBLIC_RECEIVING_ADDRESS;
  if (!receivingAddress || !isAddress(receivingAddress)) {
    return NextResponse.json({ error: 'Server misconfigured: NEXT_PUBLIC_RECEIVING_ADDRESS not set.' }, { status: 500 });
  }

  // Normalize referrer: wallet address, never self, never vault, nullable forever-valid
  let normalizedReferrer = normalizeAddress(referrer);
  if (normalizedReferrer) {
    if (normalizedReferrer === walletAddress.toLowerCase()) normalizedReferrer = null; // self-ref => null (don't error, just no credit)
    else if (normalizedReferrer === receivingAddress.toLowerCase()) normalizedReferrer = null;
  }

  try {
    const client = getClient();
    const tx = await client.getTransaction({ hash: txHash });
    const receipt = await client.getTransactionReceipt({ hash: txHash });
    if (receipt.status !== 'success') return NextResponse.json({ error: 'Transaction not successful on-chain.' }, { status: 400 });
    if (!tx.to || tx.to.toLowerCase() !== receivingAddress.toLowerCase()) {
      return NextResponse.json({ error: `Transaction 'to' mismatch. Expected ${receivingAddress}, got ${tx.to}` }, { status: 400 });
    }
    if (tx.value !== claimedValue) {
      return NextResponse.json({ error: `Value mismatch. Claimed ${formatEther(claimedValue)} ETH, on-chain ${formatEther(tx.value)} ETH.` }, { status: 400 });
    }
    if (tx.from.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: `From mismatch. Claimed ${walletAddress}, on-chain ${tx.from}` }, { status: 400 });
    }

    const record = {
      wallet_address: walletAddress.toLowerCase(),
      amount_eth: amountEth,
      amount_wei: tx.value.toString(),
      tx_hash: txHash,
      block_number: receipt.blockNumber.toString(),
      referrer: normalizedReferrer,
      timestamp: new Date().toISOString(),
      chain_id: Number(tx.chainId ?? receipt.chainId ?? 0),
    };
    // shape for JSON fallback (camelCase for backwards compat)
    const jsonRecord = {
      walletAddress: record.wallet_address,
      amountEth: record.amount_eth,
      amountWei: record.amount_wei,
      txHash: record.tx_hash,
      blockNumber: record.block_number,
      referrer: record.referrer,
      timestamp: record.timestamp,
      chainId: record.chain_id,
    };

    // Try Supabase if configured, else JSON fallback
    if (isSupabaseConfigured) {
      const supabase = getSupabaseService();
      if (supabase) {
        const { error } = await supabase.from('deposits').insert(record);
        if (error) {
          // dedup: unique tx_hash
          if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate')) {
            return NextResponse.json({ ok: true, record: jsonRecord, deduped: true, referrer: normalizedReferrer });
          }
          console.error('Supabase insert error:', error);
          // Fallback to JSON so we don't lose verified deposit if Supabase hiccups
          const existing = await readDepositsJson();
          if (existing.some((r) => r.txHash === txHash)) return NextResponse.json({ ok: true, record: jsonRecord, deduped: true, referrer: normalizedReferrer });
          existing.push(jsonRecord);
          await writeDepositsJson(existing);
          return NextResponse.json({ ok: true, record: jsonRecord, warning: `Supabase failed, saved locally: ${error.message}`, referrer: normalizedReferrer });
        }
        return NextResponse.json({ ok: true, record: jsonRecord, referrer: normalizedReferrer });
      }
    }

    // JSON fallback
    const existing = await readDepositsJson();
    if (existing.some((r) => r.txHash === txHash)) {
      return NextResponse.json({ ok: true, record: jsonRecord, deduped: true, referrer: normalizedReferrer });
    }
    existing.push(jsonRecord);
    await writeDepositsJson(existing);
    return NextResponse.json({ ok: true, record: jsonRecord, referrer: normalizedReferrer });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('record-deposit verify error:', msg);
    if (msg.toLowerCase().includes('could not be found') || msg.toLowerCase().includes('not found')) {
      return NextResponse.json({ error: 'Transaction not found on this chain/RPC. Check network.' }, { status: 404 });
    }
    return NextResponse.json({ error: `Verification failed: ${msg.slice(0, 400)}` }, { status: 500 });
  }
}

export async function GET() {
  // Try Supabase first
  if (isSupabaseConfigured) {
    const supabase = getSupabaseService();
    if (supabase) {
      const { data, error } = await supabase.from('deposits').select('amount_eth');
      if (!error && data) {
        const total = data.reduce((sum, r) => sum + Number(r.amount_eth || 0), 0);
        return NextResponse.json({ count: data.length, totalEth: total });
      }
    }
  }
  // JSON fallback
  try {
    const arr = await readDepositsJson();
    const total = arr.reduce((sum, r) => sum + Number(r.amountEth || r.amount_eth || 0), 0);
    return NextResponse.json({ count: arr.length, totalEth: total });
  } catch {
    return NextResponse.json({ count: 0, totalEth: 0 });
  }
}
