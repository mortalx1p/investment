// src/app/api/admin/withdrawals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendWithdrawalApprovedEmail, sendWithdrawalRejectedEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const where = status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' } : {};

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        include: { user: { select: { firstName: true, lastName: true, email: true, balance: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawal.count({ where }),
    ]);

    return NextResponse.json({ withdrawals, total, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { withdrawalId, action, adminNote, txHash } = await req.json();

    if (!withdrawalId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (withdrawal.status !== 'PENDING') {
      return NextResponse.json({ error: 'Already processed' }, { status: 409 });
    }

    if (action === 'approve') {
      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: 'APPROVED',
            processedAt: new Date(),
            processedBy: admin.id,
            adminNote,
            txHash,
          },
        }),
        prisma.user.update({
          where: { id: withdrawal.userId },
          data: { totalWithdrawn: { increment: withdrawal.amount } },
        }),
        prisma.notification.create({
          data: {
            userId: withdrawal.userId,
            type: 'WITHDRAWAL_APPROVED',
            title: 'Withdrawal Approved',
            message: `Your withdrawal of $${withdrawal.amount} (${withdrawal.coin}) has been approved and processed.`,
          },
        }),
      ]);

      sendWithdrawalApprovedEmail(withdrawal.user.email, withdrawal.user.firstName, withdrawal.amount, withdrawal.coin).catch(console.error);
    } else {
      // Return funds to user balance
      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: 'REJECTED', adminNote },
        }),
        prisma.user.update({
          where: { id: withdrawal.userId },
          data: { balance: { increment: withdrawal.amount } },
        }),
        prisma.transaction.create({
          data: {
            userId: withdrawal.userId,
            type: 'RETURN',
            amount: withdrawal.amount,
            description: `Withdrawal rejected — funds returned`,
            balanceBefore: withdrawal.user.balance,
            balanceAfter: withdrawal.user.balance + withdrawal.amount,
          },
        }),
        prisma.notification.create({
          data: {
            userId: withdrawal.userId,
            type: 'WITHDRAWAL_REJECTED',
            title: 'Withdrawal Rejected',
            message: `Your withdrawal of $${withdrawal.amount} was rejected. Funds returned to your balance. ${adminNote || ''}`,
          },
        }),
      ]);

      sendWithdrawalRejectedEmail(withdrawal.user.email, withdrawal.user.firstName, withdrawal.amount, adminNote).catch(console.error);
    }

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: `WITHDRAWAL_${action.toUpperCase()}D`,
        entity: 'Withdrawal',
        entityId: withdrawalId,
        details: { amount: withdrawal.amount, coin: withdrawal.coin },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
