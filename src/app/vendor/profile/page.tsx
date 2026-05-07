import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfileWizard } from './ProfileWizard';

export const metadata = { title: 'PQQ profile · TipTop' };

export default async function VendorProfilePage({
  searchParams,
}: {
  searchParams: { welcome?: string };
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'VENDOR') redirect('/login?next=/vendor/profile');

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: user.id },
    include: { locations: true, capabilities: true, projects: true, certifications: true },
  });
  if (!profile) redirect('/login');

  const initial = {
    companyName: profile.companyName,
    websiteUrl: profile.websiteUrl ?? '',
    contactEmail: profile.contactEmail ?? '',
    contactPhone: profile.contactPhone ?? '',
    yearFounded: profile.yearFounded ?? null,
    description: profile.description ?? '',
    logoUrl: profile.logoUrl ?? '',
    sectors: profile.sectors,
    locations: profile.locations.map(({ id: _id, vendorId: _v, ...rest }) => rest),
    headcount: profile.headcount ?? null,
    keyDisciplines: profile.keyDisciplines,
    sourcingMode: profile.sourcingMode,
    internalRatio: profile.internalRatio ?? null,
    capabilities: profile.capabilities.map(({ id: _id, vendorId: _v, ...rest }) => rest),
    projects: profile.projects.map(({ id: _id, vendorId: _v, ...rest }) => rest),
    qualitySystems: profile.qualitySystems,
    gmpExperience: profile.gmpExperience,
    gmpYears: profile.gmpYears ?? null,
    auditHistory: profile.auditHistory ?? '',
    certifications: profile.certifications.map(({ id: _id, vendorId: _v, ...rest }) => rest),
    regions: profile.regions,
    currentWorkload: profile.currentWorkload,
    availableCapacity: profile.availableCapacity,
    availableFromMonths: profile.availableFromMonths ?? null,
    isPublished: profile.isPublished,
  };

  return (
    <div>
      {searchParams.welcome === '1' && (
        <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
          <strong className="font-semibold">Welcome to TipTop.</strong> Complete your prequalification
          questionnaire below — your VQI score updates as you save.
        </div>
      )}
      <ProfileWizard initial={initial} />
    </div>
  );
}
