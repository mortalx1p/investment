// src/app/admin/users/AdminUsersClient.tsx
'use client';
import React, { useState } from 'react';
import { Search, Eye, UserX, UserCheck, DollarSign } from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface User {
  id: string; email: string; firstName: string; lastName: string; phone?: string; country?: string;
  status: string; balance: number; totalDeposited: number; totalWithdrawn: number;
  createdAt: string; lastLoginAt?: string; emailVerified: boolean;
  _count: { deposits: number; withdrawals: number; investments: number };
}

export default function AdminUsersClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selected, setSelected] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = users.filter(u => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) || `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAction = async (userId: string, action: string, extra?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Action completed');
      setSelected(null); setAdjustAmount('');
      router.refresh();
    } catch {
      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">User Management</h1>
        <p className="text-gray-400 text-sm">{users.length} total users</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-all text-sm" />
          </div>
          <div className="flex gap-2">
            {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filterStatus === s ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Balance</th>
                <th>Deposited</th>
                <th>Activity</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-gold-500/30 to-gold-700/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gold-400 font-bold text-xs">{u.firstName[0]}{u.lastName[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <Badge status={u.status}>{u.status}</Badge>
                      {!u.emailVerified && <p className="text-xs text-yellow-400">Unverified</p>}
                    </div>
                  </td>
                  <td className="tabular-nums font-semibold text-gold-400">{formatCurrency(u.balance)}</td>
                  <td className="tabular-nums text-emerald-400">{formatCurrency(u.totalDeposited)}</td>
                  <td>
                    <div className="text-xs text-gray-400 space-y-0.5">
                      <p>{u._count.deposits} deposits</p>
                      <p>{u._count.withdrawals} withdrawals</p>
                      <p>{u._count.investments} investments</p>
                    </div>
                  </td>
                  <td className="text-gray-500 text-xs whitespace-nowrap">{formatDateTime(u.createdAt)}</td>
                  <td>
                    <button onClick={() => setSelected(u)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No users found</div>}
      </Card>

      {/* User Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="User Details">
        {selected && (
          <div className="space-y-4">
            <div className="bg-white/3 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Name</span><span className="text-white">{selected.firstName} {selected.lastName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-white text-xs">{selected.email}</span></div>
              {selected.phone && <div className="flex justify-between"><span className="text-gray-400">Phone</span><span className="text-white">{selected.phone}</span></div>}
              {selected.country && <div className="flex justify-between"><span className="text-gray-400">Country</span><span className="text-white">{selected.country}</span></div>}
              <div className="flex justify-between"><span className="text-gray-400">Status</span><Badge status={selected.status}>{selected.status}</Badge></div>
              <div className="flex justify-between"><span className="text-gray-400">Balance</span><span className="text-gold-400 font-bold">{formatCurrency(selected.balance)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total Deposited</span><span className="text-emerald-400">{formatCurrency(selected.totalDeposited)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total Withdrawn</span><span className="text-white">{formatCurrency(selected.totalWithdrawn)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Joined</span><span className="text-white text-xs">{formatDateTime(selected.createdAt)}</span></div>
              {selected.lastLoginAt && <div className="flex justify-between"><span className="text-gray-400">Last Login</span><span className="text-white text-xs">{formatDateTime(selected.lastLoginAt)}</span></div>}
            </div>

            {/* Balance Adjustment */}
            <div className="border border-white/10 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-white">Balance Adjustment</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter amount (negative to deduct)"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(e.target.value)}
                  className="flex-1 bg-obsidian-950/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 text-sm"
                />
                <Button
                  onClick={() => handleAction(selected.id, 'adjust_balance', { amount: parseFloat(adjustAmount) })}
                  loading={loading} size="sm" variant="secondary"
                  disabled={!adjustAmount || isNaN(parseFloat(adjustAmount))}
                >
                  <DollarSign className="w-4 h-4" /> Apply
                </Button>
              </div>
              <p className="text-xs text-gray-500">Use negative values to deduct from balance</p>
            </div>

            {/* Status Actions */}
            <div className="grid grid-cols-2 gap-3">
              {selected.status === 'SUSPENDED' ? (
                <Button onClick={() => handleAction(selected.id, 'activate')} loading={loading} className="justify-center col-span-2">
                  <UserCheck className="w-4 h-4" /> Activate Account
                </Button>
              ) : (
                <Button onClick={() => handleAction(selected.id, 'suspend')} variant="danger" loading={loading} className="justify-center col-span-2">
                  <UserX className="w-4 h-4" /> Suspend Account
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
