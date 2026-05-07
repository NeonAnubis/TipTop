import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { getCurrentUser } from '@/lib/auth';

const NAV = [
  { href: '/vendor', label: 'Overview' },
  { href: '/vendor/profile', label: 'PQQ profile' },
  { href: '/vendor/preview', label: 'Preview' },
];

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/vendor');
  if (user.role !== 'VENDOR') redirect('/client');

  return (
    <div className="min-h-screen">
      <AppHeader
        user={{ fullName: user.fullName, email: user.email, role: user.role }}
        nav={NAV}
      />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
