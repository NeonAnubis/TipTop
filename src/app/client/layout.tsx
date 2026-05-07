import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { getCurrentUser } from '@/lib/auth';

const NAV = [
  { href: '/client', label: 'Dashboard' },
  { href: '/client/vendors', label: 'Vendors' },
  { href: '/client/shortlist', label: 'Shortlist' },
  { href: '/client/compare', label: 'Compare' },
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/client');
  if (user.role !== 'CLIENT') redirect('/vendor');

  return (
    <div className="min-h-screen">
      <AppHeader user={{ fullName: user.fullName, email: user.email, role: user.role }} nav={NAV} />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
