// src/app/api/investments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { investmentSchema } from '@/lib/validations';
import { addDays } from 'date-fns';

export async function GET() {
  try {
    const user = await requireAuth();
    const investments = await prisma.investment.findMany({
      where: { userId: user.id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ investments });
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
    const parsed = investmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const { planId, amount } = parsed.data;

    const plan = await prisma.investmentPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Plan not available' }, { status: 404 });
    }

    if (amount < plan.minDeposit || amount > plan.maxDeposit) {
      return NextResponse.json({
        error: `Amount must be between $${plan.minDeposit} and $${plan.maxDeposit}`,
      }, { status: 400 });
    }

    if (fullUser.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const endDate = addDays(new Date(), plan.durationDays);
    const expectedReturn = amount + (amount * plan.estimatedReturn) / 100;

    const [investment] = await prisma.$transaction([
      prisma.investment.create({
        data: {
          userId: user.id,
          planId,
          amount,
          expectedReturn,
          endDate,
          status: 'ACTIVE',
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'INVESTMENT',
          amount: -amount,
          description: `Investment in ${plan.name} plan`,
          balanceBefore: fullUser.balance,
          balanceAfter: fullUser.balance - amount,
        },
      }),
    ]);

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'INVESTMENT_STARTED',
        title: 'Investment Started',
        message: `Your $${amount} investment in the ${plan.name} plan has started. Expected maturity: ${endDate.toLocaleDateString()}.`,
      },
    });

    return NextResponse.json({ investment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Investment failed' }, { status: 500 });
  }
}
