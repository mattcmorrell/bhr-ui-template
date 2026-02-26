const STORAGE_KEY = 'plan-year-selected-carriers';
const CARRIER_PLANS_STORAGE_KEY = 'plan-year-selected-plans-by-carrier';
const PLAN_YEAR_INCLUDED_PLANS_STORAGE_KEY = 'plan-year-included-plan-ids';
const PLAN_YEAR_CUSTOM_PLANS_STORAGE_KEY = 'plan-year-custom-plans';
const PLAN_YEAR_CUSTOM_YEARS_STORAGE_KEY = 'plan-year-custom-years';
const PLAN_YEAR_BASICS_DRAFT_STORAGE_KEY = 'plan-year-basics-drafts';
const PLAN_YEAR_DELETED_IDS_STORAGE_KEY = 'plan-year-deleted-ids';
const PLAN_YEAR_PLAN_REVIEW_DECISIONS_STORAGE_KEY = 'plan-year-plan-review-decisions';

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

type IncludedPlanIdsByYear = Record<string, string[]>;

function readIncludedPlanIdsByYear(): IncludedPlanIdsByYear {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PLAN_YEAR_INCLUDED_PLANS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as IncludedPlanIdsByYear;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeIncludedPlanIdsByYear(value: IncludedPlanIdsByYear) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PLAN_YEAR_INCLUDED_PLANS_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // no-op: localStorage may be unavailable
  }
}

export function getIncludedPlanIdsForPlanYear(planYearId: string, fallback: string[] = []) {
  const allIncludedPlanIds = readIncludedPlanIdsByYear();
  return allIncludedPlanIds[planYearId] ?? fallback;
}

export function setIncludedPlanIdsForPlanYear(planYearId: string, planIds: string[]) {
  const allIncludedPlanIds = readIncludedPlanIdsByYear();
  allIncludedPlanIds[planYearId] = planIds;
  writeIncludedPlanIdsByYear(allIncludedPlanIds);
}

export interface PlanYearCustomPlan {
  id: string;
  carrierId: string;
  name: string;
  type: string;
  effectiveDate: string;
  endDate: string;
  summary: string;
  status: 'Active' | 'Inactive';
  source?: 'created' | 'renewed';
}

type CustomPlansByYear = Record<string, PlanYearCustomPlan[]>;

function readCustomPlansByYear(): CustomPlansByYear {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PLAN_YEAR_CUSTOM_PLANS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CustomPlansByYear;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeCustomPlansByYear(value: CustomPlansByYear) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PLAN_YEAR_CUSTOM_PLANS_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // no-op: localStorage may be unavailable
  }
}

export function getCustomPlansForPlanYear(planYearId: string) {
  const allCustomPlansByYear = readCustomPlansByYear();
  return allCustomPlansByYear[planYearId] ?? [];
}

export function addCustomPlanForPlanYear(planYearId: string, plan: PlanYearCustomPlan) {
  const allCustomPlansByYear = readCustomPlansByYear();
  const currentPlans = allCustomPlansByYear[planYearId] ?? [];
  allCustomPlansByYear[planYearId] = [...currentPlans, plan];
  writeCustomPlansByYear(allCustomPlansByYear);
}

export interface PlanYearRecord {
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

type PlanYearRecordsById = Record<string, PlanYearRecord>;

function readCustomPlanYearRecords(): PlanYearRecordsById {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PLAN_YEAR_CUSTOM_YEARS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PlanYearRecordsById;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeCustomPlanYearRecords(value: PlanYearRecordsById) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PLAN_YEAR_CUSTOM_YEARS_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // no-op: localStorage may be unavailable
  }
}

function sortPlanYearsDescending(a: PlanYearRecord, b: PlanYearRecord) {
  const aYear = Number.parseInt(a.id, 10);
  const bYear = Number.parseInt(b.id, 10);

  if (Number.isFinite(aYear) && Number.isFinite(bYear)) {
    return bYear - aYear;
  }

  return b.name.localeCompare(a.name);
}

function readDeletedPlanYearIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PLAN_YEAR_DELETED_IDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDeletedPlanYearIds(value: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PLAN_YEAR_DELETED_IDS_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // no-op: localStorage may be unavailable
  }
}

export function getBenefitPlanYearsWithCustom(basePlanYears: PlanYearRecord[]) {
  const customPlanYearsById = readCustomPlanYearRecords();
  const deletedPlanYearIds = new Set(readDeletedPlanYearIds());
  const mergedById: PlanYearRecordsById = {};

  basePlanYears.forEach((planYear) => {
    if (!deletedPlanYearIds.has(planYear.id)) {
      mergedById[planYear.id] = planYear;
    }
  });

  Object.values(customPlanYearsById).forEach((planYear) => {
    if (!deletedPlanYearIds.has(planYear.id)) {
      mergedById[planYear.id] = planYear;
    }
  });

  return Object.values(mergedById).sort(sortPlanYearsDescending);
}

export function upsertCustomPlanYearRecord(planYear: PlanYearRecord) {
  const customPlanYearsById = readCustomPlanYearRecords();
  customPlanYearsById[planYear.id] = planYear;
  writeCustomPlanYearRecords(customPlanYearsById);

  const deletedPlanYearIds = readDeletedPlanYearIds().filter((id) => id !== planYear.id);
  writeDeletedPlanYearIds(deletedPlanYearIds);
}

export interface PlanYearBasicsDraft {
  name: string;
  startDate: string;
  endDate: string;
}

type PlanYearBasicsDraftsById = Record<string, PlanYearBasicsDraft>;

function readPlanYearBasicsDrafts(): PlanYearBasicsDraftsById {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PLAN_YEAR_BASICS_DRAFT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PlanYearBasicsDraftsById;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePlanYearBasicsDrafts(value: PlanYearBasicsDraftsById) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PLAN_YEAR_BASICS_DRAFT_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // no-op: localStorage may be unavailable
  }
}

export function getPlanYearBasicsDraft(planYearId: string, fallback: PlanYearBasicsDraft): PlanYearBasicsDraft {
  const drafts = readPlanYearBasicsDrafts();
  return drafts[planYearId] ?? fallback;
}

export function setPlanYearBasicsDraft(planYearId: string, draft: PlanYearBasicsDraft) {
  const drafts = readPlanYearBasicsDrafts();
  drafts[planYearId] = draft;
  writePlanYearBasicsDrafts(drafts);
}

export function deletePlanYearById(planYearId: string) {
  const deletedPlanYearIds = new Set(readDeletedPlanYearIds());
  deletedPlanYearIds.add(planYearId);
  writeDeletedPlanYearIds(Array.from(deletedPlanYearIds));

  const customPlanYearsById = readCustomPlanYearRecords();
  if (customPlanYearsById[planYearId]) {
    delete customPlanYearsById[planYearId];
    writeCustomPlanYearRecords(customPlanYearsById);
  }
}

export type PlanReviewDecision = 'confirm-as-is' | 'make-changes';
type PlanReviewDecisionsByYear = Record<string, Record<string, PlanReviewDecision>>;

function readPlanReviewDecisionsByYear(): PlanReviewDecisionsByYear {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PLAN_YEAR_PLAN_REVIEW_DECISIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PlanReviewDecisionsByYear;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePlanReviewDecisionsByYear(value: PlanReviewDecisionsByYear) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PLAN_YEAR_PLAN_REVIEW_DECISIONS_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // no-op: localStorage may be unavailable
  }
}

export function getPlanReviewDecisionsForPlanYear(planYearId: string) {
  const allDecisionsByYear = readPlanReviewDecisionsByYear();
  return allDecisionsByYear[planYearId] ?? {};
}

export function setPlanReviewDecisionsForPlanYear(planYearId: string, decisions: Record<string, PlanReviewDecision>) {
  const allDecisionsByYear = readPlanReviewDecisionsByYear();
  allDecisionsByYear[planYearId] = decisions;
  writePlanReviewDecisionsByYear(allDecisionsByYear);
}
