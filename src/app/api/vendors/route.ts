import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const VALID_CAPABILITY = new Set(['CSA', 'HVAC', 'ELECTRICAL', 'MECHANICAL', 'CLEANROOM', 'EQUIPMENT', 'AUTOMATION']);
const VALID_CAPACITY = new Set(['LOW', 'MEDIUM', 'HIGH']);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = url.searchParams;

  const q = params.get('q')?.trim();
  const capabilities = params.getAll('capability').filter((c) => VALID_CAPABILITY.has(c));
  const disciplines = params.getAll('discipline').filter(Boolean);
  const sectors = params.getAll('sector').filter(Boolean);
  const regions = params.getAll('region').filter(Boolean);
  const gmpOnly = params.get('gmp') === '1';
  const minScore = Number(params.get('minScore') ?? 0);
  const maxScore = Number(params.get('maxScore') ?? 100);
  const availability = params.get('availability');

  const where: Prisma.VendorProfileWhereInput = {
    isPublished: true,
    vqiScore: {
      gte: Number.isFinite(minScore) ? Math.max(0, minScore) : 0,
      lte: Number.isFinite(maxScore) ? Math.min(100, maxScore) : 100,
    },
  };

  if (q) {
    where.OR = [
      { companyName: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { keyDisciplines: { has: q } },
    ];
  }
  if (gmpOnly) where.gmpExperience = true;
  if (sectors.length) where.sectors = { hasSome: sectors };
  if (regions.length) where.regions = { hasSome: regions };
  if (disciplines.length) where.keyDisciplines = { hasSome: disciplines };
  if (availability && VALID_CAPACITY.has(availability)) {
    where.availableCapacity = availability as Prisma.VendorProfileWhereInput['availableCapacity'];
  }
  if (capabilities.length) {
    where.AND = capabilities.map((cat) => ({
      capabilities: {
        some: { category: cat as 'CSA' | 'HVAC' | 'ELECTRICAL' | 'MECHANICAL' | 'CLEANROOM' | 'EQUIPMENT' | 'AUTOMATION' },
      },
    }));
  }

  const vendors = await prisma.vendorProfile.findMany({
    where,
    include: {
      locations: { where: { isHeadquarters: true }, take: 1 },
      capabilities: true,
      certifications: { take: 4 },
    },
    orderBy: [{ vqiScore: 'desc' }, { companyName: 'asc' }],
    take: 100,
  });

  return NextResponse.json({ vendors });
}
