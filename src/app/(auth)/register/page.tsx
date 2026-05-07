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
    <div className="card mt-8 p-8">
      <h1 className="text-2xl font-semibold text-ink-900">Create your account</h1>
      <p className="mt-1 text-sm text-ink-500">
        Join TipTop to {initialRole === 'VENDOR' ? 'list your company' : 'discover qualified vendors'}.
      </p>
      <RegisterForm initialRole={initialRole} />
      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
