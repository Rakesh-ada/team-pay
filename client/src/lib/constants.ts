import { Chain, TransferMethod } from '@/types';

// CCTP V2 supported chains - both mainnet and testnet
export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://etherscan.io',
    usdcAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    cctpDomain: 0,
    color: 'bg-red-500'
  },
  {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://polygonscan.com',
    usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    cctpDomain: 7,
    color: 'bg-purple-500'
  },
  {
    id: 42161,
    name: 'Arbitrum',
    symbol: 'ETH',
    rpcUrl: 'https://arbitrum-mainnet.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://arbiscan.io',
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    cctpDomain: 3,
    color: 'bg-blue-500'
  },
  {
    id: 8453,
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    cctpDomain: 6,
    color: 'bg-blue-600'
  },
  {
    id: 10,
    name: 'OP Mainnet',
    symbol: 'ETH',
    rpcUrl: 'https://optimism-mainnet.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://optimistic.etherscan.io',
    usdcAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    cctpDomain: 2,
    color: 'bg-red-600'
  },
  {
    id: 43114,
    name: 'Avalanche',
    symbol: 'AVAX',
    rpcUrl: 'https://avalanche-mainnet.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://snowtrace.io',
    usdcAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    cctpDomain: 1,
    color: 'bg-red-500'
  },
  {
    id: 59144,
    name: 'Linea',
    symbol: 'ETH',
    rpcUrl: 'https://rpc.linea.build',
    blockExplorer: 'https://lineascan.build',
    usdcAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    cctpDomain: 9,
    color: 'bg-green-500'
  }
];

export const TRANSFER_METHODS: TransferMethod[] = [
  {
    type: 'fast',
    name: 'Fast Transfer',
    description: 'Faster-than-finality transfers with Circle\'s attestation backing',
    estimatedTime: '~8-20s',
    fee: 'Per chain basis'
  },
  {
    type: 'standard',
    name: 'Standard Transfer',
    description: 'Hard finality transfers with maximum security',
    estimatedTime: '~13-19m',
    fee: 'No onchain fee'
  }
];

// CCTP V2 Contract Addresses (Mainnet) - Universal addresses across all chains
export const CCTP_V2_CONTRACTS = {
  tokenMessengerV2: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
  messageTransmitterV2: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
  tokenMinterV2: '0xfd78EE919681417d192449715b2594ab58f5D002',
  messageV2: '0xec546b6B005471ECf012e5aF77FBeC07e0FD8f78',
  // Legacy V1 contracts for backward compatibility
  tokenMessenger: '0xBd3fa81B58Ba92a82136038B25aDec7066af3155',
  messageTransmitter: '0x0a992d191DEeC32aFe36203Ad87D7d289a738F81',
  tokenMinter: '0xc4922d64a24675E16e1586e3e3Aa56C06fABe907'
};

// CCTP V2 Contract Addresses (Testnet) - Sepolia testnet addresses
export const CCTP_V2_TESTNET_CONTRACTS = {
  tokenMessengerV2: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
  messageTransmitterV2: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275',
  tokenMinterV2: '0xb43db544E2c27092c107639Ad201b3dEfAbcF192',
  messageV2: '0xbaC0179bB358A8936169a63408C8481D582390C4',
  // Legacy V1 contracts
  tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
  messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275',
  tokenMinter: '0xb43db544E2c27092c107639Ad201b3dEfAbcF192'
};

export const CIRCLE_ATTESTATION_API = 'https://iris-api.circle.com/attestations';

// For backwards compatibility
export const CCTP_CONTRACTS = CCTP_V2_CONTRACTS;

export const TESTNET_CHAINS: Chain[] = [
  {
    id: 11155111,
    name: 'Sepolia',
    symbol: 'ETH',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://sepolia.etherscan.io',
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    cctpDomain: 0,
    color: 'bg-red-500'
  },
  {
    id: 421614,
    name: 'Arbitrum Sepolia',
    symbol: 'ETH',
    rpcUrl: 'https://arbitrum-sepolia.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://sepolia.arbiscan.io',
    usdcAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CF46854E',
    cctpDomain: 3,
    color: 'bg-blue-500'
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    symbol: 'ETH',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    cctpDomain: 6,
    color: 'bg-blue-600'
  }
];
