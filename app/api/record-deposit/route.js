import { NextResponse } from 'next/server';
import { createPublicClient, http, parseEther, formatEther, isAddress } from 'viem';
import { robinhoodChain, robinhoodTestnet } from '../../../lib/chains.js';
import { promises as fs } from 'fs';
import path from 'path';

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
  const { walletAddress, amountEth, txHash } = body;
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
  // no max per user request — any amount above min allowed

  const receivingAddress = process.env.NEXT_PUBLIC_RECEIVING_ADDRESS;
  if (!receivingAddress || !isAddress(receivingAddress)) {
    return NextResponse.json({ error: 'Server misconfigured: NEXT_PUBLIC_RECEIVING_ADDRESS not set.' }, { status: 500 });
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
      walletAddress,
      amountEth,
      amountWei: tx.value.toString(),
      txHash,
      blockNumber: receipt.blockNumber.toString(),
      timestamp: new Date().toISOString(),
      chainId: tx.chainId,
    };

    try {
      const dataDir = path.join(process.cwd(), 'data');
      await fs.mkdir(dataDir, { recursive: true });
      const filePath = path.join(dataDir, 'deposits.json');
      let existing = [];
      try {
        const raw = await fs.readFile(filePath, 'utf-8');
        existing = JSON.parse(raw);
        if (!Array.isArray(existing)) existing = [];
      } catch {}
      if (existing.some((r) => r.txHash === txHash)) {
        return NextResponse.json({ ok: true, record, deduped: true });
      }
      existing.push(record);
      await fs.writeFile(filePath, JSON.stringify(existing, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write deposit record:', e);
      return NextResponse.json({ ok: true, record, warning: 'Verified but failed to persist locally.' });
    }

    return NextResponse.json({ ok: true, record });
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
  try {
    const filePath = path.join(process.cwd(), 'data', 'deposits.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const arr = JSON.parse(raw);
    const total = Array.isArray(arr) ? arr.reduce((sum, r) => sum + Number(r.amountEth || 0), 0) : 0;
    return NextResponse.json({ count: Array.isArray(arr) ? arr.length : 0, totalEth: total });
  } catch {
    return NextResponse.json({ count: 0, totalEth: 0 });
  }
}
