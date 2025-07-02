import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function BalanceDisplay() {
  const { wallet, recipients } = useAppStore();

  const totalNeeded = recipients.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);
  const currentBalance = parseFloat(wallet.balance || '0');
  const hasSufficientBalance = currentBalance >= totalNeeded;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Your Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold mb-2 text-white">
            {currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-slate-300 mb-4">USDC Available</div>
          
          {recipients.length > 0 && (
            <div className="mb-4 text-sm text-slate-400">
              <div>Total needed: {totalNeeded.toFixed(2)} USDC</div>
              <div>Remaining: {(currentBalance - totalNeeded).toFixed(2)} USDC</div>
            </div>
          )}
          
          <div className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 ${
            hasSufficientBalance
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {hasSufficientBalance ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Sufficient Balance</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Insufficient Balance</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
