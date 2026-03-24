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
  { id: 'div-apac', name: 'Asia-Pacific', people: 8 },
  { id: 'div-eu', name: 'Europe', people: 13 },
  { id: 'div-na', name: 'North America', people: 65 },
];

export const organizationDepartments: OrganizationCountRow[] = [
  { id: 'dept-cs', name: 'Customer Success', people: 13 },
  { id: 'dept-fin', name: 'Finance', people: 4 },
  { id: 'dept-hr', name: 'Human Resources', people: 15 },
  { id: 'dept-it', name: 'IT', people: 5 },
  { id: 'dept-mkt', name: 'Marketing', people: 7 },
  { id: 'dept-ops', name: 'Operations', people: 7 },
  { id: 'dept-prod', name: 'Product', people: 17 },
  { id: 'dept-sales', name: 'Sales', people: 21 },
  { id: 'dept-ux', name: 'UX', people: 0 },
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
    people: 59,
  },
  {
    id: 'loc-london',
    name: 'London, UK',
    address: '2/3 Conduit St, Mayfair, London, City of W1S 2BX, United Kingdom',
    people: 14,
  },
  {
    id: 'loc-remote',
    name: 'Remote Worker',
    address: 'Remote Location',
    people: 1,
  },
  {
    id: 'loc-sydney',
    name: 'Sydney, Australia',
    address: '201 Elizabeth St, Sydney, New South Wales 2000, Australia',
    people: 9,
  },
  {
    id: 'loc-vancouver',
    name: 'Vancouver, Canada',
    address: '720 Granville St, Vancouver, British Columbia V6Z 1E4, Canada',
    people: 7,
  },
];

export const organizationEeoCategories: OrganizationCountRow[] = [
  { id: 'eeo-sales', name: 'Sales Workers', people: 12 },
  { id: 'eeo-prof', name: 'Professionals', people: 9 },
  {
    id: 'eeo-exec',
    name: 'Executive/Senior Level Officials and Managers',
    people: 2,
  },
  { id: 'eeo-tech', name: 'Technicians', people: 0 },
  { id: 'eeo-uncat', name: 'Uncategorized', people: 1 },
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

const builtInJobProfileGroups: JobProfileGroup[] = [
  {
    id: 'product-design',
    name: 'Product Design',
    profiles: [
      { id: '1', name: 'Associate Product Designer', careerTrackLevel: 'P1', people: 3 },
      { id: '2', name: 'Product Designer I', careerTrackLevel: 'P2', people: 3 },
      {
        id: '3',
        name: 'Product Designer II',
        careerTrackLevel: 'P3',
        people: 5,
        jobDescription:
          'This role focuses on creating and refining concepts for new or improved products and experiences, balancing functionality, aesthetics, and user experience. Responsibilities include conducting user research, developing prototypes, and collaborating with engineering and marketing teams to ensure design feasibility and market fit. Proficiency in design software, strong visualization skills, and an understanding of how designs move into delivery are essential. The position often requires presenting ideas and revisions to stakeholders, as well as iterating designs based on feedback. Attention to detail, problem-solving, and project management abilities are key for successfully bringing innovative work to market. This profile reflects a standard scope for the level, with clear expectations for quality and collaboration.',
      },
      { id: '4', name: 'Sr. Product Designer', careerTrackLevel: 'P4', people: 6 },
      { id: '5', name: 'Staff Product Designer', careerTrackLevel: 'P5', people: 2 },
      { id: '6', name: 'Principal Product Designer', careerTrackLevel: 'P6', people: 1 },
      { id: '7', name: 'Design Lead', careerTrackLevel: 'M1', people: 2 },
      { id: '8', name: 'Director of Product Design', careerTrackLevel: 'M2', people: 3 },
      { id: '9', name: 'Sr. Director of Product Design', careerTrackLevel: 'M3', people: 1 },
    ],
  },
  {
    id: 'product-management',
    name: 'Product Management',
    profiles: [
      { id: '10', name: 'Associate Product Manager', careerTrackLevel: 'P1', people: 1 },
      { id: '11', name: 'Product Manager I', careerTrackLevel: 'P2', people: 3 },
      { id: '12', name: 'Product Manager II', careerTrackLevel: 'P3', people: 1 },
    ],
  },
];

export const jobProfileGroups: JobProfileGroup[] = [
  ...builtInJobProfileGroups,
  ...(jobLibProfileGroups.filter(
    (g) => !builtInJobProfileGroups.some((b) => b.id === g.id)
  ) as JobProfileGroup[]),
];

export const jobFamilies = jobProfileGroups.map((g) => ({ value: g.id, label: g.name }));
