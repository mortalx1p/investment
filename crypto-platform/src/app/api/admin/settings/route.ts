// src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const settings = await prisma.adminSetting.findMany({ orderBy: { key: 'asc' } });
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { settings } = await req.json();

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await Promise.all(
      settings.map(({ key, value }: { key: string; value: string }) =>
        prisma.adminSetting.upsert({
          where: { key },
          update: { value, updatedBy: admin.id },
          create: { key, value, label: key, updatedAt: new Date() },
        })
      )
    );

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'SETTINGS_UPDATED',
        entity: 'AdminSetting',
        details: { keys: settings.map((s: { key: string }) => s.key) },
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
