import { ethers, BrowserProvider } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class WalletService {
  private provider: BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      this.provider = new BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      const address = accounts[0];
      const network = await this.provider.getNetwork();
      const balance = await this.getUSDCBalance(address);

      return {
        address,
        chainId: Number(network.chainId),
        balance
      };
    } catch (error) {
      throw new Error('Failed to connect wallet');
    }
  }

  async switchNetwork(chainId: number) {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        throw new Error('Network not added to MetaMask');
      }
      throw error;
    }
  }

  async getUSDCBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    // This would use the actual USDC contract address for the current chain
    // For now, returning mock balance
    return '1250.00';
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }
}

export const walletService = new WalletService();
