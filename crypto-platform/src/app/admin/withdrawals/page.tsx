// src/app/admin/withdrawals/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AdminLayout from '@/components/admin/Layout';
import AdminWithdrawalsClient from './AdminWithdrawalsClient';

export default async function AdminWithdrawalsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/login');

  const withdrawals = await prisma.withdrawal.findMany({
    include: { user: { select: { firstName: true, lastName: true, email: true, balance: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminLayout>
      <AdminWithdrawalsClient withdrawals={JSON.parse(JSON.stringify(withdrawals))} />
    </AdminLayout>
  );
}
