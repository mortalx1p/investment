// src/app/withdraw/WithdrawClient.tsx
'use client';
import React, { useState } from 'react';
import { ArrowUpFromLine, AlertTriangle } from 'lucide-react';
import { Button, Card, Badge, RiskWarning } from '@/components/ui';
import { formatCurrency, formatDateTime, getCoinName } from '@/lib/utils';
import toast from 'react-hot-toast';

const COINS = [
  { key: 'BTC', name: 'Bitcoin' },
  { key: 'ETH', name: 'Ethereum' },
  { key: 'USDT_TRC20', name: 'USDT (TRC20)' },
  { key: 'USDT_ERC20', name: 'USDT (ERC20)' },
  { key: 'BNB', name: 'BNB' },
];

interface Props {
  balance: number;
  withdrawals: Array<{ id: string; coin: string; amount: number; walletAddress: string; status: string; createdAt: string; adminNote?: string }>;
  minWithdrawal: number;
  withdrawalFee: number;
}

export default function WithdrawClient({ balance, withdrawals, minWithdrawal, withdrawalFee }: Props) {
  const [coin, setCoin] = useState('');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const fee = (numAmount * withdrawalFee) / 100;
  const youReceive = numAmount - fee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coin) { toast.error('Select a cryptocurrency'); return; }
    if (numAmount < minWithdrawal) { toast.error(`Minimum withdrawal is $${minWithdrawal}`); return; }
    if (numAmount > balance) { toast.error('Insufficient balance'); return; }
    if (!walletAddress || walletAddress.length < 20) { toast.error('Enter a valid wallet address'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin, amount: numAmount, walletAddress }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Request failed'); return; }
      toast.success('Withdrawal request submitted! Awaiting approval.');
      setCoin(''); setAmount(''); setWalletAddress('');
      window.location.reload();
    } catch {
      toast.error('Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Withdraw Funds</h1>
        <p className="text-gray-400 text-sm">Request a withdrawal to your external wallet.</p>
      </div>

      <RiskWarning />

      {/* Balance card */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5 text-center">
          <p className="text-xs text-gray-400 mb-1">Available Balance</p>
          <p className="text-xl font-bold text-gold-400">{formatCurrency(balance)}</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-xs text-gray-400 mb-1">Minimum Withdrawal</p>
          <p className="text-xl font-bold text-white">{formatCurrency(minWithdrawal)}</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-xs text-gray-400 mb-1">Processing Fee</p>
          <p className="text-xl font-bold text-white">{withdrawalFee}%</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
          <ArrowUpFromLine className="w-5 h-5 text-gold-400" /> Withdrawal Request
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Cryptocurrency</label>
            <select
              value={coin}
              onChange={e => setCoin(e.target.value)}
              className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
              required
            >
              <option value="" className="bg-[#1a1d24]">Select coin...</option>
              {COINS.map(c => <option key={c.key} value={c.key} className="bg-[#1a1d24]">{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Amount (USD)</label>
            <input
              type="number"
              placeholder={`Min. $${minWithdrawal}`}
              min={minWithdrawal}
              max={balance}
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
              required
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Available: {formatCurrency(balance)}</span>
              <button type="button" onClick={() => setAmount(String(balance))} className="text-gold-400 hover:text-gold-300">Max</button>
            </div>
          </div>

          {numAmount > 0 && (
            <div className="bg-white/3 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Amount</span><span className="text-white">{formatCurrency(numAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Fee ({withdrawalFee}%)</span><span className="text-red-400">-{formatCurrency(fee)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-white/10 pt-2">
                <span className="text-gray-300">You Receive</span>
                <span className="text-gold-400">{formatCurrency(youReceive)}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Your {coin ? getCoinName(coin) : 'Crypto'} Wallet Address</label>
            <input
              type="text"
              placeholder="Enter your receiving wallet address"
              value={walletAddress}
              onChange={e => setWalletAddress(e.target.value)}
              className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all font-mono text-sm"
              required
            />
          </div>

          <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-3 text-red-300 text-xs flex gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            Double-check your wallet address. Withdrawals sent to wrong addresses cannot be recovered.
          </div>

          <Button type="submit" loading={loading} className="w-full justify-center">
            Submit Withdrawal Request
          </Button>
        </form>
      </Card>

      {withdrawals.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-4">Withdrawal History</h3>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Amount</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id}>
                    <td className="font-medium text-white">{getCoinName(w.coin)}</td>
                    <td className="tabular-nums text-white">{formatCurrency(w.amount)}</td>
                    <td>
                      <span className="font-mono text-xs text-gray-400">
                        {w.walletAddress.slice(0, 12)}...
                      </span>
                    </td>
                    <td>
                      <Badge status={w.status}>{w.status}</Badge>
                      {w.adminNote && <p className="text-xs text-gray-500 mt-0.5">{w.adminNote}</p>}
                    </td>
                    <td className="text-gray-500 text-xs">{formatDateTime(w.createdAt)}</td>
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
