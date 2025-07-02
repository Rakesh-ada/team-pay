import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import { SUPPORTED_CHAINS } from '@/lib/constants';

export default function PaymentSummary() {
  const { recipients } = useAppStore();

  const totalAmount = recipients.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);
  
  const chainBreakdown = recipients.reduce((acc, recipient) => {
    const existing = acc.find(item => item.chainId === recipient.chainId);
    if (existing) {
      existing.amount += parseFloat(recipient.amount || '0');
    } else {
      acc.push({
        chainId: recipient.chainId,
        chainName: recipient.chainName,
        amount: parseFloat(recipient.amount || '0')
      });
    }
    return acc;
  }, [] as Array<{ chainId: number; chainName: string; amount: number }>);

  const getChainColor = (chainName: string) => {
    const colors = {
      'Ethereum': 'bg-red-500',
      'Polygon': 'bg-purple-500',
      'Arbitrum': 'bg-blue-500',
      'Base': 'bg-blue-600',
      'OP Mainnet': 'bg-red-600',
      'Avalanche': 'bg-red-500'
    };
    return colors[chainName as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Total Recipients</span>
            <span className="font-semibold text-white">{recipients.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Total Amount</span>
            <span className="font-semibold text-lg text-white">{totalAmount.toFixed(2)} USDC</span>
          </div>
          
          {chainBreakdown.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              <h3 className="font-medium mb-2 text-white">Breakdown by Chain</h3>
              <div className="space-y-2">
                {chainBreakdown.map((item) => (
                  <div key={item.chainId} className="flex justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getChainColor(item.chainName)}`}></div>
                      <span className="text-slate-300">{item.chainName}</span>
                    </div>
                    <span className="text-white">{item.amount.toFixed(2)} USDC</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
