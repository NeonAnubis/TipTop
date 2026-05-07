import Link from 'next/link';
import { cn } from '@/lib/cn';

export function Logo({ className, href = '/' }: { className?: string; href?: string | null }) {
  const inner = (
    <span className={cn('inline-flex items-center gap-2 font-semibold tracking-tight', className)}>
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2 4.2C2 3.0799 2 2.51984 2.21799 2.09202C2.40973 1.71569 2.71569 1.40973 3.09202 1.21799C3.51984 1 4.0799 1 5.2 1H8.8C9.9201 1 10.4802 1 10.908 1.21799C11.2843 1.40973 11.5903 1.71569 11.782 2.09202C12 2.51984 12 3.0799 12 4.2V13L7 10.5L2 13V4.2Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-ink-900">TipTop</span>
    </span>
  );
  if (!href) return inner;
  return <Link href={href}>{inner}</Link>;
}
