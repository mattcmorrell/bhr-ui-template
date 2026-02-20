import type { IconName } from '../components/Icon';
import { defaultIncludedPlanIdsByYear, sharedSettingsPlanGroups } from './benefitPlansCatalog';

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

export interface AccessRole {
  id: string;
  name: string;
  description: string;
  members: number;
  scope: string;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  trigger: string;
  approvers: string[];
  sla: string;
}

export interface DirectoryField {
  id: string;
  label: string;
  visibility: string;
  source: string;
}

export interface TimeOffPolicy {
  id: string;
  name: string;
  accrual: string;
  carryover: string;
  requiresApproval: boolean;
}

export interface PayrollSetting {
  id: string;
  label: string;
  value: string;
  status: 'configured' | 'needs-review';
}

export interface BenefitPlan {
  id: string;
  name: string;
  endDate: string;
  eligibility: string;
  status: string;
}

export interface BenefitPlanGroup {
  id: string;
  label: string;
  icon: IconName;
  plans: BenefitPlan[];
}

export interface BenefitPlanYear {
  id: string;
  name: string;
  plans: number;
  status: 'Closed' | 'Active' | 'Draft';
  duration: string;
  pending?: number;
  approved?: number;
  incomplete?: number;
  missingInfoCount?: number;
  nameIsLink?: boolean;
}

export const settingsNavItems: SettingsNavItem[] = [
  { id: 'account', label: 'Account', icon: 'wrench' },
  { id: 'access-levels', label: 'Access Levels', icon: 'lock' },
  { id: 'employee-fields', label: 'Employee Fields', icon: 'pen-to-square' },
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

export const benefitsSubTabs: SubTab[] = [
  { id: 'plan-years', label: 'Plan Years' },
  { id: 'plans', label: 'Plans' },
  { id: 'windows', label: 'Windows' },
  { id: 'elections', label: 'Elections' },
  { id: 'carriers', label: 'Carriers' },
  { id: 'carrier-pdfs', label: 'Carrier PDFs' },
];

export interface SettingsCarrier {
  id: string;
  name: string;
  planCount: number;
  color: string; // for the icon square
  isActive: boolean;
}

export const settingsCarriers: SettingsCarrier[] = [
  { id: 'ampersand', name: 'Ampersand', planCount: 3, color: '#7c3aed', isActive: true },
  { id: 'delta', name: 'Delta', planCount: 1, color: '#2e7918', isActive: true },
  { id: 'fidelity', name: 'Fidelity', planCount: 4, color: '#166534', isActive: true },
  { id: 'mutual', name: 'Mutual of Omaha', planCount: 2, color: '#1e3a5f', isActive: true },
  { id: 'vista', name: 'Vista', planCount: 3, color: '#0ea5e9', isActive: true },
  { id: 'wright', name: 'Wright-Martin', planCount: 1, color: '#6b7280', isActive: true },
  { id: 'united', name: 'United Healthcare', planCount: 3, color: '#6b7280', isActive: false },
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

export const accessRoles: AccessRole[] = [
  {
    id: 'hr-admin',
    name: 'HR Admin',
    description: 'Full access to employee records, approvals, and company settings.',
    members: 4,
    scope: 'All employees',
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Can manage direct reports, approve requests, and review performance.',
    members: 21,
    scope: 'Direct reports only',
  },
  {
    id: 'payroll-specialist',
    name: 'Payroll Specialist',
    description: 'Access to payroll setup, exports, and tax profile configuration.',
    members: 3,
    scope: 'Payroll and compensation',
  },
];

export const approvalWorkflows: ApprovalWorkflow[] = [
  {
    id: 'pto',
    name: 'Time Off Requests',
    trigger: 'Employee submits time off request',
    approvers: ['Direct Manager', 'HR Admin'],
    sla: '48 hours',
  },
  {
    id: 'job-requisition',
    name: 'Job Requisitions',
    trigger: 'Hiring manager opens a new role',
    approvers: ['Department VP', 'Finance'],
    sla: '72 hours',
  },
  {
    id: 'comp-change',
    name: 'Compensation Changes',
    trigger: 'Salary or bonus update proposed',
    approvers: ['People Ops', 'CFO'],
    sla: '24 hours',
  },
];

export const directoryFields: DirectoryField[] = [
  { id: 'display-name', label: 'Display Name', visibility: 'Everyone', source: 'Core profile' },
  { id: 'department', label: 'Department', visibility: 'Everyone', source: 'Job information' },
  { id: 'work-email', label: 'Work Email', visibility: 'Everyone', source: 'Contact fields' },
  { id: 'phone', label: 'Work Phone', visibility: 'Manager+ only', source: 'Contact fields' },
  { id: 'location', label: 'Location', visibility: 'Everyone', source: 'Employment details' },
];

export const timeOffPolicies: TimeOffPolicy[] = [
  {
    id: 'vacation',
    name: 'Vacation',
    accrual: '6.67 hours per pay period',
    carryover: 'Up to 40 hours annually',
    requiresApproval: true,
  },
  {
    id: 'sick',
    name: 'Sick Leave',
    accrual: '4 hours per pay period',
    carryover: 'Up to 80 hours annually',
    requiresApproval: true,
  },
  {
    id: 'bereavement',
    name: 'Bereavement',
    accrual: 'As needed (up to 3 days/event)',
    carryover: 'Not applicable',
    requiresApproval: false,
  },
];

export const payrollSettings: PayrollSetting[] = [
  { id: 'pay-schedule', label: 'Pay Schedule', value: 'Bi-weekly (Friday)', status: 'configured' },
  { id: 'tax-profile', label: 'Tax Profile', value: 'Federal + 14 state registrations', status: 'configured' },
  { id: 'direct-deposit', label: 'Direct Deposit Rules', value: 'Net pay split enabled', status: 'configured' },
  { id: 'garnishments', label: 'Garnishment Rules', value: '2 active configurations', status: 'needs-review' },
];

export const benefitPlanGroups: BenefitPlanGroup[] = sharedSettingsPlanGroups;

export const benefitPlanYears: BenefitPlanYear[] = [
  {
    id: '2026',
    name: '2026',
    plans: defaultIncludedPlanIdsByYear['2026'].length,
    status: 'Active',
    duration: '01/01/2026 - 12/31/2026',
    pending: 0,
    approved: 0,
    incomplete: 5,
    missingInfoCount: 4,
    nameIsLink: true,
  },
  {
    id: '2025',
    name: '2025',
    plans: defaultIncludedPlanIdsByYear['2025'].length,
    status: 'Closed',
    duration: '01/01/2025 - 12/31/2025',
    pending: 0,
    approved: 1,
    incomplete: 9,
    missingInfoCount: 4,
  },
  {
    id: '2024',
    name: '2024',
    plans: defaultIncludedPlanIdsByYear['2024'].length,
    status: 'Closed',
    duration: '05/01/2024 - 05/01/2025',
    pending: 0,
    approved: 2,
    incomplete: 4,
    missingInfoCount: 4,
  },
  {
    id: '2023',
    name: '2023',
    plans: defaultIncludedPlanIdsByYear['2023'].length,
    status: 'Closed',
    duration: '10/28/2023 - 11/03/2024',
    pending: 0,
    approved: 0,
    incomplete: 80,
    missingInfoCount: 4,
  },
];
