// src/app/admin/deposits/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AdminLayout from '@/components/admin/Layout';
import AdminDepositsClient from './AdminDepositsClient';

export default async function AdminDepositsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/login');

  const deposits = await prisma.deposit.findMany({
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminLayout>
      <AdminDepositsClient deposits={JSON.parse(JSON.stringify(deposits))} />
    </AdminLayout>
  );
}
