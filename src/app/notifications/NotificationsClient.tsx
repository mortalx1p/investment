// src/app/notifications/NotificationsClient.tsx
'use client';
import React, { useState } from 'react';
import { Bell, CheckCheck, Check } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string; type: string; title: string; message: string; read: boolean; createdAt: string;
}

const typeIcons: Record<string, string> = {
  DEPOSIT_APPROVED: '✅',
  DEPOSIT_REJECTED: '❌',
  WITHDRAWAL_APPROVED: '✅',
  WITHDRAWAL_REJECTED: '❌',
  INVESTMENT_STARTED: '📈',
  INVESTMENT_COMPLETED: '🎉',
  GENERAL: '🔔',
};

export default function NotificationsClient({ notifications, unreadCount }: { notifications: Notification[]; unreadCount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [localNotifs, setLocalNotifs] = useState(notifications);

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setLocalNotifs(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
      router.refresh();
    } catch {
      toast.error('Failed to mark as read');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setLocalNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Notifications</h1>
          {unreadCount > 0 && <p className="text-gold-400 text-sm">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" loading={loading} onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {localNotifs.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No notifications yet</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {localNotifs.map(notif => (
            <div
              key={notif.id}
              className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:border-white/15 ${
                notif.read ? 'bg-[#1a1d24] border-white/6' : 'bg-gold-500/5 border-gold-500/20'
              }`}
              onClick={() => !notif.read && markRead(notif.id)}
            >
              <div className="text-2xl flex-shrink-0 mt-0.5">
                {typeIcons[notif.type] || '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-semibold text-sm ${notif.read ? 'text-gray-300' : 'text-white'}`}>
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-gold-400 flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                <p className="text-xs text-gray-600 mt-2">{formatDateTime(notif.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
