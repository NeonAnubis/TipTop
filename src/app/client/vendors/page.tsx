import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { VendorListItem } from '@/lib/types';
import { VendorBrowser } from './VendorBrowser';

export const metadata = { title: 'Vendor network · TipTop' };

export default async function VendorsBrowsePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/client/vendors');

  const [shortlist, vendors] = await Promise.all([
    prisma.shortlistEntry.findMany({
      where: { clientId: user.id },
      select: { vendorId: true },
    }),
    prisma.vendorProfile.findMany({
      where: { isPublished: true },
      include: {
        locations: { where: { isHeadquarters: true }, take: 1 },
        capabilities: true,
        certifications: { take: 4 },
      },
      orderBy: [{ vqiScore: 'desc' }, { companyName: 'asc' }],
      take: 60,
    }),
  ]);

  return (
    <VendorBrowser
      initialVendors={vendors as unknown as VendorListItem[]}
      initialShortlistIds={shortlist.map((s) => s.vendorId)}
    />
  );
}
