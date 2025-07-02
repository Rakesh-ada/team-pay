import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import { useWallet } from '@/hooks/useWallet';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wifi, DollarSign, Users, Activity, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ActivityItem {
  id: string;
  type: 'wallet' | 'balance' | 'transaction' | 'network' | 'recipient';
  message: string;
  timestamp: Date;
  status: 'info' | 'success' | 'warning' | 'error';
}

export default function LiveFeed() {
  const { wallet, recipients, autoRefresh, isTestnet } = useAppStore();
  const { isConnected } = useWallet();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Add activity to feed
  const addActivity = (type: ActivityItem['type'], message: string, status: ActivityItem['status'] = 'info') => {
    const newActivity: ActivityItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date(),
      status
    };
    
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only last 10 items
  };

  // Monitor wallet connection changes
  useEffect(() => {
    if (isConnected && wallet.address) {
      addActivity('wallet', `Wallet connected: ${wallet.address.slice(0, 10)}...`, 'success');
    } else if (!isConnected && activities.length > 0) {
      addActivity('wallet', 'Wallet disconnected', 'warning');
    }
  }, [isConnected, wallet.address]);

  // Monitor balance changes
  useEffect(() => {
    if (wallet.balance && parseFloat(wallet.balance) > 0) {
      addActivity('balance', `Balance updated: ${parseFloat(wallet.balance).toFixed(2)} USDC`, 'success');
    }
  }, [wallet.balance]);

  // Monitor network changes
  useEffect(() => {
    if (wallet.chainId && isConnected) {
      addActivity('network', `Network switched to chain ID: ${wallet.chainId}`, 'info');
    }
  }, [wallet.chainId, isConnected]);

  // Monitor recipient changes
  useEffect(() => {
    if (recipients.length > 0) {
      const activeRecipients = recipients.filter(r => r.status !== 'ready');
      if (activeRecipients.length > 0) {
        addActivity('transaction', `${activeRecipients.length} active transfers`, 'info');
      }
    }
  }, [recipients]);

  // Auto-refresh status updates
  useEffect(() => {
    if (autoRefresh) {
      addActivity('network', 'Auto-refresh enabled', 'success');
      const interval = setInterval(() => {
        addActivity('network', 'System status refreshed', 'info');
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getActivityIcon = (type: ActivityItem['type'], status: ActivityItem['status']) => {
    switch (type) {
      case 'wallet':
        return status === 'success' ? <Wifi className="w-4 h-4 text-emerald-400" /> : <Wifi className="w-4 h-4 text-red-400" />;
      case 'balance':
        return <DollarSign className="w-4 h-4 text-blue-400" />;
      case 'transaction':
        return <Activity className="w-4 h-4 text-purple-400" />;
      case 'network':
        return <Loader2 className="w-4 h-4 text-yellow-400" />;
      case 'recipient':
        return <Users className="w-4 h-4 text-cyan-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'warning': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'error': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  if (activities.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Live Activity Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activity yet. Connect your wallet to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Live Activity Feed</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {autoRefresh && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
                Live
              </Badge>
            )}
            <Badge variant="outline" className={isTestnet ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}>
              {isTestnet ? 'Testnet' : 'Mainnet'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${getStatusColor(activity.status)}`}
            >
              {getActivityIcon(activity.type, activity.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {activity.message}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-500">
                    {activity.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}