// src/app/register/page.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Check } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';

const passwordRules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '', country: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { toast.error('Please agree to the terms'); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details) setErrors(data.details);
        else toast.error(data.error || 'Registration failed');
        return;
      }
      setDone(true);
    } catch {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
          <p className="text-gray-400 mb-6">
            We sent a verification link to <strong className="text-white">{form.email}</strong>. 
            Click the link to activate your account.
          </p>
          <Link href="/login" className="text-gold-400 hover:text-gold-300 font-medium text-sm">
            → Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] grid-bg flex items-center justify-center p-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-700 rounded-xl flex items-center justify-center">
              <span className="text-black font-black">CV</span>
            </div>
            <span className="font-display font-bold text-2xl">
              <span className="text-gold-400">Crypto</span><span className="text-white">Vault</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm">Start your investment journey today</p>
        </div>

        <div className="bg-[#1a1d24] border border-white/8 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                value={form.firstName}
                onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                icon={<User className="w-4 h-4" />}
                error={errors.firstName?.[0]}
                required
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={form.lastName}
                onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                error={errors.lastName?.[0]}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.[0]}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {passwordRules.map(({ label, test }) => (
                    <div key={label} className={`flex items-center gap-1.5 text-xs ${test(form.password) ? 'text-emerald-400' : 'text-gray-500'}`}>
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center ${test(form.password) ? 'bg-emerald-400' : 'bg-gray-700'}`}>
                        {test(form.password) && <Check className="w-2 h-2 text-black" />}
                      </div>
                      {label}
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-xs text-red-400">{errors.password[0]}</p>}
            </div>

            <Input
              label="Phone (Optional)"
              type="tel"
              placeholder="+1 234 567 8900"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              icon={<Phone className="w-4 h-4" />}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Country (Optional)</label>
              <select
                value={form.country}
                onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-all"
              >
                <option value="" className="bg-[#1a1d24]">Select country...</option>
                {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'Japan', 'Brazil', 'Other'].map(c => (
                  <option key={c} value={c} className="bg-[#1a1d24]">{c}</option>
                ))}
              </select>
            </div>

            <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 text-amber-300/80 text-xs">
              ⚠️ Cryptocurrency investments involve significant risk. Returns are not guaranteed. Invest only what you can afford to lose.
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 accent-yellow-500"
              />
              <span className="text-xs text-gray-400">
                I understand that cryptocurrency investments carry risk, returns are not guaranteed, and I am investing at my own risk. I agree to the platform's terms.
              </span>
            </label>

            <Button type="submit" loading={loading} disabled={!agreed} className="w-full justify-center">
              Create Account <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-gold-400 hover:text-gold-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
