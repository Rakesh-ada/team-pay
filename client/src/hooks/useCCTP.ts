import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CCTPService } from '@/lib/cctp';
import { walletService } from '@/lib/wallet';
import { Recipient } from '@/types';

export const useCCTP = () => {
  const { 
    recipients, 
    updateRecipient, 
    addTransaction, 
    updateTransaction,
    selectedTransferMethod,
    setFeeEstimation
  } = useAppStore();
  
  const [isExecuting, setIsExecuting] = useState(false);

  const executeBulkTransfer = async () => {
    if (!walletService.getProvider() || !walletService.getSigner()) {
      throw new Error('Wallet not connected');
    }

    setIsExecuting(true);

    try {
      const cctpService = new CCTPService(
        walletService.getProvider()!,
        walletService.getSigner()!
      );

      for (const recipient of recipients) {
        if (recipient.status !== 'ready') continue;

        try {
          // Update status to burning
          updateRecipient(recipient.id, { status: 'burning' });

          // Execute burn transaction
          const burnTxHash = await cctpService.burnUSDC(recipient, recipient.chainId);
          
          updateRecipient(recipient.id, { 
            status: 'attesting', 
            txHash: burnTxHash 
          });

          addTransaction({
            id: `burn-${recipient.id}`,
            type: 'burn',
            status: 'confirmed',
            txHash: burnTxHash,
            chainId: recipient.chainId,
            amount: recipient.amount,
            recipient: recipient.address,
            timestamp: Date.now()
          });

          // Poll for attestation
          let attestation: string;
          let attempts = 0;
          const maxAttempts = selectedTransferMethod === 'fast' ? 5 : 60; // 5 attempts for fast, 60 for standard
          
          while (attempts < maxAttempts) {
            try {
              attestation = await cctpService.getAttestation(burnTxHash, recipient.chainId);
              break;
            } catch (error) {
              attempts++;
              await new Promise(resolve => setTimeout(resolve, 
                selectedTransferMethod === 'fast' ? 3000 : 30000
              ));
            }
          }

          if (!attestation!) {
            updateRecipient(recipient.id, { 
              status: 'failed', 
              error: 'Attestation timeout' 
            });
            continue;
          }

          updateRecipient(recipient.id, { 
            status: 'minting', 
            attestationHash: attestation 
          });

          // Execute mint transaction
          const mintTxHash = await cctpService.mintUSDC(
            attestation, 
            burnTxHash, 
            recipient.chainId
          );

          updateRecipient(recipient.id, { 
            status: 'completed',
            txHash: mintTxHash
          });

          addTransaction({
            id: `mint-${recipient.id}`,
            type: 'mint',
            status: 'confirmed',
            txHash: mintTxHash,
            chainId: recipient.chainId,
            amount: recipient.amount,
            recipient: recipient.address,
            timestamp: Date.now()
          });

        } catch (error) {
          console.error(`Failed to process recipient ${recipient.id}:`, error);
          updateRecipient(recipient.id, { 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const estimateFees = async () => {
    if (!walletService.getProvider() || !walletService.getSigner()) {
      return;
    }

    try {
      const cctpService = new CCTPService(
        walletService.getProvider()!,
        walletService.getSigner()!
      );

      const fees = await cctpService.estimateFees(recipients, selectedTransferMethod);
      setFeeEstimation(fees);
    } catch (error) {
      console.error('Failed to estimate fees:', error);
    }
  };

  return {
    executeBulkTransfer,
    estimateFees,
    isExecuting
  };
};
