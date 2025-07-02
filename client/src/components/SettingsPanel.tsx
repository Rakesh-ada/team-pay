import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/useAppStore';

export default function SettingsPanel() {
  const { isTestnet, setTestnet, autoRefresh, setAutoRefresh } = useAppStore();

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Testnet Mode</span>
            <Switch
              checked={isTestnet}
              onCheckedChange={setTestnet}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Auto-refresh Status</span>
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
