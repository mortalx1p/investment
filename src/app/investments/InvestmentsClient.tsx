// src/app/investments/InvestmentsClient.tsx
'use client';
import React, { useState } from 'react';
import { Check, TrendingUp, Clock, Shield, AlertTriangle } from 'lucide-react';
import { Button, Card, Badge, Modal, RiskWarning } from '@/components/ui';
import { formatCurrency, formatDate, getRiskColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';

interface Plan {
  id: string; name: string; description: string; minDeposit: number; maxDeposit: number;
  durationDays: number; estimatedReturn: number; riskLevel: string; featured: boolean; features: string[];
}

interface Investment {
  id: string; amount: number; expectedReturn: number; startDate: string; endDate: string;
  status: string; plan: Plan;
}

interface Props {
  plans: Plan[];
  investments: Investment[];
  balance: number;
}

export default function InvestmentsClient({ plans, investments, balance }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'plans' | 'active'>('plans');

  const activeInvestments = investments.filter(i => i.status === 'ACTIVE');
  const pastInvestments = investments.filter(i => i.status !== 'ACTIVE');

  const handleInvest = async () => {
    if (!selectedPlan || !amount) return;
    const num = parseFloat(amount);
    if (num < selectedPlan.minDeposit || num > selectedPlan.maxDeposit) {
      toast.error(`Amount must be between $${selectedPlan.minDeposit} - $${selectedPlan.maxDeposit}`);
      return;
    }
    if (num > balance) { toast.error('Insufficient balance. Please deposit first.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan.id, amount: num }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Investment failed'); return; }
      toast.success(`Investment in ${selectedPlan.name} plan started!`);
      setSelectedPlan(null); setAmount('');
      window.location.reload();
    } catch {
      toast.error('Investment failed');
    } finally {
      setLoading(false);
    }
  };

  const riskColors: Record<string, string> = {
    LOW: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    MEDIUM: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    HIGH: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    VERY_HIGH: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Investment Plans</h1>
          <p className="text-gray-400 text-sm">
            Available balance: <span className="text-gold-400 font-semibold">{formatCurrency(balance)}</span>
          </p>
        </div>
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setTab('plans')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'plans' ? 'bg-gold-500/20 text-gold-400' : 'text-gray-400 hover:text-white'}`}
          >
            Browse Plans
          </button>
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'active' ? 'bg-gold-500/20 text-gold-400' : 'text-gray-400 hover:text-white'}`}
          >
            My Investments {activeInvestments.length > 0 && `(${activeInvestments.length})`}
          </button>
        </div>
      </div>

      <RiskWarning />

      {tab === 'plans' && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all card-hover ${
                plan.featured
                  ? 'bg-gradient-to-br from-gold-500/10 to-gold-600/5 border-gold-500/30'
                  : 'bg-[#1a1d24] border-white/8'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-black text-xs font-black px-3 py-1 rounded-full tracking-wide">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-display font-bold text-xl text-white mb-2">{plan.name}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${riskColors[plan.riskLevel]}`}>
                  {plan.riskLevel.replace('_', ' ')} RISK
                </span>
              </div>

              <div className="mb-4">
                <div className="text-3xl font-bold gradient-text">Est. {plan.estimatedReturn}%*</div>
                <p className="text-xs text-gray-500 mt-0.5">*Not guaranteed — projection only</p>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-gray-400 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Min</span>
                  <span className="text-white font-medium">{formatCurrency(plan.minDeposit)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-gray-400 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Max</span>
                  <span className="text-white font-medium">{formatCurrency(plan.maxDeposit)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Duration</span>
                  <span className="text-white font-medium">{plan.durationDays} days</span>
                </div>
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => { setSelectedPlan(plan); setAmount(''); }}
                className={`w-full justify-center ${!plan.featured ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10 from-transparent to-transparent' : ''}`}
                variant={plan.featured ? 'primary' : 'secondary'}
              >
                Invest Now
              </Button>
            </div>
          ))}
        </div>
      )}

      {tab === 'active' && (
        <div className="space-y-6">
          {activeInvestments.length === 0 ? (
            <Card className="p-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Active Investments</h3>
              <p className="text-gray-500 text-sm mb-4">Browse plans to start investing.</p>
              <Button onClick={() => setTab('plans')} variant="secondary">Browse Plans</Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {activeInvestments.map(inv => {
                const total = differenceInDays(new Date(inv.endDate), new Date(inv.startDate));
                const elapsed = differenceInDays(new Date(), new Date(inv.startDate));
                const progress = Math.min(100, (elapsed / total) * 100);

                return (
                  <Card key={inv.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-white">{inv.plan.name} Plan</h4>
                        <Badge status={inv.status}>{inv.status}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{formatCurrency(inv.amount)}</p>
                        <p className="text-xs text-emerald-400">Est. {formatCurrency(inv.expectedReturn)}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Started {format(new Date(inv.startDate), 'MMM d')}</span>
                      <span>Ends {format(new Date(inv.endDate), 'MMM d, yyyy')}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {pastInvestments.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-3">Past Investments</h3>
              <Card className="overflow-hidden">
                <table className="table-base">
                  <thead><tr><th>Plan</th><th>Amount</th><th>Expected Return</th><th>Status</th><th>End Date</th></tr></thead>
                  <tbody>
                    {pastInvestments.map(inv => (
                      <tr key={inv.id}>
                        <td className="text-white">{inv.plan.name}</td>
                        <td className="tabular-nums">{formatCurrency(inv.amount)}</td>
                        <td className="tabular-nums text-emerald-400">{formatCurrency(inv.expectedReturn)}</td>
                        <td><Badge status={inv.status}>{inv.status}</Badge></td>
                        <td className="text-gray-500 text-xs">{formatDate(inv.endDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Investment Modal */}
      <Modal isOpen={!!selectedPlan} onClose={() => setSelectedPlan(null)} title={`Invest in ${selectedPlan?.name} Plan`}>
        {selectedPlan && (
          <div className="space-y-5">
            <div className="bg-white/3 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="text-white">{selectedPlan.durationDays} days</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Est. Return</span><span className="text-emerald-400">{selectedPlan.estimatedReturn}% (projection only)</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Risk Level</span><span className={getRiskColor(selectedPlan.riskLevel)}>{selectedPlan.riskLevel}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Your Balance</span><span className="text-gold-400 font-medium">{formatCurrency(balance)}</span></div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">
                Investment Amount (${selectedPlan.minDeposit} – ${selectedPlan.maxDeposit})
              </label>
              <input
                type="number"
                placeholder={`Min $${selectedPlan.minDeposit}`}
                min={selectedPlan.minDeposit}
                max={Math.min(selectedPlan.maxDeposit, balance)}
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
              />
            </div>

            {parseFloat(amount) > 0 && (
              <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-xl p-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">You invest</span>
                  <span className="text-white">{formatCurrency(parseFloat(amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated maturity value*</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatCurrency(parseFloat(amount) + (parseFloat(amount) * selectedPlan.estimatedReturn / 100))}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">*Estimated projection. Not a guaranteed return.</p>
              </div>
            )}

            <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-3 text-red-300/80 text-xs flex gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Cryptocurrency investments involve significant risk. You may lose some or all of your invested amount. This is not financial advice.
            </div>

            <Button onClick={handleInvest} loading={loading} className="w-full justify-center">
              Confirm Investment
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
