import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { walletService } from '@/lib/wallet';

export const useWallet = () => {
  const { wallet, setWallet, autoRefresh } = useAppStore();
  const intervalRef = useRef<NodeJS.Timeout>();

  const connectWallet = async () => {
    try {
      const walletData = await walletService.connectWallet();
      setWallet({
        isConnected: true,
        ...walletData
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      balance: '0'
    });
  };

  const switchNetwork = async (chainId: number) => {
    try {
      await walletService.switchNetwork(chainId);
      // Update wallet state after successful switch
      const updatedWallet = await walletService.connectWallet();
      setWallet(updatedWallet);
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  };

  // Auto-update wallet balance and connection status
  const updateWalletData = useCallback(async () => {
    if (!wallet.isConnected || !wallet.address) return;
    
    try {
      const provider = walletService.getProvider();
      if (!provider) return;

      // Check if wallet is still connected
      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        disconnectWallet();
        return;
      }

      // Update balance
      const balance = await walletService.getUSDCBalance(wallet.address);
      const network = await provider.getNetwork();
      
      setWallet({
        balance,
        chainId: Number(network.chainId)
      });
    } catch (error) {
      console.error('Failed to update wallet data:', error);
    }
  }, [wallet.isConnected, wallet.address, setWallet]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && wallet.isConnected) {
      // Update immediately
      updateWalletData();
      
      // Set up interval for periodic updates
      intervalRef.current = setInterval(updateWalletData, 10000); // Update every 10 seconds
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Clear interval if auto-refresh is disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [autoRefresh, wallet.isConnected, updateWalletData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWallet({ address: accounts[0] });
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWallet({ chainId: parseInt(chainId, 16) });
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [setWallet]);

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    updateWalletData
  };
};
