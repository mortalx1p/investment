// src/app/profile/ProfileClient.tsx
'use client';
import React, { useState } from 'react';
import { User, Lock, Shield, Calendar, Mail, Phone, Globe, CheckCircle } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string; firstName: string; lastName: string; email: string; phone?: string;
  country?: string; role: string; status: string; balance: number; totalDeposited: number;
  totalWithdrawn: number; emailVerified: boolean; createdAt: string; lastLoginAt?: string;
}

export default function ProfileClient({ user }: { user: UserProfile }) {
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
  const [profile, setProfile] = useState({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || '', country: user.country || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'password', currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Account Settings</h1>
        <p className="text-gray-400 text-sm">Manage your profile and security preferences</p>
      </div>

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-700 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-xl">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                {user.status}
              </span>
              {user.emailVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/6">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Balance</p>
            <p className="font-bold text-gold-400">{formatCurrency(user.balance)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Total Deposited</p>
            <p className="font-bold text-emerald-400">{formatCurrency(user.totalDeposited)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Total Withdrawn</p>
            <p className="font-bold text-white">{formatCurrency(user.totalWithdrawn)}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        {[{ key: 'info', label: 'Personal Info', icon: User }, { key: 'security', label: 'Security', icon: Lock }].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as 'info' | 'security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key ? 'bg-gold-500/20 text-gold-400' : 'text-gray-400 hover:text-white'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-gold-400" /> Personal Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="First Name" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} />
            <Input label="Last Name" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </label>
            <input value={user.email} disabled className="w-full bg-obsidian-950/60 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
          </div>
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 234 567 8900"
            value={profile.phone}
            onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
            icon={<Phone className="w-4 h-4" />}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Country
            </label>
            <select
              value={profile.country}
              onChange={e => setProfile(p => ({ ...p, country: e.target.value }))}
              className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-all"
            >
              <option value="" className="bg-[#1a1d24]">Select country...</option>
              {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'Japan', 'Brazil', 'Other'].map(c => (
                <option key={c} value={c} className="bg-[#1a1d24]">{c}</option>
              ))}
            </select>
          </div>

          {user.lastLoginAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-white/5">
              <Calendar className="w-4 h-4" />
              Last login: {formatDateTime(user.lastLoginAt)} · Member since {new Date(user.createdAt).getFullYear()}
            </div>
          )}

          <Button onClick={saveProfile} loading={loading} className="w-full justify-center">
            Save Changes
          </Button>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-400" /> Change Password
          </h3>
          <Input
            label="Current Password"
            type="password"
            placeholder="Your current password"
            value={passwords.currentPassword}
            onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
            icon={<Lock className="w-4 h-4" />}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Min. 8 characters"
            value={passwords.newPassword}
            onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
            icon={<Lock className="w-4 h-4" />}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            value={passwords.confirmPassword}
            onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
            icon={<Lock className="w-4 h-4" />}
          />
          <Button onClick={changePassword} loading={loading} className="w-full justify-center">
            Update Password
          </Button>
        </Card>
      )}
    </div>
  );
}
