import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateCompletion, calculateVqi } from '@/lib/scoring';

const LocationSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  isHeadquarters: z.boolean().optional().default(false),
});

const CapabilitySchema = z.object({
  category: z.enum(['CSA', 'HVAC', 'ELECTRICAL', 'MECHANICAL', 'CLEANROOM', 'EQUIPMENT', 'AUTOMATION']),
  level: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  notes: z.string().optional().nullable(),
});

const ProjectSchema = z.object({
  name: z.string().min(1),
  client: z.string().optional().nullable(),
  projectType: z.string().optional().nullable(),
  scopeDelivered: z.string().optional().nullable(),
  valueRange: z.string().optional().nullable(),
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  isGmp: z.boolean().optional().default(false),
  sector: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
});

const CertificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().optional().nullable(),
  issuedYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  expiresYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  reference: z.string().optional().nullable(),
});

const ProfileSchema = z.object({
  // A. Company
  companyName: z.string().min(1),
  websiteUrl: z.string().url().optional().nullable().or(z.literal('').transform(() => null)),
  contactEmail: z.string().email().optional().nullable().or(z.literal('').transform(() => null)),
  contactPhone: z.string().optional().nullable(),
  yearFounded: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional().nullable(),
  description: z.string().optional().nullable(),
  logoUrl: z
    .string()
    .url()
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  sectors: z.array(z.string()).default([]),
  locations: z.array(LocationSchema).default([]),

  // B. Organisation
  headcount: z.coerce.number().int().min(1).max(1_000_000).optional().nullable(),
  keyDisciplines: z.array(z.string()).default([]),
  sourcingMode: z.enum(['INTERNAL', 'SUBCONTRACTED', 'HYBRID']).default('INTERNAL'),
  internalRatio: z.coerce.number().int().min(0).max(100).optional().nullable(),

  // C. Capabilities
  capabilities: z.array(CapabilitySchema).default([]),

  // D. Projects
  projects: z.array(ProjectSchema).default([]),

  // E. Quality
  qualitySystems: z.array(z.string()).default([]),
  gmpExperience: z.boolean().default(false),
  gmpYears: z.coerce.number().int().min(0).max(100).optional().nullable(),
  auditHistory: z.string().optional().nullable(),
  certifications: z.array(CertificationSchema).default([]),

  // F. Capacity
  regions: z.array(z.string()).default([]),
  currentWorkload: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  availableCapacity: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  availableFromMonths: z.coerce.number().int().min(0).max(36).optional().nullable(),

  isPublished: z.boolean().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'VENDOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: user.id },
    include: { locations: true, capabilities: true, projects: true, certifications: true },
  });
  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'VENDOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const existing = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
  if (!existing) {
    return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
  }

  const profileScalars: Prisma.VendorProfileUpdateInput = {
    companyName: data.companyName,
    websiteUrl: data.websiteUrl ?? null,
    contactEmail: data.contactEmail ?? null,
    contactPhone: data.contactPhone ?? null,
    yearFounded: data.yearFounded ?? null,
    description: data.description ?? null,
    logoUrl: data.logoUrl ?? null,
    sectors: data.sectors,
    headcount: data.headcount ?? null,
    keyDisciplines: data.keyDisciplines,
    sourcingMode: data.sourcingMode,
    internalRatio: data.internalRatio ?? null,
    qualitySystems: data.qualitySystems,
    gmpExperience: data.gmpExperience,
    gmpYears: data.gmpYears ?? null,
    auditHistory: data.auditHistory ?? null,
    regions: data.regions,
    currentWorkload: data.currentWorkload,
    availableCapacity: data.availableCapacity,
    availableFromMonths: data.availableFromMonths ?? null,
    ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
  };

  // Replace child collections in a single transaction.
  await prisma.$transaction([
    prisma.vendorProfile.update({ where: { id: existing.id }, data: profileScalars }),
    prisma.location.deleteMany({ where: { vendorId: existing.id } }),
    prisma.location.createMany({
      data: data.locations.map((l) => ({ ...l, vendorId: existing.id })),
    }),
    prisma.capability.deleteMany({ where: { vendorId: existing.id } }),
    prisma.capability.createMany({
      data: data.capabilities.map((c) => ({
        vendorId: existing.id,
        category: c.category,
        level: c.level,
        notes: c.notes ?? null,
      })),
    }),
    prisma.project.deleteMany({ where: { vendorId: existing.id } }),
    prisma.project.createMany({
      data: data.projects.map((p) => ({
        vendorId: existing.id,
        name: p.name,
        client: p.client ?? null,
        projectType: p.projectType ?? null,
        scopeDelivered: p.scopeDelivered ?? null,
        valueRange: p.valueRange ?? null,
        year: p.year ?? null,
        isGmp: p.isGmp ?? false,
        sector: p.sector ?? null,
        location: p.location ?? null,
      })),
    }),
    prisma.certification.deleteMany({ where: { vendorId: existing.id } }),
    prisma.certification.createMany({
      data: data.certifications.map((c) => ({
        vendorId: existing.id,
        name: c.name,
        issuer: c.issuer ?? null,
        issuedYear: c.issuedYear ?? null,
        expiresYear: c.expiresYear ?? null,
        reference: c.reference ?? null,
      })),
    }),
  ]);

  // Recompute scores
  const fresh = await prisma.vendorProfile.findUniqueOrThrow({
    where: { id: existing.id },
    include: { capabilities: true, projects: true, certifications: true },
  });
  const breakdown = calculateVqi(fresh);
  const completion = calculateCompletion(fresh);

  await prisma.vendorProfile.update({
    where: { id: existing.id },
    data: {
      vqiScore: breakdown.overall,
      scoreCapability: breakdown.capability,
      scoreCapacity: breakdown.capacity,
      scoreCompliance: breakdown.compliance,
      scoreOutput: breakdown.output,
      completionPercent: completion,
    },
  });

  return NextResponse.json({ ok: true, score: breakdown, completion });
}
