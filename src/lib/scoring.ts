import type {
  Capability,
  CapabilityLevel,
  CapacityLevel,
  Certification,
  Project,
  VendorProfile,
} from '@prisma/client';

export type VendorWithRelations = VendorProfile & {
  capabilities: Capability[];
  projects: Project[];
  certifications: Certification[];
};

export interface VqiBreakdown {
  capability: number;   // 0-100
  capacity: number;     // 0-100
  compliance: number;   // 0-100
  output: number;       // 0-100
  overall: number;      // 0-100
}

const CAPABILITY_LEVEL_SCORE: Record<CapabilityLevel, number> = {
  BASIC: 25,
  INTERMEDIATE: 55,
  ADVANCED: 80,
  EXPERT: 100,
};

const CAPACITY_AVAILABILITY_SCORE: Record<CapacityLevel, number> = {
  // Higher available capacity = higher score
  HIGH: 100,
  MEDIUM: 65,
  LOW: 30,
};

const WORKLOAD_HEADROOM_SCORE: Record<CapacityLevel, number> = {
  // Lower current workload = more headroom = higher score
  LOW: 100,
  MEDIUM: 65,
  HIGH: 35,
};

/**
 * VQI: 4-pillar weighted score.
 *  - Capability: breadth & depth across the 7 disciplines
 *  - Capacity: workload headroom + available regions
 *  - Compliance: certifications + GMP experience + quality systems
 *  - Output: project track record (count + GMP projects + size)
 */
export function calculateVqi(vendor: VendorWithRelations): VqiBreakdown {
  // ── Capability ──────────────────────────────────────────────
  // Average level across declared capabilities, weighted by breadth
  // (max 7 disciplines; >=5 = full breadth credit).
  const capCount = vendor.capabilities.length;
  const capDepth =
    capCount === 0
      ? 0
      : vendor.capabilities.reduce(
          (sum, c) => sum + CAPABILITY_LEVEL_SCORE[c.level],
          0,
        ) / capCount;
  const breadthFactor = Math.min(capCount / 5, 1); // 0..1
  const capability = Math.round(capDepth * (0.5 + 0.5 * breadthFactor));

  // ── Capacity ────────────────────────────────────────────────
  const availability = CAPACITY_AVAILABILITY_SCORE[vendor.availableCapacity];
  const headroom = WORKLOAD_HEADROOM_SCORE[vendor.currentWorkload];
  const regionScore = Math.min(((vendor.regions?.length ?? 0) / 4) * 100, 100);
  const capacity = Math.round(availability * 0.5 + headroom * 0.3 + regionScore * 0.2);

  // ── Compliance ──────────────────────────────────────────────
  const certCount = vendor.certifications.length;
  const certScore = Math.min((certCount / 4) * 100, 100);
  const qsCount = vendor.qualitySystems?.length ?? 0;
  const qsScore = Math.min((qsCount / 3) * 100, 100);
  const gmpScore = vendor.gmpExperience
    ? Math.min(50 + (vendor.gmpYears ?? 0) * 5, 100)
    : 0;
  const compliance = Math.round(certScore * 0.4 + qsScore * 0.25 + gmpScore * 0.35);

  // ── Output ──────────────────────────────────────────────────
  const projectCount = vendor.projects.length;
  const projectCountScore = Math.min((projectCount / 6) * 100, 100);
  const gmpProjects = vendor.projects.filter((p) => p.isGmp).length;
  const gmpProjectScore = Math.min((gmpProjects / 3) * 100, 100);
  const largeProjects = vendor.projects.filter(
    (p) => p.valueRange === '5-20M' || p.valueRange === '>20M',
  ).length;
  const sizeScore = Math.min((largeProjects / 2) * 100, 100);
  const output = Math.round(projectCountScore * 0.4 + gmpProjectScore * 0.35 + sizeScore * 0.25);

  // ── Overall ─────────────────────────────────────────────────
  // Weighted average: capability 30, output 25, compliance 25, capacity 20
  const overall = Math.round(
    capability * 0.3 + output * 0.25 + compliance * 0.25 + capacity * 0.2,
  );

  return { capability, capacity, compliance, output, overall };
}

/**
 * Estimate profile completeness (0-100) for the in-product progress bar.
 */
export function calculateCompletion(vendor: VendorWithRelations): number {
  const checks: boolean[] = [
    !!vendor.companyName,
    !!vendor.description,
    !!vendor.yearFounded,
    !!vendor.headcount,
    (vendor.keyDisciplines?.length ?? 0) > 0,
    (vendor.sectors?.length ?? 0) > 0,
    (vendor.regions?.length ?? 0) > 0,
    vendor.capabilities.length >= 3,
    vendor.projects.length >= 1,
    vendor.certifications.length >= 1,
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'text-brand-700 bg-brand-50 border-brand-200';
  if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Developing';
  return 'Limited';
}
