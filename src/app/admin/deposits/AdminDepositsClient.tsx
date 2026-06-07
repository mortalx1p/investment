// src/app/admin/deposits/AdminDepositsClient.tsx
'use client';
import React, { useState } from 'react';
import { Check, X, Eye, Search } from 'lucide-react';
import { Button, Card, Badge, Modal, Textarea } from '@/components/ui';
import { formatCurrency, formatDateTime, getCoinName } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Deposit {
  id: string; coin: string; amount: number; txHash: string; status: string;
  walletAddress: string; createdAt: string; adminNote?: string;
  user: { firstName: string; lastName: string; email: string };
}

export default function AdminDepositsClient({ deposits }: { deposits: Deposit[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Deposit | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = deposits.filter(d => {
    const matchStatus = filter === 'ALL' || d.status === filter;
    const matchSearch = !search || d.user.email.toLowerCase().includes(search.toLowerCase()) || d.txHash.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId: selected.id, action, adminNote }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(`Deposit ${action}d successfully`);
      setSelected(null); setAdminNote('');
      router.refresh();
    } catch {
      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = deposits.filter(d => d.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Deposit Management</h1>
        <p className="text-gray-400 text-sm">{pendingCount} pending review</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or tx hash..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}
              >
                {s} {s === 'PENDING' && pendingCount > 0 && `(${pendingCount})`}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="table-base">
          <thead>
            <tr>
              <th>User</th>
              <th>Coin</th>
              <th>Amount</th>
              <th>Tx Hash</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(dep => (
              <tr key={dep.id}>
                <td>
                  <p className="text-sm text-white">{dep.user.firstName} {dep.user.lastName}</p>
                  <p className="text-xs text-gray-500">{dep.user.email}</p>
                </td>
                <td className="font-medium text-white">{getCoinName(dep.coin)}</td>
                <td className="tabular-nums font-semibold text-white">{formatCurrency(dep.amount)}</td>
                <td>
                  <span className="font-mono text-xs text-gray-400">{dep.txHash.slice(0, 16)}...</span>
                </td>
                <td><Badge status={dep.status}>{dep.status}</Badge></td>
                <td className="text-gray-500 text-xs whitespace-nowrap">{formatDateTime(dep.createdAt)}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelected(dep); setAdminNote(''); }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                      title="Review"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {dep.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => { setSelected(dep); setAdminNote(''); }}
                          className="p-1.5 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 transition-all"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelected(dep); setAdminNote(''); }}
                          className="p-1.5 rounded-lg bg-red-400/10 hover:bg-red-400/20 text-red-400 transition-all"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No deposits found</div>
        )}
      </Card>

      {/* Review Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Review Deposit">
        {selected && (
          <div className="space-y-4">
            <div className="bg-white/3 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">User</span><span className="text-white">{selected.user.firstName} {selected.user.lastName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-white">{selected.user.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Coin</span><span className="text-white">{getCoinName(selected.coin)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="text-white font-semibold">{formatCurrency(selected.amount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Status</span><Badge status={selected.status}>{selected.status}</Badge></div>
              <div className="flex justify-between"><span className="text-gray-400">Date</span><span className="text-white text-xs">{formatDateTime(selected.createdAt)}</span></div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Transaction Hash</p>
              <div className="bg-obsidian-950/80 border border-white/10 rounded-xl p-3">
                <p className="font-mono text-xs text-gray-300 break-all">{selected.txHash}</p>
              </div>
            </div>

            <Textarea
              label="Admin Note (optional)"
              placeholder="Reason for rejection or additional notes..."
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              rows={3}
            />

            {selected.status === 'PENDING' && (
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => handleAction('reject')} variant="danger" loading={loading} className="justify-center">
                  <X className="w-4 h-4" /> Reject
                </Button>
                <Button onClick={() => handleAction('approve')} loading={loading} className="justify-center">
                  <Check className="w-4 h-4" /> Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
