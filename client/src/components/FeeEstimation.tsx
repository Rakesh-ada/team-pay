import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';

export default function FeeEstimation() {
  const { feeEstimation } = useAppStore();

  if (!feeEstimation) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Fee Estimation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-400">
            <p className="text-sm">Add recipients to see fee estimation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Fee Estimation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Network Fees</span>
            <span className="font-medium text-white">
              {feeEstimation.networkFees} <span className="text-sm text-slate-400">Gwei</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">CCTP Transfer Fees</span>
            <span className="font-medium text-white">
              {feeEstimation.cctpFees} <span className="text-sm text-slate-400">Gwei</span>
            </span>
          </div>
          <div className="border-t border-slate-700 pt-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-white">Total Estimated</span>
              <span className="font-semibold text-lg text-white">
                {feeEstimation.total} <span className="text-sm font-normal text-slate-400">Gwei</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
