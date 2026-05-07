import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { getCurrentUser } from '@/lib/auth';

const VENDOR_NAV = [
  { href: '/vendor', label: 'Overview' },
  { href: '/vendor/profile', label: 'PQQ profile' },
  { href: '/vendor/preview', label: 'Preview' },
];
const CLIENT_NAV = [
  { href: '/client', label: 'Dashboard' },
  { href: '/client/vendors', label: 'Vendors' },
  { href: '/client/shortlist', label: 'Shortlist' },
  { href: '/client/compare', label: 'Compare' },
];

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/profile');

  return (
    <div className="min-h-screen">
      <AppHeader
        user={{
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        }}
        nav={user.role === 'VENDOR' ? VENDOR_NAV : CLIENT_NAV}
      />
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
