import { ethers, BrowserProvider, Contract, parseUnits, formatEther } from 'ethers';
import { CCTP_V2_CONTRACTS, CCTP_V2_TESTNET_CONTRACTS, SUPPORTED_CHAINS, TESTNET_CHAINS } from './constants';
import { Recipient } from '@/types';

// Circle API response interfaces
interface AttestationResponse {
  data: {
    attestation: string;
    status: 'complete' | 'pending_confirmations';
  };
}

interface MessageResponse {
  messages: Array<{
    message: string;
    eventNonce: string;
    attestation: string;
    status: 'complete' | 'pending_confirmations';
    cctpVersion: number;
    decodedMessage?: {
      sourceDomain: string;
      destinationDomain: string;
      nonce: string;
      sender: string;
      recipient: string;
      messageBody: string;
    };
  }>;
}

interface PublicKeysResponse {
  publicKeys: Array<{
    publicKey: string;
    cctpVersion: string;
  }>;
}

interface FastBurnAllowanceResponse {
  allowance: string;
}

interface BurnFeesResponse {
  fees: Array<{
    feeType: 'fast' | 'standard';
    fee: string;
  }>;
}

export class CCTPService {
  private provider: BrowserProvider;
  private signer: ethers.Signer;
  private isTestnet: boolean;

  constructor(provider: BrowserProvider, signer: ethers.Signer, isTestnet: boolean = false) {
    this.provider = provider;
    this.signer = signer;
    this.isTestnet = isTestnet;
  }

  private getApiBaseUrl(): string {
    return this.isTestnet 
      ? 'https://iris-api-sandbox.circle.com'
      : 'https://iris-api.circle.com';
  }

  private getContracts() {
    return this.isTestnet ? CCTP_V2_TESTNET_CONTRACTS : CCTP_V2_CONTRACTS;
  }

  private getSupportedChains() {
    return this.isTestnet ? TESTNET_CHAINS : SUPPORTED_CHAINS;
  }

  async burnUSDC(recipient: Recipient, destinationChain: number, transferMethod: 'fast' | 'standard' = 'standard'): Promise<string> {
    try {
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);
      const supportedChains = this.getSupportedChains();
      const sourceChain = supportedChains.find(c => c.id === chainId);
      
      if (!sourceChain) {
        throw new Error('Unsupported source chain');
      }

      const destChain = supportedChains.find(c => c.id === destinationChain);
      if (!destChain) {
        throw new Error('Unsupported destination chain');
      }

      const contracts = this.getContracts();
      const amount = parseUnits(recipient.amount, 6);

      // USDC contract ABI
      const usdcAbi = [
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function allowance(address owner, address spender) external view returns (uint256)'
      ];

      const usdcContract = new Contract(sourceChain.usdcAddress, usdcAbi, this.signer);
      const signerAddress = await this.signer.getAddress();

      // Check and approve TokenMessengerV2
      const allowance = await usdcContract.allowance(signerAddress, contracts.tokenMessengerV2);

      if (allowance < amount) {
        const approveTx = await usdcContract.approve(contracts.tokenMessengerV2, amount);
        await approveTx.wait();
      }

      // TokenMessengerV2 ABI for CCTP V2
      const tokenMessengerV2Abi = [
        'function depositForBurnWithCaller(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken, bytes32 destinationCaller) external returns (uint64 nonce)',
        'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken) external returns (uint64 nonce)'
      ];

      const tokenMessengerV2 = new Contract(
        contracts.tokenMessengerV2,
        tokenMessengerV2Abi,
        this.signer
      );

      const mintRecipient = ethers.zeroPadValue(recipient.address, 32);
      
      let burnTx;
      if (transferMethod === 'fast') {
        // For fast transfers, use depositForBurnWithCaller with specific destination caller
        const destinationCaller = ethers.zeroPadValue(recipient.address, 32);
        burnTx = await tokenMessengerV2.depositForBurnWithCaller(
          amount,
          destChain.cctpDomain,
          mintRecipient,
          sourceChain.usdcAddress,
          destinationCaller
        );
      } else {
        // Standard transfer
        burnTx = await tokenMessengerV2.depositForBurn(
          amount,
          destChain.cctpDomain,
          mintRecipient,
          sourceChain.usdcAddress
        );
      }

      const receipt = await burnTx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Burn failed:', error);
      throw error;
    }
  }

  async getMessagesAndAttestation(txHash: string, sourceChainId: number): Promise<MessageResponse> {
    try {
      const supportedChains = this.getSupportedChains();
      const sourceChain = supportedChains.find(c => c.id === sourceChainId);
      
      if (!sourceChain) {
        throw new Error('Unsupported source chain');
      }

      const apiUrl = `${this.getApiBaseUrl()}/v2/messages/${sourceChain.cctpDomain}?transactionHash=${txHash}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: MessageResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get messages and attestation:', error);
      throw error;
    }
  }

  async getAttestation(messageHash: string): Promise<string> {
    try {
      const apiUrl = `${this.getApiBaseUrl()}/v1/attestations/${messageHash}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Attestation API request failed: ${response.status} ${response.statusText}`);
      }

      const data: AttestationResponse = await response.json();
      
      if (data.data.status !== 'complete') {
        throw new Error('Attestation not ready');
      }

      return data.data.attestation;
    } catch (error) {
      console.error('Failed to get attestation:', error);
      throw error;
    }
  }

  async reattest(nonce: string): Promise<void> {
    try {
      const apiUrl = `${this.getApiBaseUrl()}/v2/reattest/${nonce}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Reattest API request failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to reattest:', error);
      throw error;
    }
  }

  async mintUSDC(message: string, attestation: string, destinationChainId: number): Promise<string> {
    try {
      const network = await this.provider.getNetwork();
      const currentChainId = Number(network.chainId);
      if (currentChainId !== destinationChainId) {
        throw new Error('Please switch to the destination chain');
      }

      const contracts = this.getContracts();
      const messageTransmitterV2Abi = [
        'function receiveMessage(bytes calldata message, bytes calldata attestation) external returns (bool success)'
      ];

      const messageTransmitterV2 = new Contract(
        contracts.messageTransmitterV2,
        messageTransmitterV2Abi,
        this.signer
      );

      const mintTx = await messageTransmitterV2.receiveMessage(message, attestation);
      const receipt = await mintTx.wait();
      
      return receipt.hash;
    } catch (error) {
      console.error('Mint failed:', error);
      throw error;
    }
  }

  async getFastBurnAllowance(): Promise<string> {
    try {
      const apiUrl = `${this.getApiBaseUrl()}/v2/fastBurn/USDC/allowance`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Fast burn allowance API request failed: ${response.status} ${response.statusText}`);
      }

      const data: FastBurnAllowanceResponse = await response.json();
      return data.allowance;
    } catch (error) {
      console.error('Failed to get fast burn allowance:', error);
      throw error;
    }
  }

  async getBurnFees(sourceChainId: number, destinationChainId: number): Promise<BurnFeesResponse> {
    try {
      const supportedChains = this.getSupportedChains();
      const sourceChain = supportedChains.find(c => c.id === sourceChainId);
      const destChain = supportedChains.find(c => c.id === destinationChainId);
      
      if (!sourceChain || !destChain) {
        throw new Error('Unsupported chain');
      }

      const apiUrl = `${this.getApiBaseUrl()}/v2/burn/USDC/fees/${sourceChain.cctpDomain}/${destChain.cctpDomain}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Burn fees API request failed: ${response.status} ${response.statusText}`);
      }

      const data: BurnFeesResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get burn fees:', error);
      throw error;
    }
  }

  async getPublicKeys(): Promise<PublicKeysResponse> {
    try {
      const apiUrl = `${this.getApiBaseUrl()}/v2/publicKeys?cctpVersion=2`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Public keys API request failed: ${response.status} ${response.statusText}`);
      }

      const data: PublicKeysResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get public keys:', error);
      throw error;
    }
  }

  async estimateFees(recipients: Recipient[], transferMethod: 'fast' | 'standard'): Promise<{
    networkFees: string;
    cctpFees: string;
    total: string;
  }> {
    try {
      // Get network fees estimation
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || parseUnits('20', 'gwei');
      const estimatedGas = recipients.length * 150000; // Gas per transfer
      
      const networkFees = gasPrice * BigInt(estimatedGas);
      const networkFeesUSD = Number(formatEther(networkFees)) * 2000; // Assume ETH = $2000

      // Get real CCTP fees if possible
      let cctpFeesUSD = 0;
      if (recipients.length > 0) {
        try {
          const network = await this.provider.getNetwork();
          const sourceChainId = Number(network.chainId);
          const uniqueDestinations = Array.from(new Set(recipients.map(r => r.chainId)));
          
          for (const destChainId of uniqueDestinations) {
            if (destChainId !== sourceChainId) {
              const feesData = await this.getBurnFees(sourceChainId, destChainId);
              const relevantFee = feesData.fees.find(f => f.feeType === transferMethod);
              if (relevantFee) {
                const recipientsForChain = recipients.filter(r => r.chainId === destChainId);
                cctpFeesUSD += parseFloat(relevantFee.fee) * recipientsForChain.length;
              }
            }
          }
        } catch (error) {
          console.warn('Could not fetch real CCTP fees, using fallback:', error);
          // Fallback fee estimation
          cctpFeesUSD = transferMethod === 'fast' ? recipients.length * 0.5 : 0;
        }
      }

      const total = networkFeesUSD + cctpFeesUSD;

      return {
        networkFees: `~$${networkFeesUSD.toFixed(2)}`,
        cctpFees: `~$${cctpFeesUSD.toFixed(2)}`,
        total: `~$${total.toFixed(2)}`
      };
    } catch (error) {
      console.error('Fee estimation failed:', error);
      
      // Fallback estimation
      return {
        networkFees: '~$15.00',
        cctpFees: transferMethod === 'fast' ? '~$5.00' : '~$0.00',
        total: transferMethod === 'fast' ? '~$20.00' : '~$15.00'
      };
    }
  }
}
