import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VendorProfileView } from '@/components/VendorProfileView';
import { ShortlistButton } from './ShortlistButton';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const v = await prisma.vendorProfile.findUnique({
    where: { id: params.id },
    select: { companyName: true },
  });
  return { title: v ? `${v.companyName} · TipTop` : 'Vendor · TipTop' };
}

export default async function VendorDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/client/vendors/${params.id}`);

  const vendor = await prisma.vendorProfile.findUnique({
    where: { id: params.id },
    include: {
      locations: true,
      capabilities: true,
      projects: true,
      certifications: true,
    },
  });
  if (!vendor || !vendor.isPublished) notFound();

  const shortlisted =
    user.role === 'CLIENT'
      ? await prisma.shortlistEntry.findUnique({
          where: { clientId_vendorId: { clientId: user.id, vendorId: vendor.id } },
        })
      : null;

  return (
    <div className="space-y-6">
      <Link href="/client/vendors" className="text-sm text-ink-500 hover:text-ink-900">
        ← Back to network
      </Link>
      <VendorProfileView
        vendor={vendor}
        actions={
          user.role === 'CLIENT' ? (
            <ShortlistButton vendorId={vendor.id} initialActive={!!shortlisted} />
          ) : null
        }
      />
    </div>
  );
}
