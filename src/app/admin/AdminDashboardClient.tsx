// src/app/admin/AdminDashboardClient.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { Users, ArrowDownToLine, ArrowUpFromLine, TrendingUp, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { StatCard, Card, Badge } from '@/components/ui';
import { formatCurrency, formatDateTime, getCoinName } from '@/lib/utils';

interface Props {
  stats: {
    users: { total: number; active: number };
    deposits: { total: number; pending: number; totalAmount: number };
    withdrawals: { total: number; pending: number; totalAmount: number };
    investments: { active: number };
  };
  pendingDeposits: Array<{ id: string; coin: string; amount: number; createdAt: string; user: { firstName: string; lastName: string; email: string } }>;
  pendingWithdrawals: Array<{ id: string; coin: string; amount: number; walletAddress: string; createdAt: string; user: { firstName: string; lastName: string; email: string } }>;
}

export default function AdminDashboardClient({ stats, pendingDeposits, pendingWithdrawals }: Props) {
  const totalPending = stats.deposits.pending + stats.withdrawals.pending;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm">Platform overview and pending actions</p>
      </div>

      {totalPending > 0 && (
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">
            <strong>{totalPending} pending actions</strong> require your attention — 
            {stats.deposits.pending > 0 && ` ${stats.deposits.pending} deposits`}
            {stats.deposits.pending > 0 && stats.withdrawals.pending > 0 && ','}
            {stats.withdrawals.pending > 0 && ` ${stats.withdrawals.pending} withdrawals`}.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={String(stats.users.total)} icon={<Users className="w-6 h-6" />} change={`${stats.users.active} active`} color="blue" />
        <StatCard label="Deposits Approved" value={formatCurrency(stats.deposits.totalAmount)} icon={<ArrowDownToLine className="w-6 h-6" />} change={`${stats.deposits.pending} pending`} color="emerald" />
        <StatCard label="Withdrawals Processed" value={formatCurrency(stats.withdrawals.totalAmount)} icon={<ArrowUpFromLine className="w-6 h-6" />} change={`${stats.withdrawals.pending} pending`} color="gold" />
        <StatCard label="Active Investments" value={String(stats.investments.active)} icon={<TrendingUp className="w-6 h-6" />} color="gold" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Deposits */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" /> Pending Deposits
              {stats.deposits.pending > 0 && (
                <span className="bg-yellow-400/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.deposits.pending}
                </span>
              )}
            </h3>
            <Link href="/admin/deposits" className="text-xs text-gold-400 hover:text-gold-300">View all →</Link>
          </div>
          {pendingDeposits.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No pending deposits</p>
          ) : (
            <div className="space-y-3">
              {pendingDeposits.map(dep => (
                <div key={dep.id} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
                  <div className="w-9 h-9 bg-yellow-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ArrowDownToLine className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{dep.user.firstName} {dep.user.lastName}</p>
                    <p className="text-xs text-gray-500">{getCoinName(dep.coin)} · {formatDateTime(dep.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{formatCurrency(dep.amount)}</p>
                    <Badge status="PENDING">PENDING</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Withdrawals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" /> Pending Withdrawals
              {stats.withdrawals.pending > 0 && (
                <span className="bg-yellow-400/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.withdrawals.pending}
                </span>
              )}
            </h3>
            <Link href="/admin/withdrawals" className="text-xs text-gold-400 hover:text-gold-300">View all →</Link>
          </div>
          {pendingWithdrawals.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No pending withdrawals</p>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map(w => (
                <div key={w.id} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
                  <div className="w-9 h-9 bg-yellow-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ArrowUpFromLine className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{w.user.firstName} {w.user.lastName}</p>
                    <p className="text-xs text-gray-500">{getCoinName(w.coin)} · {formatDateTime(w.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{formatCurrency(w.amount)}</p>
                    <Badge status="PENDING">PENDING</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/admin/users', label: 'Manage Users', icon: Users, color: 'text-blue-400 bg-blue-400/10' },
          { href: '/admin/deposits', label: 'Review Deposits', icon: ArrowDownToLine, color: 'text-emerald-400 bg-emerald-400/10' },
          { href: '/admin/withdrawals', label: 'Process Withdrawals', icon: ArrowUpFromLine, color: 'text-gold-400 bg-gold-400/10' },
          { href: '/admin/wallets', label: 'Wallet Addresses', icon: DollarSign, color: 'text-purple-400 bg-purple-400/10' },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href} className="card p-5 hover:border-white/15 transition-all group text-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-white group-hover:text-gold-400 transition-colors">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
