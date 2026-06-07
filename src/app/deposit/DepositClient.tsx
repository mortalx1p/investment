// src/app/deposit/DepositClient.tsx
'use client';
import React, { useState } from 'react';
import { Copy, Check, ArrowDownToLine, AlertCircle } from 'lucide-react';
import { Button, Card, Badge, RiskWarning } from '@/components/ui';
import { formatCurrency, formatDateTime, getCoinName } from '@/lib/utils';
import toast from 'react-hot-toast';

const COINS = [
  { key: 'BTC', name: 'Bitcoin', symbol: 'BTC', color: 'text-orange-400 bg-orange-400/10' },
  { key: 'ETH', name: 'Ethereum', symbol: 'ETH', color: 'text-blue-400 bg-blue-400/10' },
  { key: 'USDT_TRC20', name: 'USDT TRC20', symbol: 'USDT', color: 'text-emerald-400 bg-emerald-400/10' },
  { key: 'USDT_ERC20', name: 'USDT ERC20', symbol: 'USDT', color: 'text-emerald-400 bg-emerald-400/10' },
  { key: 'BNB', name: 'BNB', symbol: 'BNB', color: 'text-yellow-400 bg-yellow-400/10' },
];

interface Props {
  deposits: Array<{ id: string; coin: string; amount: number; txHash: string; status: string; createdAt: string; adminNote?: string }>;
  wallets: Array<{ coin: string; address: string; network: string }>;
}

export default function DepositClient({ deposits, wallets }: Props) {
  const [selectedCoin, setSelectedCoin] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const wallet = wallets.find(w => w.coin === selectedCoin);

  const copyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      toast.success('Address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin || !amount || !txHash) {
      toast.error('Please fill all fields');
      return;
    }
    if (parseFloat(amount) < 1) { toast.error('Minimum deposit is $1'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin: selectedCoin, amount: parseFloat(amount), txHash }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Submission failed'); return; }
      toast.success('Deposit submitted! Awaiting admin approval.');
      setAmount(''); setTxHash(''); setSelectedCoin('');
      window.location.reload();
    } catch {
      toast.error('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Deposit Funds</h1>
        <p className="text-gray-400 text-sm">Send crypto to our wallet and submit your transaction hash for approval.</p>
      </div>

      <RiskWarning />

      {/* Deposit Form */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-gold-400" /> Select Cryptocurrency
          </h3>
          <div className="grid grid-cols-1 gap-2 mb-6">
            {COINS.map(coin => {
              const hasWallet = wallets.some(w => w.coin === coin.key);
              return (
                <button
                  key={coin.key}
                  onClick={() => hasWallet && setSelectedCoin(coin.key)}
                  disabled={!hasWallet}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                    selectedCoin === coin.key
                      ? 'border-gold-500/50 bg-gold-500/10'
                      : hasWallet
                        ? 'border-white/10 hover:border-white/20 hover:bg-white/3'
                        : 'border-white/5 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${coin.color}`}>
                    {coin.symbol.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{coin.name}</p>
                    {!hasWallet && <p className="text-xs text-gray-500">Temporarily unavailable</p>}
                  </div>
                  {selectedCoin === coin.key && (
                    <Check className="ml-auto w-4 h-4 text-gold-400" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          {wallet && (
            <Card className="p-6">
              <h3 className="font-semibold text-white mb-1">Send To This Address</h3>
              <p className="text-xs text-gray-400 mb-4">{wallet.network}</p>
              <div className="bg-obsidian-950/80 border border-white/10 rounded-xl p-4 mb-3">
                <p className="font-mono text-xs text-gray-300 break-all leading-relaxed">{wallet.address}</p>
              </div>
              <button
                onClick={copyAddress}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Address'}
              </button>
              <div className="mt-3 bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 text-amber-300 text-xs flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Send only {getCoinName(selectedCoin)} to this address. Sending other coins may result in permanent loss.
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="font-semibold text-white mb-5">Submit Transaction Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Amount (USD equivalent)</label>
                <input
                  type="number"
                  placeholder="100.00"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Transaction Hash (TxID)</label>
                <input
                  type="text"
                  placeholder="Paste your transaction hash here"
                  value={txHash}
                  onChange={e => setTxHash(e.target.value)}
                  className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500">Find this in your wallet after sending</p>
              </div>
              <Button
                type="submit"
                loading={loading}
                disabled={!selectedCoin}
                className="w-full justify-center"
              >
                Submit Deposit
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Deposit History */}
      {deposits.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-4">Deposit History</h3>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Amount</th>
                  <th>Tx Hash</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map(dep => (
                  <tr key={dep.id}>
                    <td className="font-medium text-white">{getCoinName(dep.coin)}</td>
                    <td className="tabular-nums text-white">{formatCurrency(dep.amount)}</td>
                    <td>
                      <span className="font-mono text-xs text-gray-400">
                        {dep.txHash.slice(0, 16)}...
                      </span>
                    </td>
                    <td>
                      <Badge status={dep.status}>{dep.status}</Badge>
                      {dep.adminNote && (
                        <p className="text-xs text-gray-500 mt-1">{dep.adminNote}</p>
                      )}
                    </td>
                    <td className="text-gray-500 text-xs">{formatDateTime(dep.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
