const STORAGE_KEY = 'plan-year-selected-carriers';
const CARRIER_PLANS_STORAGE_KEY = 'plan-year-selected-plans-by-carrier';

type CarrierSelectionsByYear = Record<string, string[]>;

function readSelections(): CarrierSelectionsByYear {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CarrierSelectionsByYear;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeSelections(value: CarrierSelectionsByYear) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // no-op: localStorage may be unavailable
  }
}

export function getSelectedCarrierIdsForPlanYear(planYearId: string, fallbackIds: string[]) {
  const allSelections = readSelections();
  return allSelections[planYearId] ?? fallbackIds;
}

export function setSelectedCarrierIdsForPlanYear(planYearId: string, carrierIds: string[]) {
  const allSelections = readSelections();
  allSelections[planYearId] = carrierIds;
  writeSelections(allSelections);
}

export interface IncludedCarrierPlan {
  name: string;
  type: string;
  effectiveDate: string;
}

type IncludedPlansByCarrier = Record<string, IncludedCarrierPlan[]>;

function readCarrierPlans(): IncludedPlansByCarrier {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CARRIER_PLANS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as IncludedPlansByCarrier;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeCarrierPlans(value: IncludedPlansByCarrier) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CARRIER_PLANS_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // no-op: localStorage may be unavailable
  }
}

function carrierPlansKey(planYearId: string, carrierId: string) {
  return `${planYearId}:${carrierId}`;
}

export function getIncludedPlansForCarrier(planYearId: string, carrierId: string) {
  const allPlans = readCarrierPlans();
  return allPlans[carrierPlansKey(planYearId, carrierId)] ?? [];
}

export function setIncludedPlansForCarrier(planYearId: string, carrierId: string, plans: IncludedCarrierPlan[]) {
  const allPlans = readCarrierPlans();
  allPlans[carrierPlansKey(planYearId, carrierId)] = plans;
  writeCarrierPlans(allPlans);
}
