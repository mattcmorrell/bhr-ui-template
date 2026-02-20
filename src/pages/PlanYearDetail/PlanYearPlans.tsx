import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Icon } from '../../components';
import { benefitPlanYears } from '../../data/settingsData';
import {
  getCustomPlansForPlanYear,
  getIncludedPlanIdsForPlanYear,
  getSelectedCarrierIdsForPlanYear,
  setIncludedPlanIdsForPlanYear,
} from './planYearWizardState';
import { PlanYearWizardLayout } from './PlanYearWizardLayout';

interface CarrierOption {
  id: string;
  name: string;
}

interface PlanOption {
  id: string;
  name: string;
  type: string;
  currentEndDate: string;
  previousPlanYear: string;
}

interface CarrierPlansGroup {
  carrierId: string;
  carrierName: string;
  plans: PlanOption[];
}

interface PlanVersionDetails {
  id: string;
  label: string;
  status: 'Active' | 'Inactive';
  planName: string;
  carrier: string;
  groupNumber: string;
  planType: string;
  planTypeId: string;
  summary: string;
  description: string;
  attachmentName: string;
}

const CARRIER_OPTIONS: CarrierOption[] = [
  { id: 'united-healthcare', name: 'United Healthcare' },
  { id: 'delta-dental', name: 'Delta Dental' },
  { id: 'vsp', name: 'VSP' },
  { id: 'aetna', name: 'Aetna' },
  { id: 'principal', name: 'Principal' },
  { id: 'fidelity', name: 'Fidelity' },
];

const PLAN_OPTIONS_BY_CARRIER: Record<string, PlanOption[]> = {
  'united-healthcare': [
    {
      id: 'united-medical-bronze',
      name: 'Medical Bronze',
      type: 'Medical',
      currentEndDate: '12/31/2025',
      previousPlanYear: '2025',
    },
    {
      id: 'united-medical-silver',
      name: 'Medical Silver',
      type: 'Medical',
      currentEndDate: '12/31/2025',
      previousPlanYear: '2025',
    },
    {
      id: 'united-medical-gold',
      name: 'Medical Gold',
      type: 'Medical',
      currentEndDate: '12/31/2025',
      previousPlanYear: '2025',
    },
    {
      id: 'united-medical-other',
      name: 'Medical Other',
      type: 'Medical',
      currentEndDate: '12/31/2025',
      previousPlanYear: 'Not Assigned',
    },
  ],
  'delta-dental': [
    {
      id: 'delta-dental-basic',
      name: 'Dental Basic',
      type: 'Dental',
      currentEndDate: '12/31/2025',
      previousPlanYear: '2025',
    },
    {
      id: 'delta-dental-premium',
      name: 'Dental Premium',
      type: 'Dental',
      currentEndDate: '12/31/2025',
      previousPlanYear: 'Not Assigned',
    },
  ],
  'vsp': [
    {
      id: 'vsp-vision-bronze',
      name: 'Vision Bronze',
      type: 'Vision',
      currentEndDate: '12/31/2025',
      previousPlanYear: '2025',
    },
    {
      id: 'vsp-vision-silver',
      name: 'Vision Silver',
      type: 'Vision',
      currentEndDate: '12/31/2025',
      previousPlanYear: '2025',
    },
  ],
  aetna: [
    {
      id: 'aetna-plan-1',
      name: '[Plan Name]',
      type: '[Plan Type]',
      currentEndDate: '12/31/2025',
      previousPlanYear: '2025',
    },
    {
      id: 'aetna-plan-2',
      name: '[Plan Name]',
      type: '[Plan Type]',
      currentEndDate: '12/31/2025',
      previousPlanYear: '2025',
    },
  ],
  principal: [
    {
      id: 'principal-plan-1',
      name: '[Plan Name]',
      type: '[Plan Type]',
      currentEndDate: '12/31/2025',
      previousPlanYear: '2025',
    },
    {
      id: 'principal-plan-2',
      name: '[Plan Name]',
      type: '[Plan Type]',
      currentEndDate: '12/31/2025',
      previousPlanYear: '2025',
    },
  ],
  fidelity: [
    {
      id: 'fidelity-plan-1',
      name: '[Plan Name]',
      type: '[Plan Type]',
      currentEndDate: '12/31/2025',
      previousPlanYear: '2025',
    },
    {
      id: 'fidelity-plan-2',
      name: '[Plan Name]',
      type: '[Plan Type]',
      currentEndDate: '12/31/2025',
      previousPlanYear: '2025',
    },
  ],
};

const EXISTING_INCLUDED_PLAN_IDS_BY_YEAR: Record<string, string[]> = {
  '2026': [
    'united-medical-bronze',
    'united-medical-silver',
    'delta-dental-basic',
    'vsp-vision-bronze',
    'aetna-plan-1',
    'aetna-plan-2',
    'principal-plan-1',
    'fidelity-plan-1',
  ],
};

export function PlanYearPlans() {
  const navigate = useNavigate();
  const { planYearId = 'default' } = useParams<{ planYearId: string }>();
  const selectedPlanYear = benefitPlanYears.find((planYear) => planYear.id === planYearId);
  const isExistingPlanYear = Boolean(selectedPlanYear);
  const activePlanYears = benefitPlanYears.filter((planYear) => planYear.status === 'Active');
  const defaultPlanVersionId = activePlanYears[0]?.id ?? selectedPlanYear?.id ?? 'current';

  const [isAddExistingPlansOpen, setIsAddExistingPlansOpen] = useState(false);
  const [isPlanDetailsOpen, setIsPlanDetailsOpen] = useState(false);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [includedPlanIds, setIncludedPlanIds] = useState<string[]>(
    () =>
      getIncludedPlanIdsForPlanYear(
        planYearId,
        isExistingPlanYear ? (EXISTING_INCLUDED_PLAN_IDS_BY_YEAR[planYearId] ?? []) : [],
      ),
  );
  const [activePlanDetails, setActivePlanDetails] = useState<PlanOption | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState(defaultPlanVersionId);

  const selectedCarrierIds = useMemo(
    () => getSelectedCarrierIdsForPlanYear(planYearId, CARRIER_OPTIONS.map((carrier) => carrier.id)),
    [planYearId],
  );
  const customPlans = useMemo(() => getCustomPlansForPlanYear(planYearId), [planYearId]);

  const groupedPlanOptions = useMemo<CarrierPlansGroup[]>(
    () =>
      CARRIER_OPTIONS.filter((carrier) => selectedCarrierIds.includes(carrier.id)).map((carrier) => ({
        carrierId: carrier.id,
        carrierName: carrier.name,
        plans: [
          ...(PLAN_OPTIONS_BY_CARRIER[carrier.id] ?? []),
          ...customPlans
            .filter((plan) => plan.carrierId === carrier.id)
            .map((plan) => ({
              id: plan.id,
              name: plan.name,
              type: plan.type,
              currentEndDate: plan.endDate,
              previousPlanYear: 'New',
            })),
        ],
      })),
    [customPlans, selectedCarrierIds],
  );

  const allSelectablePlanIds = useMemo(
    () =>
      groupedPlanOptions
        .map((group) => ({
          ...group,
          plans: group.plans.filter((plan) => !includedPlanIds.includes(plan.id)),
        }))
        .flatMap((group) => group.plans.map((plan) => plan.id)),
    [groupedPlanOptions, includedPlanIds],
  );

  const includedGroups = useMemo(
    () =>
      groupedPlanOptions
        .map((group) => ({
          ...group,
          plans: group.plans.filter((plan) => includedPlanIds.includes(plan.id)),
        }))
        .filter((group) => group.plans.length > 0),
    [groupedPlanOptions, includedPlanIds],
  );
  const availableGroups = useMemo(
    () =>
      groupedPlanOptions
        .map((group) => ({
          ...group,
          plans: group.plans.filter((plan) => !includedPlanIds.includes(plan.id)),
        }))
        .filter((group) => group.plans.length > 0),
    [groupedPlanOptions, includedPlanIds],
  );

  const selectedCount = selectedPlanIds.length;
  const allSelected = allSelectablePlanIds.length > 0 && selectedCount === allSelectablePlanIds.length;
  const hasIncludedPlans = includedPlanIds.length > 0;

  const togglePlan = (planId: string) => {
    setSelectedPlanIds((current) =>
      current.includes(planId) ? current.filter((id) => id !== planId) : [...current, planId],
    );
  };

  const removeIncludedPlan = (planId: string) => {
    setIncludedPlanIds((current) => {
      const nextIncludedPlanIds = current.filter((id) => id !== planId);
      setIncludedPlanIdsForPlanYear(planYearId, nextIncludedPlanIds);
      return nextIncludedPlanIds;
    });
    setSelectedPlanIds((current) => current.filter((id) => id !== planId));
  };

  const toggleAllPlans = () => {
    setSelectedPlanIds(allSelected ? [] : allSelectablePlanIds);
  };

  const openAddExistingPlans = () => {
    setSelectedPlanIds([]);
    setIsAddExistingPlansOpen(true);
  };

  const closeModal = () => {
    setIsAddExistingPlansOpen(false);
  };

  const openCreatePlan = () => {
    navigate(`/settings/plan-years/${planYearId}/plans/create`);
  };

  const openEditPlan = (plan: PlanOption, carrierId: string) => {
    const params = new URLSearchParams({
      name: plan.name,
      type: plan.type,
      carrierId,
    });
    navigate(`/settings/plan-years/${planYearId}/plans/edit/${encodeURIComponent(plan.id)}?${params.toString()}`);
  };

  const addSelectedPlans = () => {
    if (selectedCount === 0) return;
    const nextIncludedPlanIds = Array.from(new Set([...includedPlanIds, ...selectedPlanIds]));
    setIncludedPlanIds(nextIncludedPlanIds);
    setIncludedPlanIdsForPlanYear(planYearId, nextIncludedPlanIds);
    setIsAddExistingPlansOpen(false);
  };

  const openPlanDetails = (plan: PlanOption) => {
    setActivePlanDetails(plan);
    setSelectedVersionId(defaultPlanVersionId);
    setIsPlanDetailsOpen(true);
  };

  const closePlanDetails = () => {
    setIsPlanDetailsOpen(false);
  };

  const planVersions = useMemo<PlanVersionDetails[]>(() => {
    if (!activePlanDetails) return [];
    const type = activePlanDetails.type === '[Plan Type]' ? 'HMO' : activePlanDetails.type;
    const baseName =
      activePlanDetails.name === '[Plan Name]' ? 'Medical Plan' : activePlanDetails.name;

    if (activePlanYears.length === 0) {
      return [
        {
          id: defaultPlanVersionId,
          label: selectedPlanYear?.duration ?? 'Current Plan Year',
          status: 'Active',
          planName: `${baseName} Plan Name 1`,
          carrier: 'UnitedHealthCare',
          groupNumber: 'A-324589',
          planType: type,
          planTypeId: '--',
          summary: 'Low Deductible Plan Family Eligible',
          description:
            'The current plan year version includes in-network and out-of-network options with preventive care coverage.',
          attachmentName: `PlanDoc-${defaultPlanVersionId}.pdf`,
        },
      ];
    }

    return activePlanYears.map((planYear, index) => ({
      id: planYear.id,
      label: planYear.duration,
      status: 'Active' as const,
      planName: `${baseName} ${planYear.name}`,
      carrier: 'UnitedHealthCare',
      groupNumber: `A-${324589 + index * 279}`,
      planType: type,
      planTypeId: index === 0 ? '--' : `HMO-${planYear.name.slice(-2)}`,
      summary: index === 0 ? 'Low Deductible Plan Family Eligible' : 'Family and Employee Coverage',
      description:
        index === 0
          ? 'The current active version gives employees flexibility to see trusted providers with broad coverage options.'
          : `This active plan year version for ${planYear.name} includes balanced deductibles and preventive care benefits.`,
      attachmentName: `PlanDoc-${planYear.id}.pdf`,
    }));
  }, [activePlanDetails, activePlanYears, defaultPlanVersionId, selectedPlanYear?.duration]);

  const selectedVersionDetails = useMemo(
    () => planVersions.find((version) => version.id === selectedVersionId) ?? planVersions[0],
    [planVersions, selectedVersionId],
  );

  return (
    <PlanYearWizardLayout activeStep="plans">
      <section className="flex-1 min-h-[760px] rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden flex flex-col">
        <div className="flex-1 px-8 py-8">
          {!hasIncludedPlans ? (
            <div className="h-full flex flex-col items-center">
              <h2
                className="text-[32px] font-semibold text-[var(--text-neutral-xx-strong)] text-center"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '40px' }}
              >
                Add All plans offered in {`[Plan Year]`}
              </h2>

              <div className="mt-12 mb-6 size-[112px] rounded-[12px] border-2 border-[var(--border-neutral-medium)] text-[var(--border-neutral-medium)] flex items-center justify-center">
                <Icon name="file-lines" variant="regular" size={66} />
              </div>

              <p
                className="text-[40px] font-semibold text-[var(--text-neutral-medium)] text-center"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '48px' }}
              >
                No Plans Included in {`[Plan Year]`}... Yet
              </p>

              <div className="mt-6 flex items-center gap-4">
                <Button variant="primary" size="medium" icon="chevron-right" onClick={openAddExistingPlans}>
                  Add Existing Plans
                </Button>
                <Button variant="standard" size="medium" icon="circle-plus-lined" showCaret onClick={openCreatePlan}>
                  Create New Plan
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] px-7 py-7 flex flex-col">
              <h2
                className="text-[32px] font-semibold text-[var(--text-neutral-xx-strong)] text-center"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '40px' }}
              >
                Add All plans offered in {`[Plan Year]`}
              </h2>

              <div className="mt-6 flex items-center justify-between">
                <p className="text-[15px] font-semibold text-[var(--text-neutral-strong)]">{includedPlanIds.length} Plans Included</p>
                <div className="flex items-center gap-2">
                  <Button variant="outlined" size="small" icon="chevron-right" onClick={openAddExistingPlans}>
                    Add Existing
                  </Button>
                  <Button variant="standard" size="small" icon="circle-plus-lined" onClick={openCreatePlan}>
                    Create New
                  </Button>
                </div>
              </div>

              <div className="mt-3 h-[52px] bg-[var(--surface-neutral-xx-weak)] rounded-[6px] px-4 flex items-center">
                <p className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-strong)]">Plan Name</p>
                <p className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-strong)]">Effective Date</p>
                <p className="w-[170px] text-[15px] font-semibold text-[var(--text-neutral-strong)]">Status</p>
              </div>

              <div className="mt-3 flex-1 min-h-0 overflow-y-auto pr-1">
                {includedGroups.map((group) => (
                  <div key={group.carrierId} className="mb-3">
                    <div className="h-8 px-3 rounded-[8px] bg-[var(--surface-neutral-x-weak)] flex items-center">
                      <p className="text-[14px] font-semibold text-[var(--text-neutral-medium)] leading-[20px]">{group.carrierName}</p>
                    </div>

                    <div className="mt-2 space-y-2">
                      {group.plans.map((plan) => (
                        <div
                          key={plan.id}
                          className="h-[84px] rounded-[16px] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)] px-4 flex items-center"
                        >
                          <div className="flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => openPlanDetails(plan)}
                              className="text-[16px] font-medium leading-[24px] text-[#0b4fd1] truncate text-left hover:underline"
                            >
                              {plan.name}
                            </button>
                            <p className="text-[13px] leading-[19px] text-[var(--text-neutral-strong)]">{plan.type}</p>
                          </div>

                          <div className="flex-1 flex items-center gap-2 text-[var(--text-neutral-strong)]">
                            <Icon name="calendar" size={16} />
                            <p className="text-[15px] leading-[22px]">01/01/2026</p>
                          </div>

                          <div className="w-[170px] flex items-center justify-end gap-2">
                            <Button variant="standard" size="small" icon="pen" onClick={() => openEditPlan(plan, group.carrierId)}>
                              Edit Plan
                            </Button>
                            <button
                              type="button"
                              onClick={() => removeIncludedPlan(plan.id)}
                              className="size-10 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[var(--text-neutral-strong)] shadow-[var(--shadow-100)] text-[16px] leading-none flex items-center justify-center"
                              aria-label={`Remove ${plan.name}`}
                            >
                              -
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="h-[128px] border-t border-[var(--border-neutral-x-weak)] px-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`/settings/plan-years/${planYearId}/carriers`)}
            className="h-12 px-8 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[18px] font-semibold leading-[26px] text-[var(--text-neutral-strong)] shadow-[var(--shadow-100)]"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={() => navigate(`/settings/plan-years/${planYearId}/open-enrollment`)}
            className="h-12 px-9 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-white text-[18px] font-semibold leading-[26px] shadow-[var(--shadow-100)]"
          >
            Next
          </button>
        </footer>
      </section>

      {isAddExistingPlansOpen && (
        <div className="fixed inset-0 z-50 bg-[#605b58]/95 px-8 py-8" onClick={closeModal}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add Existing Plans"
            onClick={(event) => event.stopPropagation()}
            className="h-full w-full rounded-[16px] bg-[var(--surface-neutral-xx-weak)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden flex flex-col"
          >
            <header className="h-[84px] px-8 border-b border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] flex items-center justify-between">
              <h2
                className="text-[52px] font-semibold text-[var(--color-primary-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '38px' }}
              >
                Add Existing Plans
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="size-10 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[var(--text-neutral-strong)] flex items-center justify-center bg-[var(--surface-neutral-white)] shadow-[var(--shadow-100)]"
                aria-label="Close"
              >
                <Icon name="xmark" size={16} />
              </button>
            </header>

            <div className="flex-1 p-8 min-h-0">
              <section className="h-full rounded-[16px] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] px-7 pt-6 pb-6 shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] flex flex-col min-h-0">
                <h3
                  className="text-[44px] font-semibold text-[var(--text-neutral-xx-strong)]"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '26px' }}
                >
                  Which existing plans do you want to offer in this plan year?
                </h3>
                <p className="mt-3 text-[15px] leading-[22px] text-[var(--text-neutral-x-strong)]">
                  Select below, and you can make any changes later.
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[14px] font-medium leading-[20px] text-[var(--text-neutral-strong)]">Active Plans</p>
                  <button type="button" className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#0b4fd1] leading-[22px]">
                    <Icon name="eye" size={14} />
                    Show Inactive Plans
                  </button>
                </div>

                <div className="mt-2 flex-1 min-h-0 overflow-y-auto pr-1">
                  <div className="rounded-[6px] overflow-hidden">
                    <div className="h-[52px] bg-[var(--surface-neutral-xx-weak)] px-3 flex items-center">
                      <div className="w-9 shrink-0 flex items-center">
                        <input
                          type="checkbox"
                          checked={allSelectablePlanIds.length > 0 && allSelected}
                          onChange={toggleAllPlans}
                          className="size-4 rounded-[4px] border border-[var(--border-neutral-medium)] accent-[var(--color-primary-strong)]"
                        />
                      </div>
                      <p className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-strong)]">Plan Name</p>
                      <p className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-strong)]">Plan Type</p>
                      <p className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-strong)]">Current End Date</p>
                      <p className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-strong)]">Most Recent Plan Year</p>
                    </div>

                    <div className="bg-[var(--surface-neutral-white)]">
                      {availableGroups.map((group) => (
                        <div key={group.carrierId} className="pt-1">
                          <div className="h-8 px-3 rounded-[8px] bg-[var(--surface-neutral-x-weak)] flex items-center">
                            <p className="text-[14px] font-semibold text-[var(--text-neutral-medium)] leading-[20px]">{group.carrierName}</p>
                          </div>

                          {group.plans.map((plan) => {
                            const isSelected = selectedPlanIds.includes(plan.id);
                            return (
                              <div
                                key={plan.id}
                                className={`h-[58px] border-b border-[var(--border-neutral-xx-weak)] px-3 flex items-center ${
                                  isSelected ? 'bg-[#dcefdc]' : 'bg-[var(--surface-neutral-white)]'
                                }`}
                              >
                                <div className="w-9 shrink-0 flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => togglePlan(plan.id)}
                                    className="size-4 rounded-[4px] border border-[var(--border-neutral-medium)] accent-[var(--color-primary-strong)]"
                                  />
                                </div>
                                <p className="flex-1 text-[15px] leading-[22px] text-[var(--text-neutral-x-strong)]">{plan.name}</p>
                                <p className="flex-1 text-[15px] leading-[22px] text-[var(--text-neutral-x-strong)]">{plan.type}</p>
                                <p className="flex-1 text-[15px] leading-[22px] text-[var(--text-neutral-x-strong)]">{plan.currentEndDate}</p>
                                <p className="flex-1 text-[15px] leading-[22px] text-[var(--text-neutral-x-strong)]">{plan.previousPlanYear}</p>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                      {availableGroups.length === 0 && (
                        <div className="h-[120px] border-b border-[var(--border-neutral-xx-weak)] px-3 flex items-center justify-center bg-[var(--surface-neutral-white)]">
                          <p className="text-[15px] leading-[22px] text-[var(--text-neutral-medium)]">
                            All available plans are already included in this plan year.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <footer className="h-[108px] px-8 border-t border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] flex items-center gap-4">
              <button
                type="button"
                onClick={addSelectedPlans}
                disabled={selectedCount === 0}
                className={`h-10 px-5 rounded-[var(--radius-full)] text-[15px] font-semibold leading-[22px] shadow-[var(--shadow-100)] disabled:opacity-100 ${
                  selectedCount === 0
                    ? 'bg-[var(--surface-neutral-medium)] text-white cursor-not-allowed'
                    : 'bg-[var(--color-primary-strong)] text-white hover:bg-[var(--color-primary-medium)]'
                }`}
              >
                Add {selectedCount} Plans
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="h-10 px-1 text-[15px] font-semibold leading-[22px] text-[#0b4fd1]"
              >
                Cancel
              </button>
            </footer>
          </div>
        </div>
      )}

      {isPlanDetailsOpen && activePlanDetails && (
        <div className="fixed inset-0 z-[60] bg-[#605b58]/95 p-8" onClick={closePlanDetails}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${activePlanDetails.name} Details`}
            onClick={(event) => event.stopPropagation()}
            className="h-full w-full rounded-[16px] bg-[var(--surface-neutral-xx-weak)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden flex flex-col"
          >
            <header className="h-[84px] px-8 border-b border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] flex items-center justify-between">
              <h2
                className="text-[44px] font-semibold text-[var(--color-primary-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '38px' }}
              >
                {activePlanDetails.name}
              </h2>
              <button
                type="button"
                onClick={closePlanDetails}
                className="size-10 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[var(--text-neutral-strong)] flex items-center justify-center bg-[var(--surface-neutral-white)] shadow-[var(--shadow-100)]"
                aria-label="Close"
              >
                <Icon name="xmark" size={16} />
              </button>
            </header>

            <div className="flex-1 min-h-0 px-8 py-6 flex flex-col gap-6">
              <div>
                <p className="text-[15px] font-medium leading-[22px] text-[var(--text-neutral-medium)]">Plan Versions</p>
                <div className="mt-3 grid grid-cols-[1fr_1fr_1fr_auto] gap-4">
                  {planVersions.map((version) => {
                    const isSelected = selectedVersionDetails?.id === version.id;
                    return (
                      <button
                        key={version.id}
                        type="button"
                        onClick={() => setSelectedVersionId(version.id)}
                        className={`h-[86px] rounded-[16px] border bg-[var(--surface-neutral-white)] shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)] px-5 text-left ${
                          isSelected ? 'border-[var(--color-primary-medium)]' : 'border-[var(--border-neutral-x-weak)]'
                        }`}
                      >
                        <p
                          className={`text-[16px] leading-[24px] ${
                            isSelected ? 'font-bold text-[var(--color-primary-strong)]' : 'font-medium text-[var(--text-neutral-strong)]'
                          }`}
                        >
                          {version.label}
                        </p>
                        <p className="text-[15px] leading-[22px] text-[var(--text-neutral-strong)]">{version.status}</p>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className="h-[86px] rounded-[16px] border border-dashed border-[var(--border-neutral-weak)] bg-[var(--surface-neutral-white)] px-6 flex items-center gap-3 text-[var(--text-neutral-strong)]"
                  >
                    <Icon name="link" size={20} />
                    <span className="text-[16px] font-medium leading-[24px] whitespace-nowrap">Link Old Version</span>
                  </button>
                </div>
              </div>

              <section className="flex-1 min-h-0 rounded-[16px] bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-x-weak)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] p-6 flex gap-8 overflow-hidden">
                <aside className="w-[260px] shrink-0 border-r border-[var(--border-neutral-x-weak)] pr-6">
                  <div className="space-y-1 text-[var(--text-neutral-strong)]">
                    <div className="h-10 rounded-[8px] bg-[var(--surface-neutral-xx-weak)] px-3 flex items-center text-[14px] font-semibold text-[var(--color-primary-strong)]">
                      Plan Details
                    </div>
                    <div className="h-9 px-3 flex items-center text-[15px]">Coverage Options</div>
                    <div className="h-9 px-3 flex items-center text-[15px]">Premium Type</div>
                    <div className="h-9 px-3 flex items-center text-[15px]">Eligibility and Cost</div>
                    <div className="h-9 px-3 flex items-center text-[15px]">Employment Details</div>
                    <div className="h-9 px-3 flex items-center text-[15px]">Payroll Deductions</div>
                  </div>
                </aside>

                <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="size-9 rounded-[10px] bg-[var(--surface-neutral-xx-weak)] flex items-center justify-center text-[var(--color-primary-strong)]">
                        <Icon name="table-cells" size={16} />
                      </span>
                      <h3 className="text-[21px] font-semibold text-[var(--color-primary-strong)]" style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '26px' }}>
                        Plan Details
                      </h3>
                    </div>
                    <Button variant="standard" size="small">Edit</Button>
                  </div>

                  <div className="space-y-4 text-[var(--text-neutral-x-strong)]">
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Plan Name</p>
                      <p className="text-[15px] leading-[22px]">{selectedVersionDetails?.planName}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Carrier</p>
                      <p className="text-[15px] leading-[22px]">{selectedVersionDetails?.carrier}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Group Number</p>
                      <p className="text-[15px] leading-[22px]">{selectedVersionDetails?.groupNumber}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Plan Type</p>
                      <p className="text-[15px] leading-[22px]">{selectedVersionDetails?.planType}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Plan Type ID</p>
                      <p className="text-[15px] leading-[22px]">{selectedVersionDetails?.planTypeId}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Summary</p>
                      <p className="text-[15px] leading-[22px]">{selectedVersionDetails?.summary}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Description</p>
                      <p className="text-[15px] leading-[22px]">{selectedVersionDetails?.description}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Attachments</p>
                      <button
                        type="button"
                        className="mt-2 h-10 px-4 rounded-[12px] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[#0b4fd1] text-[15px] leading-[22px] shadow-[var(--shadow-100)] inline-flex items-center gap-2"
                      >
                        {selectedVersionDetails?.attachmentName}
                        <Icon name="paperclip" size={14} className="text-[var(--text-neutral-strong)]" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <footer className="h-[108px] px-8 border-t border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] flex items-center gap-4">
              <button
                type="button"
                onClick={closePlanDetails}
                className="h-10 px-6 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-white text-[15px] font-semibold leading-[22px] shadow-[var(--shadow-100)]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={closePlanDetails}
                className="h-10 px-1 text-[15px] font-semibold leading-[22px] text-[#0b4fd1]"
              >
                Cancel
              </button>
            </footer>
          </div>
        </div>
      )}
    </PlanYearWizardLayout>
  );
}

export default PlanYearPlans;
