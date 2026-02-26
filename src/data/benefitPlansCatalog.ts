import type { IconName } from '../components/Icon';

export interface UnifiedBenefitPlan {
  id: string;
  name: string;
  type: string;
  categoryId: string;
  carrierId: string;
  carrierName: string;
  effectiveDate: string;
  endDate: string;
  mostRecentPlanYear: string;
  eligibility: string;
  enrolledCount: number;
  waivedCount: number;
}

interface PlanCategoryMeta {
  label: string;
  icon: IconName;
}

const PLAN_CATEGORY_META: Record<string, PlanCategoryMeta> = {
  medical: { label: 'Medical', icon: 'heart' },
  dental: { label: 'Dental', icon: 'star' },
  vision: { label: 'Vision', icon: 'eye' },
  supplemental: { label: 'Supplemental', icon: 'compass' },
  life: { label: 'Life', icon: 'shield' },
  disability: { label: 'Disability', icon: 'wrench' },
  retirement: { label: 'Retirement', icon: 'piggy-bank' },
};

export const unifiedBenefitPlans: UnifiedBenefitPlan[] = [
  {
    id: 'uhc-choice-plus-ppo-500',
    name: 'UnitedHealthcare Choice Plus PPO 500',
    type: 'Medical',
    categoryId: 'medical',
    carrierId: 'united-healthcare',
    carrierName: 'UnitedHealthcare',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: '2025',
    eligibility: 'Full-Time (30+ hrs)',
    enrolledCount: 126,
    waivedCount: 24,
  },
  {
    id: 'uhc-nexus-aco-hdhp-3000',
    name: 'UnitedHealthcare Nexus ACO HDHP 3000',
    type: 'Medical',
    categoryId: 'medical',
    carrierId: 'united-healthcare',
    carrierName: 'UnitedHealthcare',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: '2025',
    eligibility: 'Full-Time (30+ hrs)',
    enrolledCount: 82,
    waivedCount: 68,
  },
  {
    id: 'uhc-choice-plus-epo-1000',
    name: 'UnitedHealthcare Choice EPO 1000',
    type: 'Medical',
    categoryId: 'medical',
    carrierId: 'united-healthcare',
    carrierName: 'UnitedHealthcare',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: '2024',
    eligibility: 'Full-Time (30+ hrs)',
    enrolledCount: 34,
    waivedCount: 116,
  },
  {
    id: 'delta-ppo-premier',
    name: 'Delta Dental PPO Premier',
    type: 'Dental',
    categoryId: 'dental',
    carrierId: 'delta-dental',
    carrierName: 'Delta Dental',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: '2025',
    eligibility: 'All benefit-eligible employees',
    enrolledCount: 141,
    waivedCount: 9,
  },
  {
    id: 'delta-dhmo',
    name: 'DeltaCare USA DHMO',
    type: 'Dental',
    categoryId: 'dental',
    carrierId: 'delta-dental',
    carrierName: 'Delta Dental',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: '2025',
    eligibility: 'All benefit-eligible employees',
    enrolledCount: 27,
    waivedCount: 123,
  },
  {
    id: 'vsp-choice',
    name: 'VSP Choice Network',
    type: 'Vision',
    categoryId: 'vision',
    carrierId: 'vsp',
    carrierName: 'VSP',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: '2025',
    eligibility: 'All benefit-eligible employees',
    enrolledCount: 118,
    waivedCount: 32,
  },
  {
    id: 'vsp-signature',
    name: 'VSP Signature Vision',
    type: 'Vision',
    categoryId: 'vision',
    carrierId: 'vsp',
    carrierName: 'VSP',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: 'Not Assigned',
    eligibility: 'Executive + Director tiers',
    enrolledCount: 19,
    waivedCount: 131,
  },
  {
    id: 'aetna-accident',
    name: 'Aetna Group Accident Insurance',
    type: 'Supplemental',
    categoryId: 'supplemental',
    carrierId: 'aetna',
    carrierName: 'Aetna',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: '2025',
    eligibility: 'All benefit-eligible employees',
    enrolledCount: 61,
    waivedCount: 89,
  },
  {
    id: 'aetna-critical-illness',
    name: 'Aetna Critical Illness',
    type: 'Supplemental',
    categoryId: 'supplemental',
    carrierId: 'aetna',
    carrierName: 'Aetna',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: '2024',
    eligibility: 'All benefit-eligible employees',
    enrolledCount: 39,
    waivedCount: 111,
  },
  {
    id: 'principal-basic-life-add',
    name: 'Principal Basic Life + AD&D',
    type: 'Life',
    categoryId: 'life',
    carrierId: 'principal',
    carrierName: 'Principal',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: '2025',
    eligibility: 'All benefit-eligible employees',
    enrolledCount: 150,
    waivedCount: 0,
  },
  {
    id: 'principal-short-term-disability',
    name: 'Principal Short-Term Disability',
    type: 'Disability',
    categoryId: 'disability',
    carrierId: 'principal',
    carrierName: 'Principal',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: '2025',
    eligibility: 'All benefit-eligible employees',
    enrolledCount: 146,
    waivedCount: 4,
  },
  {
    id: 'principal-long-term-disability',
    name: 'Principal Long-Term Disability',
    type: 'Disability',
    categoryId: 'disability',
    carrierId: 'principal',
    carrierName: 'Principal',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: '2023',
    eligibility: 'All benefit-eligible employees',
    enrolledCount: 137,
    waivedCount: 13,
  },
  {
    id: 'fidelity-401k-core',
    name: 'Fidelity 401(k) Core + 4% Match',
    type: 'Retirement',
    categoryId: 'retirement',
    carrierId: 'fidelity',
    carrierName: 'Fidelity',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: '2025',
    eligibility: 'All employees after 30 days',
    enrolledCount: 132,
    waivedCount: 18,
  },
  {
    id: 'fidelity-roth-401k',
    name: 'Fidelity Roth 401(k)',
    type: 'Retirement',
    categoryId: 'retirement',
    carrierId: 'fidelity',
    carrierName: 'Fidelity',
    effectiveDate: '01/01/2026',
    endDate: '12/31/2026',
    mostRecentPlanYear: '2024',
    eligibility: 'All employees after 30 days',
    enrolledCount: 74,
    waivedCount: 76,
  },
];

export const planYearCarrierOptions = Array.from(
  new Map(unifiedBenefitPlans.map((plan) => [plan.carrierId, { id: plan.carrierId, name: plan.carrierName }])).values(),
);

export const unifiedBenefitPlansByCarrier = unifiedBenefitPlans.reduce<Record<string, UnifiedBenefitPlan[]>>(
  (accumulator, plan) => {
    if (!accumulator[plan.carrierId]) accumulator[plan.carrierId] = [];
    accumulator[plan.carrierId].push(plan);
    return accumulator;
  },
  {},
);

export const defaultIncludedPlanIdsByYear: Record<string, string[]> = {
  '2026': [
    'uhc-choice-plus-ppo-500',
    'uhc-nexus-aco-hdhp-3000',
    'delta-ppo-premier',
    'vsp-choice',
    'aetna-accident',
    'principal-basic-life-add',
    'principal-short-term-disability',
    'fidelity-401k-core',
    'fidelity-roth-401k',
    'delta-dhmo',
  ],
  '2025': [
    'uhc-choice-plus-ppo-500',
    'delta-ppo-premier',
    'vsp-choice',
    'aetna-accident',
    'principal-basic-life-add',
    'principal-short-term-disability',
    'fidelity-401k-core',
    'delta-dhmo',
  ],
  '2024': [
    'uhc-choice-plus-ppo-500',
    'delta-ppo-premier',
    'vsp-choice',
    'principal-basic-life-add',
    'principal-short-term-disability',
    'fidelity-401k-core',
  ],
  '2023': [
    'uhc-choice-plus-ppo-500',
    'delta-ppo-premier',
    'principal-basic-life-add',
    'fidelity-401k-core',
  ],
};

export interface SettingsPlanGroup {
  id: string;
  label: string;
  icon: IconName;
  plans: Array<{
    id: string;
    name: string;
    endDate: string;
    eligibility: string;
    status: string;
  }>;
}

export const sharedSettingsPlanGroups: SettingsPlanGroup[] = Object.entries(PLAN_CATEGORY_META).map(
  ([categoryId, meta]) => ({
    id: categoryId,
    label: meta.label,
    icon: meta.icon,
    plans: unifiedBenefitPlans
      .filter((plan) => plan.categoryId === categoryId)
      .map((plan) => ({
        id: plan.id,
        name: plan.name,
        endDate: plan.endDate,
        eligibility: plan.eligibility,
        status: `${plan.enrolledCount} Enrolled, ${plan.waivedCount} Not enrolled/waived`,
      })),
  }),
).filter((group) => group.plans.length > 0);
