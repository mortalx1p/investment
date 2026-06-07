// src/app/notifications/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/dashboard/Layout';
import NotificationsClient from './NotificationsClient';

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [notifications, fullUser, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { firstName: true, lastName: true, email: true, role: true, balance: true } }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return (
    <DashboardLayout user={fullUser!} unreadCount={unreadCount}>
      <NotificationsClient notifications={JSON.parse(JSON.stringify(notifications))} unreadCount={unreadCount} />
    </DashboardLayout>
  );
}
