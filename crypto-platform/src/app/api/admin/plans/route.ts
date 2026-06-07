// src/app/api/admin/plans/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { investmentPlanSchema } from '@/lib/validations';

export async function GET() {
  try {
    await requireAdmin();
    const plans = await prisma.investmentPlan.findMany({
      where: { status: { not: 'DELETED' } },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { investments: true } } },
    });
    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = investmentPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const plan = await prisma.investmentPlan.create({ data: parsed.data });
    return NextResponse.json({ plan }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const { planId, action, ...data } = await req.json();
    if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 });

    let updateData: Record<string, unknown> = {};

    if (action === 'pause') updateData = { status: 'PAUSED' };
    else if (action === 'activate') updateData = { status: 'ACTIVE' };
    else if (action === 'delete') updateData = { status: 'DELETED' };
    else {
      const parsed = investmentPlanSchema.partial().safeParse(data);
      if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
      updateData = parsed.data;
    }

    const plan = await prisma.investmentPlan.update({ where: { id: planId }, data: updateData });
    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
