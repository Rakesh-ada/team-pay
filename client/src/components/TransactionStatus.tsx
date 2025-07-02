import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { Loader2, Clock, CheckCircle, AlertCircle, RefreshCw, Activity } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

export default function TransactionStatus() {
  const { recipients, autoRefresh, updateRecipient } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const activeTransactions = recipients.filter(r => 
    ['burning', 'attesting', 'minting'].includes(r.status)
  );

  const completedTransactions = recipients.filter(r => 
    r.status === 'completed'
  );

  const failedTransactions = recipients.filter(r => 
    r.status === 'failed'
  );

  // Mock status update function (in real app, this would call CCTP API)
  const updateTransactionStatuses = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update last refresh time
      setLastUpdate(new Date());
      
      // In a real application, you would:
      // 1. Check Circle API for attestation status
      // 2. Update recipient statuses based on blockchain confirmations
      // 3. Handle any errors or retries
      
    } catch (error) {
      console.error('Failed to update transaction statuses:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && activeTransactions.length > 0) {
      const interval = setInterval(updateTransactionStatuses, 15000); // Check every 15 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, activeTransactions.length, updateTransactionStatuses]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'burning':
        return <Loader2 className="w-5 h-5 animate-spin text-amber-400" />;
      case 'attesting':
        return <Clock className="w-5 h-5 animate-pulse text-blue-400" />;
      case 'minting':
        return <Loader2 className="w-5 h-5 animate-spin text-purple-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'burning':
        return 'Burning USDC on source chain';
      case 'attesting':
        return 'Awaiting Circle attestation';
      case 'minting':
        return 'Minting USDC on destination chain';
      case 'completed':
        return 'Transfer completed successfully';
      case 'failed':
        return 'Transfer failed';
      default:
        return 'Unknown status';
    }
  };

  const allTransactions = [...activeTransactions, ...completedTransactions, ...failedTransactions];

  if (allTransactions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">Transaction Status</CardTitle>
          <div className="flex items-center space-x-2">
            {autoRefresh && activeTransactions.length > 0 && (
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-400">Auto-updating</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={updateTransactionStatuses}
              disabled={isRefreshing}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        {allTransactions.length > 0 && (
          <div className="text-xs text-slate-400 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allTransactions.map((recipient) => (
            <div
              key={recipient.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                recipient.status === 'completed'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : recipient.status === 'failed'
                  ? 'bg-red-500/10 border-red-500/30'
                  : recipient.status === 'attesting'
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(recipient.status)}
                <div>
                  <div className={`font-medium ${
                    recipient.status === 'completed'
                      ? 'text-emerald-400'
                      : recipient.status === 'failed'
                      ? 'text-red-400'
                      : recipient.status === 'attesting'
                      ? 'text-blue-400'
                      : 'text-amber-400'
                  }`}>
                    {getStatusMessage(recipient.status)}
                  </div>
                  <div className="text-sm text-slate-400">
                    {recipient.status === 'failed' && recipient.error
                      ? recipient.error
                      : `To ${recipient.address.slice(0, 10)}...`
                    }
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">{recipient.amount} USDC</div>
                <div className="text-xs text-slate-400">→ {recipient.chainName}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
