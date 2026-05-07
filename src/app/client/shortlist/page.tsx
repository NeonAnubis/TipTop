import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShortlistManager } from './ShortlistManager';

export const metadata = { title: 'Shortlist · TipTop' };

export default async function ShortlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/client/shortlist');

  const entries = await prisma.shortlistEntry.findMany({
    where: { clientId: user.id },
    include: {
      vendor: {
        include: {
          locations: { where: { isHeadquarters: true }, take: 1 },
          capabilities: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Your shortlist is empty"
        description="Save vendors as you browse and they will appear here."
        action={<Link href="/client/vendors" className="btn-primary">Browse vendors</Link>}
      />
    );
  }

  return (
    <ShortlistManager
      entries={entries.map((e) => ({
        id: e.id,
        vendorId: e.vendor.id,
        companyName: e.vendor.companyName,
        logoUrl: e.vendor.logoUrl,
        gmpExperience: e.vendor.gmpExperience,
        vqiScore: e.vendor.vqiScore,
        scoreCapability: e.vendor.scoreCapability,
        scoreCapacity: e.vendor.scoreCapacity,
        scoreCompliance: e.vendor.scoreCompliance,
        scoreOutput: e.vendor.scoreOutput,
        location: e.vendor.locations[0]
          ? `${e.vendor.locations[0].city}, ${e.vendor.locations[0].country}`
          : null,
        capabilities: e.vendor.capabilities.map((c) => c.category),
      }))}
    />
  );
}
