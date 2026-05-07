import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ProfileForm } from './ProfileForm';

export const metadata = { title: 'My profile · TipTop' };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/profile');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-950">My profile</h1>
        <p className="text-sm text-ink-500">
          Manage how you appear in TipTop and update your account details.
        </p>
      </header>

      <ProfileForm
        initial={{
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl ?? '',
          jobTitle: user.jobTitle ?? '',
        }}
      />
    </div>
  );
}
