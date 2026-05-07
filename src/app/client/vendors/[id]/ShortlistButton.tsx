'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useToast } from '@/components/ui/Toast';

export function ShortlistButton({
  vendorId,
  initialActive,
}: {
  vendorId: string;
  initialActive: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch('/api/client/shortlist', {
        method: active ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      });
      if (res.ok) {
        setActive(!active);
        toast(active ? 'Removed from shortlist' : 'Added to shortlist', 'success');
      } else {
        toast('Could not update shortlist', 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        'btn',
        active
          ? 'border border-amber-400/40 bg-amber-500/15 text-amber-200 shadow-[0_0_14px_-2px_rgba(251,191,36,0.4)] hover:bg-amber-500/25'
          : 'border border-white/15 bg-white/[0.04] text-ink-800 backdrop-blur-md hover:border-white/25 hover:bg-white/[0.08]',
      )}
    >
      {active ? '★ Shortlisted' : '☆ Add to shortlist'}
    </button>
  );
}
