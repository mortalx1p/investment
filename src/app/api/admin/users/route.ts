// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const where = {
      role: 'USER' as const,
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status: status as 'ACTIVE' | 'SUSPENDED' | 'PENDING' }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          status: true, balance: true, totalDeposited: true, totalWithdrawn: true,
          createdAt: true, lastLoginAt: true, emailVerified: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { userId, action, amount } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    let updateData: Record<string, unknown> = {};

    if (action === 'suspend') updateData = { status: 'SUSPENDED' };
    else if (action === 'activate') updateData = { status: 'ACTIVE' };
    else if (action === 'adjust_balance' && amount !== undefined) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const newBalance = Math.max(0, user.balance + amount);
      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { balance: newBalance } }),
        prisma.transaction.create({
          data: {
            userId,
            type: 'BONUS',
            amount,
            description: `Balance adjustment by admin`,
            balanceBefore: user.balance,
            balanceAfter: newBalance,
          },
        }),
      ]);

      await prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: 'ADMIN_BALANCE_ADJUSTMENT',
          entity: 'User',
          entityId: userId,
          details: { amount, newBalance },
        },
      });

      return NextResponse.json({ success: true });
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({ where: { id: userId }, data: updateData });
      await prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: `ADMIN_USER_${action.toUpperCase()}`,
          entity: 'User',
          entityId: userId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
