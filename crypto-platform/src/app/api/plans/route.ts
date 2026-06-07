// src/app/api/plans/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const plans = await prisma.investmentPlan.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { minDeposit: 'asc' },
    });
    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}
