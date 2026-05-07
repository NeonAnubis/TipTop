import type { CapabilityCategory, CapabilityLevel, CapacityLevel, SourcingMode } from '@prisma/client';

export const CAPABILITY_CATEGORIES: { value: CapabilityCategory; label: string; description: string }[] = [
  { value: 'CSA', label: 'CSA', description: 'Civil, Structural & Architectural' },
  { value: 'HVAC', label: 'HVAC', description: 'Heating, ventilation, air conditioning' },
  { value: 'ELECTRICAL', label: 'Electrical', description: 'Power, lighting, distribution' },
  { value: 'MECHANICAL', label: 'Mechanical', description: 'Process piping, utilities' },
  { value: 'CLEANROOM', label: 'Cleanroom', description: 'ISO classified clean environments' },
  { value: 'EQUIPMENT', label: 'Process Equipment', description: 'Skids, vessels, isolators' },
  { value: 'AUTOMATION', label: 'Automation', description: 'PLC, SCADA, MES, GAMP5' },
];

export const CAPABILITY_LEVELS: { value: CapabilityLevel; label: string }[] = [
  { value: 'BASIC', label: 'Basic' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'EXPERT', label: 'Expert' },
];

export const CAPACITY_LEVELS: { value: CapacityLevel; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

export const SOURCING_MODES: { value: SourcingMode; label: string }[] = [
  { value: 'INTERNAL', label: 'Mostly internal' },
  { value: 'SUBCONTRACTED', label: 'Mostly subcontracted' },
  { value: 'HYBRID', label: 'Hybrid' },
];

export const SECTOR_OPTIONS = [
  'Pharmaceuticals',
  'Biotech',
  'Cell & Gene Therapy',
  'Vaccines',
  'Medical Devices',
  'Food & Beverage',
  'Cosmetics',
  'Semiconductors',
  'Chemicals',
  'Data Centers',
];

export const REGION_OPTIONS = [
  'Switzerland',
  'EU – DACH',
  'EU – France & Benelux',
  'EU – Nordics',
  'EU – Southern Europe',
  'United Kingdom & Ireland',
  'North America',
  'LATAM',
  'Middle East',
  'Asia Pacific',
];

export const QUALITY_SYSTEM_OPTIONS = [
  'ISO 9001',
  'ISO 14001',
  'ISO 45001',
  'GAMP 5',
  'ICH Q9',
  'EU GMP Annex 1',
  'EU GMP Annex 15',
  'FDA 21 CFR Part 11',
  'ASME BPE',
];

export const PROJECT_VALUE_RANGES = ['<1M', '1-5M', '5-20M', '>20M'];
export const PROJECT_TYPES = ['Greenfield', 'Brownfield / Retrofit', 'Capacity expansion', 'Process upgrade', 'Compliance remediation'];

export const DISCIPLINE_OPTIONS = [
  'Project Management',
  'Process Engineering',
  'Validation / CQV',
  'Mechanical Design',
  'Electrical Design',
  'Automation',
  'Construction Management',
  'Commissioning & Qualification',
  'Quality Engineering',
  'HSE',
];
