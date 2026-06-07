// src/app/admin/withdrawals/AdminWithdrawalsClient.tsx
'use client';
import React, { useState } from 'react';
import { Check, X, Eye, Search, Copy } from 'lucide-react';
import { Button, Card, Badge, Modal, Textarea, Input } from '@/components/ui';
import { formatCurrency, formatDateTime, getCoinName, truncateAddress } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Withdrawal {
  id: string; coin: string; amount: number; walletAddress: string; status: string;
  txHash?: string; createdAt: string; adminNote?: string;
  user: { firstName: string; lastName: string; email: string; balance: number };
}

export default function AdminWithdrawalsClient({ withdrawals }: { withdrawals: Withdrawal[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Withdrawal | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = withdrawals.filter(w => {
    const matchStatus = filter === 'ALL' || w.status === filter;
    const matchSearch = !search || w.user.email.toLowerCase().includes(search.toLowerCase()) || w.walletAddress.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = withdrawals.filter(w => w.status === 'PENDING').length;

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: selected.id, action, adminNote, txHash }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(`Withdrawal ${action}d`);
      setSelected(null); setAdminNote(''); setTxHash('');
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
        <h1 className="text-2xl font-bold text-white mb-1">Withdrawal Management</h1>
        <p className="text-gray-400 text-sm">{pendingCount} pending approval</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or wallet..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}>
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
              <th>Wallet Address</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id}>
                <td>
                  <p className="text-sm text-white">{w.user.firstName} {w.user.lastName}</p>
                  <p className="text-xs text-gray-500">{w.user.email}</p>
                </td>
                <td className="font-medium text-white">{getCoinName(w.coin)}</td>
                <td className="tabular-nums font-semibold text-white">{formatCurrency(w.amount)}</td>
                <td>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-gray-400">{truncateAddress(w.walletAddress)}</span>
                    <button onClick={() => { navigator.clipboard.writeText(w.walletAddress); toast.success('Copied!'); }} className="text-gray-500 hover:text-white">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </td>
                <td><Badge status={w.status}>{w.status}</Badge></td>
                <td className="text-gray-500 text-xs whitespace-nowrap">{formatDateTime(w.createdAt)}</td>
                <td>
                  <button onClick={() => { setSelected(w); setAdminNote(w.adminNote || ''); setTxHash(''); }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No withdrawals found</div>}
      </Card>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Review Withdrawal">
        {selected && (
          <div className="space-y-4">
            <div className="bg-white/3 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">User</span><span className="text-white">{selected.user.firstName} {selected.user.lastName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Coin</span><span className="text-white">{getCoinName(selected.coin)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="text-white font-semibold">{formatCurrency(selected.amount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">User Balance</span><span className="text-gold-400">{formatCurrency(selected.user.balance)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Status</span><Badge status={selected.status}>{selected.status}</Badge></div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Destination Wallet</p>
              <div className="bg-obsidian-950/80 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-2">
                <p className="font-mono text-xs text-gray-300 break-all">{selected.walletAddress}</p>
                <button onClick={() => { navigator.clipboard.writeText(selected.walletAddress); toast.success('Copied!'); }} className="text-gray-400 hover:text-white flex-shrink-0">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            {selected.status === 'PENDING' && (
              <>
                <Input label="Transaction Hash (after sending)" placeholder="Enter tx hash after you send the funds" value={txHash} onChange={e => setTxHash(e.target.value)} />
                <Textarea label="Admin Note (optional)" placeholder="Reason or notes..." value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2} />
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => handleAction('reject')} variant="danger" loading={loading} className="justify-center"><X className="w-4 h-4" /> Reject</Button>
                  <Button onClick={() => handleAction('approve')} loading={loading} className="justify-center"><Check className="w-4 h-4" /> Approve</Button>
                </div>
              </>
            )}
            {selected.adminNote && selected.status !== 'PENDING' && (
              <div className="bg-white/3 rounded-xl p-3 text-sm text-gray-400">
                <span className="text-gray-300 font-medium">Admin note: </span>{selected.adminNote}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
