import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VendorProfileView } from '@/components/VendorProfileView';

export const metadata = { title: 'Preview profile · TipTop' };

export default async function VendorPreviewPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'VENDOR') redirect('/login?next=/vendor/preview');

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: user.id },
    include: {
      locations: true,
      capabilities: true,
      projects: true,
      certifications: true,
    },
  });
  if (!vendor) redirect('/vendor/profile');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/vendor" className="text-sm text-ink-500 hover:text-ink-900">
          ← Back to overview
        </Link>
        <div className="flex items-center gap-2">
          <span
            className={`chip ${
              vendor.isPublished
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'text-ink-600'
            }`}
          >
            {vendor.isPublished ? 'Live' : 'Draft preview'}
          </span>
          <Link href="/vendor/profile" className="btn-secondary text-xs">
            Edit profile
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-3 text-xs text-brand-900">
        This is what clients see when they open your profile.
        {!vendor.isPublished && (
          <> It is not yet visible — finish the PQQ and publish to go live.</>
        )}
      </div>

      <VendorProfileView vendor={vendor} />
    </div>
  );
}
