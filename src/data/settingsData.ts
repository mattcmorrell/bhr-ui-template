import type { IconName } from '../components/Icon';
import { jobLibProfileGroups } from './parseJobLibCsv';

export interface SettingsNavItem {
  id: string;
  label: string;
  icon: IconName;
}

export interface SubTab {
  id: string;
  label: string;
}

export interface AddOn {
  id: string;
  title: string;
  subtitle?: string;
  employees?: string;
  icon: IconName;
}

export interface Upgrade {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
}

export interface AccountInfo {
  companyName: string;
  accountNumber: string;
  url: string;
  owner: {
    name: string;
    avatar: string;
    role: string;
  };
}

export interface Subscription {
  plan: string;
  packageType: string;
  employees: number;
}

export const settingsNavItems: SettingsNavItem[] = [
  { id: 'account', label: 'Account', icon: 'wrench' },
  { id: 'access-levels', label: 'Access Levels', icon: 'lock' },
  { id: 'employee-fields', label: 'Employee Fields', icon: 'pen-to-square' },
  { id: 'job-organization', label: 'Job Organization', icon: 'building' },
  { id: 'approvals', label: 'Approvals', icon: 'thumbs-up' },
  { id: 'apps', label: 'Apps', icon: 'table-cells' },
  { id: 'ask-bamboohr', label: 'Ask BambooHR', icon: 'circle-question' },
  { id: 'benefits', label: 'Benefits', icon: 'heart' },
  { id: 'company-directory', label: 'Company Directory', icon: 'user-group' },
  { id: 'compensation', label: 'Compensation', icon: 'circle-dollar' },
  { id: 'core-values', label: 'Core Values', icon: 'heart' },
  { id: 'custom-fields', label: 'Custom Fields & Tables', icon: 'sliders' },
  { id: 'email-alerts', label: 'Email Alerts', icon: 'bell' },
  { id: 'employee-community', label: 'Employee Community', icon: 'user-group' },
  { id: 'employee-satisfaction', label: 'Employee Satisfaction', icon: 'face-smile' },
  { id: 'employee-wellbeing', label: 'Employee Wellbeing', icon: 'spa' },
  { id: 'global-employment', label: 'Global Employment', icon: 'location-dot' },
  { id: 'hiring', label: 'Hiring', icon: 'id-badge' },
  { id: 'holidays', label: 'Holidays', icon: 'calendar' },
  { id: 'logo-color', label: 'Logo & Color', icon: 'palette' },
  { id: 'offboarding', label: 'Offboarding', icon: 'door-open' },
  { id: 'onboarding', label: 'Onboarding', icon: 'door-closed' },
  { id: 'payroll', label: 'Payroll', icon: 'circle-dollar' },
  { id: 'performance', label: 'Performance', icon: 'chart-line' },
  { id: 'time-off', label: 'Time Off', icon: 'plane' },
  { id: 'time-tracking', label: 'Time Tracking', icon: 'clock' },
  { id: 'total-rewards', label: 'Total Rewards', icon: 'heart' },
  { id: 'training', label: 'Training', icon: 'graduation-cap' },
];

export const accountSubTabs: SubTab[] = [
  { id: 'account-info', label: 'Account Info' },
  { id: 'billing', label: 'Billing' },
  { id: 'aca-settings', label: 'ACA Settings' },
  { id: 'general-settings', label: 'General Settings' },
  { id: 'icalendar-feeds', label: 'iCalendar Feeds' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'import-hours', label: 'Import Hours' },
  { id: 'login-settings', label: 'Login Settings' },
  { id: 'api-app-access', label: 'API & App Access' },
  { id: 'company-ownership', label: 'Company Ownership' },
];

export const accountInfo: AccountInfo = {
  companyName: 'BambooHR User Testing',
  accountNumber: 'Account #91457',
  url: 'usabilitytesting.bamboohr.com',
  owner: {
    name: 'Janet Parker',
    avatar: 'https://i.pravatar.cc/300?img=47',
    role: 'Account Owner',
  },
};

export const subscription: Subscription = {
  plan: 'Pro',
  packageType: 'HR Package',
  employees: 129,
};

export const addOns: AddOn[] = [
  { id: 'payroll', title: 'Payroll', icon: 'circle-dollar' },
  { id: 'time-tracking', title: 'Time Tracking', employees: '23 Employees', icon: 'clock' },
];

export const jobPostings = {
  current: 4,
  max: 55,
};

export const fileStorage = {
  used: 0,
  total: 85,
  unit: 'GB',
};

export const upgrades: Upgrade[] = [
  {
    id: 'elite',
    title: 'Elite',
    subtitle: 'HR Package',
    icon: 'shield',
  },
  {
    id: 'benefits-admin',
    title: 'Benefits Administration',
    subtitle: 'Add-On',
    icon: 'heart',
  },
  {
    id: 'global-employment',
    title: 'Global Employment',
    subtitle: 'Powered by Remote',
    icon: 'location-dot',
  },
];

export const dataCenter = {
  location: 'Ohio',
};

export interface JobOrganizationNavItem {
  id: string;
  label: string;
}

export type JobProfileCompetencyLevel = 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';

export interface JobProfileCompetency {
  id: string;
  name: string;
  description: string;
  level: JobProfileCompetencyLevel;
}

export const competencyLevelOptions: { value: JobProfileCompetencyLevel; label: string }[] = [
  { value: 'Basic', label: 'Basic' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Expert', label: 'Expert' },
];

export interface JobProfile {
  id: string;
  name: string;
  careerTrackLevel: string;
  people: number;
  jobDescription?: string;
  internalJobCode?: string;
  /** Omit = inherit job family from nested group in `jobProfileGroups`. `null` or "" = Unassigned. */
  jobFamilyGroupId?: string | null;
  competencies?: JobProfileCompetency[];
}

export interface JobProfileGroup {
  id: string;
  name: string;
  profiles: JobProfile[];
}

export const jobOrganizationNavItems: JobOrganizationNavItem[] = [
  { id: 'job-profiles', label: 'Job Profiles' },
  { id: 'departments', label: 'Departments' },
  { id: 'divisions', label: 'Divisions' },
  { id: 'teams', label: 'Teams' },
  { id: 'locations', label: 'Locations' },
  { id: 'eeo-categories', label: 'EEO Categories' },
];

export interface OrganizationCountRow {
  id: string;
  name: string;
  people: number;
}

export interface OrganizationLocationRow {
  id: string;
  name: string;
  address: string;
  people: number;
}

export const organizationDivisions: OrganizationCountRow[] = [
  { id: 'div-apac', name: 'Asia-Pacific', people: 11 },
  { id: 'div-eu', name: 'Europe', people: 17 },
  { id: 'div-na', name: 'North America', people: 101 },
];

export const organizationDepartments: OrganizationCountRow[] = [
  { id: 'dept-cs', name: 'Customer Success', people: 18 },
  { id: 'dept-fin', name: 'Finance', people: 6 },
  { id: 'dept-hr', name: 'Human Resources', people: 20 },
  { id: 'dept-it', name: 'IT', people: 7 },
  { id: 'dept-mkt', name: 'Marketing', people: 10 },
  { id: 'dept-ops', name: 'Operations', people: 10 },
  { id: 'dept-prod', name: 'Product', people: 23 },
  { id: 'dept-sales', name: 'Sales', people: 33 },
  { id: 'dept-ux', name: 'UX', people: 2 },
];

export const organizationTeams: OrganizationCountRow[] = [
  { id: 'team-blue-steel', name: 'Blue Steel', people: 5 },
  { id: 'team-mobile', name: 'Mobile Products', people: 4 },
];

export const organizationLocations: OrganizationLocationRow[] = [
  {
    id: 'loc-lindon',
    name: 'Lindon, Utah',
    address: '335 South 560 West, Lindon, Utah 84042, United States',
    people: 72,
  },
  {
    id: 'loc-london',
    name: 'London, UK',
    address: '2/3 Conduit St, Mayfair, London, City of W1S 2BX, United Kingdom',
    people: 18,
  },
  {
    id: 'loc-remote',
    name: 'Remote Worker',
    address: 'Remote Location',
    people: 4,
  },
  {
    id: 'loc-sydney',
    name: 'Sydney, Australia',
    address: '201 Elizabeth St, Sydney, New South Wales 2000, Australia',
    people: 12,
  },
  {
    id: 'loc-vancouver',
    name: 'Vancouver, Canada',
    address: '720 Granville St, Vancouver, British Columbia V6Z 1E4, Canada',
    people: 23,
  },
];

export const organizationEeoCategories: OrganizationCountRow[] = [
  { id: 'eeo-sales', name: 'Sales Workers', people: 32 },
  { id: 'eeo-prof', name: 'Professionals', people: 70 },
  {
    id: 'eeo-exec',
    name: 'Executive/Senior Level Officials and Managers',
    people: 8,
  },
  { id: 'eeo-tech', name: 'Technicians', people: 12 },
  { id: 'eeo-uncat', name: 'Uncategorized', people: 7 },
];

export const careerTrackOptions = [
  { value: 'E', label: 'Executive (E)' },
  { value: 'M', label: 'Management/People Leader (M)' },
  { value: 'P', label: 'Professional (P)' },
  { value: 'T', label: 'Technical (T)' },
  { value: 'S', label: 'Support/Para-Professional (S)' },
];

export const levelOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

/** Deduplicate profiles by name across all groups. First occurrence wins for all fields except
 * `people`, which is summed. Duplicate entries are removed from their groups. */
function deduplicateProfilesByName(groups: JobProfileGroup[]): JobProfileGroup[] {
  const seenNames = new Map<string, string>(); // normalized name → profile id of keeper
  const peopleById = new Map<string, number>(); // profile id → total people

  // First pass: accumulate people totals for each unique name
  for (const g of groups) {
    for (const p of g.profiles) {
      const key = p.name.trim().toLowerCase();
      if (!seenNames.has(key)) {
        seenNames.set(key, p.id);
        peopleById.set(p.id, p.people);
      } else {
        const keeperId = seenNames.get(key)!;
        peopleById.set(keeperId, (peopleById.get(keeperId) ?? 0) + p.people);
      }
    }
  }

  // Second pass: keep only the first occurrence per name, update its people count
  const emittedIds = new Set<string>();
  return groups.map((g) => ({
    ...g,
    profiles: g.profiles
      .filter((p) => {
        const key = p.name.trim().toLowerCase();
        const keeperId = seenNames.get(key);
        if (keeperId !== p.id) return false; // duplicate — drop
        if (emittedIds.has(p.id)) return false; // already emitted in another group
        emittedIds.add(p.id);
        return true;
      })
      .map((p) => ({ ...p, people: peopleById.get(p.id) ?? p.people })),
  })).filter((g) => g.profiles.length > 0);
}

/** Keep every other profile globally (even indices in flat order), preserving group structure. */
function halveJobProfiles(groups: JobProfileGroup[]): JobProfileGroup[] {
  let idx = 0;
  return groups
    .map((g) => ({
      ...g,
      profiles: g.profiles.filter(() => idx++ % 2 === 0),
    }))
    .filter((g) => g.profiles.length > 0);
}

function mergeJobLibProfileGroups(
  builtIn: JobProfileGroup[],
  lib: JobProfileGroup[],
): JobProfileGroup[] {
  const builtInIds = new Set(builtIn.map((g) => g.id));
  const mergedById = new Map<string, JobProfileGroup>();

  for (const g of builtIn) {
    mergedById.set(g.id, { ...g, profiles: [...g.profiles] });
  }

  for (const lg of lib) {
    const existing = mergedById.get(lg.id);
    if (existing) {
      mergedById.set(lg.id, {
        ...existing,
        profiles: [...existing.profiles, ...lg.profiles],
      });
    } else {
      mergedById.set(lg.id, { ...lg, profiles: [...lg.profiles] });
    }
  }

  const result: JobProfileGroup[] = [];
  for (const g of builtIn) {
    result.push(mergedById.get(g.id)!);
  }
  for (const lg of lib) {
    if (!builtInIds.has(lg.id)) {
      result.push(mergedById.get(lg.id)!);
    }
  }
  return result;
}

export const jobProfileGroups: JobProfileGroup[] = [
  {
    id: 'executive-leadership',
    name: 'Executive Leadership',
    profiles: [
      { id: '1',  name: 'Chief Executive Officer (CEO)',        careerTrackLevel: 'E5', people: 1 },
      { id: '2',  name: 'Chief Operating Officer (COO)',        careerTrackLevel: 'E5', people: 1 },
      { id: '3',  name: 'Chief Financial Officer (CFO)',        careerTrackLevel: 'E5', people: 1 },
      { id: '4',  name: 'Chief Marketing Officer (CMO)',        careerTrackLevel: 'E5', people: 1 },
      { id: '5',  name: 'Chief Technology Officer (CTO)',       careerTrackLevel: 'E5', people: 1 },
      { id: '6',  name: 'Chief Human Resources Officer (CHRO)', careerTrackLevel: 'E5', people: 1 },
      { id: '7',  name: 'Chief Information Officer (CIO)',      careerTrackLevel: 'E5', people: 1 },
      { id: '8',  name: 'Chief Compliance Officer (CCO)',       careerTrackLevel: 'E5', people: 1 },
    ],
  },
  {
    id: 'vice-presidents',
    name: 'Vice Presidents',
    profiles: [
      { id: '9',  name: 'Vice President of Operations',       careerTrackLevel: 'M4', people: 1 },
      { id: '10', name: 'Vice President of Sales',            careerTrackLevel: 'M4', people: 1 },
      { id: '11', name: 'Vice President of Marketing',        careerTrackLevel: 'M4', people: 1 },
      { id: '12', name: 'Vice President of Finance',          careerTrackLevel: 'M4', people: 1 },
      { id: '13', name: 'Vice President of Human Resources',  careerTrackLevel: 'M4', people: 1 },
      { id: '14', name: 'Vice President of IT',               careerTrackLevel: 'M4', people: 1 },
    ],
  },
  {
    id: 'directors',
    name: 'Directors',
    profiles: [
      { id: '15', name: 'Director of Operations',          careerTrackLevel: 'M3', people: 1 },
      { id: '16', name: 'Director of Sales',               careerTrackLevel: 'M3', people: 1 },
      { id: '17', name: 'Director of Marketing',           careerTrackLevel: 'M3', people: 1 },
      { id: '18', name: 'Director of Finance',             careerTrackLevel: 'M3', people: 1 },
      { id: '19', name: 'Director of Human Resources',     careerTrackLevel: 'M3', people: 1 },
      { id: '20', name: 'Director of IT',                  careerTrackLevel: 'M3', people: 1 },
      { id: '21', name: 'Director of Product Management',  careerTrackLevel: 'M3', people: 1 },
      { id: '22', name: 'Director of Customer Success',    careerTrackLevel: 'M3', people: 1 },
      { id: '23', name: 'Director of Business Development', careerTrackLevel: 'M3', people: 1 },
    ],
  },
  {
    id: 'project-program-management',
    name: 'Project & Program Management',
    profiles: [
      { id: '24', name: 'Senior Project Manager', careerTrackLevel: 'P4', people: 2 },
      { id: '25', name: 'Project Manager',         careerTrackLevel: 'P3', people: 4 },
      { id: '26', name: 'Program Manager',         careerTrackLevel: 'P3', people: 2 },
    ],
  },
  {
    id: 'product',
    name: 'Product',
    profiles: [
      { id: '27', name: 'Product Manager',  careerTrackLevel: 'P3', people: 4 },
      { id: '28', name: 'Product Owner',    careerTrackLevel: 'P2', people: 3 },
      { id: '29', name: 'Business Analyst', careerTrackLevel: 'P2', people: 5 },
    ],
  },
  {
    id: 'finance',
    name: 'Finance',
    profiles: [
      { id: '30', name: 'Financial Analyst', careerTrackLevel: 'P2', people: 4 },
    ],
  },
  {
    id: 'sales',
    name: 'Sales',
    profiles: [
      { id: '31', name: 'Sales Manager',      careerTrackLevel: 'M2', people: 3 },
      { id: '32', name: 'Account Manager',     careerTrackLevel: 'P3', people: 5 },
      { id: '33', name: 'Key Account Manager', careerTrackLevel: 'P4', people: 3 },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    profiles: [
      { id: '34', name: 'Marketing Manager', careerTrackLevel: 'M2', people: 3 },
    ],
  },
  {
    id: 'customer-success',
    name: 'Customer Success',
    profiles: [
      { id: '35', name: 'Customer Success Manager',       careerTrackLevel: 'M2', people: 4 },
      { id: '36', name: 'Customer Service Representative', careerTrackLevel: 'P1', people: 8 },
      { id: '37', name: 'Technical Support Specialist',    careerTrackLevel: 'P2', people: 4 },
    ],
  },
  {
    id: 'human-resources',
    name: 'Human Resources',
    profiles: [
      { id: '38', name: 'HR Manager',                        careerTrackLevel: 'M2', people: 2 },
      { id: '39', name: 'Talent Acquisition Manager',        careerTrackLevel: 'M2', people: 1 },
      { id: '40', name: 'Recruiting Specialist',             careerTrackLevel: 'P2', people: 3 },
      { id: '41', name: 'HR Generalist',                     careerTrackLevel: 'P2', people: 4 },
      { id: '42', name: 'Training and Development Specialist', careerTrackLevel: 'P2', people: 2 },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    profiles: [
      { id: '43', name: 'Operations Manager',  careerTrackLevel: 'M2', people: 3 },
      { id: '44', name: 'Supply Chain Manager', careerTrackLevel: 'M2', people: 2 },
      { id: '45', name: 'Procurement Manager',  careerTrackLevel: 'M2', people: 1 },
    ],
  },
  {
    id: 'information-technology',
    name: 'Information Technology',
    profiles: [
      { id: '46', name: 'IT Manager',           careerTrackLevel: 'M2', people: 2 },
      { id: '47', name: 'Systems Administrator', careerTrackLevel: 'P2', people: 3 },
      { id: '48', name: 'Network Engineer',      careerTrackLevel: 'P2', people: 2 },
      { id: '49', name: 'Software Engineer',     careerTrackLevel: 'P2', people: 8 },
      { id: '50', name: 'Data Analyst',          careerTrackLevel: 'P2', people: 4 },
      { id: '51', name: 'Data Scientist',        careerTrackLevel: 'P3', people: 2 },
    ],
  },
  {
    id: 'legal-compliance',
    name: 'Legal & Compliance',
    profiles: [
      { id: '52', name: 'Legal Counsel',                  careerTrackLevel: 'P4', people: 2 },
      { id: '53', name: 'Compliance Analyst',             careerTrackLevel: 'P2', people: 2 },
      { id: '54', name: 'Quality Assurance (QA) Analyst', careerTrackLevel: 'P2', people: 3 },
      { id: '55', name: 'Internal Auditor',               careerTrackLevel: 'P2', people: 1 },
      { id: '56', name: 'Risk Manager',                   careerTrackLevel: 'M2', people: 1 },
    ],
  },
  {
    id: 'administrative',
    name: 'Administrative & Communications',
    profiles: [
      { id: '57', name: 'Executive Assistant',            careerTrackLevel: 'P2', people: 4 },
      { id: '58', name: 'Administrative Assistant',       careerTrackLevel: 'P1', people: 5 },
      { id: '59', name: 'Office Manager',                 careerTrackLevel: 'P2', people: 2 },
      { id: '60', name: 'Corporate Communications Manager', careerTrackLevel: 'M2', people: 1 },
    ],
  },
]
  .map((g) => ({ ...g, profiles: [...g.profiles].sort((a, b) => b.people - a.people) }))
  .sort((a, b) => {
    const totalA = a.profiles.reduce((s, p) => s + p.people, 0);
    const totalB = b.profiles.reduce((s, p) => s + p.people, 0);
    return totalB - totalA;
  });

export const jobFamilies = jobProfileGroups.map((g) => ({ value: g.id, label: g.name }));
