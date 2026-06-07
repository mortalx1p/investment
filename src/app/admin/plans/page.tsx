// src/app/admin/plans/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AdminLayout from '@/components/admin/Layout';
import AdminPlansClient from './AdminPlansClient';

export default async function AdminPlansPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/login');

  const plans = await prisma.investmentPlan.findMany({
    where: { status: { not: 'DELETED' } },
    orderBy: { minDeposit: 'asc' },
    include: { _count: { select: { investments: true } } },
  });

  return (
    <AdminLayout>
      <AdminPlansClient plans={JSON.parse(JSON.stringify(plans))} />
    </AdminLayout>
  );
}
