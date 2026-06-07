// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function generateVerifyToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function calculateReturn(amount: number, returnPercentage: number): number {
  return amount + (amount * returnPercentage) / 100;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    APPROVED: 'text-emerald-400 bg-emerald-400/10',
    REJECTED: 'text-red-400 bg-red-400/10',
    ACTIVE: 'text-blue-400 bg-blue-400/10',
    COMPLETED: 'text-emerald-400 bg-emerald-400/10',
    CANCELLED: 'text-gray-400 bg-gray-400/10',
    PROCESSING: 'text-purple-400 bg-purple-400/10',
  };
  return colors[status] || 'text-gray-400 bg-gray-400/10';
}

export function getRiskColor(risk: string): string {
  const colors: Record<string, string> = {
    LOW: 'text-emerald-400',
    MEDIUM: 'text-yellow-400',
    HIGH: 'text-orange-400',
    VERY_HIGH: 'text-red-400',
  };
  return colors[risk] || 'text-gray-400';
}

export function getCoinIcon(coin: string): string {
  const icons: Record<string, string> = {
    BTC: '₿',
    ETH: 'Ξ',
    USDT_TRC20: '₮',
    USDT_ERC20: '₮',
    BNB: 'B',
  };
  return icons[coin] || '?';
}

export function getCoinName(coin: string): string {
  const names: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USDT_TRC20: 'USDT (TRC20)',
    USDT_ERC20: 'USDT (ERC20)',
    BNB: 'BNB',
  };
  return names[coin] || coin;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
