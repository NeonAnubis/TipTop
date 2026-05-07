import { cn } from '@/lib/cn';

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center', className)}>
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-base font-semibold text-ink-900">{title}</div>
      {description && <div className="mt-1 max-w-md text-sm text-ink-500">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
