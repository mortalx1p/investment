// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers, activeUsers,
      totalDeposits, pendingDeposits, approvedDepositsSum,
      totalWithdrawals, pendingWithdrawals, approvedWithdrawalsSum,
      totalInvestments, activeInvestments,
      recentUsers, recentDeposits,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'USER', status: 'ACTIVE' } }),
      prisma.deposit.count(),
      prisma.deposit.count({ where: { status: 'PENDING' } }),
      prisma.deposit.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
      prisma.withdrawal.count(),
      prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      prisma.withdrawal.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
      prisma.investment.count(),
      prisma.investment.count({ where: { status: 'ACTIVE' } }),
      prisma.user.findMany({
        where: { role: 'USER' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, status: true },
      }),
      prisma.deposit.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
    ]);

    return NextResponse.json({
      users: { total: totalUsers, active: activeUsers },
      deposits: {
        total: totalDeposits,
        pending: pendingDeposits,
        approvedAmount: approvedDepositsSum._sum.amount || 0,
      },
      withdrawals: {
        total: totalWithdrawals,
        pending: pendingWithdrawals,
        approvedAmount: approvedWithdrawalsSum._sum.amount || 0,
      },
      investments: { total: totalInvestments, active: activeInvestments },
      recentUsers,
      recentDeposits,
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
