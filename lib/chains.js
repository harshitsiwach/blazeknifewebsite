import { defineChain } from "viem";

export const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" },
  },
});

export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://robinhoodchain-testnet.blockscout.com" },
  },
  testnet: true,
});

export function getActiveChain() {
  const useTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === "true";
  return useTestnet ? robinhoodTestnet : robinhoodChain;
}

export function getRpcUrl() {
  const useTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === "true";
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (useTestnet) return "https://rpc.testnet.chain.robinhood.com";
  if (alchemyKey) return `https://robinhood-mainnet.g.alchemy.com/v2/${alchemyKey}`;
  return "https://rpc.mainnet.chain.robinhood.com";
}

export function getExplorerTxUrl(hash) {
  const chain = getActiveChain();
  return `${chain.blockExplorers.default.url}/tx/${hash}`;
}

export function getExplorerAddressUrl(address) {
  const chain = getActiveChain();
  return `${chain.blockExplorers.default.url}/address/${address}`;
}
