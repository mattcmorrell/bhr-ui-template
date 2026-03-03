import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Dropdown, Icon } from '../../components';
import {
  defaultIncludedPlanIdsByYear,
  planYearCarrierOptions,
  unifiedBenefitPlansByCarrier,
} from '../../data/benefitPlansCatalog';
import { benefitPlanYears } from '../../data/settingsData';
import {
  addCustomPlanForPlanYear,
  getBenefitPlanYearsWithCustom,
  getCustomPlansForPlanYear,
  getIncludedPlanIdsForPlanYear,
  getSelectedCarrierIdsForPlanYear,
  setIncludedPlanIdsForPlanYear,
} from './planYearWizardState';
import { PlanYearWizardLayout } from './PlanYearWizardLayout';

interface PlanOption {
  id: string;
  name: string;
  type: string;
  effectiveDate: string;
  currentEndDate: string;
  previousPlanYear: string;
  isRenewed?: boolean;
  isNew?: boolean;
}

interface CarrierPlansGroup {
  carrierId: string;
  carrierName: string;
  plans: PlanOption[];
}

const PLAN_OPTIONS_BY_CARRIER: Record<string, PlanOption[]> = Object.fromEntries(
  Object.entries(unifiedBenefitPlansByCarrier).map(([carrierId, plans]) => [
    carrierId,
    plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      type: plan.type,
      effectiveDate: plan.effectiveDate,
      currentEndDate: plan.endDate,
      previousPlanYear: plan.mostRecentPlanYear,
      isRenewed: true,
    })),
  ]),
);

export function PlanYearPlans() {
  const navigate = useNavigate();
  const location = useLocation();
  const { planYearId = 'default' } = useParams<{ planYearId: string }>();
  const allPlanYears = getBenefitPlanYearsWithCustom(benefitPlanYears);
  const selectedPlanYear = allPlanYears.find((planYear) => planYear.id === planYearId);
  const hasPresetDefaults = benefitPlanYears.some((planYear) => planYear.id === planYearId);
  const isFirstTimePlanYearSetup = !selectedPlanYear;
  const planYearName = selectedPlanYear?.name ?? planYearId ?? 'Plan Year';

  const [isAddExistingPlansOpen, setIsAddExistingPlansOpen] = useState(false);
  const [isCreatePlanChoiceOpen, setIsCreatePlanChoiceOpen] = useState(false);
  const [createPlanMode, setCreatePlanMode] = useState<'scratch' | 'template'>('scratch');
  const [selectedTemplatePlanId, setSelectedTemplatePlanId] = useState('');
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [includedPlanIds, setIncludedPlanIds] = useState<string[]>(
    () =>
      getIncludedPlanIdsForPlanYear(
        planYearId,
        hasPresetDefaults ? (defaultIncludedPlanIdsByYear[planYearId] ?? []) : [],
      ),
  );
  const [openPlanActionsId, setOpenPlanActionsId] = useState<string | null>(null);
  const [isRenewConfirmationVisible, setIsRenewConfirmationVisible] = useState(
    Boolean((location.state as { renewedPlanName?: string } | null)?.renewedPlanName),
  );

  const locationState = location.state as { renewedPlanId?: string; renewedPlanName?: string } | null;
  const renewConfirmationName = locationState?.renewedPlanName ?? null;

  useEffect(() => {
    if (!renewConfirmationName) return;

    const hideTimeout = window.setTimeout(() => {
      setIsRenewConfirmationVisible(false);
    }, 2600);

    const clearStateTimeout = window.setTimeout(() => {
      navigate(location.pathname, { replace: true });
    }, 3000);

    return () => {
      window.clearTimeout(hideTimeout);
      window.clearTimeout(clearStateTimeout);
    };
  }, [location.pathname, navigate, renewConfirmationName]);

  const selectedCarrierIds = useMemo(
    () => getSelectedCarrierIdsForPlanYear(planYearId, planYearCarrierOptions.map((carrier) => carrier.id)),
    [planYearId],
  );
  const customPlans = useMemo(() => getCustomPlansForPlanYear(planYearId), [planYearId]);

  const groupedPlanOptions = useMemo<CarrierPlansGroup[]>(
    () =>
      planYearCarrierOptions.filter((carrier) => selectedCarrierIds.includes(carrier.id)).map((carrier) => ({
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
              effectiveDate: plan.effectiveDate,
              currentEndDate: plan.endDate,
              previousPlanYear: 'New',
              isRenewed: plan.source === 'renewed',
              isNew: plan.source === 'renewed',
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
  const templatePlanOptions = useMemo(
    () =>
      groupedPlanOptions.flatMap((group) =>
        group.plans
          .filter((plan) => !plan.isNew)
          .map((plan) => ({
            value: `${group.carrierId}::${plan.id}`,
            label: `${plan.name} (${group.carrierName})`,
          })),
      ),
    [groupedPlanOptions],
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
    if (isFirstTimePlanYearSetup && !hasIncludedPlans) {
      setCreatePlanMode('scratch');
      setSelectedTemplatePlanId('');
      setIsCreatePlanChoiceOpen(true);
      return;
    }
    navigate(`/settings/plan-years/${planYearId}/plans/create`);
  };

  const continueCreatePlan = () => {
    if (createPlanMode === 'scratch') {
      setIsCreatePlanChoiceOpen(false);
      navigate(`/settings/plan-years/${planYearId}/plans/create?source=scratch`);
      return;
    }

    if (!selectedTemplatePlanId) return;

    const [templateCarrierId, templatePlanId] = selectedTemplatePlanId.split('::');
    const group = groupedPlanOptions.find((entry) => entry.carrierId === templateCarrierId);
    const templatePlan = group?.plans.find((plan) => plan.id === templatePlanId);
    if (!templatePlan) return;

    const params = new URLSearchParams({
      source: 'template',
      templatePlanId: templatePlan.id,
      templateCarrierId,
      templateName: templatePlan.name,
      templateType: templatePlan.type,
      templateEffectiveDate: templatePlan.effectiveDate,
      templateEndDate: templatePlan.currentEndDate,
    });
    setIsCreatePlanChoiceOpen(false);
    navigate(`/settings/plan-years/${planYearId}/plans/create?${params.toString()}`);
  };

  const openEditPlan = (plan: PlanOption, carrierId: string) => {
    const params = new URLSearchParams({
      name: plan.name,
      type: plan.type,
      carrierId,
    });
    navigate(`/settings/plan-years/${planYearId}/plans/edit/${encodeURIComponent(plan.id)}?${params.toString()}`);
  };

  const duplicatePlan = (plan: PlanOption, carrierId: string) => {
    const duplicateId = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const duplicateName = `${plan.name} Copy`;
    addCustomPlanForPlanYear(planYearId, {
      id: duplicateId,
      carrierId,
      name: duplicateName,
      type: plan.type,
      effectiveDate: plan.effectiveDate,
      endDate: plan.currentEndDate,
      summary: `${plan.type} copied from existing plan`,
      status: 'Active',
      source: 'created',
    });

    setIncludedPlanIds((current) => {
      const nextIncludedPlanIds = Array.from(new Set([...current, duplicateId]));
      setIncludedPlanIdsForPlanYear(planYearId, nextIncludedPlanIds);
      return nextIncludedPlanIds;
    });
    setOpenPlanActionsId(null);
  };

  const addSelectedPlans = () => {
    if (selectedCount === 0) return;
    const nextIncludedPlanIds = Array.from(new Set([...includedPlanIds, ...selectedPlanIds]));
    setIncludedPlanIds(nextIncludedPlanIds);
    setIncludedPlanIdsForPlanYear(planYearId, nextIncludedPlanIds);
    setIsAddExistingPlansOpen(false);
  };

  return (
    <PlanYearWizardLayout activeStep="plans">
      <section className="flex-1 h-full min-h-0 rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden flex flex-col">
        <div
          className={`mx-8 mt-2 rounded-[12px] border border-[var(--color-primary-medium)] bg-[#f4faf2] px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
            renewConfirmationName && isRenewConfirmationVisible
              ? 'max-h-[120px] opacity-100 translate-y-0'
              : 'max-h-0 opacity-0 -translate-y-2 overflow-hidden p-0 border-0 mt-0'
          }`}
        >
          <span className="size-7 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-white flex items-center justify-center">
            <Icon name="check" size={14} />
          </span>
          <p className="text-[15px] font-medium leading-[22px] text-[var(--text-neutral-x-strong)]">
            <span className="font-semibold">{renewConfirmationName ?? 'Plan'}</span> was added to this plan year.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-8 pt-2 pb-0">
          {!hasIncludedPlans ? (
            <div className="h-full flex flex-col items-center">
              <h2
                className="text-[24px] font-semibold text-[var(--text-neutral-xx-strong)] text-center"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
              >
                Add All plans offered in {planYearName}
              </h2>

              <div className="mt-12 mb-6 text-[var(--icon-neutral-x-weak)] flex items-center justify-center">
                <Icon name="file-lines" variant="regular" size={108} />
              </div>

              <p
                className="text-[40px] font-semibold text-[var(--text-neutral-medium)] text-center"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '48px' }}
              >
                No Plans Included in {planYearName}... Yet
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
            <div className="h-full flex flex-col">
              <h2
                className="text-[32px] font-semibold text-[var(--text-neutral-xx-strong)] text-center"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '40px' }}
              >
                Add All plans offered in {planYearName}
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

              <div className="mt-2 h-[44px] bg-[var(--surface-neutral-xx-weak)] rounded-[8px] px-4 flex items-center">
                <p className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-strong)]">Plan Name</p>
                <p className="w-[197px] text-[15px] font-semibold text-[var(--text-neutral-strong)]">Type</p>
                <p className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-strong)]">Effective Dates</p>
                <p className="w-[140px] text-[15px] font-semibold text-[var(--text-neutral-strong)] text-right">Actions</p>
              </div>

              <div className="mt-1 flex-1 min-h-0 overflow-y-auto pr-1">
                {includedGroups.map((group) => (
                  <div key={group.carrierId}>
                    <div className="h-9 px-4 rounded-[8px] bg-[var(--surface-neutral-x-weak)] flex items-center border-b border-[var(--border-neutral-xx-weak)]">
                      <p className="text-[14px] font-semibold leading-[20px] text-[var(--text-neutral-medium)]">{group.carrierName}</p>
                    </div>

                    <div>
                      {group.plans.map((plan) => (
                        <div key={plan.id} className="group h-[64px] border-b border-[var(--border-neutral-xx-weak)] px-4 flex items-center">
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-[15px] font-normal leading-[22px] text-[var(--text-neutral-x-strong)] truncate">
                              {plan.name}
                            </p>
                          </div>

                          <div className="w-[197px] pr-4">
                            <p className="text-[15px] leading-[22px] text-[var(--text-neutral-x-strong)] truncate">
                              {plan.type}
                            </p>
                          </div>

                          <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="text-[15px] leading-[22px] text-[var(--text-neutral-x-strong)] truncate">
                                {plan.effectiveDate} - {plan.currentEndDate}
                              </p>
                              {plan.isRenewed && isFirstTimePlanYearSetup && (
                                <div className="relative group/renewed shrink-0">
                                  <span className="inline-flex items-center h-6 px-2 rounded-[999px] bg-[#eaf5e6] text-[12px] font-semibold leading-[16px] text-[var(--color-primary-strong)]">
                                    Renewing
                                  </span>
                                  <div className="pointer-events-none absolute left-0 top-7 z-30 w-[320px] rounded-[10px] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] px-3 py-2 text-[13px] leading-[18px] text-[var(--text-neutral-medium)] shadow-[0_6px_16px_rgba(0,0,0,0.12)] opacity-0 transition-opacity group-hover/renewed:opacity-100">
                                    This plan is being renewed into this plan year. Effective dates will be updated to match the selected plan year dates.
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="w-[140px] flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditPlan(plan, group.carrierId)}
                              className="size-9 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[var(--icon-neutral-strong)] shadow-[var(--shadow-100)] hover:bg-[var(--surface-neutral-xx-weak)] flex items-center justify-center"
                              aria-label={`Edit ${plan.name}`}
                            >
                              <Icon name="pen-to-square" size={13} />
                            </button>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenPlanActionsId((current) => (current === plan.id ? null : plan.id))
                                }
                                className="size-9 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[var(--icon-neutral-strong)] shadow-[var(--shadow-100)] hover:bg-[var(--surface-neutral-xx-weak)] flex items-center justify-center"
                                aria-label={`More actions for ${plan.name}`}
                              >
                                <Icon name="ellipsis" size={13} />
                              </button>
                              {openPlanActionsId === plan.id && (
                                <div className="absolute right-0 top-10 z-30 min-w-[170px] rounded-[12px] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] p-1 shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)]">
                                  <button
                                    type="button"
                                    onClick={() => duplicatePlan(plan, group.carrierId)}
                                    className="w-full rounded-[8px] px-3 py-2 text-left text-[14px] font-medium text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)]"
                                  >
                                    Duplicate plan
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      removeIncludedPlan(plan.id);
                                      setOpenPlanActionsId(null);
                                    }}
                                    className="w-full rounded-[8px] px-3 py-2 text-left text-[14px] font-medium text-[#b42318] hover:bg-[#fff3f2]"
                                  >
                                    Delete plan
                                  </button>
                                </div>
                              )}
                            </div>
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

        <footer className="sticky bottom-0 z-20 h-[88px] border-t border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] px-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`/settings/plan-years/${planYearId}/carriers`)}
            className="h-12 px-8 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[18px] font-semibold leading-[26px] text-[var(--text-neutral-strong)] shadow-[var(--shadow-100)]"
          >
            Previous
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(`/settings/plan-years/${planYearId}/open-enrollment`)}
              disabled={!hasIncludedPlans}
              className={`h-12 px-9 rounded-[var(--radius-full)] text-[18px] font-semibold leading-[26px] shadow-[var(--shadow-100)] ${
                hasIncludedPlans
                  ? 'bg-[var(--color-primary-strong)] text-white'
                  : 'bg-[var(--surface-neutral-medium)] text-white cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
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

      {isCreatePlanChoiceOpen && (
        <div className="fixed inset-0 z-[55] bg-[#605b58]/95 px-8 py-8" onClick={() => setIsCreatePlanChoiceOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create New Plan"
            onClick={(event) => event.stopPropagation()}
            className="mx-auto mt-12 w-full max-w-[760px] rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] border border-[var(--border-neutral-x-weak)] overflow-hidden"
          >
            <header className="h-[84px] px-8 border-b border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] flex items-center justify-between">
              <h2 className="text-[32px] font-semibold text-[var(--color-primary-strong)]" style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '36px' }}>
                Create New Plan
              </h2>
              <button
                type="button"
                onClick={() => setIsCreatePlanChoiceOpen(false)}
                className="size-10 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[var(--text-neutral-strong)] flex items-center justify-center bg-[var(--surface-neutral-white)] shadow-[var(--shadow-100)]"
                aria-label="Close"
              >
                <Icon name="xmark" size={16} />
              </button>
            </header>

            <div className="px-8 py-7 space-y-5">
              <p className="text-[15px] leading-[22px] text-[var(--text-neutral-strong)]">
                How would you like to start this plan?
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCreatePlanMode('scratch')}
                  className={`h-[104px] rounded-[16px] border px-6 flex items-center gap-5 text-left shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)] ${
                    createPlanMode === 'scratch'
                      ? 'border-[var(--color-primary-medium)]'
                      : 'border-[var(--border-neutral-x-weak)]'
                  }`}
                >
                  <span
                    className={`size-12 rounded-[14px] flex items-center justify-center ${
                      createPlanMode === 'scratch'
                        ? 'bg-[var(--color-primary-strong)] text-white'
                        : 'bg-[var(--surface-neutral-xx-weak)] text-[var(--color-primary-strong)]'
                    }`}
                  >
                    <Icon name="circle-plus-lined" size={20} />
                  </span>
                  <span className="text-[16px] font-medium leading-[24px] text-[var(--color-primary-strong)]">
                    Start from
                    <br />
                    Scratch
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreatePlanMode('template')}
                  className={`h-[104px] rounded-[16px] border px-6 flex items-center gap-5 text-left shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)] ${
                    createPlanMode === 'template'
                      ? 'border-[var(--color-primary-medium)]'
                      : 'border-[var(--border-neutral-x-weak)]'
                  }`}
                >
                  <span
                    className={`size-12 rounded-[14px] flex items-center justify-center ${
                      createPlanMode === 'template'
                        ? 'bg-[var(--color-primary-strong)] text-white'
                        : 'bg-[var(--surface-neutral-xx-weak)] text-[var(--color-primary-strong)]'
                    }`}
                  >
                    <Icon name="sparkles" size={20} />
                  </span>
                  <span className="text-[16px] font-medium leading-[24px] text-[var(--color-primary-strong)]">
                    Use Different Plan
                    <br />
                    as Template
                  </span>
                </button>
              </div>

              {createPlanMode === 'template' && (
                <div className="w-[500px]">
                  <Dropdown
                    label="Template plan"
                    options={templatePlanOptions.length > 0 ? templatePlanOptions : [{ value: '', label: 'No templates available' }]}
                    value={selectedTemplatePlanId}
                    onChange={setSelectedTemplatePlanId}
                    className="w-full"
                  />
                </div>
              )}

              <div className="rounded-[10px] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-xx-weak)] px-4 py-3">
                <p className="text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">
                  Using a template creates a brand-new plan record. To renew an existing plan into this plan year, use{' '}
                  <span className="font-semibold text-[var(--text-neutral-strong)]">Add Existing Plans</span>.
                </p>
              </div>
            </div>

            <footer className="h-[88px] px-8 border-t border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsCreatePlanChoiceOpen(false)}
                className="h-10 px-2 text-[15px] font-semibold leading-[22px] text-[#0b4fd1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={continueCreatePlan}
                disabled={createPlanMode === 'template' && !selectedTemplatePlanId}
                className={`h-10 px-6 rounded-[var(--radius-full)] text-[15px] font-semibold leading-[22px] shadow-[var(--shadow-100)] ${
                  createPlanMode === 'template' && !selectedTemplatePlanId
                    ? 'bg-[var(--surface-neutral-medium)] text-white cursor-not-allowed'
                    : 'bg-[var(--color-primary-strong)] text-white'
                }`}
              >
                Continue
              </button>
            </footer>
          </div>
        </div>
      )}

    </PlanYearWizardLayout>
  );
}

export default PlanYearPlans;
