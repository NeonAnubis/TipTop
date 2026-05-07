export type VendorListItem = {
  id: string;
  companyName: string;
  description: string | null;
  logoUrl?: string | null;
  vqiScore: number;
  scoreCapability: number;
  scoreCapacity: number;
  scoreCompliance: number;
  scoreOutput: number;
  gmpExperience: boolean;
  sectors: string[];
  regions: string[];
  availableCapacity: 'LOW' | 'MEDIUM' | 'HIGH';
  currentWorkload: 'LOW' | 'MEDIUM' | 'HIGH';
  locations: { city: string; country: string }[];
  capabilities: { category: string; level: string }[];
  certifications: { name: string }[];
};
