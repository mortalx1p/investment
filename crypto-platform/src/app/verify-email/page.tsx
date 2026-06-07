// src/app/verify-email/page.tsx
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    redirect('/login?error=invalid-token');
  }

  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });

  if (!user) {
    redirect('/login?error=invalid-token');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null, status: 'ACTIVE' },
  });

  redirect('/login?verified=true');
}
