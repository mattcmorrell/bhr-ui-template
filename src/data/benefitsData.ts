export type ElectionCategory = 'incomplete' | 'needs-attention' | 'completed';

export interface BenefitsEmployee {
  id: number;
  name: string;
  title: string;
  avatar: string;
  status: string;
  statusVariant: 'default' | 'warning' | 'success';
  /** Determines which tab (Incomplete, Needs Attention, Completed) the employee appears in */
  electionCategory: ElectionCategory;
}

export const benefitsEmployees: BenefitsEmployee[] = [
  // INCOMPLETE - Haven't started or submitted (New hire, Open enrollment)
  {
    id: 1,
    name: 'Wallace French',
    title: 'Marketing Manager',
    avatar: 'https://i.pravatar.cc/300?img=4',
    status: 'Incomplete - New Hire Enrollment (1 day remaining)',
    statusVariant: 'warning',
    electionCategory: 'incomplete',
  },
  {
    id: 2,
    name: 'Marcus Chen',
    title: 'Software Engineer',
    avatar: 'https://i.pravatar.cc/300?img=11',
    status: 'Not Started - Open Enrollment',
    statusVariant: 'warning',
    electionCategory: 'incomplete',
  },
  // NEEDS ATTENTION - Pending approval, Missing details
  {
    id: 3,
    name: 'Jeremy Dench',
    title: 'Design Lead',
    avatar: 'https://i.pravatar.cc/300?img=3',
    status: 'Pending Approval - New Hire Enrollment (1 day remaining)',
    statusVariant: 'warning',
    electionCategory: 'needs-attention',
  },
  {
    id: 4,
    name: 'Steff Grossman',
    title: 'Group Product Manager',
    avatar: 'https://i.pravatar.cc/300?img=1',
    status: 'Request - Qualifying Life Event (Today)',
    statusVariant: 'default',
    electionCategory: 'needs-attention',
  },
  {
    id: 5,
    name: 'Diana Reyes',
    title: 'HR Coordinator',
    avatar: 'https://i.pravatar.cc/300?img=9',
    status: 'Pending Approval - Open Enrollment',
    statusVariant: 'warning',
    electionCategory: 'needs-attention',
  },
  {
    id: 6,
    name: 'James Okonkwo',
    title: 'Sales Representative',
    avatar: 'https://i.pravatar.cc/300?img=12',
    status: 'Missing Details - Plan selection incomplete',
    statusVariant: 'warning',
    electionCategory: 'needs-attention',
  },
  // COMPLETED - Enrolled
  {
    id: 7,
    name: 'Arnold Cross',
    title: 'Senior Engineer',
    avatar: 'https://i.pravatar.cc/300?img=2',
    status: 'Enrolled in 8 Plans',
    statusVariant: 'success',
    electionCategory: 'completed',
  },
  {
    id: 8,
    name: 'Jenny Abbott',
    title: 'HR Specialist',
    avatar: 'https://i.pravatar.cc/300?img=5',
    status: 'Enrolled in 8 Plans',
    statusVariant: 'success',
    electionCategory: 'completed',
  },
  {
    id: 9,
    name: 'Samantha Montgomery',
    title: 'Finance Analyst',
    avatar: 'https://i.pravatar.cc/300?img=6',
    status: 'Enrolled in 8 Plans',
    statusVariant: 'success',
    electionCategory: 'completed',
  },
  {
    id: 10,
    name: 'Heinz Von Doofenshmirtz',
    title: 'Operations Coordinator',
    avatar: 'https://i.pravatar.cc/300?img=7',
    status: 'Enrolled in 8 Plans',
    statusVariant: 'success',
    electionCategory: 'completed',
  },
  {
    id: 11,
    name: 'Raphael Torres',
    title: 'Customer Success Manager',
    avatar: 'https://i.pravatar.cc/300?img=8',
    status: 'Enrolled in 8 Plans',
    statusVariant: 'success',
    electionCategory: 'completed',
  },
  {
    id: 12,
    name: 'Elena Vasquez',
    title: 'Product Designer',
    avatar: 'https://i.pravatar.cc/300?img=10',
    status: 'Enrolled in 6 Plans',
    statusVariant: 'success',
    electionCategory: 'completed',
  },
];

export interface BenefitPlanVersion {
  id: string;
  name: string;
  carrier: string;
  planYear: string;
  startDate: string;
  endDate: string;
  eligibility: string;
  enrolledCount: number;
  notEnrolledCount: number;
}

export const benefitPlanVersions: BenefitPlanVersion[] = [
  {
    id: 'm1-v2026',
    name: 'Medical Plan Name 1',
    carrier: 'United Healthcare',
    planYear: '2026',
    startDate: '01/01/2026',
    endDate: '12/31/2026',
    eligibility: 'Full-Time',
    enrolledCount: 126,
    notEnrolledCount: 24,
  },
  {
    id: 'm2-v2026',
    name: 'Medical Plan Name 2',
    carrier: 'United Healthcare',
    planYear: '2026',
    startDate: '01/01/2026',
    endDate: '12/31/2026',
    eligibility: 'Full-Time',
    enrolledCount: 82,
    notEnrolledCount: 68,
  },
  {
    id: 'm3-v2026',
    name: 'Medical Plan Name 3',
    carrier: 'United Healthcare',
    planYear: '2026',
    startDate: '01/01/2026',
    endDate: '12/31/2026',
    eligibility: 'Full-Time',
    enrolledCount: 34,
    notEnrolledCount: 116,
  },
  {
    id: 'd1-v2026',
    name: 'Dental Plan Name 1',
    carrier: 'Delta Dental',
    planYear: '2026',
    startDate: '01/01/2026',
    endDate: '12/31/2026',
    eligibility: 'Full-Time',
    enrolledCount: 118,
    notEnrolledCount: 32,
  },
  {
    id: 'v1-v2026',
    name: 'Vision Plan Name 1',
    carrier: 'VSP',
    planYear: '2026',
    startDate: '01/01/2026',
    endDate: '12/31/2026',
    eligibility: 'Full-Time',
    enrolledCount: 111,
    notEnrolledCount: 39,
  },
  {
    id: 's1-v2026',
    name: 'Supplemental Plan Name 1',
    carrier: 'Aflac',
    planYear: '2026',
    startDate: '01/01/2026',
    endDate: '12/31/2026',
    eligibility: 'Full-Time',
    enrolledCount: 74,
    notEnrolledCount: 76,
  },
  {
    id: 'h1-v2026',
    name: 'HSA Plan Name 1',
    carrier: 'Fidelity',
    planYear: '2026',
    startDate: '01/01/2026',
    endDate: '12/31/2026',
    eligibility: 'Full-Time',
    enrolledCount: 88,
    notEnrolledCount: 62,
  },
  {
    id: 'f1-v2026',
    name: 'FSA Plan Name 1',
    carrier: 'Fidelity',
    planYear: '2026',
    startDate: '01/01/2026',
    endDate: '12/31/2026',
    eligibility: 'Full-Time',
    enrolledCount: 69,
    notEnrolledCount: 81,
  },
  {
    id: 'dis1-v2026',
    name: 'Disability Plan Name 1',
    carrier: 'Guardian',
    planYear: '2026',
    startDate: '01/01/2026',
    endDate: '12/31/2026',
    eligibility: 'Full-Time',
    enrolledCount: 63,
    notEnrolledCount: 87,
  },
  {
    id: 'r1-v2026',
    name: '401(k) Plan',
    carrier: 'Fidelity',
    planYear: '2026',
    startDate: '01/01/2026',
    endDate: '12/31/2026',
    eligibility: 'Full-Time',
    enrolledCount: 104,
    notEnrolledCount: 46,
  },
  {
    id: 'l1-v2026',
    name: 'Life Plan Name 1',
    carrier: 'Met Life',
    planYear: '2026',
    startDate: '01/01/2026',
    endDate: '12/31/2026',
    eligibility: 'Full-Time',
    enrolledCount: 121,
    notEnrolledCount: 29,
  },
  {
    id: 'o1-v2026',
    name: 'Other Plan Name 1',
    carrier: 'Aetna',
    planYear: '2026',
    startDate: '01/01/2026',
    endDate: '12/31/2026',
    eligibility: 'Full-Time',
    enrolledCount: 52,
    notEnrolledCount: 98,
  },
];

export type CarrierStatusType = 'connected' | 'pending' | 'request' | 'not-eligible' | 'warning';

export interface Carrier {
  id: string;
  name: string;
  statusType: CarrierStatusType;
  warningText?: string; // e.g. "1 plan is missing details"
}

export const carriers: Carrier[] = [
  { id: 'aetna', name: 'Aetna', statusType: 'connected' },
  { id: 'aflac', name: 'Aflac', statusType: 'pending' },
  { id: 'delta-dental', name: 'Delta Dental', statusType: 'request' },
  { id: 'fidelity', name: 'Fidelity', statusType: 'not-eligible' },
  { id: 'guardian', name: 'Guardian', statusType: 'request' },
  { id: 'met-life', name: 'Met Life', statusType: 'not-eligible' },
  { id: 'united', name: 'United Healthcare', statusType: 'request' },
  { id: 'vista', name: 'Vista', statusType: 'warning', warningText: '1 plan is missing details' },
];

export const attentionItems = [
  {
    id: 'plans',
    icon: 'circle-question' as const,
    text: '6 plans missing required details based on updated settings.',
    link: 'Go to Plans',
  },
  {
    id: 'elections',
    icon: 'pen-to-square' as const,
    text: '6 elections need your approval',
    link: 'Go to Elections',
  },
  {
    id: 'changes',
    icon: 'pen' as const,
    text: '4 employees had information changes that affected their eligibility',
    link: 'Review Changes',
  },
];
