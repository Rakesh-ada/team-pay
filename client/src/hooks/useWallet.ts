import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { walletService } from '@/lib/wallet';

export const useWallet = () => {
  const { wallet, setWallet } = useAppStore();

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
    switchNetwork
  };
};
