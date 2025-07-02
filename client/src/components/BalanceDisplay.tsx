import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function BalanceDisplay() {
  const { wallet, recipients, isTestnet } = useAppStore();

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
          
          {/* Testnet USDC Faucet Helper */}
          {isTestnet && currentBalance === 0 && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300 mb-2">
                Need testnet USDC? Get some from the Circle faucet:
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                onClick={() => window.open('https://faucet.circle.com/', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Get Testnet USDC
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
