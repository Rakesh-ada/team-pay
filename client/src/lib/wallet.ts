import { ethers, BrowserProvider } from 'ethers';
import { MetaMaskSDK } from '@metamask/sdk';
import { SUPPORTED_CHAINS, TESTNET_CHAINS } from './constants';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class WalletService {
  private provider: BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private sdk: MetaMaskSDK | null = null;

  constructor() {
    this.initializeSDK();
  }

  private initializeSDK() {
    this.sdk = new MetaMaskSDK({
      dappMetadata: {
        name: 'CCTP Bulk Transfer',
        url: window.location.href,
      },
      preferDesktop: true,
    });
  }

  async connectWallet() {
    try {
      if (!this.sdk) {
        throw new Error('MetaMask SDK not initialized');
      }

      const accounts = await this.sdk.connect();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from MetaMask');
      }

      // Get the provider from SDK
      const ethereum = this.sdk.getProvider();
      if (!ethereum) {
        throw new Error('Failed to get provider from MetaMask SDK');
      }

      this.provider = new BrowserProvider(ethereum);
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
      console.error('Failed to connect wallet:', error);
      throw error;
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

    try {
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Find the chain configuration
      const allChains = [...SUPPORTED_CHAINS, ...TESTNET_CHAINS];
      const chain = allChains.find(c => c.id === chainId);
      
      if (!chain) {
        return '0.00';
      }

      // USDC contract ABI for balanceOf function
      const usdcAbi = [
        'function balanceOf(address account) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];

      const usdcContract = new ethers.Contract(chain.usdcAddress, usdcAbi, this.provider);
      const balance = await usdcContract.balanceOf(address);
      const decimals = await usdcContract.decimals();
      
      // Convert from wei to human readable format
      const formattedBalance = ethers.formatUnits(balance, decimals);
      return parseFloat(formattedBalance).toFixed(2);
    } catch (error) {
      console.error('Failed to get USDC balance:', error);
      return '0.00';
    }
  }

  async getETHBalance(address: string, chainId: number): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      // Find the chain configuration to use the right RPC URL
      const allChains = [...SUPPORTED_CHAINS, ...TESTNET_CHAINS];
      const chain = allChains.find(c => c.id === chainId);
      
      if (!chain) {
        return '0.00';
      }

      // If checking on the current network, use the existing provider
      if (this.provider && (await this.provider.getNetwork()).chainId === BigInt(chainId)) {
        const balance = await this.provider.getBalance(address);
        return ethers.formatEther(balance);
      } else {
        // If checking on a different network, create a temporary provider
        const tempProvider = new ethers.JsonRpcProvider(chain.rpcUrl);
        const balance = await tempProvider.getBalance(address);
        return ethers.formatEther(balance);
      }
    } catch (error) {
      console.error('Failed to get ETH balance:', error);
      return '0.00';
    }
  }

  async hasZeroETHBalance(address: string, chainId: number): Promise<boolean> {
    try {
      const balance = await this.getETHBalance(address, chainId);
      return parseFloat(balance) === 0;
    } catch (error) {
      console.error('Error checking ETH balance:', error);
      // Return false to avoid showing warning on errors
      return false;
    }
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }
}

export const walletService = new WalletService();
