// src/app/api/deposits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { depositSchema } from '@/lib/validations';

export async function GET() {
  try {
    const user = await requireAuth();
    const deposits = await prisma.deposit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ deposits });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = depositSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { coin, amount, txHash } = parsed.data;

    // Check for duplicate transaction hash
    const existing = await prisma.deposit.findFirst({ where: { txHash } });
    if (existing) {
      return NextResponse.json({ error: 'Transaction hash already submitted' }, { status: 409 });
    }

    // Get wallet address for this coin
    const wallet = await prisma.walletAddress.findUnique({ where: { coin } });
    if (!wallet) {
      return NextResponse.json({ error: 'Coin not supported currently' }, { status: 400 });
    }

    const deposit = await prisma.deposit.create({
      data: {
        userId: user.id,
        coin,
        amount,
        txHash,
        walletAddress: wallet.address,
        status: 'PENDING',
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'GENERAL',
        title: 'Deposit Submitted',
        message: `Your deposit of $${amount} (${coin}) is pending review. We'll notify you once approved.`,
      },
    });

    return NextResponse.json({ deposit }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
