export interface Recipient {
  id: string;
  address: string;
  chainId: number;
  chainName: string;
  amount: string;
  status: 'ready' | 'pending' | 'transferring' | 'burning' | 'attesting' | 'minting' | 'completed' | 'failed';
  txHash?: string;
  attestationHash?: string;
  error?: string;
  isSameChain?: boolean;
}

export interface Chain {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer: string;
  usdcAddress: string;
  cctpDomain: number;
  color: string;
}

export interface TransferMethod {
  type: 'fast' | 'standard' | 'same-chain';
  name: string;
  description: string;
  estimatedTime: string;
  fee: string;
}

export interface Transaction {
  id: string;
  type: 'burn' | 'mint' | 'transfer';
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
  chainId: number;
  amount: string;
  recipient?: string;
  timestamp: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string;
}

export interface FeeEstimation {
  networkFees: string;
  cctpFees: string;
  total: string;
}
