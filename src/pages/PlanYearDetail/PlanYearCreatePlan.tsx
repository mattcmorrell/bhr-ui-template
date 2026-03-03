import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../components';
import {
  addCustomPlanForPlanYear,
  getCustomPlansForPlanYear,
  getIncludedPlanIdsForPlanYear,
  getIncludedPlansForCarrier,
  getSelectedCarrierIdsForPlanYear,
  setIncludedPlanIdsForPlanYear,
  setIncludedPlansForCarrier,
} from './planYearWizardState';

const CARRIER_OPTIONS = [
  { id: 'united-healthcare', name: 'UnitedHealthcare' },
  { id: 'delta-dental', name: 'Delta Dental' },
  { id: 'vsp', name: 'VSP' },
  { id: 'aetna', name: 'Aetna' },
  { id: 'principal', name: 'Principal' },
  { id: 'fidelity', name: 'Fidelity' },
];

const PLAN_TYPE_OPTIONS = [
  'Medical',
  'Dental',
  'Vision',
  'Supplemental Health',
  'Retirement',
  'Reimbursement',
  'Health Savings Account',
  'Flex Savings Account',
  'Life Insurance',
  'Disability',
  'Other',
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

function toTitleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function toDisplayDate(value: string) {
  const [year, month, day] = value.split('-');
  if (!month || !day || !year) return value;
  return `${month}/${day}/${year}`;
}

function buildPlanId(planName: string) {
  const slug = planName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'new-plan'}-${Date.now().toString(36)}`;
}

function toInputDate(value: string) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [month, day, year] = value.split('/');
  if (!month || !day || !year) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function normalizePlanToken(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function StepPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="flex-1 rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] px-8 py-6">
      <h2
        className="text-[36px] font-semibold text-[var(--color-primary-strong)]"
        style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '44px' }}
      >
        {title}
      </h2>
      <p className="text-[15px] leading-[22px] text-[var(--text-neutral-medium)] mt-1">{description}</p>
      <div className="h-px bg-[var(--border-neutral-x-weak)] my-5" />
      <div className="w-[560px] space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Input label</label>
          <input className="mt-1 w-[320px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[var(--text-neutral-medium)]">Input label</label>
          <input className="mt-1 w-[320px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />
        </div>
      </div>
    </section>
  );
}

export function PlanYearCreatePlan() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    planYearId = 'default',
    carrierId,
    stepId,
  } = useParams<{ planYearId: string; carrierId?: string; stepId?: string }>();

  const defaultCarrierIds = CARRIER_OPTIONS.map((carrier) => carrier.id);
  const selectedCarrierIds = getSelectedCarrierIdsForPlanYear(planYearId, defaultCarrierIds);
  const allowedCarrierIds = selectedCarrierIds.length > 0 ? selectedCarrierIds : defaultCarrierIds;
  const carrierOptions = CARRIER_OPTIONS.filter((carrier) => allowedCarrierIds.includes(carrier.id));

  const resolvedCarrierId = useMemo(() => {
    if (carrierId && carrierOptions.some((carrier) => carrier.id === carrierId)) {
      return carrierId;
    }
    return carrierOptions[0]?.id ?? CARRIER_OPTIONS[0].id;
  }, [carrierId, carrierOptions]);

  const initialStepId = WIZARD_STEPS.some((step) => step.id === stepId)
    ? (stepId as WizardStepId)
    : 'plan-details';
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const templateSource = searchParams.get('source');
  const templateName = searchParams.get('templateName') ?? '';
  const templateType = searchParams.get('templateType') ?? '';
  const templateCarrierId = searchParams.get('templateCarrierId') ?? '';
  const templateEffectiveDate = toInputDate(searchParams.get('templateEffectiveDate') ?? '');
  const templateEndDate = toInputDate(searchParams.get('templateEndDate') ?? '');
  const isTemplateCreate = templateSource === 'template';
  const preselectedPlanType = useMemo(() => {
    const requestedType = searchParams.get('planType');
    if (isTemplateCreate && templateType) {
      return PLAN_TYPE_OPTIONS.find((type) => type.toLowerCase() === templateType.toLowerCase()) ?? PLAN_TYPE_OPTIONS[0];
    }
    if (!requestedType) return PLAN_TYPE_OPTIONS[0];
    return PLAN_TYPE_OPTIONS.find((type) => type.toLowerCase() === requestedType.toLowerCase()) ?? PLAN_TYPE_OPTIONS[0];
  }, [isTemplateCreate, searchParams, templateType]);

  const [planName, setPlanName] = useState(isTemplateCreate && templateName ? `${templateName} Copy` : '');
  const [selectedCarrierId, setSelectedCarrierId] = useState(
    isTemplateCreate && templateCarrierId && carrierOptions.some((carrier) => carrier.id === templateCarrierId)
      ? templateCarrierId
      : resolvedCarrierId,
  );
  const [groupNumber, setGroupNumber] = useState('');
  const [planType, setPlanType] = useState(preselectedPlanType);
  const [planTypeId, setPlanTypeId] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState(
    isTemplateCreate && templateName
      ? `Copied from ${templateName}. Update details before publishing.`
      : '',
  );
  const [effectiveDate, setEffectiveDate] = useState(templateEffectiveDate || '2026-01-01');
  const [endDate, setEndDate] = useState(templateEndDate || '2026-12-31');
  const [saveError, setSaveError] = useState('');
  const activeStepId = initialStepId;

  const activeStepIndex = WIZARD_STEPS.findIndex((step) => step.id === activeStepId);
  const planTypeLabel = planType === 'Medical' ? 'Medical Plan' : 'Plan';
  const pageTitle = `Create New ${planTypeLabel}`;

  const baseCreatePath = carrierId
    ? `/settings/plan-years/${planYearId}/plans/create/carrier/${carrierId}`
    : `/settings/plan-years/${planYearId}/plans/create`;

  const backPath = carrierId
    ? `/settings/plan-years/${planYearId}/plans/${carrierId}`
    : `/settings/plan-years/${planYearId}/plans`;

  const canSavePlan = planName.trim().length > 0 && description.trim().length > 0;

  const goToStep = (targetStep: WizardStepId) => {
    navigate(`${baseCreatePath}/${targetStep}`);
  };

  const handlePersistPlan = () => {
    if (!canSavePlan) return;

    const formattedName = toTitleCase(planName.trim());
    const normalizedName = normalizePlanToken(formattedName);
    const normalizedType = normalizePlanToken(planType);
    const carrierPlans = getIncludedPlansForCarrier(planYearId, selectedCarrierId);
    const customPlansForCarrier = getCustomPlansForPlanYear(planYearId).filter(
      (plan) => plan.carrierId === selectedCarrierId,
    );
    const duplicateExists =
      carrierPlans.some(
        (plan) =>
          normalizePlanToken(plan.name) === normalizedName &&
          normalizePlanToken(plan.type) === normalizedType,
      ) ||
      customPlansForCarrier.some(
        (plan) =>
          normalizePlanToken(plan.name) === normalizedName &&
          normalizePlanToken(plan.type) === normalizedType,
      );

    if (duplicateExists) {
      setSaveError('A plan with this name and type already exists in this plan year. To renew, use Add Existing Plans.');
      return;
    }

    const id = buildPlanId(formattedName);
    const displayStart = toDisplayDate(effectiveDate);
    const displayEnd = toDisplayDate(endDate);

    addCustomPlanForPlanYear(planYearId, {
      id,
      carrierId: selectedCarrierId,
      name: formattedName,
      type: planType,
      effectiveDate: displayStart,
      endDate: displayEnd,
      summary: summary.trim() || description.trim(),
      status: 'Active',
      source: 'created',
    });

    const includedPlanIds = getIncludedPlanIdsForPlanYear(planYearId, []);
    if (!includedPlanIds.includes(id)) {
      setIncludedPlanIdsForPlanYear(planYearId, [...includedPlanIds, id]);
    }

    const includedCarrierPlans = getIncludedPlansForCarrier(planYearId, selectedCarrierId);
    setIncludedPlansForCarrier(planYearId, selectedCarrierId, [
      ...includedCarrierPlans,
      {
        name: formattedName,
        type: planType,
        effectiveDate: displayStart,
      },
    ]);
  };

  const handleNextStep = () => {
    const nextStep = WIZARD_STEPS[activeStepIndex + 1];
    if (!nextStep) {
      handlePersistPlan();
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
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-[16px] ${
                      active ? 'bg-[var(--surface-neutral-white)]' : ''
                    }`}
                  >
                    <Icon
                      name="circle"
                      variant="regular"
                      size={22}
                      className={active ? 'text-[var(--color-primary-strong)]' : 'text-[var(--text-neutral-strong)]'}
                    />
                    <span
                      className={`text-[16px] leading-[24px] ${
                        active
                          ? 'font-bold text-[var(--color-primary-strong)]'
                          : 'font-medium text-[var(--text-neutral-strong)]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="h-px bg-[var(--border-neutral-x-weak)] my-6 mx-2" />

            <button
              type="button"
              className="w-full h-10 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-white text-[15px] font-semibold disabled:opacity-60"
              onClick={handleNextStep}
              disabled={activeStepId === 'plan-details' && !canSavePlan}
            >
              {activeStepIndex === WIZARD_STEPS.length - 1 ? 'Create plan' : 'Next step'}
            </button>

            <div className="mt-3 space-y-3 text-center">
              <button
                type="button"
                className="w-full h-10 rounded-[var(--radius-full)] bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-medium)]"
              >
                Save &amp; Finish Later
              </button>
              <p className="text-[13px] font-medium leading-[19px] text-[var(--text-neutral-weak)]">
                Autosaved 5 minutes ago
              </p>
              <button type="button" className="text-[15px] font-semibold text-[#0b4fd1]" onClick={() => navigate(backPath)}>
                Cancel
              </button>
            </div>
          </aside>

          {activeStepId === 'plan-details' ? (
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
                    Plan Details
                  </h2>
                  <p className="text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">
                    How will you explain this plan to employees?
                  </p>
                </div>
              </div>

              <div className="h-px bg-[var(--border-neutral-x-weak)] mb-4" />

              {isTemplateCreate && (
                <div className="mb-4 rounded-[10px] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-xx-weak)] px-4 py-3">
                  <p className="text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">
                    You&apos;re creating a new plan from a template. This does not renew or link the source plan.
                  </p>
                </div>
              )}

              {saveError && (
                <div className="mb-4 rounded-[10px] border border-[#f1c0b7] bg-[#fff5f3] px-4 py-3">
                  <p className="text-[13px] leading-[19px] text-[#b42318]">{saveError}</p>
                </div>
              )}

              <div className="w-[620px] space-y-2">
                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Name *</label>
                <input
                  value={planName}
                  onChange={(event) => {
                    setPlanName(event.target.value);
                    if (saveError) setSaveError('');
                  }}
                  className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]"
                />

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Carrier *</label>
                <select
                  value={selectedCarrierId}
                  onChange={(event) => {
                    setSelectedCarrierId(event.target.value);
                    if (saveError) setSaveError('');
                  }}
                  className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]"
                >
                  {carrierOptions.map((carrier) => (
                    <option key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </option>
                  ))}
                </select>

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Group Number *</label>
                <input
                  value={groupNumber}
                  onChange={(event) => setGroupNumber(event.target.value)}
                  className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]"
                />

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Type *</label>
                <select
                  value={planType}
                  onChange={(event) => {
                    setPlanType(event.target.value);
                    if (saveError) setSaveError('');
                  }}
                  className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]"
                >
                  {PLAN_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Type ID</label>
                <input
                  value={planTypeId}
                  onChange={(event) => setPlanTypeId(event.target.value)}
                  className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]"
                />

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Summary</label>
                <input
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  className="w-[392px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]"
                />

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Description *</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-[392px] h-[92px] rounded-[8px] border border-[var(--border-neutral-medium)] px-3 py-2 text-[14px] resize-none"
                />

                <div className="flex items-end gap-3">
                  <div>
                    <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Starts *</label>
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(event) => setEffectiveDate(event.target.value)}
                      className="w-[174px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]"
                    />
                  </div>
                  <span className="pb-2 text-[var(--text-neutral-weak)]">-</span>
                  <div>
                    <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Ends *</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      min={effectiveDate}
                      className="w-[174px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]"
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {activeStepId === 'coverage-options' ? (
            <StepPlaceholder title="Coverage Options" description="Define what coverage options employees can choose." />
          ) : null}

          {activeStepId === 'premium-type' ? (
            <StepPlaceholder title="Premium Type" description="Set how premium contributions are structured." />
          ) : null}

          {activeStepId === 'eligibility-cost' ? (
            <StepPlaceholder title="Eligibility & Cost" description="Configure eligibility and employer/employee cost details." />
          ) : null}

          {activeStepId === 'enrollment-details' ? (
            <StepPlaceholder title="Enrollment Details" description="Define enrollment rules and effective timing." />
          ) : null}

          {activeStepId === 'payroll-deductions' ? (
            <StepPlaceholder title="Payroll Deductions" description="Map deductions to payroll timing and frequency." />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default PlanYearCreatePlan;
