// src/app/admin/wallets/AdminWalletsClient.tsx
'use client';
import React, { useState } from 'react';
import { Pencil, Save, X, Copy, Shield, AlertTriangle } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Wallet {
  id: string; coin: string; address: string; network: string; isActive: boolean; updatedAt: string;
}

const COIN_CONFIG = [
  { coin: 'BTC', name: 'Bitcoin', symbol: 'BTC', network: 'Bitcoin Network', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', icon: '₿' },
  { coin: 'ETH', name: 'Ethereum', symbol: 'ETH', network: 'Ethereum Network (ERC20)', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: 'Ξ' },
  { coin: 'USDT_TRC20', name: 'USDT TRC20', symbol: 'USDT', network: 'TRON Network (TRC20)', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: '₮' },
  { coin: 'USDT_ERC20', name: 'USDT ERC20', symbol: 'USDT', network: 'Ethereum Network (ERC20)', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: '₮' },
  { coin: 'BNB', name: 'BNB', symbol: 'BNB', network: 'BNB Smart Chain', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: 'B' },
];

export default function AdminWalletsClient({ wallets }: { wallets: Wallet[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Record<string, { address: string; network: string }>>(
    Object.fromEntries(
      COIN_CONFIG.map(c => {
        const w = wallets.find(w => w.coin === c.coin);
        return [c.coin, { address: w?.address || '', network: w?.network || c.network }];
      })
    )
  );
  const [loading, setLoading] = useState<string | null>(null);

  const handleSave = async (coin: string) => {
    const { address, network } = addresses[coin];
    if (!address || address.length < 10) { toast.error('Enter a valid wallet address'); return; }

    setLoading(coin);
    try {
      const res = await fetch('/api/admin/wallets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin, address, network }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Save failed'); return; }
      toast.success(`${coin} wallet address updated`);
      setEditing(null);
      router.refresh();
    } catch {
      toast.error('Save failed');
    } finally {
      setLoading(null);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Wallet Address Management</h1>
        <p className="text-gray-400 text-sm">Manage deposit wallet addresses for each cryptocurrency. Changes take effect immediately.</p>
      </div>

      <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-amber-300 text-sm">
          <p className="font-semibold mb-1">Critical: Verify all addresses carefully</p>
          <p className="text-amber-300/80">Double-check every address before saving. Users will send funds to these addresses. Incorrect addresses can result in permanent loss of funds.</p>
        </div>
      </div>

      <div className="space-y-4">
        {COIN_CONFIG.map(config => {
          const wallet = wallets.find(w => w.coin === config.coin);
          const isEditing = editing === config.coin;
          const isSaving = loading === config.coin;
          const currentAddress = addresses[config.coin].address;

          return (
            <Card key={config.coin} className="p-6">
              <div className="flex items-start gap-4">
                {/* Coin Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border text-lg font-bold ${config.color}`}>
                  {config.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{config.name}</h3>
                      <p className="text-xs text-gray-500">{config.network}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {wallet?.isActive && !isEditing && (
                        <span className="text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full">Active</span>
                      )}
                      {!isEditing ? (
                        <Button onClick={() => setEditing(config.coin)} variant="secondary" size="sm">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button onClick={() => setEditing(null)} variant="ghost" size="sm"><X className="w-4 h-4" /></Button>
                          <Button onClick={() => handleSave(config.coin)} loading={isSaving} size="sm">
                            <Save className="w-3.5 h-3.5" /> Save
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Wallet Address</label>
                        <input
                          type="text"
                          value={addresses[config.coin].address}
                          onChange={e => setAddresses(p => ({ ...p, [config.coin]: { ...p[config.coin], address: e.target.value } }))}
                          placeholder={`Enter ${config.name} wallet address`}
                          className="w-full bg-obsidian-950/80 border border-gold-500/30 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Network Label</label>
                        <input
                          type="text"
                          value={addresses[config.coin].network}
                          onChange={e => setAddresses(p => ({ ...p, [config.coin]: { ...p[config.coin], network: e.target.value } }))}
                          placeholder="Network name shown to users"
                          className="w-full bg-obsidian-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold-500/50 transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      {currentAddress ? (
                        <div className="flex items-center gap-2 bg-obsidian-950/60 border border-white/8 rounded-xl px-4 py-2.5">
                          <p className="font-mono text-sm text-gray-300 truncate flex-1">{currentAddress}</p>
                          <button
                            onClick={() => copyAddress(currentAddress)}
                            className="text-gray-500 hover:text-gold-400 transition-colors flex-shrink-0"
                            title="Copy address"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-2.5">
                          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <p className="text-sm text-red-400">No address configured — deposits for this coin are unavailable</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 bg-blue-400/5 border-blue-400/20">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300/80">
            <p className="font-semibold text-blue-300 mb-1">Security Note</p>
            <p>All wallet address changes are logged in the audit trail. Only admin accounts can modify these addresses. Users are shown the exact address stored here when making a deposit.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
