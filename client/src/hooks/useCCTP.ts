import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CCTPService } from '@/lib/cctp';
import { USDCService } from '@/lib/usdc';
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
      // Separate recipients by transfer type
      const sameChainRecipients = recipients.filter(r => r.isSameChain && r.status === 'ready');
      const crossChainRecipients = recipients.filter(r => !r.isSameChain && r.status === 'ready');

      // Handle same-chain transfers
      if (sameChainRecipients.length > 0 && selectedTransferMethod === 'same-chain') {
        const usdcService = new USDCService(
          walletService.getProvider()!,
          walletService.getSigner()!,
          isTestnet
        );

        for (const recipient of sameChainRecipients) {
          try {
            // Update status to transferring
            updateRecipient(recipient.id, { status: 'transferring' });

            // Execute direct USDC transfer
            const txHash = await usdcService.executeBatchTransfer([recipient]);
            
            updateRecipient(recipient.id, { 
              status: 'completed', 
              txHash: txHash 
            });

            addTransaction({
              id: `transfer-${recipient.id}`,
              type: 'transfer',
              status: 'confirmed',
              txHash: txHash,
              chainId: recipient.chainId,
              amount: recipient.amount,
              recipient: recipient.address,
              timestamp: Date.now()
            });

          } catch (error) {
            console.error(`Failed to process same-chain recipient ${recipient.id}:`, error);
            
            // Handle user cancellation gracefully
            if (error instanceof Error && error.message === 'Transaction cancelled by user') {
              updateRecipient(recipient.id, { 
                status: 'ready', 
                error: undefined 
              });
            } else {
              updateRecipient(recipient.id, { 
                status: 'failed', 
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          }
        }
      }

      // Handle cross-chain transfers
      if (crossChainRecipients.length > 0 && (selectedTransferMethod === 'fast' || selectedTransferMethod === 'standard')) {
        const cctpService = new CCTPService(
          walletService.getProvider()!,
          walletService.getSigner()!,
          isTestnet
        );

        for (const recipient of crossChainRecipients) {
          try {
            // Update status to burning
            updateRecipient(recipient.id, { status: 'burning' });

            // Execute burn transaction with transfer method
            const burnTxHash = await cctpService.burnUSDC(recipient, recipient.chainId, selectedTransferMethod as 'fast' | 'standard');
            
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
            console.error(`Failed to process cross-chain recipient ${recipient.id}:`, error);
            
            // Handle user cancellation gracefully
            if (error instanceof Error && error.message === 'Transaction cancelled by user') {
              updateRecipient(recipient.id, { 
                status: 'ready', 
                error: undefined 
              });
            } else {
              updateRecipient(recipient.id, { 
                status: 'failed', 
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Bulk transfer failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const estimateFees = async () => {
    if (!walletService.getProvider() || !walletService.getSigner()) {
      return;
    }

    try {
      if (selectedTransferMethod === 'same-chain') {
        // Use USDC service for same-chain fee estimation
        const usdcService = new USDCService(
          walletService.getProvider()!,
          walletService.getSigner()!,
          isTestnet
        );

        const fees = await usdcService.estimateFees(recipients);
        setFeeEstimation(fees);
      } else {
        // Use CCTP service for cross-chain fee estimation
        const cctpService = new CCTPService(
          walletService.getProvider()!,
          walletService.getSigner()!,
          isTestnet
        );

        const fees = await cctpService.estimateFees(recipients, selectedTransferMethod as 'fast' | 'standard');
        setFeeEstimation(fees);
      }
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
        networkFees: selectedTransferMethod === 'same-chain' ? '~$5.00' : '~$15.00',
        cctpFees: selectedTransferMethod === 'fast' ? '~$5.00' : '~$0.00',
        total: selectedTransferMethod === 'same-chain' ? '~$5.00' : (selectedTransferMethod === 'fast' ? '~$20.00' : '~$15.00')
      });
    }
  };

  return {
    executeBulkTransfer,
    estimateFees,
    isExecuting
  };
};
