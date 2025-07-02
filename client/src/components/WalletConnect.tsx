import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { useAppStore } from '@/store/useAppStore';
import { SUPPORTED_CHAINS, TESTNET_CHAINS } from '@/lib/constants';
import { Wallet, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WalletConnect() {
  const { isConnected, address, chainId, connectWallet, disconnectWallet } = useWallet();
  const { isTestnet, autoRefresh } = useAppStore();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  // Update connection status based on wallet state
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected]);

  const handleConnect = async () => {
    setConnectionStatus('connecting');
    try {
      await connectWallet();
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setConnectionStatus('disconnected');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setConnectionStatus('disconnected');
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  // Get current network info
  const supportedChains = isTestnet ? TESTNET_CHAINS : SUPPORTED_CHAINS;
  const currentChain = chainId ? supportedChains.find(chain => chain.id === chainId) : null;
  const networkName = currentChain?.name || (isConnected ? 'Unknown Network' : 'Not Connected');
  const isValidChain = currentChain !== null;

  return (
    <div className="flex items-center space-x-4">
      {/* Network Indicator */}
      <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg px-3 py-2">
        <div className={`w-2 h-2 rounded-full ${isValidChain ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
        <span className="text-sm text-slate-300">{networkName}</span>
        
      </div>

      

      {/* Wallet Connection */}
      {isConnected ? (
        <Button
          variant="outline"
          onClick={handleDisconnect}
          className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {shortAddress}
        </Button>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={connectionStatus === 'connecting'}
          className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  );
}
