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
          ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
          : 'border border-ink-200 bg-white text-ink-800 hover:bg-ink-50',
      )}
    >
      {active ? '★ Shortlisted' : '☆ Add to shortlist'}
    </button>
  );
}
