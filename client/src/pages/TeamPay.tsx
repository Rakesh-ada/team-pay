import { useEffect, useCallback, useRef } from 'react';
import WalletConnect from '@/components/WalletConnect';
import TransferMethodSelector from '@/components/TransferMethodSelector';
import RecipientManager from '@/components/RecipientManager';
import TransactionStatus from '@/components/TransactionStatus';
import PaymentSummary from '@/components/PaymentSummary';
import FeeEstimation from '@/components/FeeEstimation';
import BalanceDisplay from '@/components/BalanceDisplay';
import SettingsPanel from '@/components/SettingsPanel';
import LiveFeed from '@/components/LiveFeed';
import SystemStatus from '@/components/SystemStatus';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { useCCTP } from '@/hooks/useCCTP';
import { NotebookPen, AlertTriangle, Users, Zap } from 'lucide-react';

export default function TeamPay() {
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
    }, 1000);
  }, [recipients, wallet.isConnected, wallet.chainId, selectedTransferMethod, estimateFees]);

  useEffect(() => {
    debouncedEstimateFees();
    
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
    <div className="min-h-screen bg-gray-900 relative">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Team Pay</h1>
                <p className="text-gray-400 text-xs">Bulk USDC transfers</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Network Mismatch Warning */}
      {hasNetworkMismatch && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
              <div>
                <p className="text-yellow-300 font-medium">Network Configuration Mismatch</p>
                <p className="text-yellow-200/80 text-sm mt-1">
                  Your wallet is connected to {isMainnet ? 'Mainnet' : 'Testnet'} but the app is configured for {isTestnet ? 'Testnet' : 'Mainnet'}. 
                  Please switch the network mode in settings or connect to the appropriate network.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transfer Method Selector */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <TransferMethodSelector />
            </div>

            {/* Recipient Manager */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <RecipientManager />
            </div>

            {/* System Status */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <SystemStatus />
            </div>

            {/* Transaction Status */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <TransactionStatus />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <PaymentSummary />
            </div>

            {/* Fee Estimation */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <FeeEstimation />
            </div>

            {/* Balance Display */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <BalanceDisplay />
            </div>
            
            {/* Execute Button */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={executeBulkTransfer}
                disabled={!canExecute || isExecuting}
              >
                {isExecuting ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Execute Team Payment
                  </>
                )}
              </Button>
              {recipients.length > 0 && (
                <p className="text-center text-gray-400 text-sm mt-3">
                  {recipients.length} recipients • {recipients.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0).toFixed(2)} USDC
                </p>
              )}
            </div>

            {/* Settings Panel */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <SettingsPanel />
            </div>

            {/* Live Feed */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <LiveFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}