// src/app/transactions/TransactionsClient.tsx
'use client';
import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, History, Search } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Transaction {
  id: string; type: string; amount: number; description: string;
  reference?: string; balanceBefore: number; balanceAfter: number; createdAt: string;
}

const typeColors: Record<string, string> = {
  DEPOSIT: 'text-emerald-400 bg-emerald-400/10',
  WITHDRAWAL: 'text-red-400 bg-red-400/10',
  INVESTMENT: 'text-blue-400 bg-blue-400/10',
  RETURN: 'text-emerald-400 bg-emerald-400/10',
  BONUS: 'text-gold-400 bg-gold-400/10',
};

export default function TransactionsClient({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(tx => {
    const matchType = filter === 'ALL' || tx.type === filter;
    const matchSearch = !search || tx.description.toLowerCase().includes(search.toLowerCase()) || tx.reference?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Transaction History</h1>
        <p className="text-gray-400 text-sm">{transactions.length} total transactions</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'RETURN', 'BONUS'].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === t ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <History className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No transactions found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${typeColors[tx.type] || 'text-gray-400 bg-gray-400/10'}`}>
                        {tx.amount > 0
                          ? <ArrowDownRight className="w-3.5 h-3.5" />
                          : <ArrowUpRight className="w-3.5 h-3.5" />
                        }
                      </div>
                      <span className={`text-xs font-semibold ${typeColors[tx.type]?.split(' ')[0] || 'text-gray-400'}`}>{tx.type}</span>
                    </div>
                  </td>
                  <td>
                    <p className="text-white text-sm">{tx.description}</p>
                    {tx.reference && <p className="text-xs font-mono text-gray-500 mt-0.5">{tx.reference.slice(0, 20)}...</p>}
                  </td>
                  <td className={`tabular-nums font-semibold ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </td>
                  <td className="tabular-nums text-white">{formatCurrency(tx.balanceAfter)}</td>
                  <td className="text-gray-500 text-xs whitespace-nowrap">{formatDateTime(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
