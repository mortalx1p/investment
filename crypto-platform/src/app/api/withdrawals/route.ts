// src/app/api/withdrawals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { withdrawalSchema } from '@/lib/validations';

export async function GET() {
  try {
    const user = await requireAuth();
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ withdrawals });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!fullUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const parsed = withdrawalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { coin, amount, walletAddress } = parsed.data;

    if (fullUser.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Get minimum withdrawal from settings
    const minSetting = await prisma.adminSetting.findUnique({ where: { key: 'min_withdrawal' } });
    const minWithdrawal = parseFloat(minSetting?.value || '50');

    if (amount < minWithdrawal) {
      return NextResponse.json({ error: `Minimum withdrawal is $${minWithdrawal}` }, { status: 400 });
    }

    // Check for pending withdrawal
    const pendingWithdrawal = await prisma.withdrawal.findFirst({
      where: { userId: user.id, status: 'PENDING' },
    });
    if (pendingWithdrawal) {
      return NextResponse.json({ error: 'You already have a pending withdrawal request' }, { status: 409 });
    }

    // Deduct from balance and create withdrawal
    const [withdrawal] = await prisma.$transaction([
      prisma.withdrawal.create({
        data: {
          userId: user.id,
          coin,
          amount,
          walletAddress,
          status: 'PENDING',
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'WITHDRAWAL',
          amount: -amount,
          description: `Withdrawal request (${coin})`,
          balanceBefore: fullUser.balance,
          balanceAfter: fullUser.balance - amount,
        },
      }),
    ]);

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'GENERAL',
        title: 'Withdrawal Requested',
        message: `Your withdrawal of $${amount} (${coin}) is under review. You'll be notified once processed.`,
      },
    });

    return NextResponse.json({ withdrawal }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Withdrawal request failed' }, { status: 500 });
  }
}
