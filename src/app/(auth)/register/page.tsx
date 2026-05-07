import Link from 'next/link';
import { redirect } from 'next/navigation';
import { RegisterForm } from './RegisterForm';
import { getSession } from '@/lib/auth';

export const metadata = { title: 'Create account · TipTop' };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const session = await getSession();
  if (session) redirect(session.role === 'VENDOR' ? '/vendor' : '/client');

  const initialRole = searchParams.role === 'CLIENT' ? 'CLIENT' : 'VENDOR';

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Create your account</h1>
      <p className="mt-1 text-sm text-ink-500">
        Free to join while in pilot. No credit card.
      </p>
      <RegisterForm initialRole={initialRole} />
      <p className="mt-5 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-300 hover:text-brand-200 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
