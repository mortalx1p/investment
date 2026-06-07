// src/components/ui/index.tsx
'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, X } from 'lucide-react';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children, variant = 'primary', size = 'md', loading, className, disabled, ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold hover:from-gold-400 hover:to-gold-500 shadow-glow-gold',
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20',
    danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 rounded-xl',
    lg: 'px-7 py-3.5 text-lg rounded-xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        )}
        <input
          className={cn(
            'w-full bg-obsidian-950/60 border rounded-xl px-4 py-3 text-white placeholder-gray-500',
            'focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all duration-200',
            error ? 'border-red-500/50' : 'border-white/10',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <select
        className={cn(
          'w-full bg-obsidian-950/60 border rounded-xl px-4 py-3 text-white',
          'focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all duration-200',
          error ? 'border-red-500/50' : 'border-white/10',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-obsidian-950">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// Badge
interface BadgeProps {
  status: string;
  children?: React.ReactNode;
}

export function Badge({ status, children }: BadgeProps) {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    APPROVED: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    REJECTED: 'bg-red-400/10 text-red-400 border-red-400/20',
    ACTIVE: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    COMPLETED: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    CANCELLED: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
    PROCESSING: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    SUSPENDED: 'bg-red-400/10 text-red-400 border-red-400/20',
    LOW: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    MEDIUM: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    HIGH: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
    VERY_HIGH: 'bg-red-400/10 text-red-400 border-red-400/20',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      styles[status] || 'bg-gray-400/10 text-gray-400 border-gray-400/20'
    )}>
      {children || status}
    </span>
  );
}

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-obsidian-950 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Card
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[#1a1d24] border border-white/6 rounded-2xl', className)}>
      {children}
    </div>
  );
}

// Stat Card
export function StatCard({
  label, value, icon, change, color = 'gold',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  color?: 'gold' | 'emerald' | 'blue' | 'red';
}) {
  const colors = {
    gold: 'text-gold-400 bg-gold-400/10',
    emerald: 'text-emerald-400 bg-emerald-400/10',
    blue: 'text-blue-400 bg-blue-400/10',
    red: 'text-red-400 bg-red-400/10',
  };
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
          {change && <p className="text-xs text-gray-500 mt-1">{change}</p>}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors[color])}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// Empty State
export function EmptyState({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-gray-500">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-xs">{description}</p>
    </div>
  );
}

// Risk Warning Banner
export function RiskWarning() {
  return (
    <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 text-amber-300/80 text-sm flex gap-3">
      <span className="text-xl flex-shrink-0">⚠️</span>
      <p>
        <strong className="text-amber-300">Risk Notice:</strong>{' '}
        Cryptocurrency investments involve significant risk. Returns are not guaranteed. 
        Past performance does not indicate future results. Please conduct your own research before investing.
      </p>
    </div>
  );
}

// Loading Spinner
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return <Loader2 className={cn('animate-spin text-gold-500', sizes[size])} />;
}

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <textarea
        className={cn(
          'w-full bg-obsidian-950/60 border rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none',
          'focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all duration-200',
          error ? 'border-red-500/50' : 'border-white/10',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
