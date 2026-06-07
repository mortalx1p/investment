// src/app/admin/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AdminLayout from '@/components/admin/Layout';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/login');

  const [
    totalUsers, activeUsers,
    totalDeposits, pendingDeposits,
    totalWithdrawals, pendingWithdrawals,
    activeInvestments,
    depositsSum, withdrawalsSum,
    recentDeposits, recentWithdrawals,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'USER', status: 'ACTIVE' } }),
    prisma.deposit.count(),
    prisma.deposit.count({ where: { status: 'PENDING' } }),
    prisma.withdrawal.count(),
    prisma.withdrawal.count({ where: { status: 'PENDING' } }),
    prisma.investment.count({ where: { status: 'ACTIVE' } }),
    prisma.deposit.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
    prisma.withdrawal.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
    prisma.deposit.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.withdrawal.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return (
    <AdminLayout>
      <AdminDashboardClient
        stats={{
          users: { total: totalUsers, active: activeUsers },
          deposits: { total: totalDeposits, pending: pendingDeposits, totalAmount: depositsSum._sum.amount || 0 },
          withdrawals: { total: totalWithdrawals, pending: pendingWithdrawals, totalAmount: withdrawalsSum._sum.amount || 0 },
          investments: { active: activeInvestments },
        }}
        pendingDeposits={JSON.parse(JSON.stringify(recentDeposits))}
        pendingWithdrawals={JSON.parse(JSON.stringify(recentWithdrawals))}
      />
    </AdminLayout>
  );
}
