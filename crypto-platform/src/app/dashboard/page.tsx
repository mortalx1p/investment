// src/app/dashboard/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/dashboard/Layout';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [investments, transactions, notifications, deposits] = await Promise.all([
    prisma.investment.findMany({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { plan: true },
      take: 5,
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    prisma.deposit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      role: true, balance: true, totalDeposited: true, totalWithdrawn: true,
    },
  });

  return (
    <DashboardLayout
      user={fullUser ? { ...fullUser, balance: fullUser.balance } : undefined}
      unreadCount={notifications}
    >
      <DashboardClient
        user={fullUser!}
        investments={JSON.parse(JSON.stringify(investments))}
        transactions={JSON.parse(JSON.stringify(transactions))}
        deposits={JSON.parse(JSON.stringify(deposits))}
      />
    </DashboardLayout>
  );
}
