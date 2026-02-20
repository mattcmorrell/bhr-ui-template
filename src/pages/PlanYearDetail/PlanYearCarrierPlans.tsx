import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Icon } from '../../components';
import {
  defaultIncludedPlanIdsByYear,
  planYearCarrierOptions,
  unifiedBenefitPlansByCarrier,
} from '../../data/benefitPlansCatalog';
import { benefitPlanYears } from '../../data/settingsData';
import { PlanYearWizardLayout } from './PlanYearWizardLayout';
import {
  getIncludedPlanIdsForPlanYear,
  getIncludedPlansForCarrier,
  setIncludedPlansForCarrier,
  type IncludedCarrierPlan,
} from './planYearWizardState';

function fallbackCarrierName(carrierId?: string) {
  if (!carrierId) return 'Carrier';
  return decodeURIComponent(carrierId)
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ');
}

export function PlanYearCarrierPlans() {
  const navigate = useNavigate();
  const { planYearId = 'default', carrierId } = useParams<{ planYearId: string; carrierId: string }>();
  const selectedPlanYear = benefitPlanYears.find((planYear) => planYear.id === planYearId);
  const planYearName = selectedPlanYear?.name ?? planYearId ?? 'Plan Year';

  const carrierName = useMemo(() => {
    return planYearCarrierOptions.find((carrier) => carrier.id === carrierId)?.name ?? fallbackCarrierName(carrierId);
  }, [carrierId]);
  const carrierKey = carrierId ?? 'carrier';
  const carrierPlansFromCatalog = useMemo(
    () => unifiedBenefitPlansByCarrier[carrierKey] ?? [],
    [carrierKey],
  );
  const defaultIncludedPlansForCarrier = useMemo(() => {
    const includedPlanIds = getIncludedPlanIdsForPlanYear(
      planYearId,
      defaultIncludedPlanIdsByYear[planYearId] ?? [],
    );
    return carrierPlansFromCatalog
      .filter((plan) => includedPlanIds.includes(plan.id))
      .map(
        (plan): IncludedCarrierPlan => ({
          name: plan.name,
          type: plan.type,
          effectiveDate: plan.effectiveDate,
        }),
      );
  }, [carrierPlansFromCatalog, planYearId]);

  const [isAddExistingPlansOpen, setIsAddExistingPlansOpen] = useState(false);
  const [includedPlans, setIncludedPlans] = useState<IncludedCarrierPlan[]>(() => {
    const plansFromState = getIncludedPlansForCarrier(planYearId, carrierKey);
    return plansFromState.length > 0 ? plansFromState : defaultIncludedPlansForCarrier;
  });
  const [selectedPlanNames, setSelectedPlanNames] = useState<string[]>(() =>
    getIncludedPlansForCarrier(planYearId, carrierKey).map((plan) => plan.name),
  );

  const availablePlans = carrierPlansFromCatalog.map((plan) => ({
    id: plan.id,
    name: plan.name,
    type: plan.type,
    mostRecentPlanYear: plan.mostRecentPlanYear,
    effectiveDate: plan.effectiveDate,
  }));
  const availablePlansToAdd = availablePlans.filter(
    (plan) => !includedPlans.some((includedPlan) => includedPlan.name === plan.name),
  );
  const allAvailableSelected =
    availablePlansToAdd.length > 0 && selectedPlanNames.length === availablePlansToAdd.length;

  const togglePlan = (planName: string) => {
    setSelectedPlanNames((prev) => {
      if (prev.includes(planName)) return prev.filter((name) => name !== planName);
      return [...prev, planName];
    });
  };

  const openAddExistingPlans = () => {
    setSelectedPlanNames([]);
    setIsAddExistingPlansOpen(true);
  };

  const openCreatePlan = () => {
    navigate(`/settings/plan-years/${planYearId}/plans/create/carrier/${carrierKey}`);
  };

  const openEditPlan = (planName: string, planType: string) => {
    const params = new URLSearchParams({
      name: planName,
      type: planType,
      carrierId: carrierKey,
    });
    navigate(
      `/settings/plan-years/${planYearId}/plans/edit/${encodeURIComponent(planName)}?${params.toString()}`,
    );
  };

  const handleAddSelectedPlans = () => {
    const selectedPlansToAdd: IncludedCarrierPlan[] = availablePlansToAdd
      .filter((plan) => selectedPlanNames.includes(plan.name))
      .map((plan) => ({
        name: plan.name,
        type: plan.type,
        effectiveDate: plan.effectiveDate,
      }));
    const nextIncludedPlans: IncludedCarrierPlan[] = [...includedPlans, ...selectedPlansToAdd];

    setIncludedPlans(nextIncludedPlans);
    setIncludedPlansForCarrier(planYearId, carrierKey, nextIncludedPlans);
    setIsAddExistingPlansOpen(false);
  };

  return (
    <PlanYearWizardLayout activeStep="plans">
      <section className="flex-1 min-h-[760px] rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden flex flex-col">
        <div className="flex-1 px-8 py-8">
          {includedPlans.length === 0 ? (
            <div className="h-full rounded-[16px] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] px-8 py-8 flex flex-col items-center text-center">
              <h2
                className="text-[32px] font-semibold text-[var(--text-neutral-xx-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '40px' }}
              >
                Add All plans offered in {planYearName} by {carrierName}
              </h2>

              <div className="mt-10 mb-6 size-[112px] rounded-[12px] border-2 border-[var(--border-neutral-medium)] text-[var(--border-neutral-medium)] flex items-center justify-center">
                <Icon name="file-lines" variant="regular" size={66} />
              </div>

              <p
                className="text-[40px] font-semibold text-[var(--text-neutral-medium)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '48px' }}
              >
                No Plans Included in {planYearName}... Yet
              </p>

              <div className="mt-6 flex items-center gap-3">
                <Button variant="primary" size="medium" icon="chevron-right" onClick={openAddExistingPlans}>
                  Add Existing Plans
                </Button>
                <Button variant="standard" size="medium" icon="circle-plus-lined" showCaret onClick={openCreatePlan}>
                  Create New Plan
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full rounded-[16px] bg-[var(--surface-neutral-white)] px-6 py-6">
              <h2
                className="text-[32px] font-semibold text-[var(--text-neutral-xx-strong)] text-center"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '40px' }}
              >
                Add All plans offered in {planYearName} by {carrierName}
              </h2>

              <div className="mt-6 flex items-center justify-between">
                <p className="text-[15px] font-semibold text-[var(--text-neutral-strong)]">{includedPlans.length} Plans Included</p>
                <div className="flex items-center gap-2">
                  <Button variant="outlined" size="small" icon="chevron-right" onClick={openAddExistingPlans}>
                    Add Existing
                  </Button>
                  <Button variant="standard" size="small" icon="circle-plus-lined" onClick={openCreatePlan}>
                    Create New
                  </Button>
                </div>
              </div>

              <div className="mt-2 rounded-[6px] bg-[var(--surface-neutral-xx-weak)] h-[52px] px-4 flex items-center">
                <p className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-strong)]">Plan Name</p>
                <p className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-strong)]">Effective Date</p>
                <p className="w-[180px] text-[15px] font-semibold text-[var(--text-neutral-strong)]">Status</p>
              </div>

              <div className="space-y-2 mt-2">
                {includedPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className="h-[86px] rounded-[16px] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)] px-5 flex items-center"
                  >
                    <div className="flex-1">
                      <p className="text-[16px] font-medium leading-[24px] text-[#0b4fd1]">{plan.name}</p>
                      <p className="text-[13px] leading-[19px] text-[var(--text-neutral-strong)]">{plan.type}</p>
                    </div>
                    <div className="flex-1 flex items-center gap-2 text-[var(--text-neutral-strong)]">
                      <Icon name="calendar" size={16} />
                      <p className="text-[15px] leading-[22px]">{plan.effectiveDate}</p>
                    </div>
                    <div className="w-[180px] flex items-center gap-2">
                      <Button
                        variant="standard"
                        size="small"
                        icon="pen"
                        onClick={() => openEditPlan(plan.name, plan.type)}
                      >
                        Edit Plan
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextIncludedPlans = includedPlans.filter((included) => included.name !== plan.name);
                          setIncludedPlans(nextIncludedPlans);
                          setIncludedPlansForCarrier(planYearId, carrierKey, nextIncludedPlans);
                          setSelectedPlanNames((prev) => prev.filter((selectedName) => selectedName !== plan.name));
                        }}
                        className="size-10 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] shadow-[var(--shadow-100)] text-[var(--text-neutral-strong)] text-[18px] leading-none flex items-center justify-center"
                        aria-label={`Remove ${plan.name}`}
                      >
                        -
                      </button>
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
            onClick={() => navigate(`/settings/plan-years/${planYearId}/plans`)}
            className="h-12 px-8 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[15px] font-semibold text-[var(--text-neutral-strong)]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => navigate(`/settings/plan-years/${planYearId}/open-enrollment`)}
            className="h-12 px-9 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-white text-[15px] font-semibold"
          >
            Next
          </button>
        </footer>
      </section>

      {isAddExistingPlansOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#676260]/90 flex items-center justify-center p-6"
          onClick={() => setIsAddExistingPlansOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Select ${carrierName} Plans`}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[816px] rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden"
          >
            <header className="bg-[var(--surface-neutral-xx-weak)] px-5 py-4 flex items-center justify-between">
              <h3
                className="text-[24px] font-semibold text-[var(--color-primary-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
              >
                Select {carrierName} Plans
              </h3>
              <button
                type="button"
                onClick={() => setIsAddExistingPlansOpen(false)}
                className="size-10 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[var(--text-neutral-strong)] flex items-center justify-center"
                aria-label="Close"
              >
                <Icon name="xmark" size={16} />
              </button>
            </header>

            <div className="px-5 py-8">
              <div className="text-center">
                <h4
                  className="text-[21px] font-semibold text-[var(--text-neutral-xx-strong)]"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '26px' }}
                >
                  Which existing plans do you want to offer in this plan year?
                </h4>
                <p className="mt-1 text-[15px] leading-[22px] text-[var(--text-neutral-x-strong)]">
                  Select below, and you can make any changes later.
                </p>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[14px] font-medium leading-[20px] text-[var(--text-neutral-strong)]">Active Plans</p>
                  <button type="button" className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#0b4fd1]">
                    <Icon name="eye" size={14} />
                    Show Inactive Plans
                  </button>
                </div>

                <div className="rounded-[6px] overflow-hidden">
                  <div className="h-[50px] bg-[var(--surface-neutral-xx-weak)] px-4 flex items-center">
                    <div className="w-[32px] shrink-0 flex justify-center">
                      <input
                        type="checkbox"
                        checked={allAvailableSelected}
                        onChange={(event) =>
                          setSelectedPlanNames(
                            event.target.checked ? availablePlansToAdd.map((plan) => plan.name) : [],
                          )
                        }
                        className="size-[18px] rounded-[6px] border border-[var(--border-neutral-medium)] accent-[var(--color-primary-strong)]"
                      />
                    </div>
                    <p className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-strong)]">Plan Name</p>
                    <p className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-strong)]">Plan Type</p>
                    <p className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-strong)]">Most Recent Plan Year</p>
                  </div>

                  {availablePlansToAdd.map((plan) => (
                    <div key={plan.name} className="h-[68px] border-b border-[var(--border-neutral-xx-weak)] px-4 flex items-center">
                      <div className="w-[32px] shrink-0 flex justify-center">
                        <input
                          type="checkbox"
                          checked={selectedPlanNames.includes(plan.name)}
                          onChange={() => togglePlan(plan.name)}
                          className="size-[18px] rounded-[6px] border border-[var(--border-neutral-medium)] accent-[var(--color-primary-strong)]"
                        />
                      </div>
                      <p className="flex-1 text-[15px] leading-[22px] text-[var(--text-neutral-x-strong)]">{plan.name}</p>
                      <p className="flex-1 text-[15px] leading-[22px] text-[var(--text-neutral-x-strong)]">{plan.type}</p>
                      <p className="flex-1 text-[15px] leading-[22px] text-[var(--text-neutral-x-strong)]">{plan.mostRecentPlanYear}</p>
                    </div>
                  ))}
                  {availablePlansToAdd.length === 0 && (
                    <div className="h-[120px] border-b border-[var(--border-neutral-xx-weak)] px-4 flex items-center justify-center">
                      <p className="text-[15px] leading-[22px] text-[var(--text-neutral-medium)]">
                        All available plans are already included in this plan year.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <footer className="bg-[var(--surface-neutral-xx-weak)] px-5 py-4 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsAddExistingPlansOpen(false)}
                className="h-10 px-2 text-[15px] font-semibold text-[#0b4fd1]"
              >
                Cancel
              </button>
              <Button variant="primary" size="medium" onClick={handleAddSelectedPlans}>
                Add Selected Plans
              </Button>
            </footer>
          </div>
        </div>
      )}
    </PlanYearWizardLayout>
  );
}

export default PlanYearCarrierPlans;
