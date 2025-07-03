import { ethers, BrowserProvider, Contract, parseUnits, formatEther } from 'ethers';
import { SUPPORTED_CHAINS, TESTNET_CHAINS } from './constants';
import { Recipient } from '@/types';

export class USDCService {
  private provider: BrowserProvider;
  private signer: ethers.Signer;
  private isTestnet: boolean;

  constructor(provider: BrowserProvider, signer: ethers.Signer, isTestnet: boolean = false) {
    this.provider = provider;
    this.signer = signer;
    this.isTestnet = isTestnet;
  }

  private getSupportedChains() {
    return this.isTestnet ? TESTNET_CHAINS : SUPPORTED_CHAINS;
  }

  async executeBatchTransfer(recipients: Recipient[]): Promise<string> {
    try {
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);
      const supportedChains = this.getSupportedChains();
      const sourceChain = supportedChains.find(c => c.id === chainId);
      
      if (!sourceChain) {
        throw new Error(`Unsupported chain: ${chainId}`);
      }

      // USDC contract ABI for transfers
      const usdcAbi = [
        'function transfer(address to, uint256 amount) external returns (bool)',
        'function balanceOf(address account) view returns (uint256)',
        'function allowance(address owner, address spender) external view returns (uint256)'
      ];

      const usdcContract = new Contract(sourceChain.usdcAddress, usdcAbi, this.signer);
      const signerAddress = await this.signer.getAddress();

      // Calculate total amount needed
      const totalAmount = recipients.reduce((sum, recipient) => {
        return sum + parseUnits(recipient.amount, 6);
      }, BigInt(0));

      // Check balance
      const balance = await usdcContract.balanceOf(signerAddress);
      if (balance < totalAmount) {
        throw new Error(`Insufficient USDC balance. You have ${ethers.formatUnits(balance, 6)} USDC but need ${ethers.formatUnits(totalAmount, 6)} USDC`);
      }

      // For single recipient, use direct transfer
      if (recipients.length === 1) {
        const recipient = recipients[0];
        const amount = parseUnits(recipient.amount, 6);
        
        const tx = await usdcContract.transfer(recipient.address, amount);
        await tx.wait();
        return tx.hash;
      }

      // For multiple recipients, we could use a multicall or send individual transactions
      // For simplicity, we'll send individual transactions in sequence
      const txHashes: string[] = [];
      
      for (const recipient of recipients) {
        const amount = parseUnits(recipient.amount, 6);
        const tx = await usdcContract.transfer(recipient.address, amount);
        await tx.wait();
        txHashes.push(tx.hash);
      }

      // Return the first transaction hash as the primary reference
      return txHashes[0];

    } catch (error: any) {
      // Handle user rejection gracefully
      if (error.code === 'ACTION_REJECTED' || error.code === 4001 || 
          (error.message && error.message.includes('user denied')) ||
          (error.message && error.message.includes('User denied'))) {
        throw new Error('Transaction cancelled by user');
      }
      
      console.error('Same-chain transfer failed:', error);
      throw error;
    }
  }

  async estimateFees(recipients: Recipient[]): Promise<{
    networkFees: string;
    cctpFees: string;
    total: string;
  }> {
    try {
      // Get network fees estimation
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || parseUnits('20', 'gwei');
      
      // Convert gas price to Gwei for display
      const networkFeesGwei = ethers.formatUnits(gasPrice, 'gwei');

      return {
        networkFees: `~${parseFloat(networkFeesGwei).toFixed(2)}`,
        cctpFees: '~0.00', // No CCTP fees for same-chain transfers
        total: `~${parseFloat(networkFeesGwei).toFixed(2)}`
      };
    } catch (error) {
      console.error('Fee estimation failed:', error);
      
      // Fallback estimation in Gwei
      return {
        networkFees: '~15.00',
        cctpFees: '~0.00',
        total: '~15.00'
      };
    }
  }
}