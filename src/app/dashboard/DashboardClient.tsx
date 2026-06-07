// src/app/dashboard/DashboardClient.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import {
  ArrowDownToLine, ArrowUpFromLine, TrendingUp, DollarSign,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle,
} from 'lucide-react';
import { StatCard, Card, Badge, RiskWarning } from '@/components/ui';
import { formatCurrency, formatDateTime, getCoinName } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface Props {
  user: { firstName: string; lastName: string; email: string; role: string; balance: number; totalDeposited: number; totalWithdrawn: number };
  investments: Array<{ id: string; amount: number; expectedReturn: number; endDate: string; status: string; plan: { name: string; estimatedReturn: number; riskLevel: string } }>;
  transactions: Array<{ id: string; type: string; amount: number; description: string; createdAt: string; balanceAfter: number }>;
  deposits: Array<{ id: string; coin: string; amount: number; status: string; createdAt: string }>;
}

export default function DashboardClient({ user, investments, transactions, deposits }: Props) {
  // Build chart data from transactions
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'MMM d');
    const dayTxns = transactions.filter(t => format(new Date(t.createdAt), 'MMM d') === dateStr);
    const balance = dayTxns.length > 0 ? dayTxns[dayTxns.length - 1].balanceAfter : (i === 0 ? user.balance : null);
    return { date: dateStr, balance };
  });

  // Fill null values
  let lastBalance = user.balance;
  const chartData = [...last7Days].reverse().map(d => {
    if (d.balance !== null) lastBalance = d.balance;
    return { ...d, balance: lastBalance };
  }).reverse();

  const activeInvestments = investments.filter(i => i.status === 'ACTIVE');
  const totalInvested = activeInvestments.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user.firstName}</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here's your portfolio overview</p>
        </div>
        <div className="flex gap-3">
          <Link href="/deposit" className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 text-gold-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gold-500/20 transition-all">
            <ArrowDownToLine className="w-4 h-4" /> Deposit
          </Link>
          <Link href="/withdraw" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
            <ArrowUpFromLine className="w-4 h-4" /> Withdraw
          </Link>
        </div>
      </div>

      <RiskWarning />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Available Balance"
          value={formatCurrency(user.balance)}
          icon={<DollarSign className="w-6 h-6" />}
          color="gold"
        />
        <StatCard
          label="Total Deposited"
          value={formatCurrency(user.totalDeposited)}
          icon={<ArrowDownToLine className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          label="Total Withdrawn"
          value={formatCurrency(user.totalWithdrawn)}
          icon={<ArrowUpFromLine className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          label="Active Investments"
          value={String(activeInvestments.length)}
          icon={<TrendingUp className="w-6 h-6" />}
          change={totalInvested > 0 ? `$${totalInvested.toFixed(2)} deployed` : 'No active plans'}
          color="gold"
        />
      </div>

      {/* Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-white">Balance History</h3>
            <p className="text-xs text-gray-500 mt-0.5">Last 7 days</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white tabular-nums">{formatCurrency(user.balance)}</p>
            <p className="text-xs text-gray-500">Current balance</p>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#1a1d24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }}
                formatter={(v: number) => [formatCurrency(v), 'Balance']}
              />
              <Area type="monotone" dataKey="balance" stroke="#eab308" strokeWidth={2} fill="url(#balanceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Investments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Active Investments</h3>
            <Link href="/investments" className="text-xs text-gold-400 hover:text-gold-300">View all →</Link>
          </div>
          {activeInvestments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No active investments</p>
              <Link href="/investments" className="text-gold-400 text-xs hover:text-gold-300 mt-1 inline-block">Browse plans →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeInvestments.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-white/3 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-white">{inv.plan.name} Plan</p>
                    <p className="text-xs text-gray-500">Ends {format(new Date(inv.endDate), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{formatCurrency(inv.amount)}</p>
                    <p className="text-xs text-emerald-400">Est. {formatCurrency(inv.expectedReturn)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Activity</h3>
            <Link href="/transactions" className="text-xs text-gold-400 hover:text-gold-300">View all →</Link>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 6).map(tx => (
                <div key={tx.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tx.amount > 0 ? 'bg-emerald-400/10' : 'bg-red-400/10'}`}>
                    {tx.amount > 0
                      ? <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                      : <ArrowUpRight className="w-4 h-4 text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{tx.description}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(tx.createdAt)}</p>
                  </div>
                  <p className={`text-sm font-semibold tabular-nums ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Deposits */}
      {deposits.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Deposits</h3>
            <Link href="/deposit" className="text-xs text-gold-400 hover:text-gold-300">New deposit →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map(dep => (
                  <tr key={dep.id}>
                    <td className="font-medium text-white">{getCoinName(dep.coin)}</td>
                    <td className="tabular-nums">{formatCurrency(dep.amount)}</td>
                    <td><Badge status={dep.status}>{dep.status}</Badge></td>
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
