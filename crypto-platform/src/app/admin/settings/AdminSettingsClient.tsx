// src/app/admin/settings/AdminSettingsClient.tsx
'use client';
import React, { useState } from 'react';
import { Settings, Save, Plus, X } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Setting { id: string; key: string; value: string; label: string; updatedAt: string; }

const SETTING_LABELS: Record<string, { label: string; description: string; type: string }> = {
  site_name:         { label: 'Site Name',              description: 'Platform display name',                   type: 'text' },
  site_email:        { label: 'Contact Email',           description: 'Admin contact email',                     type: 'email' },
  min_withdrawal:    { label: 'Min Withdrawal (USD)',    description: 'Minimum amount users can withdraw',        type: 'number' },
  withdrawal_fee:    { label: 'Withdrawal Fee (%)',      description: 'Percentage fee applied to withdrawals',    type: 'number' },
  maintenance_mode:  { label: 'Maintenance Mode',       description: '"true" to enable, "false" to disable',    type: 'text' },
};

export default function AdminSettingsClient({ settings }: { settings: Setting[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map(s => [s.key, s.value]))
  );
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = Object.entries(values).map(([key, value]) => ({ key, value }));
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload }),
      });
      if (!res.ok) { toast.error('Save failed'); return; }
      toast.success('Settings saved successfully');
      router.refresh();
    } catch {
      toast.error('Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSetting = async () => {
    if (!newKey || !newValue || !newLabel) { toast.error('Fill all fields'); return; }
    const cleanKey = newKey.toLowerCase().replace(/\s+/g, '_');
    setValues(p => ({ ...p, [cleanKey]: newValue }));
    setNewKey(''); setNewValue(''); setNewLabel('');
    toast.success('Setting added — click Save to persist');
  };

  // Group settings: known ones first, then extras
  const knownKeys = Object.keys(SETTING_LABELS);
  const allKeys = Array.from(new Set([...knownKeys, ...Object.keys(values)]));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">System Settings</h1>
          <p className="text-gray-400 text-sm">Configure platform-wide settings</p>
        </div>
        <Button onClick={handleSave} loading={loading}>
          <Save className="w-4 h-4" /> Save All
        </Button>
      </div>

      <Card className="p-6 space-y-5">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-gold-400" /> Platform Settings
        </h3>

        {allKeys.map(key => {
          const config = SETTING_LABELS[key];
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">
                {config?.label || key}
                {config?.description && <span className="text-gray-500 font-normal ml-2">— {config.description}</span>}
              </label>
              <input
                type={config?.type || 'text'}
                value={values[key] || ''}
                onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
                className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
              />
            </div>
          );
        })}
      </Card>

      {/* Add Custom Setting */}
      <Card className="p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-gold-400" /> Add Custom Setting
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Key (snake_case)" placeholder="my_setting" value={newKey} onChange={e => setNewKey(e.target.value)} />
            <Input label="Label" placeholder="Display name" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
          </div>
          <Input label="Value" placeholder="Setting value" value={newValue} onChange={e => setNewValue(e.target.value)} />
          <Button onClick={handleAddSetting} variant="secondary" size="sm">
            <Plus className="w-4 h-4" /> Add Setting
          </Button>
        </div>
      </Card>

      <Button onClick={handleSave} loading={loading} className="w-full justify-center">
        <Save className="w-4 h-4" /> Save All Settings
      </Button>
    </div>
  );
}
