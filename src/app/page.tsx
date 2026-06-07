// src/app/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, TrendingUp, Zap, Globe, ChevronDown, Star,
  ArrowRight, Check, Lock, Activity, BarChart2, Users,
} from 'lucide-react';

const stats = [
  { label: 'Active Users', value: '24,800+', icon: Users },
  { label: 'Assets Under Management', value: '$142M+', icon: BarChart2 },
  { label: 'Countries Served', value: '80+', icon: Globe },
  { label: 'Uptime', value: '99.9%', icon: Activity },
];

const features = [
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    desc: 'Multi-layer encryption, cold storage, and 2FA protect your assets at every level.',
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: TrendingUp,
    title: 'Diverse Investment Plans',
    desc: 'Choose from multiple risk-calibrated strategies designed for various market conditions.',
    color: 'from-gold-500/20 to-gold-600/10 border-gold-500/20',
    iconColor: 'text-gold-400',
  },
  {
    icon: Zap,
    title: 'Instant Processing',
    desc: 'Deposits reviewed within 24 hours. Withdrawals processed swiftly once approved.',
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Globe,
    title: 'Global Access',
    desc: 'Accessible from 80+ countries with support for major cryptocurrencies.',
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
    iconColor: 'text-purple-400',
  },
];

const testimonials = [
  {
    name: 'Marcus A.',
    location: 'United Kingdom',
    text: 'The platform interface is intuitive and professional. I appreciate the transparent risk disclosures on every plan.',
    rating: 5,
  },
  {
    name: 'Priya S.',
    location: 'Singapore',
    text: 'Customer support is responsive and the deposit/withdrawal process is clearly documented. Good overall experience.',
    rating: 5,
  },
  {
    name: 'Carlos M.',
    location: 'Brazil',
    text: 'As someone new to crypto investing, I found the starter plan a good way to learn. The risk warnings are helpful.',
    rating: 4,
  },
];

const faqs = [
  {
    q: 'Are returns on investment guaranteed?',
    a: 'No. All estimated returns are projections based on historical market conditions. Cryptocurrency markets are volatile and returns are never guaranteed. You may lose some or all of your invested capital.',
  },
  {
    q: 'What cryptocurrencies can I deposit?',
    a: 'We currently support Bitcoin (BTC), Ethereum (ETH), USDT (TRC20 and ERC20), and Binance Coin (BNB). The wallet addresses for each coin are available on the deposit page.',
  },
  {
    q: 'How long does a deposit take to approve?',
    a: 'Deposits are typically reviewed and approved within 24 hours after the transaction has sufficient network confirmations. You will receive an email notification once approved.',
  },
  {
    q: 'Can I withdraw my funds at any time?',
    a: 'You can submit a withdrawal request from your dashboard. Withdrawals are subject to admin approval, minimum withdrawal limits, and are processed to the wallet address you provide.',
  },
  {
    q: 'Is my personal data safe?',
    a: 'We implement bank-grade security measures including encrypted data storage, secure authentication, and regular security audits to protect your personal information.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-white/8 rounded-2xl overflow-hidden cursor-pointer hover:border-gold-500/30 transition-colors duration-200"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-6">
        <h4 className="font-semibold text-white pr-4">{q}</h4>
        <ChevronDown className={`w-5 h-5 text-gold-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white overflow-x-hidden">
      {/* Ticker */}
      <div className="bg-[#111318] border-b border-white/5 py-2 overflow-hidden">
        <div className="animate-ticker flex gap-8 whitespace-nowrap" style={{ width: 'max-content' }}>
          {['BTC $67,240', 'ETH $3,450', 'BNB $612', 'USDT $1.00', 'SOL $178', 'BTC $67,240', 'ETH $3,450', 'BNB $612', 'USDT $1.00', 'SOL $178'].map((item, i) => (
            <span key={i} className="text-xs text-gray-400 font-mono flex items-center gap-2">
              <span className="text-emerald-400">●</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0d0f12]/95 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-gold-500 to-gold-700 rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-sm">CV</span>
            </div>
            <span className="font-display font-bold text-xl">
              <span className="text-gold-400">Crypto</span><span className="text-white">Vault</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#plans" className="text-sm text-gray-400 hover:text-white transition-colors">Plans</a>
            <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-xl transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold px-5 py-2.5 rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center grid-bg">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full text-gold-400 text-sm font-medium mb-8 animate-fade-in">
              <Lock className="w-4 h-4" />
              Regulated Crypto Investment Platform
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
              Invest in Crypto
              <span className="block gradient-text">With Confidence</span>
            </h1>

            <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100">
              Professional-grade cryptocurrency investment platform with transparent strategies, 
              robust security, and dedicated support. 
            </p>

            <div className="bg-amber-900/30 border border-amber-700/40 rounded-xl p-4 mb-10 text-amber-300 text-sm max-w-2xl mx-auto animate-fade-in-up delay-200">
              ⚠️ <strong>Risk Notice:</strong> Cryptocurrency investments involve significant risk. 
              Returns are not guaranteed. Invest only what you can afford to lose.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold px-8 py-4 rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all shadow-glow-gold text-lg"
              >
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#plans"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/15 text-white rounded-xl hover:bg-white/5 transition-all text-lg"
              >
                View Plans
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5 bg-[#111318]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 bg-gold-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-gold-400" />
                </div>
                <div className="text-3xl font-bold gradient-text mb-1">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">CryptoVault</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built for serious investors who demand transparency, security, and professional service.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color, iconColor }) => (
              <div
                key={title}
                className={`bg-gradient-to-br ${color} border rounded-2xl p-6 hover:scale-105 transition-transform duration-300`}
              >
                <div className={`w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center mb-4 ${iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section id="plans" className="py-24 bg-[#111318]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Investment <span className="gradient-text">Plans</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-4">
              Choose a strategy that aligns with your risk tolerance and investment goals.
            </p>
          </div>

          <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 text-amber-300 text-sm text-center mb-12 max-w-3xl mx-auto">
            ⚠️ Estimated returns are projections only. All investments carry risk. Past performance is not indicative of future results.
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Starter', min: '$100', max: '$999', duration: '30 days', return: 'Est. 8%', risk: 'LOW', features: ['Portfolio Diversification', 'Weekly Reports', 'Email Support'], featured: false },
              { name: 'Growth', min: '$1,000', max: '$4,999', duration: '60 days', return: 'Est. 18%', risk: 'MEDIUM', features: ['Diversified Portfolio', 'Daily Reports', 'Priority Support', 'Market Alerts'], featured: true },
              { name: 'Premium', min: '$5,000', max: '$24,999', duration: '90 days', return: 'Est. 35%', risk: 'HIGH', features: ['Active Management', 'Real-time Reports', 'Dedicated Manager', 'DeFi Access'], featured: false },
              { name: 'Elite', min: '$25,000', max: 'Unlimited', duration: '180 days', return: 'Est. 65%', risk: 'VERY HIGH', features: ['Custom Portfolio', 'Personal Advisor', 'Quant Strategies', 'VIP Events'], featured: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.featured
                    ? 'bg-gradient-to-br from-gold-500/20 to-gold-600/5 border-2 border-gold-500/40'
                    : 'bg-[#1a1d24] border border-white/8'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-display font-bold text-xl text-white mb-1">{plan.name}</h3>
                  <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-3 ${
                    plan.risk === 'LOW' ? 'bg-emerald-400/10 text-emerald-400' :
                    plan.risk === 'MEDIUM' ? 'bg-yellow-400/10 text-yellow-400' :
                    plan.risk === 'HIGH' ? 'bg-orange-400/10 text-orange-400' :
                    'bg-red-400/10 text-red-400'
                  }`}>
                    {plan.risk} RISK
                  </div>
                  <div className="text-2xl font-bold gradient-text mb-1">{plan.return}*</div>
                  <p className="text-xs text-gray-500">*Estimated, not guaranteed</p>
                </div>

                <div className="space-y-1 text-sm text-gray-400 mb-4">
                  <div className="flex justify-between"><span>Min Deposit</span><span className="text-white">{plan.min}</span></div>
                  <div className="flex justify-between"><span>Max Deposit</span><span className="text-white">{plan.max}</span></div>
                  <div className="flex justify-between"><span>Duration</span><span className="text-white">{plan.duration}</span></div>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-gold-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.featured
                      ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-black hover:from-gold-400 hover:to-gold-500'
                      : 'border border-white/15 text-white hover:bg-white/5'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">
              What Our <span className="gradient-text">Users Say</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#1a1d24] border border-white/8 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed italic">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-[#111318]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Ready to Start <span className="gradient-text">Investing?</span>
          </h2>
          <p className="text-gray-400 mb-4 text-lg">
            Join thousands of investors on CryptoVault. Create your account in minutes.
          </p>
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 text-amber-300 text-sm mb-8">
            By registering, you acknowledge that cryptocurrency investments carry risk and returns are not guaranteed.
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold px-10 py-4 rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all shadow-glow-gold text-lg"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/6 bg-[#111318] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-display font-bold text-xl mb-2">
                <span className="text-gold-400">Crypto</span><span className="text-white">Vault</span>
              </div>
              <p className="text-gray-500 text-sm">Professional Cryptocurrency Investment Platform</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-500 text-xs max-w-md">
                ⚠️ Cryptocurrency investments involve risk. Returns are not guaranteed. 
                Users should conduct their own research before investing. 
                CryptoVault does not provide financial advice.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 text-center text-gray-600 text-xs">
            © 2024 CryptoVault. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
