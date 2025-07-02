import { useEffect, useCallback, useRef } from 'react';
import WalletConnect from '@/components/WalletConnect';
import TransferMethodSelector from '@/components/TransferMethodSelector';
import RecipientManager from '@/components/RecipientManager';
import TransactionStatus from '@/components/TransactionStatus';
import PaymentSummary from '@/components/PaymentSummary';
import FeeEstimation from '@/components/FeeEstimation';
import BalanceDisplay from '@/components/BalanceDisplay';
import SettingsPanel from '@/components/SettingsPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import { useCCTP } from '@/hooks/useCCTP';
import { NotebookPen, AlertTriangle } from 'lucide-react';

export default function Home() {
  const { recipients, wallet, isTestnet, selectedTransferMethod } = useAppStore();
  const { executeBulkTransfer, isExecuting, estimateFees } = useCCTP();
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Debounced fee estimation to avoid rapid calls during network changes
  const debouncedEstimateFees = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      if (recipients.length > 0 && wallet.isConnected && wallet.chainId) {
        estimateFees();
      }
    }, 1000); // Wait 1 second after last change before estimating fees
  }, [recipients, wallet.isConnected, wallet.chainId, selectedTransferMethod, estimateFees]);

  useEffect(() => {
    debouncedEstimateFees();
    
    // Cleanup timeout on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [debouncedEstimateFees]);

  const canExecute = wallet.isConnected && recipients.length > 0 && recipients.some(r => r.status === 'ready');

  // Check for network compatibility issues
  const isMainnet = wallet.chainId === 1 || wallet.chainId === 137 || wallet.chainId === 42161 || wallet.chainId === 8453 || wallet.chainId === 10 || wallet.chainId === 43114;
  const isTestnetChain = wallet.chainId === 11155111 || wallet.chainId === 421614 || wallet.chainId === 84532 || wallet.chainId === 43113 || wallet.chainId === 11155420 || wallet.chainId === 80002 || wallet.chainId === 59901 || wallet.chainId === 713715 || wallet.chainId === 1301 || wallet.chainId === 4801;
  const hasNetworkMismatch = wallet.isConnected && ((isMainnet && isTestnet) || (isTestnetChain && !isTestnet));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <NotebookPen className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold">CCTP Bulk Transfer</h1>
              </div>
              <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs font-medium">
                V2
              </span>
            </div>
            
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Network Mismatch Warning */}
      {hasNetworkMismatch && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mx-4 sm:mx-6 lg:mx-8 mt-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-medium">Network Mismatch Detected</h3>
              <p className="text-red-300 text-sm mt-1">
                {isMainnet && isTestnet ? (
                  <>You're connected to <strong>mainnet</strong> but the app is in <strong>testnet mode</strong>. Switch to testnet mode in settings or connect to a testnet network like Sepolia.</>
                ) : (
                  <>You're connected to <strong>testnet</strong> but the app is in <strong>mainnet mode</strong>. Switch to mainnet mode in settings or connect to a mainnet network like Ethereum.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            <TransferMethodSelector />
            <RecipientManager />
            <TransactionStatus />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PaymentSummary />
            <FeeEstimation />
            <BalanceDisplay />
            
            {/* Execute Button */}
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={executeBulkTransfer}
              disabled={!canExecute || isExecuting}
            >
              <NotebookPen className="w-5 h-5 mr-2" />
              {isExecuting ? 'Executing...' : 'Execute Bulk Transfer'}
            </Button>

            <SettingsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
