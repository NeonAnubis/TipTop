import { Logo } from '@/components/ui/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-50/40">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <Logo />
      </div>
      <div className="mx-auto flex max-w-md flex-col px-6 pb-16">{children}</div>
    </div>
  );
}
