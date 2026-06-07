// src/components/dashboard/Layout.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, TrendingUp,
  History, Bell, User, LogOut, Menu, X, ChevronRight, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/deposit', icon: ArrowDownToLine, label: 'Deposit' },
  { href: '/withdraw', icon: ArrowUpFromLine, label: 'Withdraw' },
  { href: '/investments', icon: TrendingUp, label: 'Investments' },
  { href: '/transactions', icon: History, label: 'Transactions' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/profile', icon: User, label: 'Profile' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: { firstName: string; lastName: string; email: string; role: string; balance: number };
  unreadCount?: number;
}

export default function DashboardLayout({ children, user, unreadCount = 0 }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    } finally {
      setLoggingOut(false);
    }
  };

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#0d0f12] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-[#111318] border-r border-white/6 flex flex-col transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-white/6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-gold-500 to-gold-700 rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-sm">CV</span>
            </div>
            <span className="font-display font-bold text-lg">
              <span className="text-gold-400">Crypto</span>
              <span className="text-white">Vault</span>
            </span>
          </Link>
        </div>

        {/* Balance */}
        {user && (
          <div className="mx-4 mt-4 p-4 bg-gradient-to-br from-gold-500/10 to-gold-600/5 border border-gold-500/20 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Available Balance</p>
            <p className="text-xl font-bold text-white tabular-nums">
              ${user.balance.toFixed(2)}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-gold-400')} />
                <span className="text-sm font-medium">{label}</span>
                {label === 'Notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-gold-500 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {isActive && <ChevronRight className="ml-auto w-4 h-4 text-gold-400/50" />}
              </Link>
            );
          })}

          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-purple-400 hover:bg-purple-400/10 transition-all duration-200 mt-4 border border-purple-400/20"
            >
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* User info + logout */}
        {user && (
          <div className="p-4 border-t border-white/6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-sm">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>{loggingOut ? 'Logging out...' : 'Sign Out'}</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#111318]/95 backdrop-blur-md border-b border-white/6 px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="font-display font-bold text-lg">
            <span className="text-gold-400">Crypto</span>
            <span className="text-white">Vault</span>
          </Link>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Link href="/notifications" className="relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute -top-1 -right-1 bg-gold-500 text-black text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </Link>
            )}
            <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Risk notice - legal */}
        <div className="bg-amber-900/10 border-b border-amber-700/20 px-6 py-2 text-center">
          <p className="text-xs text-amber-400/70">
            ⚠️ Cryptocurrency investments involve risk. Returns are not guaranteed. 
            Please conduct your own research before investing.
          </p>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
