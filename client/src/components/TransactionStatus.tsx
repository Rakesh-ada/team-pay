import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import { Loader2, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function TransactionStatus() {
  const { recipients } = useAppStore();

  const activeTransactions = recipients.filter(r => 
    ['burning', 'attesting', 'minting'].includes(r.status)
  );

  const completedTransactions = recipients.filter(r => 
    r.status === 'completed'
  );

  const failedTransactions = recipients.filter(r => 
    r.status === 'failed'
  );

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
        <CardTitle className="text-lg font-semibold text-white">Transaction Status</CardTitle>
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
