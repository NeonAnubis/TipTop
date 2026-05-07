import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateCompletion, calculateVqi } from '../src/lib/scoring';

const prisma = new PrismaClient();

interface SeedVendor {
  email: string;
  fullName: string;
  password: string;
  company: {
    companyName: string;
    websiteUrl: string;
    contactEmail: string;
    yearFounded: number;
    description: string;
    headcount: number;
    sectors: string[];
    keyDisciplines: string[];
    sourcingMode: 'INTERNAL' | 'SUBCONTRACTED' | 'HYBRID';
    internalRatio: number;
    qualitySystems: string[];
    gmpExperience: boolean;
    gmpYears?: number;
    auditHistory?: string;
    regions: string[];
    currentWorkload: 'LOW' | 'MEDIUM' | 'HIGH';
    availableCapacity: 'LOW' | 'MEDIUM' | 'HIGH';
    availableFromMonths: number;
    locations: { city: string; country: string; isHeadquarters: boolean }[];
    capabilities: {
      category: 'CSA' | 'HVAC' | 'ELECTRICAL' | 'MECHANICAL' | 'CLEANROOM' | 'EQUIPMENT' | 'AUTOMATION';
      level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    }[];
    projects: {
      name: string;
      client: string;
      projectType: string;
      scopeDelivered: string;
      valueRange: string;
      year: number;
      isGmp: boolean;
      sector: string;
      location: string;
    }[];
    certifications: { name: string; issuer?: string; issuedYear?: number; expiresYear?: number; reference?: string }[];
  };
}

const VENDORS: SeedVendor[] = [
  {
    email: 'contact@helvetica-eng.ch',
    fullName: 'Andreas Müller',
    password: 'tiptop1234',
    company: {
      companyName: 'Helvetica Engineering AG',
      websiteUrl: 'https://helvetica-eng.example',
      contactEmail: 'sales@helvetica-eng.ch',
      yearFounded: 1998,
      description:
        'Swiss multidisciplinary engineering firm specialised in pharma greenfields, biotech facilities and aseptic fill-finish lines. End-to-end CQV in-house.',
      headcount: 540,
      sectors: ['Pharmaceuticals', 'Biotech', 'Vaccines'],
      keyDisciplines: ['Project Management', 'Process Engineering', 'Validation / CQV', 'Automation', 'Commissioning & Qualification'],
      sourcingMode: 'INTERNAL',
      internalRatio: 85,
      qualitySystems: ['ISO 9001', 'GAMP 5', 'EU GMP Annex 1', 'EU GMP Annex 15', 'ASME BPE'],
      gmpExperience: true,
      gmpYears: 22,
      auditHistory: 'Successfully closed 3 client audits and 1 EMA pre-approval inspection in 2024.',
      regions: ['Switzerland', 'EU – DACH', 'EU – France & Benelux', 'United Kingdom & Ireland'],
      currentWorkload: 'HIGH',
      availableCapacity: 'MEDIUM',
      availableFromMonths: 3,
      locations: [
        { city: 'Zürich', country: 'Switzerland', isHeadquarters: true },
        { city: 'Basel', country: 'Switzerland', isHeadquarters: false },
        { city: 'Frankfurt', country: 'Germany', isHeadquarters: false },
      ],
      capabilities: [
        { category: 'CSA', level: 'ADVANCED' },
        { category: 'HVAC', level: 'EXPERT' },
        { category: 'ELECTRICAL', level: 'ADVANCED' },
        { category: 'MECHANICAL', level: 'EXPERT' },
        { category: 'CLEANROOM', level: 'EXPERT' },
        { category: 'EQUIPMENT', level: 'ADVANCED' },
        { category: 'AUTOMATION', level: 'INTERMEDIATE' },
      ],
      projects: [
        {
          name: 'Aseptic fill-finish line modernisation',
          client: 'Top-10 pharma (NDA)',
          projectType: 'Brownfield / Retrofit',
          scopeDelivered: 'Process design, cleanroom upgrade to Annex 1, full CQV.',
          valueRange: '5-20M',
          year: 2024,
          isGmp: true,
          sector: 'Pharmaceuticals',
          location: 'Visp, Switzerland',
        },
        {
          name: 'Greenfield mRNA vaccine facility',
          client: 'European biotech',
          projectType: 'Greenfield',
          scopeDelivered: 'Multi-disciplinary EPCMV, Annex 1 cleanrooms, automation.',
          valueRange: '>20M',
          year: 2023,
          isGmp: true,
          sector: 'Vaccines',
          location: 'Frankfurt, Germany',
        },
        {
          name: 'Cell therapy GMP suite',
          client: 'Confidential',
          projectType: 'Greenfield',
          scopeDelivered: 'Grade B/C cleanroom, isolators, MES integration.',
          valueRange: '5-20M',
          year: 2022,
          isGmp: true,
          sector: 'Cell & Gene Therapy',
          location: 'Lausanne, Switzerland',
        },
      ],
      certifications: [
        { name: 'ISO 9001', issuer: 'SGS', issuedYear: 2019, expiresYear: 2025 },
        { name: 'ISO 14001', issuer: 'SGS', issuedYear: 2020, expiresYear: 2026 },
        { name: 'ISO 45001', issuer: 'TÜV', issuedYear: 2021 },
      ],
    },
  },
  {
    email: 'hello@nordbau-pharma.no',
    fullName: 'Eline Larsen',
    password: 'tiptop1234',
    company: {
      companyName: 'Nordbau Pharma Construction',
      websiteUrl: 'https://nordbau-pharma.example',
      contactEmail: 'projects@nordbau-pharma.no',
      yearFounded: 2008,
      description:
        'Construction-led pharma contractor delivering Annex 1 cleanrooms, fit-outs and capacity expansions across the Nordics.',
      headcount: 220,
      sectors: ['Pharmaceuticals', 'Medical Devices'],
      keyDisciplines: ['Construction Management', 'Mechanical Design', 'Electrical Design', 'HSE'],
      sourcingMode: 'HYBRID',
      internalRatio: 60,
      qualitySystems: ['ISO 9001', 'EU GMP Annex 1', 'FDA 21 CFR Part 11'],
      gmpExperience: true,
      gmpYears: 12,
      auditHistory: 'Two FDA inspections supported in 2023 with no critical findings.',
      regions: ['EU – Nordics', 'United Kingdom & Ireland', 'EU – DACH'],
      currentWorkload: 'MEDIUM',
      availableCapacity: 'HIGH',
      availableFromMonths: 1,
      locations: [
        { city: 'Oslo', country: 'Norway', isHeadquarters: true },
        { city: 'Copenhagen', country: 'Denmark', isHeadquarters: false },
      ],
      capabilities: [
        { category: 'CSA', level: 'EXPERT' },
        { category: 'HVAC', level: 'ADVANCED' },
        { category: 'ELECTRICAL', level: 'ADVANCED' },
        { category: 'MECHANICAL', level: 'INTERMEDIATE' },
        { category: 'CLEANROOM', level: 'EXPERT' },
      ],
      projects: [
        {
          name: 'Sterile injectables capacity expansion',
          client: 'Listed pharma',
          projectType: 'Capacity expansion',
          scopeDelivered: 'CSA, HVAC, cleanroom build-out, qualification.',
          valueRange: '5-20M',
          year: 2024,
          isGmp: true,
          sector: 'Pharmaceuticals',
          location: 'Oslo, Norway',
        },
        {
          name: 'Medical device assembly line fit-out',
          client: 'Stryker (NDA)',
          projectType: 'Brownfield / Retrofit',
          scopeDelivered: 'ISO 8 cleanroom, utilities, automation interfaces.',
          valueRange: '1-5M',
          year: 2023,
          isGmp: false,
          sector: 'Medical Devices',
          location: 'Helsingborg, Sweden',
        },
      ],
      certifications: [
        { name: 'ISO 9001', issuer: 'DNV', issuedYear: 2017, expiresYear: 2026 },
        { name: 'ISO 45001', issuer: 'DNV', issuedYear: 2020 },
      ],
    },
  },
  {
    email: 'team@cleanlogic.it',
    fullName: 'Giulia Rossi',
    password: 'tiptop1234',
    company: {
      companyName: 'CleanLogic Srl',
      websiteUrl: 'https://cleanlogic.example',
      contactEmail: 'info@cleanlogic.it',
      yearFounded: 2014,
      description:
        'Italian boutique specialising in cleanroom design, qualification and equipment integration for biotech start-ups and CDMOs.',
      headcount: 65,
      sectors: ['Biotech', 'Cell & Gene Therapy', 'Cosmetics'],
      keyDisciplines: ['Validation / CQV', 'Process Engineering', 'Quality Engineering'],
      sourcingMode: 'INTERNAL',
      internalRatio: 90,
      qualitySystems: ['ISO 9001', 'GAMP 5', 'EU GMP Annex 1'],
      gmpExperience: true,
      gmpYears: 8,
      auditHistory: 'AIFA mock audits performed for two CDMO clients in 2024.',
      regions: ['EU – Southern Europe', 'EU – DACH'],
      currentWorkload: 'LOW',
      availableCapacity: 'HIGH',
      availableFromMonths: 1,
      locations: [
        { city: 'Milan', country: 'Italy', isHeadquarters: true },
      ],
      capabilities: [
        { category: 'CLEANROOM', level: 'EXPERT' },
        { category: 'HVAC', level: 'ADVANCED' },
        { category: 'EQUIPMENT', level: 'ADVANCED' },
        { category: 'AUTOMATION', level: 'INTERMEDIATE' },
        { category: 'MECHANICAL', level: 'INTERMEDIATE' },
      ],
      projects: [
        {
          name: 'Cell therapy isolator integration',
          client: 'Italian CDMO',
          projectType: 'Process upgrade',
          scopeDelivered: 'cRABS isolator integration, GMP qualification.',
          valueRange: '1-5M',
          year: 2024,
          isGmp: true,
          sector: 'Cell & Gene Therapy',
          location: 'Milan, Italy',
        },
        {
          name: 'Cosmetic GMP cleanroom',
          client: 'Luxury cosmetics group',
          projectType: 'Greenfield',
          scopeDelivered: 'ISO 8 cleanroom, HVAC, qualification.',
          valueRange: '<1M',
          year: 2022,
          isGmp: false,
          sector: 'Cosmetics',
          location: 'Milan, Italy',
        },
      ],
      certifications: [
        { name: 'ISO 9001', issuer: 'Bureau Veritas', issuedYear: 2019, expiresYear: 2025 },
      ],
    },
  },
  {
    email: 'office@axis-automation.de',
    fullName: 'Felix Becker',
    password: 'tiptop1234',
    company: {
      companyName: 'Axis Automation GmbH',
      websiteUrl: 'https://axis-automation.example',
      contactEmail: 'sales@axis-automation.de',
      yearFounded: 2005,
      description:
        'Pharma 4.0 automation specialist: PLC, SCADA, MES and serialization for regulated industries.',
      headcount: 180,
      sectors: ['Pharmaceuticals', 'Biotech', 'Food & Beverage'],
      keyDisciplines: ['Automation', 'Validation / CQV', 'Quality Engineering'],
      sourcingMode: 'INTERNAL',
      internalRatio: 95,
      qualitySystems: ['GAMP 5', 'ICH Q9', 'FDA 21 CFR Part 11', 'ISO 9001'],
      gmpExperience: true,
      gmpYears: 18,
      auditHistory: 'GAMP-compliant CSV audits passed with two top-10 pharma clients in 2024.',
      regions: ['EU – DACH', 'EU – France & Benelux', 'EU – Nordics', 'North America'],
      currentWorkload: 'MEDIUM',
      availableCapacity: 'MEDIUM',
      availableFromMonths: 2,
      locations: [
        { city: 'Munich', country: 'Germany', isHeadquarters: true },
        { city: 'Boston', country: 'United States', isHeadquarters: false },
      ],
      capabilities: [
        { category: 'AUTOMATION', level: 'EXPERT' },
        { category: 'EQUIPMENT', level: 'ADVANCED' },
        { category: 'ELECTRICAL', level: 'ADVANCED' },
        { category: 'MECHANICAL', level: 'INTERMEDIATE' },
      ],
      projects: [
        {
          name: 'Serialization rollout — 14 lines',
          client: 'Mid-cap pharma',
          projectType: 'Process upgrade',
          scopeDelivered: 'PLC + MES integration, CSV documentation, qualification.',
          valueRange: '5-20M',
          year: 2024,
          isGmp: true,
          sector: 'Pharmaceuticals',
          location: 'Multiple, EU',
        },
        {
          name: 'Bioreactor SCADA harmonization',
          client: 'Biotech CDMO',
          projectType: 'Process upgrade',
          scopeDelivered: 'PCS rationalization, GAMP 5 lifecycle docs.',
          valueRange: '1-5M',
          year: 2023,
          isGmp: true,
          sector: 'Biotech',
          location: 'Vienna, Austria',
        },
        {
          name: 'Track & trace serialisation',
          client: 'CDMO',
          projectType: 'Compliance remediation',
          scopeDelivered: 'L4/L5 serialization, EPCIS integration.',
          valueRange: '1-5M',
          year: 2022,
          isGmp: true,
          sector: 'Pharmaceuticals',
          location: 'Munich, Germany',
        },
      ],
      certifications: [
        { name: 'ISO 9001', issuer: 'TÜV Süd', issuedYear: 2018, expiresYear: 2027 },
        { name: 'ISO 27001', issuer: 'TÜV Süd', issuedYear: 2021 },
      ],
    },
  },
  {
    email: 'london@thamesbuild.co.uk',
    fullName: 'Olivia Carter',
    password: 'tiptop1234',
    company: {
      companyName: 'Thames Build & Validate Ltd',
      websiteUrl: 'https://thamesbuild.example',
      contactEmail: 'hello@thamesbuild.co.uk',
      yearFounded: 2002,
      description:
        'UK-based generalist EPCM contractor with strong track record across pharma, food & beverage and data centers.',
      headcount: 410,
      sectors: ['Pharmaceuticals', 'Food & Beverage', 'Data Centers'],
      keyDisciplines: ['Project Management', 'Construction Management', 'Mechanical Design', 'Electrical Design'],
      sourcingMode: 'HYBRID',
      internalRatio: 55,
      qualitySystems: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'EU GMP Annex 15'],
      gmpExperience: true,
      gmpYears: 9,
      auditHistory: 'MHRA inspections passed at two facilities in 2023.',
      regions: ['United Kingdom & Ireland', 'EU – DACH', 'EU – Nordics'],
      currentWorkload: 'HIGH',
      availableCapacity: 'LOW',
      availableFromMonths: 6,
      locations: [
        { city: 'London', country: 'United Kingdom', isHeadquarters: true },
        { city: 'Dublin', country: 'Ireland', isHeadquarters: false },
      ],
      capabilities: [
        { category: 'CSA', level: 'EXPERT' },
        { category: 'HVAC', level: 'ADVANCED' },
        { category: 'ELECTRICAL', level: 'EXPERT' },
        { category: 'MECHANICAL', level: 'ADVANCED' },
        { category: 'CLEANROOM', level: 'INTERMEDIATE' },
      ],
      projects: [
        {
          name: 'Hyperscale data center MEP',
          client: 'Hyperscaler (NDA)',
          projectType: 'Greenfield',
          scopeDelivered: 'MEP design, BMS, commissioning.',
          valueRange: '>20M',
          year: 2024,
          isGmp: false,
          sector: 'Data Centers',
          location: 'Dublin, Ireland',
        },
        {
          name: 'Sterile suite refurbishment',
          client: 'UK pharma',
          projectType: 'Brownfield / Retrofit',
          scopeDelivered: 'CSA, HVAC, qualification.',
          valueRange: '5-20M',
          year: 2023,
          isGmp: true,
          sector: 'Pharmaceuticals',
          location: 'Cambridge, UK',
        },
      ],
      certifications: [
        { name: 'ISO 9001', issuer: 'BSI', issuedYear: 2016, expiresYear: 2025 },
        { name: 'ISO 14001', issuer: 'BSI', issuedYear: 2018, expiresYear: 2026 },
        { name: 'ISO 45001', issuer: 'BSI', issuedYear: 2020, expiresYear: 2026 },
        { name: 'CDM 2015 compliance', issuer: 'HSE', issuedYear: 2022 },
      ],
    },
  },
  {
    email: 'projects@iberbio.es',
    fullName: 'Carlos Hernández',
    password: 'tiptop1234',
    company: {
      companyName: 'IberBio Engineering S.L.',
      websiteUrl: 'https://iberbio.example',
      contactEmail: 'projects@iberbio.es',
      yearFounded: 2011,
      description:
        'Iberian biotech engineering practice covering process design, CQV and start-up support for fermentation and downstream processing.',
      headcount: 95,
      sectors: ['Biotech', 'Pharmaceuticals'],
      keyDisciplines: ['Process Engineering', 'Validation / CQV', 'Commissioning & Qualification'],
      sourcingMode: 'INTERNAL',
      internalRatio: 80,
      qualitySystems: ['EU GMP Annex 1', 'EU GMP Annex 15', 'ASME BPE'],
      gmpExperience: true,
      gmpYears: 11,
      auditHistory: 'Supported AEMPS inspection at biosimilars manufacturer in 2024.',
      regions: ['EU – Southern Europe', 'LATAM'],
      currentWorkload: 'LOW',
      availableCapacity: 'HIGH',
      availableFromMonths: 1,
      locations: [
        { city: 'Barcelona', country: 'Spain', isHeadquarters: true },
        { city: 'Lisbon', country: 'Portugal', isHeadquarters: false },
      ],
      capabilities: [
        { category: 'EQUIPMENT', level: 'EXPERT' },
        { category: 'MECHANICAL', level: 'ADVANCED' },
        { category: 'CLEANROOM', level: 'INTERMEDIATE' },
        { category: 'AUTOMATION', level: 'INTERMEDIATE' },
      ],
      projects: [
        {
          name: 'Fermentation suite expansion',
          client: 'European biotech',
          projectType: 'Capacity expansion',
          scopeDelivered: 'Process equipment specification, CQV.',
          valueRange: '5-20M',
          year: 2023,
          isGmp: true,
          sector: 'Biotech',
          location: 'Barcelona, Spain',
        },
      ],
      certifications: [
        { name: 'ISO 9001', issuer: 'AENOR', issuedYear: 2019, expiresYear: 2025 },
      ],
    },
  },
  {
    email: 'info@grandparis-mep.fr',
    fullName: 'Camille Dubois',
    password: 'tiptop1234',
    company: {
      companyName: 'Grand Paris MEP Conseil',
      websiteUrl: 'https://gpmep.example',
      contactEmail: 'info@grandparis-mep.fr',
      yearFounded: 1995,
      description:
        'French MEP consultancy with a strong portfolio in semiconductor cleanrooms and pharma utilities.',
      headcount: 310,
      sectors: ['Semiconductors', 'Pharmaceuticals', 'Chemicals'],
      keyDisciplines: ['Mechanical Design', 'Electrical Design', 'Process Engineering'],
      sourcingMode: 'INTERNAL',
      internalRatio: 75,
      qualitySystems: ['ISO 9001', 'ISO 14001', 'ASME BPE'],
      gmpExperience: false,
      gmpYears: 0,
      auditHistory: 'Annual ISO surveillance audits, last refresh 2024.',
      regions: ['EU – France & Benelux', 'EU – Southern Europe', 'EU – DACH'],
      currentWorkload: 'MEDIUM',
      availableCapacity: 'MEDIUM',
      availableFromMonths: 2,
      locations: [
        { city: 'Paris', country: 'France', isHeadquarters: true },
        { city: 'Lyon', country: 'France', isHeadquarters: false },
      ],
      capabilities: [
        { category: 'MECHANICAL', level: 'EXPERT' },
        { category: 'ELECTRICAL', level: 'EXPERT' },
        { category: 'HVAC', level: 'ADVANCED' },
        { category: 'CLEANROOM', level: 'ADVANCED' },
      ],
      projects: [
        {
          name: '300mm semicon cleanroom MEP',
          client: 'Tier-1 foundry',
          projectType: 'Greenfield',
          scopeDelivered: 'MEP design, ultra-pure utilities, qualification.',
          valueRange: '>20M',
          year: 2024,
          isGmp: false,
          sector: 'Semiconductors',
          location: 'Crolles, France',
        },
        {
          name: 'Pharma utilities upgrade',
          client: 'Confidential',
          projectType: 'Process upgrade',
          scopeDelivered: 'WFI, clean steam, CIP/SIP utilities.',
          valueRange: '5-20M',
          year: 2022,
          isGmp: false,
          sector: 'Pharmaceuticals',
          location: 'Paris, France',
        },
      ],
      certifications: [
        { name: 'ISO 9001', issuer: 'AFNOR', issuedYear: 2018, expiresYear: 2026 },
        { name: 'ISO 14001', issuer: 'AFNOR', issuedYear: 2020, expiresYear: 2026 },
      ],
    },
  },
  {
    email: 'admin@alpine-cqv.ch',
    fullName: 'Rafael Schmid',
    password: 'tiptop1234',
    company: {
      companyName: 'Alpine CQV Partners',
      websiteUrl: 'https://alpine-cqv.example',
      contactEmail: 'admin@alpine-cqv.ch',
      yearFounded: 2017,
      description:
        'Specialist CQV and validation consultancy supporting capital projects in Swiss biotech corridor.',
      headcount: 38,
      sectors: ['Pharmaceuticals', 'Biotech', 'Cell & Gene Therapy'],
      keyDisciplines: ['Validation / CQV', 'Quality Engineering', 'Commissioning & Qualification'],
      sourcingMode: 'INTERNAL',
      internalRatio: 95,
      qualitySystems: ['EU GMP Annex 1', 'EU GMP Annex 15', 'GAMP 5', 'ICH Q9'],
      gmpExperience: true,
      gmpYears: 7,
      auditHistory: 'Supported Swissmedic audits at 2 biotech clients in 2024.',
      regions: ['Switzerland', 'EU – DACH'],
      currentWorkload: 'LOW',
      availableCapacity: 'HIGH',
      availableFromMonths: 1,
      locations: [
        { city: 'Bern', country: 'Switzerland', isHeadquarters: true },
      ],
      capabilities: [
        { category: 'CLEANROOM', level: 'ADVANCED' },
        { category: 'EQUIPMENT', level: 'ADVANCED' },
        { category: 'AUTOMATION', level: 'INTERMEDIATE' },
      ],
      projects: [
        {
          name: 'CGT suite qualification',
          client: 'European cell therapy',
          projectType: 'Greenfield',
          scopeDelivered: 'IQ/OQ/PQ for isolators and BSCs.',
          valueRange: '1-5M',
          year: 2024,
          isGmp: true,
          sector: 'Cell & Gene Therapy',
          location: 'Geneva, Switzerland',
        },
      ],
      certifications: [
        { name: 'ISO 9001', issuer: 'SGS', issuedYear: 2021, expiresYear: 2027 },
      ],
    },
  },
];

const CLIENT = {
  email: 'pilot@clientco.com',
  fullName: 'Pilot Client',
  password: 'tiptop1234',
};

async function main() {
  console.log('🌱 Seeding TipTop database…');

  // Wipe existing data (idempotent reseed).
  await prisma.shortlistEntry.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.project.deleteMany();
  await prisma.capability.deleteMany();
  await prisma.location.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  // Demo client.
  const clientUser = await prisma.user.create({
    data: {
      email: CLIENT.email,
      fullName: CLIENT.fullName,
      role: 'CLIENT',
      passwordHash: await bcrypt.hash(CLIENT.password, 10),
    },
  });
  console.log(`  ✓ client: ${clientUser.email}`);

  for (const v of VENDORS) {
    const passwordHash = await bcrypt.hash(v.password, 10);
    const user = await prisma.user.create({
      data: {
        email: v.email,
        fullName: v.fullName,
        role: 'VENDOR',
        passwordHash,
        vendor: {
          create: {
            companyName: v.company.companyName,
            websiteUrl: v.company.websiteUrl,
            contactEmail: v.company.contactEmail,
            yearFounded: v.company.yearFounded,
            description: v.company.description,
            headcount: v.company.headcount,
            sectors: v.company.sectors,
            keyDisciplines: v.company.keyDisciplines,
            sourcingMode: v.company.sourcingMode,
            internalRatio: v.company.internalRatio,
            qualitySystems: v.company.qualitySystems,
            gmpExperience: v.company.gmpExperience,
            gmpYears: v.company.gmpYears,
            auditHistory: v.company.auditHistory,
            regions: v.company.regions,
            currentWorkload: v.company.currentWorkload,
            availableCapacity: v.company.availableCapacity,
            availableFromMonths: v.company.availableFromMonths,
            isPublished: true,
            locations: { create: v.company.locations },
            capabilities: { create: v.company.capabilities },
            projects: { create: v.company.projects },
            certifications: { create: v.company.certifications },
          },
        },
      },
      include: { vendor: { include: { capabilities: true, projects: true, certifications: true } } },
    });

    if (user.vendor) {
      const breakdown = calculateVqi(user.vendor);
      const completion = calculateCompletion(user.vendor);
      await prisma.vendorProfile.update({
        where: { id: user.vendor.id },
        data: {
          vqiScore: breakdown.overall,
          scoreCapability: breakdown.capability,
          scoreCapacity: breakdown.capacity,
          scoreCompliance: breakdown.compliance,
          scoreOutput: breakdown.output,
          completionPercent: completion,
        },
      });
      console.log(
        `  ✓ vendor: ${v.company.companyName.padEnd(36)} VQI=${breakdown.overall} (cap ${breakdown.capability}/cap ${breakdown.capacity}/comp ${breakdown.compliance}/out ${breakdown.output})`,
      );
    }
  }

  // Pre-shortlist a couple of vendors for the demo client.
  const top = await prisma.vendorProfile.findMany({
    orderBy: { vqiScore: 'desc' },
    take: 2,
    select: { id: true },
  });
  for (const v of top) {
    await prisma.shortlistEntry.create({
      data: { clientId: clientUser.id, vendorId: v.id },
    });
  }

  console.log('✅ Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
