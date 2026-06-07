// src/app/api/admin/deposits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendDepositApprovedEmail, sendDepositRejectedEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const where = status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' } : {};

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deposit.count({ where }),
    ]);

    return NextResponse.json({ deposits, total, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { depositId, action, adminNote } = await req.json();

    if (!depositId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { user: true },
    });

    if (!deposit) return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    if (deposit.status !== 'PENDING') {
      return NextResponse.json({ error: 'Deposit already processed' }, { status: 409 });
    }

    if (action === 'approve') {
      await prisma.$transaction([
        prisma.deposit.update({
          where: { id: depositId },
          data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: admin.id, adminNote },
        }),
        prisma.user.update({
          where: { id: deposit.userId },
          data: {
            balance: { increment: deposit.amount },
            totalDeposited: { increment: deposit.amount },
          },
        }),
        prisma.transaction.create({
          data: {
            userId: deposit.userId,
            type: 'DEPOSIT',
            amount: deposit.amount,
            description: `Deposit approved (${deposit.coin})`,
            reference: deposit.txHash,
            balanceBefore: deposit.user.balance,
            balanceAfter: deposit.user.balance + deposit.amount,
          },
        }),
        prisma.notification.create({
          data: {
            userId: deposit.userId,
            type: 'DEPOSIT_APPROVED',
            title: 'Deposit Approved',
            message: `Your deposit of $${deposit.amount} (${deposit.coin}) has been approved and added to your balance.`,
          },
        }),
      ]);

      sendDepositApprovedEmail(deposit.user.email, deposit.user.firstName, deposit.amount, deposit.coin).catch(console.error);
    } else {
      await prisma.$transaction([
        prisma.deposit.update({
          where: { id: depositId },
          data: { status: 'REJECTED', adminNote },
        }),
        prisma.notification.create({
          data: {
            userId: deposit.userId,
            type: 'DEPOSIT_REJECTED',
            title: 'Deposit Rejected',
            message: `Your deposit of $${deposit.amount} was rejected. ${adminNote || 'Contact support for details.'}`,
          },
        }),
      ]);

      sendDepositRejectedEmail(deposit.user.email, deposit.user.firstName, deposit.amount, adminNote).catch(console.error);
    }

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: `DEPOSIT_${action.toUpperCase()}D`,
        entity: 'Deposit',
        entityId: depositId,
        details: { amount: deposit.amount, coin: deposit.coin, adminNote },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
