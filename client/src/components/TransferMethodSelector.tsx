import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import { TRANSFER_METHODS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function TransferMethodSelector() {
  const { selectedTransferMethod, setTransferMethod } = useAppStore();

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Transfer Method</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRANSFER_METHODS.map((method) => (
            <div
              key={method.type}
              className={cn(
                "border-2 rounded-lg p-4 cursor-pointer transition-colors",
                selectedTransferMethod === method.type
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-600 bg-slate-800/30 hover:border-slate-500"
              )}
              onClick={() => setTransferMethod(method.type)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3
                  className={cn(
                    "font-medium",
                    selectedTransferMethod === method.type
                      ? "text-blue-400"
                      : "text-slate-300"
                  )}
                >
                  {method.name}
                </h3>
                <span
                  className={cn(
                    "px-2 py-1 rounded text-xs",
                    selectedTransferMethod === method.type
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-slate-700 text-slate-300"
                  )}
                >
                  {method.estimatedTime}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-2">{method.description}</p>
              <div className="text-xs text-slate-500">Fee: {method.fee}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
