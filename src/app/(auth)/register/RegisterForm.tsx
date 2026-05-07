'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

type Role = 'VENDOR' | 'CLIENT';

export function RegisterForm({ initialRole }: { initialRole: Role }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role, companyName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not create account');
        return;
      }
      router.push(role === 'VENDOR' ? '/vendor/profile?welcome=1' : '/client');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <div>
        <div className="label">I am a…</div>
        <div className="grid grid-cols-2 gap-2">
          {(['VENDOR', 'CLIENT'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                'rounded-xl border p-3 text-left transition',
                role === r
                  ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                  : 'border-ink-200 bg-white hover:bg-ink-50',
              )}
            >
              <div className="text-sm font-semibold text-ink-900">
                {r === 'VENDOR' ? 'Vendor' : 'Client'}
              </div>
              <div className="mt-0.5 text-xs text-ink-500">
                {r === 'VENDOR'
                  ? 'List your company and prequalify once.'
                  : 'Search and shortlist qualified vendors.'}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="fullName">Your name</label>
        <input id="fullName" className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      {role === 'VENDOR' && (
        <div>
          <label className="label" htmlFor="companyName">Company name</label>
          <input id="companyName" className="input" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">Work email</label>
        <input id="email" type="email" className="input" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" type="password" className="input" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="help">At least 8 characters.</div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
