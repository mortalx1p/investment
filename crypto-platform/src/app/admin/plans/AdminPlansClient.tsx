// src/app/admin/plans/AdminPlansClient.tsx
'use client';
import React, { useState } from 'react';
import { Plus, Pencil, Pause, Play, Trash2, TrendingUp, X } from 'lucide-react';
import { Button, Card, Badge, Modal, Input, Textarea } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Plan {
  id: string; name: string; description: string; minDeposit: number; maxDeposit: number;
  durationDays: number; estimatedReturn: number; riskLevel: string; status: string;
  featured: boolean; features: string[];
  _count: { investments: number };
}

const emptyForm = {
  name: '', description: '', minDeposit: '', maxDeposit: '', durationDays: '',
  estimatedReturn: '', riskLevel: 'LOW', featured: false,
  features: [''] as string[],
};

const riskColors: Record<string, string> = {
  LOW: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  MEDIUM: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  HIGH: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  VERY_HIGH: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function AdminPlansClient({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const openCreate = () => { setEditPlan(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (plan: Plan) => {
    setEditPlan(plan);
    setForm({
      name: plan.name, description: plan.description,
      minDeposit: String(plan.minDeposit), maxDeposit: String(plan.maxDeposit),
      durationDays: String(plan.durationDays), estimatedReturn: String(plan.estimatedReturn),
      riskLevel: plan.riskLevel, featured: plan.featured,
      features: plan.features.length > 0 ? plan.features : [''],
    });
    setShowModal(true);
  };

  const updateFeature = (idx: number, val: string) => {
    setForm(p => ({ ...p, features: p.features.map((f, i) => i === idx ? val : f) }));
  };
  const addFeature = () => setForm(p => ({ ...p, features: [...p.features, ''] }));
  const removeFeature = (idx: number) => setForm(p => ({ ...p, features: p.features.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    const payload = {
      name: form.name, description: form.description,
      minDeposit: parseFloat(form.minDeposit), maxDeposit: parseFloat(form.maxDeposit),
      durationDays: parseInt(form.durationDays), estimatedReturn: parseFloat(form.estimatedReturn),
      riskLevel: form.riskLevel, featured: form.featured,
      features: form.features.filter(f => f.trim()),
    };

    setLoading(true);
    try {
      if (editPlan) {
        const res = await fetch('/api/admin/plans', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: editPlan.id, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error || 'Update failed'); return; }
        toast.success('Plan updated');
      } else {
        const res = await fetch('/api/admin/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error || 'Create failed'); return; }
        toast.success('Plan created');
      }
      setShowModal(false);
      router.refresh();
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const handleStatusAction = async (planId: string, action: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, action }),
      });
      if (!res.ok) { toast.error('Action failed'); return; }
      toast.success(`Plan ${action}d`);
      router.refresh();
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Investment Plans</h1>
          <p className="text-gray-400 text-sm">{plans.length} plans configured</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> New Plan
        </Button>
      </div>

      {/* Risk Disclaimer */}
      <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 text-amber-300 text-sm">
        ⚠️ Ensure all plans display estimated (not guaranteed) returns. Risk disclosures are shown automatically to users.
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {plans.map(plan => (
          <Card key={plan.id} className={`p-6 ${plan.status === 'PAUSED' ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white">{plan.name}</h3>
                  {plan.featured && <span className="text-xs bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full">Featured</span>}
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${riskColors[plan.riskLevel]}`}>
                  {plan.riskLevel.replace('_', ' ')} RISK
                </span>
              </div>
              <Badge status={plan.status}>{plan.status}</Badge>
            </div>

            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-400">Est. Return</span><span className="text-emerald-400 font-semibold">{plan.estimatedReturn}%*</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Min</span><span className="text-white">{formatCurrency(plan.minDeposit)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Max</span><span className="text-white">{formatCurrency(plan.maxDeposit)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="text-white">{plan.durationDays} days</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Active investments</span><span className="text-white">{plan._count.investments}</span></div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => openEdit(plan)} variant="secondary" size="sm" className="flex-1 justify-center">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
              {plan.status === 'ACTIVE' ? (
                <Button onClick={() => handleStatusAction(plan.id, 'pause')} variant="secondary" size="sm">
                  <Pause className="w-3.5 h-3.5" />
                </Button>
              ) : plan.status === 'PAUSED' ? (
                <Button onClick={() => handleStatusAction(plan.id, 'activate')} size="sm">
                  <Play className="w-3.5 h-3.5" />
                </Button>
              ) : null}
              <Button onClick={() => { if (confirm('Delete this plan?')) handleStatusAction(plan.id, 'delete'); }} variant="danger" size="sm">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-3">*Estimated projection — not guaranteed</p>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editPlan ? 'Edit Plan' : 'Create New Plan'}>
        <div className="space-y-4">
          <Input label="Plan Name" placeholder="e.g. Growth" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <Textarea label="Description" placeholder="Brief description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Min Deposit ($)" type="number" placeholder="100" value={form.minDeposit} onChange={e => setForm(p => ({ ...p, minDeposit: e.target.value }))} />
            <Input label="Max Deposit ($)" type="number" placeholder="999" value={form.maxDeposit} onChange={e => setForm(p => ({ ...p, maxDeposit: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Duration (days)" type="number" placeholder="30" value={form.durationDays} onChange={e => setForm(p => ({ ...p, durationDays: e.target.value }))} />
            <Input label="Est. Return (%)" type="number" placeholder="8" value={form.estimatedReturn} onChange={e => setForm(p => ({ ...p, estimatedReturn: e.target.value }))} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Risk Level</label>
            <select value={form.riskLevel} onChange={e => setForm(p => ({ ...p, riskLevel: e.target.value }))}
              className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-all">
              {['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'].map(r => <option key={r} value={r} className="bg-[#1a1d24]">{r.replace('_', ' ')}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="accent-yellow-500" />
            <label htmlFor="featured" className="text-sm text-gray-300 cursor-pointer">Mark as featured (highlighted on listing)</label>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Features</label>
              <button onClick={addFeature} className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {form.features.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input value={f} onChange={e => updateFeature(i, e.target.value)} placeholder={`Feature ${i + 1}`}
                  className="flex-1 bg-obsidian-950/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold-500/50" />
                {form.features.length > 1 && (
                  <button onClick={() => removeFeature(i)} className="text-gray-500 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
          </div>

          <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 text-amber-300 text-xs">
            ⚠️ The platform will display "Estimated return — not guaranteed" automatically. Do not promise guaranteed returns.
          </div>

          <Button onClick={handleSave} loading={loading} className="w-full justify-center">
            {editPlan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
