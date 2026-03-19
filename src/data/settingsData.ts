import type { IconName } from '../components/Icon';

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

export interface JobProfile {
  id: string;
  name: string;
  careerTrackLevel: string;
  people: number;
  jobDescription?: string;
  internalJobCode?: string;
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

export const jobProfileGroups: JobProfileGroup[] = [
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
          'This role involves collaborating closely with various teams to create user-focused designs that enhance our product experience. Responsibilities include conducting user research, designing wireframes and prototypes, and refining designs based on user feedback. Active participation in design discussions and maintaining our design system is essential. The ideal candidate possesses a strong understanding of design principles, is proficient in tools like Sketch or Figma, and has a genuine passion for crafting user-friendly and engaging experiences. Join us in innovating and elevating our product offerings!',
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

export const jobFamilies = jobProfileGroups.map((g) => ({ value: g.id, label: g.name }));
