// src/app/deposit/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/dashboard/Layout';
import DepositClient from './DepositClient';

export default async function DepositPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [deposits, wallets, unreadCount, fullUser] = await Promise.all([
    prisma.deposit.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.walletAddress.findMany({ where: { isActive: true } }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { firstName: true, lastName: true, email: true, role: true, balance: true } }),
  ]);

  return (
    <DashboardLayout user={fullUser!} unreadCount={unreadCount}>
      <DepositClient
        deposits={JSON.parse(JSON.stringify(deposits))}
        wallets={JSON.parse(JSON.stringify(wallets))}
      />
    </DashboardLayout>
  );
}
