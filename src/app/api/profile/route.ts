// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { profileUpdateSchema, changePasswordSchema } from '@/lib/validations';

export async function GET() {
  try {
    const user = await requireAuth();
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, country: true, role: true, status: true,
        balance: true, totalDeposited: true, totalWithdrawn: true,
        profileImage: true, emailVerified: true, createdAt: true, lastLoginAt: true,
      },
    });
    return NextResponse.json({ user: fullUser });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (body.type === 'password') {
      const parsed = changePasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
      }
      const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!fullUser) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const valid = await bcrypt.compare(parsed.data.currentPassword, fullUser.password);
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

      const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
      return NextResponse.json({ message: 'Password updated successfully' });
    }

    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, country: true },
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
