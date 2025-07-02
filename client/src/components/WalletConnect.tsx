import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { Wallet } from 'lucide-react';

export default function WalletConnect() {
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <div className="flex items-center space-x-4">
      {/* Network Indicator */}
      <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg px-3 py-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
        <span className="text-sm text-slate-300">Ethereum</span>
      </div>

      {/* Wallet Connection */}
      {isConnected ? (
        <Button
          variant="outline"
          onClick={disconnectWallet}
          className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {shortAddress}
        </Button>
      ) : (
        <Button
          onClick={handleConnect}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      )}
    </div>
  );
}
