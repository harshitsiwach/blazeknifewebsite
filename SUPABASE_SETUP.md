# Supabase Setup — Referral Leaderboard (5 min)

This guide sets up persistent referral + deposit storage for `blazeknife`. Until you do this, the app falls back to `data/deposits.json` (dev only) — referral still works locally, but resets on redeploy. For production, follow steps 1–4.

## 1. Create Supabase Project

1. Go to https://supabase.com → **New Project**
2. Name: `blazeknife`, pick region closest to users, set DB password (save it).
3. Wait ~2 min for provision.

## 2. Create Tables (SQL Editor)

Supabase Dashboard → **SQL Editor** → **New Query** → paste and **Run**:

```sql
create table deposits (
  tx_hash text primary key,
  wallet_address text not null check (wallet_address ~ '^0x[0-9a-fA-F]{40}$'),
  amount_eth numeric not null check (amount_eth >= 0.01),
  amount_wei text not null,
  block_number text,
  referrer text check (referrer is null or referrer ~ '^0x[0-9a-fA-F]{40}$'),
  timestamp timestamptz default now(),
  chain_id int
);
create index idx_deposits_wallet on deposits(wallet_address);
create index idx_deposits_referrer on deposits(referrer) where referrer is not null;
create index idx_deposits_timestamp on deposits(timestamp desc);

-- View for leaderboard (both metrics)
create or replace view leaderboard as
  select referrer, count(*)::int as count, sum(amount_eth)::numeric as total_eth
  from deposits where referrer is not null group by referrer;

-- Enable RLS and allow anon SELECT on leaderboard view, service_role INSERT on deposits
alter table deposits enable row level security;
create policy "anon can read deposits" on deposits for select using (true);
create policy "service can insert" on deposits for insert with check (true);
-- For leaderboard view, grant anon select via deposits policy
```

If you get `policy already exists`, ignore. You can tighten RLS later.

## 3. Get API Keys

Dashboard → **Project Settings → API**:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL` (also `SUPABASE_URL`)
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (also `SUPABASE_ANON_KEY`)
- `service_role` (secret, **never expose client-side**) → `SUPABASE_SERVICE_ROLE_KEY`

Copy all 3. `service_role` bypasses RLS for server inserts — keep only in server env (Vercel → Environment Variables, not prefixed `NEXT_PUBLIC_` except URL/anon).

## 4. Set Env

Local: edit `blazeknife/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Vercel: **Project → Settings → Environment Variables** → add same 3 (add both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL` with same URL, same for anon). Redeploy.

## 5. Verify

1. `npm run dev --prefix blazeknife` → visit `http://localhost:3000?ref=0x1111111111111111111111111111111111111111` (any valid address)
2. Connect wallet, donate `0.01` on testnet/mainnet → check **Terminal → Success → Recorded ✓**
3. Check Supabase → **Table Editor → deposits** → row appears with `referrer` column set.
4. Visit leaderboard below presale card → should show `1 referrals, 0.01 ETH volume`; hit **By Referrals / By Volume** toggle.

## 6. Fallback Behavior (Placeholders)

If env vars empty, `lib/supabase.js:isSupabaseConfigured` is false → `app/api/record-deposit/route.js` writes to `data/deposits.json` and `app/api/referrals/route.js` reads from it. Same referral logic, just ephemeral. Switch to Supabase transparently when env set — no code change.

## 7. Referral Reward (1%)

Referrer gets `1%` of referee's token allocation at TGE (snapshot of `deposits` grouped by `referrer`). Example: referee donates 10 ETH → gets 1000 tokens → referrer gets 10 tokens. Calculated off-chain at distribution, not instant. Leaderboard already tracks both `count` and `totalEth` for your audit.

## 8. Troubleshooting

- `Supabase insert error: duplicate key` → tx already recorded (deduplicated, returns `deduplicated:true`)
- `Transaction not found on this chain/RPC` → check `NEXT_PUBLIC_USE_TESTNET` matches wallet network
- No leaderboard data → ensure `referrer` param was `?ref=0x...` (valid address) and not self-referral (auto-nulled)
