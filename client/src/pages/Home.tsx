import { useEffect } from 'react';
import WalletConnect from '@/components/WalletConnect';
import TransferMethodSelector from '@/components/TransferMethodSelector';
import RecipientManager from '@/components/RecipientManager';
import TransactionStatus from '@/components/TransactionStatus';
import PaymentSummary from '@/components/PaymentSummary';
import FeeEstimation from '@/components/FeeEstimation';
import BalanceDisplay from '@/components/BalanceDisplay';
import SettingsPanel from '@/components/SettingsPanel';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { useCCTP } from '@/hooks/useCCTP';
import { NotebookPen } from 'lucide-react';

export default function Home() {
  const { recipients, wallet } = useAppStore();
  const { executeBulkTransfer, isExecuting, estimateFees } = useCCTP();

  useEffect(() => {
    if (recipients.length > 0 && wallet.isConnected) {
      estimateFees();
    }
  }, [recipients, wallet.isConnected, estimateFees]);

  const canExecute = wallet.isConnected && recipients.length > 0 && recipients.some(r => r.status === 'ready');

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
