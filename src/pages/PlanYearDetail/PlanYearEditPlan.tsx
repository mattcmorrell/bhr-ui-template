import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon } from '../../components';

const CARRIER_OPTIONS = [
  { id: 'united-healthcare', name: 'UnitedHealthcare' },
  { id: 'delta-dental', name: 'Delta Dental' },
  { id: 'vsp', name: 'VSP' },
  { id: 'aetna', name: 'Aetna' },
  { id: 'principal', name: 'Principal' },
  { id: 'fidelity', name: 'Fidelity' },
];

const WIZARD_STEPS = [
  { id: 'plan-details', label: 'Plan Details' },
  { id: 'coverage-options', label: 'Coverage Options' },
  { id: 'premium-type', label: 'Premium Type' },
  { id: 'eligibility-cost', label: 'Eligibility & Cost' },
  { id: 'enrollment-details', label: 'Enrollment Details' },
  { id: 'payroll-deductions', label: 'Payroll Deductions' },
] as const;

type WizardStepId = (typeof WIZARD_STEPS)[number]['id'];

interface EditPlanFormState {
  name: string;
  carrierId: string;
  groupNumber: string;
  planType: string;
  planTypeId: string;
  summary: string;
  description: string;
  effectiveDate: string;
  endDate: string;
  coverageTier: string;
  deductibleIndividual: string;
  deductibleFamily: string;
  outOfPocketIndividual: string;
  outOfPocketFamily: string;
  premiumType: string;
  employeeOnlyPremium: string;
  employeeSpousePremium: string;
  employeeChildrenPremium: string;
  familyPremium: string;
  waitingPeriod: string;
  contributionMethod: string;
  employerContributionPercent: string;
  enrollmentWindowDays: string;
  effectiveRule: string;
  payrollFrequency: string;
  deductionCode: string;
}

function toTitleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function humanizePlanRef(planRef: string) {
  return decodeURIComponent(planRef)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeType(type: string) {
  if (!type) return 'Medical';
  const lowered = type.toLowerCase();
  if (lowered.includes('dental')) return 'Dental';
  if (lowered.includes('vision')) return 'Vision';
  if (lowered.includes('retire')) return 'Retirement';
  if (lowered.includes('supp')) return 'Supplemental';
  if (lowered.includes('medical')) return 'Medical';
  return 'Other';
}

function inferCarrierFromRef(planRef: string) {
  const decoded = decodeURIComponent(planRef).toLowerCase();
  const match = CARRIER_OPTIONS.find((carrier) => decoded.includes(carrier.id.split('-')[0]));
  return match?.id ?? 'united-healthcare';
}

function buildMockPlanState({
  name,
  type,
  carrierId,
}: {
  name: string;
  type: string;
  carrierId: string;
}): EditPlanFormState {
  const normalizedName = toTitleCase(name || 'Medical Bronze');
  const normalizedType = normalizeType(type);

  return {
    name: normalizedName,
    carrierId,
    groupNumber: 'A-324589',
    planType: normalizedType,
    planTypeId: `${normalizedType.slice(0, 3).toUpperCase()}-26`,
    summary: `${normalizedName} - Employee and Family Coverage`,
    description:
      'This plan offers broad in-network access with out-of-network flexibility, preventive coverage, and predictable copays for common services.',
    effectiveDate: '2026-01-01',
    endDate: '2026-12-31',
    coverageTier: 'Employee + Family',
    deductibleIndividual: '$1,500',
    deductibleFamily: '$3,000',
    outOfPocketIndividual: '$4,500',
    outOfPocketFamily: '$9,000',
    premiumType: 'Tiered',
    employeeOnlyPremium: '$185',
    employeeSpousePremium: '$390',
    employeeChildrenPremium: '$340',
    familyPremium: '$525',
    waitingPeriod: 'First of month after 30 days',
    contributionMethod: 'Percent of premium',
    employerContributionPercent: '78',
    enrollmentWindowDays: '30',
    effectiveRule: 'First day of next month',
    payrollFrequency: 'Semi-monthly',
    deductionCode: 'MED26',
  };
}

function StepCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="flex-1 rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] px-8 py-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-6 rounded-[6px] bg-[var(--surface-neutral-x-weak)] flex items-center justify-center">
          <Icon name="clipboard" size={14} className="text-[var(--color-primary-strong)]" />
        </div>
        <div>
          <h2
            className="text-[36px] font-semibold text-[var(--color-primary-strong)]"
            style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '44px' }}
          >
            {title}
          </h2>
          <p className="text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">{subtitle}</p>
        </div>
      </div>
      <div className="h-px bg-[var(--border-neutral-x-weak)] mb-4" />
      {children}
    </section>
  );
}

export function PlanYearEditPlan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { planYearId = 'default', planRef, stepId } = useParams<{
    planYearId: string;
    planRef: string;
    stepId?: string;
  }>();

  const activeStepId = WIZARD_STEPS.some((step) => step.id === stepId)
    ? (stepId as WizardStepId)
    : 'plan-details';
  const activeStepIndex = WIZARD_STEPS.findIndex((step) => step.id === activeStepId);

  const nameFromQuery = searchParams.get('name') ?? '';
  const typeFromQuery = searchParams.get('type') ?? '';
  const carrierFromQuery = searchParams.get('carrierId') ?? '';

  const planName = nameFromQuery || (planRef ? humanizePlanRef(planRef) : 'Medical Bronze');
  const planType = normalizeType(typeFromQuery || planName);
  const carrierId = carrierFromQuery || (planRef ? inferCarrierFromRef(planRef) : 'united-healthcare');

  const [formState, setFormState] = useState<EditPlanFormState>(() =>
    buildMockPlanState({ name: planName, type: planType, carrierId }),
  );

  const planTypeLabel = formState.planType === 'Medical' ? 'Medical Plan' : 'Plan';
  const pageTitle = `Edit ${planTypeLabel}`;
  const basePath = `/settings/plan-years/${planYearId}/plans/edit/${encodeURIComponent(planRef ?? planName)}`;
  const backPath = `/settings/plan-years/${planYearId}/plans`;
  const currentCarrierName = useMemo(
    () => CARRIER_OPTIONS.find((carrier) => carrier.id === formState.carrierId)?.name ?? 'UnitedHealthcare',
    [formState.carrierId],
  );

  const onFieldChange = <K extends keyof EditPlanFormState>(key: K, value: EditPlanFormState[K]) => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  const goToStep = (step: WizardStepId) => {
    const nextParams = searchParams.toString();
    navigate(nextParams ? `${basePath}/${step}?${nextParams}` : `${basePath}/${step}`);
  };

  const handleNextStep = () => {
    const nextStep = WIZARD_STEPS[activeStepIndex + 1];
    if (!nextStep) {
      navigate(backPath);
      return;
    }
    goToStep(nextStep.id);
  };

  return (
    <div className="min-h-full">
      <div className="bg-[var(--surface-neutral-xx-weak)] rounded-[24px] p-6 min-h-[740px]">
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)] mb-3"
        >
          <Icon name="chevron-left" size={12} />
          Back
        </button>

        <h1
          className="text-[64px] font-bold text-[var(--color-primary-strong)] mb-6"
          style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '66px' }}
        >
          {pageTitle}
        </h1>

        <div className="flex gap-6 items-start">
          <aside className="w-[304px] shrink-0">
            <div className="space-y-1">
              {WIZARD_STEPS.map((step) => {
                const active = step.id === activeStepId;
                return (
                  <button
                    type="button"
                    key={step.id}
                    onClick={() => goToStep(step.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-[16px] ${active ? 'bg-[var(--surface-neutral-white)]' : ''}`}
                  >
                    <Icon name="check-circle" size={22} className="text-[var(--color-primary-strong)]" />
                    <span className={`text-[16px] leading-[24px] ${active ? 'font-bold text-[var(--color-primary-strong)]' : 'font-medium text-[var(--color-primary-strong)]'}`}>
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="h-px bg-[var(--border-neutral-x-weak)] my-6 mx-2" />

            <button
              type="button"
              className="w-full h-10 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-white text-[15px] font-semibold"
              onClick={handleNextStep}
            >
              {activeStepIndex === WIZARD_STEPS.length - 1 ? 'Done' : 'Next step'}
            </button>

            <div className="mt-3 space-y-3 text-center">
              <button
                type="button"
                className="w-full h-10 rounded-[var(--radius-full)] bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-medium)]"
              >
                Save &amp; Finish Later
              </button>
              <p className="text-[13px] font-medium leading-[19px] text-[var(--text-neutral-weak)]">Autosaved just now</p>
              <button type="button" className="text-[15px] font-semibold text-[#0b4fd1]" onClick={() => navigate(backPath)}>
                Cancel
              </button>
            </div>
          </aside>

          {activeStepId === 'plan-details' ? (
            <StepCard title="Plan Details" subtitle="How will you explain this plan to employees?">
              <div className="w-[620px] space-y-2">
                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Name *</label>
                <input value={formState.name} onChange={(event) => onFieldChange('name', event.target.value)} className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Carrier *</label>
                <select value={formState.carrierId} onChange={(event) => onFieldChange('carrierId', event.target.value)} className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]">
                  {CARRIER_OPTIONS.map((carrier) => (
                    <option key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </option>
                  ))}
                </select>

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Group Number *</label>
                <input value={formState.groupNumber} onChange={(event) => onFieldChange('groupNumber', event.target.value)} className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Type *</label>
                <select value={formState.planType} onChange={(event) => onFieldChange('planType', event.target.value)} className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]">
                  {['Medical', 'Dental', 'Vision', 'Retirement', 'Supplemental', 'Other'].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Type ID</label>
                <input value={formState.planTypeId} onChange={(event) => onFieldChange('planTypeId', event.target.value)} className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Summary</label>
                <input value={formState.summary} onChange={(event) => onFieldChange('summary', event.target.value)} className="w-[392px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Description *</label>
                <textarea value={formState.description} onChange={(event) => onFieldChange('description', event.target.value)} className="w-[392px] h-[92px] rounded-[8px] border border-[var(--border-neutral-medium)] px-3 py-2 text-[14px] resize-none" />

                <div className="flex items-end gap-3">
                  <div>
                    <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Starts *</label>
                    <input type="date" value={formState.effectiveDate} onChange={(event) => onFieldChange('effectiveDate', event.target.value)} className="w-[174px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                  </div>
                  <span className="pb-2 text-[var(--text-neutral-weak)]">-</span>
                  <div>
                    <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Ends *</label>
                    <input type="date" value={formState.endDate} onChange={(event) => onFieldChange('endDate', event.target.value)} className="w-[174px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                  </div>
                </div>
              </div>
            </StepCard>
          ) : null}

          {activeStepId === 'coverage-options' ? (
            <StepCard title="Coverage Options" subtitle={`Configured for ${formState.name}`}>
              <div className="w-[620px] grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Coverage Tier</label>
                  <input value={formState.coverageTier} onChange={(event) => onFieldChange('coverageTier', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
                <div />
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Deductible (Individual)</label>
                  <input value={formState.deductibleIndividual} onChange={(event) => onFieldChange('deductibleIndividual', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Deductible (Family)</label>
                  <input value={formState.deductibleFamily} onChange={(event) => onFieldChange('deductibleFamily', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Out-of-Pocket (Individual)</label>
                  <input value={formState.outOfPocketIndividual} onChange={(event) => onFieldChange('outOfPocketIndividual', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Out-of-Pocket (Family)</label>
                  <input value={formState.outOfPocketFamily} onChange={(event) => onFieldChange('outOfPocketFamily', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
              </div>
            </StepCard>
          ) : null}

          {activeStepId === 'premium-type' ? (
            <StepCard title="Premium Type" subtitle={`Current carrier: ${currentCarrierName}`}>
              <div className="w-[620px] grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Premium Structure</label>
                  <input value={formState.premiumType} onChange={(event) => onFieldChange('premiumType', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
                <div />
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Employee Only</label>
                  <input value={formState.employeeOnlyPremium} onChange={(event) => onFieldChange('employeeOnlyPremium', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Employee + Spouse</label>
                  <input value={formState.employeeSpousePremium} onChange={(event) => onFieldChange('employeeSpousePremium', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Employee + Children</label>
                  <input value={formState.employeeChildrenPremium} onChange={(event) => onFieldChange('employeeChildrenPremium', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Family</label>
                  <input value={formState.familyPremium} onChange={(event) => onFieldChange('familyPremium', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
              </div>
            </StepCard>
          ) : null}

          {activeStepId === 'eligibility-cost' ? (
            <StepCard title="Eligibility & Cost" subtitle="Eligibility rules and employer contribution settings">
              <div className="w-[620px] grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Waiting Period</label>
                  <input value={formState.waitingPeriod} onChange={(event) => onFieldChange('waitingPeriod', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Contribution Method</label>
                  <input value={formState.contributionMethod} onChange={(event) => onFieldChange('contributionMethod', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Employer Contribution %</label>
                  <input value={formState.employerContributionPercent} onChange={(event) => onFieldChange('employerContributionPercent', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
              </div>
            </StepCard>
          ) : null}

          {activeStepId === 'enrollment-details' ? (
            <StepCard title="Enrollment Details" subtitle="Enrollment windows and effective-date behavior">
              <div className="w-[620px] grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Enrollment Window (Days)</label>
                  <input value={formState.enrollmentWindowDays} onChange={(event) => onFieldChange('enrollmentWindowDays', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Effective Rule</label>
                  <input value={formState.effectiveRule} onChange={(event) => onFieldChange('effectiveRule', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
              </div>
            </StepCard>
          ) : null}

          {activeStepId === 'payroll-deductions' ? (
            <StepCard title="Payroll Deductions" subtitle="Payroll mapping used for this plan">
              <div className="w-[620px] grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Payroll Frequency</label>
                  <input value={formState.payrollFrequency} onChange={(event) => onFieldChange('payrollFrequency', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Deduction Code</label>
                  <input value={formState.deductionCode} onChange={(event) => onFieldChange('deductionCode', event.target.value)} className="mt-1 w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
                </div>
              </div>
            </StepCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default PlanYearEditPlan;
