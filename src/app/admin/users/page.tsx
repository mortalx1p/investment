// src/app/admin/users/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AdminLayout from '@/components/admin/Layout';
import AdminUsersClient from './AdminUsersClient';

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/login');

  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, firstName: true, lastName: true, phone: true, country: true,
      status: true, balance: true, totalDeposited: true, totalWithdrawn: true,
      createdAt: true, lastLoginAt: true, emailVerified: true,
      _count: { select: { deposits: true, withdrawals: true, investments: true } },
    },
  });

  return (
    <AdminLayout>
      <AdminUsersClient users={JSON.parse(JSON.stringify(users))} />
    </AdminLayout>
  );
}
