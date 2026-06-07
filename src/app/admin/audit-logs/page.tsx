// src/app/admin/audit-logs/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AdminLayout from '@/components/admin/Layout';
import AuditLogsClient from './AuditLogsClient';

export default async function AuditLogsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/login');

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });

  return (
    <AdminLayout>
      <AuditLogsClient logs={JSON.parse(JSON.stringify(logs))} />
    </AdminLayout>
  );
}
