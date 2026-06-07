// src/app/api/admin/wallets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { walletAddressSchema } from '@/lib/validations';

export async function GET() {
  try {
    await requireAdmin();
    const wallets = await prisma.walletAddress.findMany({ orderBy: { coin: 'asc' } });
    return NextResponse.json({ wallets });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = walletAddressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { coin, address, network } = parsed.data;

    const wallet = await prisma.walletAddress.upsert({
      where: { coin },
      update: { address, network, updatedBy: admin.id },
      create: { coin, address, network, updatedBy: admin.id },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'WALLET_ADDRESS_UPDATED',
        entity: 'WalletAddress',
        details: { coin, address },
      },
    });

    return NextResponse.json({ wallet });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// Public endpoint to get wallet address for a specific coin (user-facing)
export async function POST(req: NextRequest) {
  try {
    const { coin } = await req.json();
    if (!coin) return NextResponse.json({ error: 'Coin required' }, { status: 400 });

    const wallet = await prisma.walletAddress.findUnique({
      where: { coin, isActive: true },
    });

    if (!wallet) return NextResponse.json({ error: 'Coin not supported' }, { status: 404 });

    return NextResponse.json({ address: wallet.address, network: wallet.network });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
