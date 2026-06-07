// src/app/admin/settings/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AdminLayout from '@/components/admin/Layout';
import AdminSettingsClient from './AdminSettingsClient';

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/login');

  const settings = await prisma.adminSetting.findMany({ orderBy: { key: 'asc' } });

  return (
    <AdminLayout>
      <AdminSettingsClient settings={JSON.parse(JSON.stringify(settings))} />
    </AdminLayout>
  );
}
