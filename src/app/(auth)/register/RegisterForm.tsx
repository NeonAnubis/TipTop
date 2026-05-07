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
    <form className="mt-5 space-y-3" onSubmit={onSubmit}>
      {/* Compact segmented role selector */}
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md">
        {(['VENDOR', 'CLIENT'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition',
              role === r
                ? 'bg-brand-500 text-white shadow-glow'
                : 'text-ink-700 hover:bg-white/[0.06]',
            )}
          >
            {r === 'VENDOR' ? 'Vendor' : 'Client'}
          </button>
        ))}
      </div>

      <div>
        <label className="label" htmlFor="fullName">Your name</label>
        <input
          id="fullName"
          className="input"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      {role === 'VENDOR' && (
        <div>
          <label className="label" htmlFor="companyName">Company name</label>
          <input
            id="companyName"
            className="input"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
      )}

      <div>
        <label className="label" htmlFor="email">Work email</label>
        <input
          id="email"
          type="email"
          className="input"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="input"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="help">At least 8 characters.</div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
