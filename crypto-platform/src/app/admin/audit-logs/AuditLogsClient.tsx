// src/app/admin/audit-logs/AuditLogsClient.tsx
'use client';
import React, { useState } from 'react';
import { Search, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';

interface Log {
  id: string; action: string; entity: string; entityId?: string;
  details?: Record<string, unknown>; ipAddress?: string; createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

const ACTION_COLORS: Record<string, string> = {
  USER_REGISTERED: 'text-blue-400 bg-blue-400/10',
  USER_LOGIN: 'text-emerald-400 bg-emerald-400/10',
  DEPOSIT_APPROVED: 'text-emerald-400 bg-emerald-400/10',
  DEPOSIT_REJECTD: 'text-red-400 bg-red-400/10',
  WITHDRAWAL_APPROVED: 'text-emerald-400 bg-emerald-400/10',
  WITHDRAWAL_REJECTED: 'text-red-400 bg-red-400/10',
  ADMIN_USER_SUSPEND: 'text-orange-400 bg-orange-400/10',
  ADMIN_USER_ACTIVATE: 'text-emerald-400 bg-emerald-400/10',
  WALLET_ADDRESS_UPDATED: 'text-purple-400 bg-purple-400/10',
  SETTINGS_UPDATED: 'text-yellow-400 bg-yellow-400/10',
};

export default function AuditLogsClient({ logs }: { logs: Log[] }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = logs.filter(log =>
    !search ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.user?.email.toLowerCase().includes(search.toLowerCase()) ||
    log.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Audit Logs</h1>
        <p className="text-gray-400 text-sm">Complete trail of all admin and system actions</p>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by action, user, or entity..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-obsidian-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-all text-sm" />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Activity className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No logs found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-white/5">
            {filtered.map(log => (
              <div key={log.id} className="hover:bg-white/2 transition-colors">
                <div
                  className="flex items-center gap-4 px-5 py-3.5 cursor-pointer"
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                >
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${ACTION_COLORS[log.action] || 'text-gray-400 bg-gray-400/10'}`}>
                    {log.action.replace(/_/g, ' ')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-white">{log.entity}</span>
                      {log.user && (
                        <span className="text-xs text-gray-500">by {log.user.firstName} {log.user.lastName}</span>
                      )}
                    </div>
                    {log.ipAddress && <p className="text-xs text-gray-600">IP: {log.ipAddress}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-xs text-gray-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</p>
                    {log.details && (
                      expanded === log.id
                        ? <ChevronDown className="w-4 h-4 text-gray-400" />
                        : <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {expanded === log.id && log.details && (
                  <div className="px-5 pb-4">
                    <div className="bg-obsidian-950/60 border border-white/8 rounded-xl p-4">
                      <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <p className="text-center text-xs text-gray-600">Showing last 200 entries · Logs are retained permanently</p>
    </div>
  );
}
