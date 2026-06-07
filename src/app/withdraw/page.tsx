// src/app/withdraw/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/dashboard/Layout';
import WithdrawClient from './WithdrawClient';

export default async function WithdrawPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [withdrawals, fullUser, settings, unreadCount] = await Promise.all([
    prisma.withdrawal.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { firstName: true, lastName: true, email: true, role: true, balance: true } }),
    prisma.adminSetting.findMany({ where: { key: { in: ['min_withdrawal', 'withdrawal_fee'] } } }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  const minWithdrawal = parseFloat(settings.find((s: { key: string; value: string }) => s.key === 'min_withdrawal')?.value || '50');
  const withdrawalFee = parseFloat(settings.find((s: { key: string; value: string }) => s.key === 'withdrawal_fee')?.value || '2.5');

  return (
    <DashboardLayout user={fullUser!} unreadCount={unreadCount}>
      <WithdrawClient
        balance={fullUser?.balance || 0}
        withdrawals={JSON.parse(JSON.stringify(withdrawals))}
        minWithdrawal={minWithdrawal}
        withdrawalFee={withdrawalFee}
      />
    </DashboardLayout>
  );
}
