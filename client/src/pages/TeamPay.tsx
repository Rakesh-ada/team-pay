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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden glass-scrollbar">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass border-b border-white/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Team Pay
                </h1>
                <p className="text-slate-300/80 text-sm">Cross-chain bulk USDC transfers powered by Circle CCTP</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Network Mismatch Warning */}
      {hasNetworkMismatch && (
        <div className="relative z-10 mx-6 mt-6">
          <div className="glass-light border border-amber-400/30 rounded-2xl p-4 animate-pulse">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
              <div>
                <p className="text-amber-300 font-medium">Network Configuration Mismatch</p>
                <p className="text-amber-200/80 text-sm mt-1">
                  Your wallet is connected to {isMainnet ? 'Mainnet' : 'Testnet'} but the app is configured for {isTestnet ? 'Testnet' : 'Mainnet'}. 
                  Please switch the network mode in settings or connect to the appropriate network.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 container mx-auto px-6 py-8 glass-scrollbar">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Transfer Method Selector */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <TransferMethodSelector />
            </div>

            {/* Recipient Manager */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <RecipientManager />
            </div>

            {/* Transaction Status */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <TransactionStatus />
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Payment Summary */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <PaymentSummary />
            </div>

            {/* Fee Estimation */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <FeeEstimation />
            </div>

            {/* Balance Display */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <BalanceDisplay />
            </div>
            
            {/* Execute Button */}
            <div className="glass-card rounded-2xl p-6">
              <Button
                className="w-full glass-button rounded-xl py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
                <p className="text-center text-slate-400 text-sm mt-2">
                  {recipients.length} recipients • {recipients.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0).toFixed(2)} USDC
                </p>
              )}
            </div>

            {/* Settings Panel */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <SettingsPanel />
            </div>

            {/* System Status */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <SystemStatus />
            </div>

            {/* Live Feed */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <LiveFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}