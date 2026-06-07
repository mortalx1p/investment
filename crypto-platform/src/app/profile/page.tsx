// src/app/profile/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/dashboard/Layout';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [fullUser, unreadCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true, country: true,
        role: true, status: true, balance: true, totalDeposited: true, totalWithdrawn: true,
        emailVerified: true, createdAt: true, lastLoginAt: true,
      },
    }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return (
    <DashboardLayout user={fullUser!} unreadCount={unreadCount}>
      <ProfileClient user={JSON.parse(JSON.stringify(fullUser))} />
    </DashboardLayout>
  );
}
