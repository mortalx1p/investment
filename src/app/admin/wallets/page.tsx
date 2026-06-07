// src/app/admin/wallets/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AdminLayout from '@/components/admin/Layout';
import AdminWalletsClient from './AdminWalletsClient';

export default async function AdminWalletsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/login');

  const wallets = await prisma.walletAddress.findMany({ orderBy: { coin: 'asc' } });

  return (
    <AdminLayout>
      <AdminWalletsClient wallets={JSON.parse(JSON.stringify(wallets))} />
    </AdminLayout>
  );
}
