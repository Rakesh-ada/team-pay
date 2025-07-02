import { ethers, BrowserProvider, Contract, parseUnits, formatEther } from 'ethers';
import { CCTP_CONTRACTS, CIRCLE_ATTESTATION_API, SUPPORTED_CHAINS } from './constants';
import { Recipient } from '@/types';

interface AttestationResponse {
  attestation: string;
  status: string;
}

export class CCTPService {
  private provider: BrowserProvider;
  private signer: ethers.Signer;

  constructor(provider: BrowserProvider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  async burnUSDC(recipient: Recipient, destinationChain: number): Promise<string> {
    try {
      // Get the USDC contract
      const usdcAbi = [
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function allowance(address owner, address spender) external view returns (uint256)'
      ];

      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);
      const sourceChain = SUPPORTED_CHAINS.find(c => c.id === chainId);
      if (!sourceChain) {
        throw new Error('Unsupported source chain');
      }

      const usdcContract = new Contract(sourceChain.usdcAddress, usdcAbi, this.signer);
      const amount = parseUnits(recipient.amount, 6);

      // Check and approve if necessary
      const allowance = await usdcContract.allowance(
        await this.signer.getAddress(),
        CCTP_CONTRACTS.tokenMessenger
      );

      if (allowance.lt(amount)) {
        const approveTx = await usdcContract.approve(CCTP_CONTRACTS.tokenMessenger, amount);
        await approveTx.wait();
      }

      // Burn USDC via TokenMessenger
      const tokenMessengerAbi = [
        'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken) external returns (uint64 nonce)'
      ];

      const tokenMessenger = new Contract(
        CCTP_CONTRACTS.tokenMessenger,
        tokenMessengerAbi,
        this.signer
      );

      const destChain = SUPPORTED_CHAINS.find(c => c.id === destinationChain);
      if (!destChain) {
        throw new Error('Unsupported destination chain');
      }

      const mintRecipient = ethers.zeroPadValue(recipient.address, 32);
      
      const burnTx = await tokenMessenger.depositForBurn(
        amount,
        destChain.cctpDomain,
        mintRecipient,
        sourceChain.usdcAddress
      );

      const receipt = await burnTx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Burn failed:', error);
      throw error;
    }
  }

  async getAttestation(txHash: string, sourceChainId: number): Promise<string> {
    try {
      // Poll Circle's attestation service
      const response = await fetch(`${CIRCLE_ATTESTATION_API}/${txHash}`);
      
      if (!response.ok) {
        throw new Error('Attestation not available yet');
      }

      const data: AttestationResponse = await response.json();
      
      if (data.status !== 'complete') {
        throw new Error('Attestation not ready');
      }

      return data.attestation;
    } catch (error) {
      console.error('Failed to get attestation:', error);
      throw error;
    }
  }

  async mintUSDC(attestation: string, txHash: string, destinationChainId: number): Promise<string> {
    try {
      // Switch to destination chain if needed
      const network = await this.provider.getNetwork();
      const currentChainId = Number(network.chainId);
      if (currentChainId !== destinationChainId) {
        throw new Error('Please switch to the destination chain');
      }

      const messageTransmitterAbi = [
        'function receiveMessage(bytes calldata message, bytes calldata attestation) external returns (bool success)'
      ];

      const messageTransmitter = new Contract(
        CCTP_CONTRACTS.messageTransmitter,
        messageTransmitterAbi,
        this.signer
      );

      // Get the message from the burn transaction (simplified)
      // In reality, you'd need to parse the burn transaction logs
      const message = '0x'; // This would be extracted from burn transaction logs

      const mintTx = await messageTransmitter.receiveMessage(message, attestation);
      const receipt = await mintTx.wait();
      
      return receipt.transactionHash;
    } catch (error) {
      console.error('Mint failed:', error);
      throw error;
    }
  }

  async estimateFees(recipients: Recipient[], transferMethod: 'fast' | 'standard'): Promise<{
    networkFees: string;
    cctpFees: string;
    total: string;
  }> {
    // Simplified fee estimation
    const feeData = await this.provider.getFeeData();
    const gasPrice = feeData.gasPrice || parseUnits('20', 'gwei');
    const estimatedGas = recipients.length * 150000; // Gas per transfer
    
    const networkFees = gasPrice * BigInt(estimatedGas);
    const networkFeesUSD = Number(formatEther(networkFees)) * 2000; // Assume ETH = $2000
    
    const cctpFees = transferMethod === 'fast' ? recipients.length * 0.5 : 0;
    const total = networkFeesUSD + cctpFees;

    return {
      networkFees: `~$${networkFeesUSD.toFixed(2)}`,
      cctpFees: `~$${cctpFees.toFixed(2)}`,
      total: `~$${total.toFixed(2)}`
    };
  }
}
