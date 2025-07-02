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
    setFeeEstimation,
    isTestnet
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
        walletService.getSigner()!,
        isTestnet
      );

      for (const recipient of recipients) {
        if (recipient.status !== 'ready') continue;

        try {
          // Update status to burning
          updateRecipient(recipient.id, { status: 'burning' });

          // Execute burn transaction with transfer method
          const burnTxHash = await cctpService.burnUSDC(recipient, recipient.chainId, selectedTransferMethod);
          
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

          // Get messages and attestation using CCTP V2 API
          let messageData;
          let attempts = 0;
          const maxAttempts = selectedTransferMethod === 'fast' ? 10 : 60;
          const network = await walletService.getProvider()!.getNetwork();
          const sourceChainId = Number(network.chainId);
          
          while (attempts < maxAttempts) {
            try {
              messageData = await cctpService.getMessagesAndAttestation(burnTxHash, sourceChainId);
              if (messageData.messages.length > 0 && messageData.messages[0].status === 'complete') {
                break;
              }
            } catch (error) {
              console.log(`Attempt ${attempts + 1}: Waiting for attestation...`);
            }
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 
              selectedTransferMethod === 'fast' ? 5000 : 30000
            ));
          }

          if (!messageData || messageData.messages.length === 0 || messageData.messages[0].status !== 'complete') {
            updateRecipient(recipient.id, { 
              status: 'failed', 
              error: 'Attestation timeout or not available' 
            });
            continue;
          }

          const message = messageData.messages[0];
          
          updateRecipient(recipient.id, { 
            status: 'minting', 
            attestationHash: message.attestation 
          });

          // Execute mint transaction with message and attestation
          const mintTxHash = await cctpService.mintUSDC(
            message.message, 
            message.attestation, 
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
        walletService.getSigner()!,
        isTestnet
      );

      const fees = await cctpService.estimateFees(recipients, selectedTransferMethod);
      setFeeEstimation(fees);
    } catch (error: any) {
      // Handle network change errors gracefully
      if (error.code === 'NETWORK_ERROR' || error.event === 'changed') {
        console.warn('Network change detected during fee estimation, will retry automatically');
        // Don't show error to user, just skip this estimation cycle
        return;
      }
      console.error('Failed to estimate fees:', error);
      
      // Set fallback fees for other errors
      setFeeEstimation({
        networkFees: '~$15.00',
        cctpFees: selectedTransferMethod === 'fast' ? '~$5.00' : '~$0.00',
        total: selectedTransferMethod === 'fast' ? '~$20.00' : '~$15.00'
      });
    }
  };

  return {
    executeBulkTransfer,
    estimateFees,
    isExecuting
  };
};
