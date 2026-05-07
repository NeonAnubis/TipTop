import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from './LoginForm';
import { getSession } from '@/lib/auth';

export const metadata = { title: 'Sign in · TipTop' };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.role === 'VENDOR' ? '/vendor' : '/client');

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Sign in</h1>
      <p className="mt-1 text-sm text-ink-500">Welcome back. Continue where you left off.</p>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-ink-500">
        New to TipTop?{' '}
        <Link href="/register" className="font-medium text-brand-300 hover:text-brand-200 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
