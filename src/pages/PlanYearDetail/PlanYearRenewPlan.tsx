import { useNavigate, useParams } from 'react-router-dom';
import { Button, Icon } from '../../components';
import { benefitPlanYears } from '../../data/settingsData';

const renewSteps = [
  { id: 'plan-details', label: 'Plan Details' },
  { id: 'coverage-options', label: 'Coverage Options' },
  { id: 'premium-type', label: 'Premium Type' },
  { id: 'eligibility-cost', label: 'Eligibility & Cost' },
  { id: 'enrollment-details', label: 'Enrollment Details' },
  { id: 'payroll-deductions', label: 'Payroll Deductions' },
];

function formatPlanName(planSlug?: string) {
  if (!planSlug) return 'Plan';
  const decoded = decodeURIComponent(planSlug).replace(/-/g, ' ').trim();
  return decoded.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function PlanYearRenewPlan() {
  const navigate = useNavigate();
  const { planYearId, planSlug, stepId } = useParams<{ planYearId: string; planSlug: string; stepId?: string }>();
  const visibleSteps = renewSteps.filter((step, index, allSteps) => allSteps.findIndex((item) => item.id === step.id) === index);
  const selectedPlanYear = benefitPlanYears.find((planYear) => planYear.id === planYearId);
  const planYearName = selectedPlanYear?.name ?? planYearId ?? 'Plan Year';
  const planName = formatPlanName(planSlug);
  const planType = planName.split(' ')[0] ?? 'Plan';
  const activeStepId = visibleSteps.some((step) => step.id === stepId) ? stepId ?? 'plan-details' : 'plan-details';
  const activeStepIndex = visibleSteps.findIndex((step) => step.id === activeStepId);

  const goToStep = (targetStepId: string) => {
    navigate(`/settings/plan-years/${planYearId}/plans/${planSlug}/renew/${targetStepId}`);
  };

  const handleNextStep = () => {
    const nextStep = visibleSteps[activeStepIndex + 1];
    if (nextStep) {
      goToStep(nextStep.id);
    }
  };

  return (
    <div className="min-h-full">
      <div className="bg-[var(--surface-neutral-xx-weak)] rounded-[24px] p-6 min-h-[740px]">
        <button
          onClick={() => navigate(`/settings/plan-years/${planYearId}/plans`)}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)] mb-3"
        >
          <Icon name="chevron-left" size={12} />
          Back
        </button>

        <div className="flex items-end justify-between mb-6">
          <div className="flex items-baseline gap-4">
            <h1
              className="text-[48px] font-bold text-[var(--color-primary-strong)]"
              style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '58px' }}
            >
              Renew {planType} Plan
            </h1>
            <p
              className="text-[36px] font-semibold text-[var(--text-neutral-medium)]"
              style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '48px' }}
            >
              {planName}
            </p>
          </div>
          <p className="text-[18px] font-medium leading-[24px] text-[var(--text-neutral-medium)] pb-2">
            Renewing for {planYearName} Plan Year
          </p>
        </div>

        <div className="flex gap-6 items-start">
          <aside className="w-[304px] shrink-0">
            <div className="space-y-1">
              {visibleSteps.map((step) => {
                const active = step.id === activeStepId;
                return (
                  <button
                    type="button"
                    key={step.id}
                    onClick={() => goToStep(step.id)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-[16px] ${
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

            <Button
              variant="primary"
              size="medium"
              className="w-full"
              onClick={handleNextStep}
              disabled={activeStepIndex === visibleSteps.length - 1}
            >
              Next step
            </Button>

            <div className="mt-3 space-y-3 text-center">
              <button
                type="button"
                className="w-full h-10 rounded-[var(--radius-full)] bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-medium)]"
              >
                Save &amp; Finish Later
              </button>
              <p className="text-[13px] font-medium leading-[19px] text-[var(--text-neutral-weak)]">Autosaved 5 minutes ago</p>
              <button type="button" className="text-[15px] font-semibold text-[#0b4fd1]">
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

              <div className="w-[560px] space-y-2">
                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Name *</label>
                <input className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px] bg-[var(--surface-neutral-x-weak)]" value={planName} readOnly />

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Carrier *</label>
                <div className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 flex items-center justify-between text-[14px]">
                  <span>UnitedHealthcare</span>
                  <Icon name="caret-down" size={12} className="text-[var(--text-neutral-weak)]" />
                </div>

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Group Number *</label>
                <input className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px] bg-[var(--surface-neutral-x-weak)]" value="324569" readOnly />

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Type *</label>
                <div className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 flex items-center justify-between text-[14px]">
                  <span>HMO</span>
                  <Icon name="caret-down" size={12} className="text-[var(--text-neutral-weak)]" />
                </div>

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Type ID</label>
                <input className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" />

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Summary</label>
                <input className="w-[392px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" value="High Deductible Family Plan" readOnly />

                <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Input label*</label>
                <textarea
                  className="w-[392px] h-[72px] rounded-[8px] border border-[var(--border-neutral-medium)] px-3 py-2 text-[14px] resize-none"
                  value="This plan gives you flexibility to see the doctors you trust, with coverage both in and out of network. You’ll pay less when you stay in-network, but you’ll..."
                  readOnly
                />

                <div className="flex items-end gap-3">
                  <div>
                    <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Starts *</label>
                    <div className="w-[174px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 flex items-center justify-between text-[14px]">
                      <span>01/01/2026</span>
                      <Icon name="calendar" size={14} className="text-[var(--icon-neutral-strong)]" />
                    </div>
                  </div>
                  <span className="pb-2 text-[var(--text-neutral-weak)]">-</span>
                  <div>
                    <label className="block text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Plan Ends *</label>
                    <div className="w-[174px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 flex items-center justify-between text-[14px]">
                      <span>12/31/2026</span>
                      <Icon name="calendar" size={14} className="text-[var(--icon-neutral-strong)]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[var(--border-neutral-x-weak)] my-6" />

              <div className="w-[560px]">
                <h3
                  className="text-[30px] font-semibold text-[var(--color-primary-strong)]"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '38px' }}
                >
                  Attachments
                </h3>
                <label className="block mt-2 text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Main Plan URL</label>
                <input className="w-[280px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 text-[14px]" placeholder="Input value" />
                <button type="button" className="mt-3 inline-flex items-center gap-2 text-[15px] font-medium text-[#0b4fd1]">
                  <Icon name="circle-plus" size={12} />
                  Add Another Link
                </button>

                <p className="mt-3 text-[13px] font-medium leading-[19px] text-[var(--text-neutral-medium)]">Attached File(s)</p>
                <div className="mt-1 flex items-center gap-3">
                  <Button variant="standard" size="small" icon="arrow-up-from-bracket">
                    Choose Files
                  </Button>
                  <span className="text-[14px] text-[var(--text-neutral-medium)]">No files selected</span>
                </div>
              </div>

              <div className="h-px bg-[var(--border-neutral-x-weak)] my-6" />

              <div className="w-[560px]">
                <h3
                  className="text-[30px] font-semibold text-[var(--color-primary-strong)]"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '38px' }}
                >
                  ACA Compliance
                </h3>

                <label className="block mt-2 text-[13px] font-medium leading-[19px] text-[var(--text-neutral-strong)]">
                  Does this plan meet the minimum value standard? *
                </label>
                <div className="mt-1 w-[120px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 flex items-center justify-between text-[14px]">
                  <span>Yes</span>
                  <div className="flex items-center gap-2">
                    <Icon name="xmark" size={12} className="text-[var(--text-neutral-weak)]" />
                    <Icon name="caret-down" size={12} className="text-[var(--text-neutral-weak)]" />
                  </div>
                </div>

                <label className="block mt-2 text-[13px] font-medium leading-[19px] text-[var(--text-neutral-strong)]">
                  Does this plan qualify as a minimum essential coverage? *
                </label>
                <div className="mt-1 w-[120px] h-10 rounded-[8px] border border-[var(--border-neutral-medium)] px-3 flex items-center justify-between text-[14px]">
                  <span>Yes</span>
                  <div className="flex items-center gap-2">
                    <Icon name="xmark" size={12} className="text-[var(--text-neutral-weak)]" />
                    <Icon name="caret-down" size={12} className="text-[var(--text-neutral-weak)]" />
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="flex-1 min-h-[720px] rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] px-8 py-6">
              <h2
                className="text-[36px] font-semibold text-[var(--color-primary-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '44px' }}
              >
                {visibleSteps[activeStepIndex]?.label}
              </h2>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanYearRenewPlan;
