'use client';

import { http } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { robinhoodChain, robinhoodTestnet } from './chains.js';

function getAppRpcUrl() {
  const useTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === 'true';
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (useTestnet) return 'https://rpc.testnet.chain.robinhood.com';
  if (alchemyKey) return `https://robinhood-mainnet.g.alchemy.com/v2/${alchemyKey}`;
  return 'https://rpc.mainnet.chain.robinhood.com';
}

const rpcUrl = getAppRpcUrl();
const testnetRpc = 'https://rpc.testnet.chain.robinhood.com';

export const wagmiConfig = getDefaultConfig({
  appName: 'BLAZE KNIFE',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [robinhoodChain, robinhoodTestnet],
  transports: {
    [robinhoodChain.id]: http(rpcUrl),
    [robinhoodTestnet.id]: http(testnetRpc),
  },
  ssr: true,
});
