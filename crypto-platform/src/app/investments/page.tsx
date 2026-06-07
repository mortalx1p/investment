// src/app/investments/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/dashboard/Layout';
import InvestmentsClient from './InvestmentsClient';

export default async function InvestmentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [plans, investments, fullUser, unreadCount] = await Promise.all([
    prisma.investmentPlan.findMany({ where: { status: 'ACTIVE' }, orderBy: { minDeposit: 'asc' } }),
    prisma.investment.findMany({
      where: { userId: user.id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findUnique({ where: { id: user.id }, select: { firstName: true, lastName: true, email: true, role: true, balance: true } }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return (
    <DashboardLayout user={fullUser!} unreadCount={unreadCount}>
      <InvestmentsClient
        plans={JSON.parse(JSON.stringify(plans))}
        investments={JSON.parse(JSON.stringify(investments))}
        balance={fullUser?.balance || 0}
      />
    </DashboardLayout>
  );
}
