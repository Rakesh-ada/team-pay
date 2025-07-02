import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAppStore } from '@/store/useAppStore';
import { SUPPORTED_CHAINS, TESTNET_CHAINS } from '@/lib/constants';
import { Plus, Upload, Trash2, Loader2, Clock, CheckCircle, AlertCircle, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RecipientManager() {
  const { recipients, addRecipient, removeRecipient, updateRecipient, isTestnet, wallet, autoRefresh } = useAppStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRecipient, setNewRecipient] = useState({
    address: '',
    chainId: 1,
    amount: ''
  });
  const [statusUpdateTimestamps, setStatusUpdateTimestamps] = useState<{[key: string]: Date}>({});

  const availableChains = isTestnet ? TESTNET_CHAINS : SUPPORTED_CHAINS;
  
  // Include current chain for same-chain transfers, plus other chains for cross-chain
  const filteredChains = availableChains.filter(chain => {
    if (!wallet.isConnected || !wallet.chainId) return true;
    
    const currentChain = availableChains.find(c => c.id === wallet.chainId);
    if (!currentChain) return true;
    
    // Allow current chain for same-chain transfers, and different CCTP domains for cross-chain
    return chain.id === wallet.chainId || chain.cctpDomain !== currentChain.cctpDomain;
  });

  // Update timestamps when statuses change
  useEffect(() => {
    recipients.forEach(recipient => {
      if (!statusUpdateTimestamps[recipient.id]) {
        setStatusUpdateTimestamps(prev => ({
          ...prev,
          [recipient.id]: new Date()
        }));
      } else if (recipient.status !== 'ready') {
        setStatusUpdateTimestamps(prev => ({
          ...prev,
          [recipient.id]: new Date()
        }));
      }
    });
  }, [recipients]);

  const handleAddRecipient = () => {
    const chain = availableChains.find(c => c.id === newRecipient.chainId)!;
    const isSameChain = wallet.isConnected && wallet.chainId === newRecipient.chainId;
    
    addRecipient({
      address: newRecipient.address,
      chainId: newRecipient.chainId,
      chainName: chain.name,
      amount: newRecipient.amount,
      status: 'ready',
      isSameChain: isSameChain
    });
    // Reset with the first available chain from filtered chains
    const defaultChainId = filteredChains.length > 0 ? filteredChains[0].id : 1;
    setNewRecipient({ address: '', chainId: defaultChainId, amount: '' });
    setShowAddDialog(false);
  };

  // Update default chain when dialog opens
  const handleOpenDialog = () => {
    const defaultChainId = filteredChains.length > 0 ? filteredChains[0].id : 1;
    setNewRecipient({ ...newRecipient, chainId: defaultChainId });
    setShowAddDialog(true);
  };

  const getStatusBadge = (status: string, recipientId: string) => {
    const timestamp = statusUpdateTimestamps[recipientId];
    const timeAgo = timestamp ? Math.floor((Date.now() - timestamp.getTime()) / 1000) : 0;
    
    const statusConfig = {
      ready: { 
        color: 'bg-slate-600 text-slate-300', 
        text: 'Ready', 
        icon: <CheckCircle className="w-3 h-3" /> 
      },
      pending: { 
        color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', 
        text: 'Pending', 
        icon: <Clock className="w-3 h-3 animate-pulse" /> 
      },
      transferring: { 
        color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', 
        text: 'Transferring', 
        icon: <Loader2 className="w-3 h-3 animate-spin" /> 
      },
      burning: { 
        color: 'bg-orange-500/20 text-orange-400 border border-orange-500/30', 
        text: 'Burning', 
        icon: <Activity className="w-3 h-3 animate-bounce" /> 
      },
      attesting: { 
        color: 'bg-purple-500/20 text-purple-400 border border-purple-500/30', 
        text: 'Attesting', 
        icon: <Clock className="w-3 h-3 animate-pulse" /> 
      },
      minting: { 
        color: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30', 
        text: 'Minting', 
        icon: <Zap className="w-3 h-3 animate-pulse" /> 
      },
      completed: { 
        color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', 
        text: 'Completed', 
        icon: <CheckCircle className="w-3 h-3" /> 
      },
      failed: { 
        color: 'bg-red-500/20 text-red-400 border border-red-500/30', 
        text: 'Failed', 
        icon: <AlertCircle className="w-3 h-3" /> 
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ready;
    
    return (
      <div className="flex flex-col items-start space-y-1">
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium space-x-1',
          config.color
        )}>
          {config.icon}
          <span>{config.text}</span>
        </span>
        {status !== 'ready' && timeAgo > 0 && (
          <span className="text-xs text-slate-500">
            {timeAgo < 60 ? `${timeAgo}s ago` : `${Math.floor(timeAgo / 60)}m ago`}
          </span>
        )}
      </div>
    );
  };

  const getChainColor = (chainName: string) => {
    const colors = {
      'Ethereum': 'bg-red-500',
      'Sepolia': 'bg-red-500',
      'Polygon': 'bg-purple-500',
      'Polygon Amoy': 'bg-purple-500',
      'Arbitrum': 'bg-blue-500',
      'Arbitrum Sepolia': 'bg-blue-500',
      'Base': 'bg-blue-600',
      'Base Sepolia': 'bg-blue-600',
      'OP Mainnet': 'bg-red-600',
      'OP Sepolia': 'bg-red-600',
      'Avalanche': 'bg-red-400',
      'Avalanche Fuji': 'bg-red-400',
      'Linea': 'bg-green-500',
      'Linea Sepolia': 'bg-green-500',
      'Sonic Testnet': 'bg-cyan-500',
      'Unichain Sepolia': 'bg-pink-500',
      'World Chain Sepolia': 'bg-indigo-500'
    };
    return colors[chainName as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-lg font-semibold text-white">Recipients</h2>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleOpenDialog}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Recipient
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Recipient</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {wallet.isConnected && filteredChains.length < availableChains.length && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-sm text-amber-400">
                        <strong>Note:</strong> Only showing chains with different CCTP domains than your current connected chain. 
                        CCTP doesn't support transfers within the same domain.
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-slate-300">Address</label>
                    <Input
                      value={newRecipient.address}
                      onChange={(e) => setNewRecipient({ ...newRecipient, address: e.target.value })}
                      placeholder="0x..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Chain</label>
                    <Select
                      value={newRecipient.chainId.toString()}
                      onValueChange={(value) => setNewRecipient({ ...newRecipient, chainId: parseInt(value) })}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {filteredChains.map((chain) => (
                          <SelectItem key={chain.id} value={chain.id.toString()}>
                            {chain.name}
                          </SelectItem>
                        ))}
                        {filteredChains.length === 0 && (
                          <div className="p-3 text-sm text-slate-400 text-center">
                            No destination chains available. Please connect to a different source chain.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Amount (USDC)</label>
                    <Input
                      value={newRecipient.amount}
                      onChange={(e) => setNewRecipient({ ...newRecipient, amount: e.target.value })}
                      placeholder="100.00"
                      type="number"
                      step="0.01"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button onClick={handleAddRecipient} className="w-full bg-blue-500 hover:bg-blue-600">
                    Add Recipient
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {recipients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Recipient Address</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Destination Chain</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Amount (USDC)</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((recipient) => (
                  <tr key={recipient.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex-shrink-0"></div>
                        <div>
                          <div className="font-mono text-sm text-white">
                            {recipient.address.slice(0, 20)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className={cn("w-4 h-4 rounded-full", getChainColor(recipient.chainName))}></div>
                        <div className="flex flex-col">
                          <span className="text-sm text-white">{recipient.chainName}</span>
                          {recipient.isSameChain ? (
                            <span className="text-xs text-cyan-400">Same-Chain</span>
                          ) : (
                            <span className="text-xs text-purple-400">Cross-Chain</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-white">{recipient.amount}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(recipient.status, recipient.id)}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecipient(recipient.id)}
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400">
            <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Add recipients manually or import from CSV</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
