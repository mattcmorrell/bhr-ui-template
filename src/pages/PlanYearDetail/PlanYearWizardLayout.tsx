import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../components';
import { benefitPlanYears } from '../../data/settingsData';

type WizardStep = 'details' | 'carriers' | 'plans' | 'open-enrollment' | 'new-hires';

interface PlanYearWizardLayoutProps {
  activeStep: WizardStep;
  children: ReactNode;
  sidebarActions?: 'default' | 'plans';
  sidebarNextTo?: string;
  sidebarNextLabel?: string;
  pageTitle?: string;
}

const wizardSteps: Array<{ id: WizardStep; label: string; suffix: string }> = [
  { id: 'details', label: 'Details', suffix: '' },
  { id: 'carriers', label: 'Carriers', suffix: '/carriers' },
  { id: 'plans', label: 'Plans', suffix: '/plans' },
  { id: 'open-enrollment', label: 'Open Enrollment', suffix: '/open-enrollment' },
  { id: 'new-hires', label: 'New Hires', suffix: '/new-hires' },
];

export function PlanYearWizardLayout({
  activeStep,
  children,
  sidebarActions = 'default',
  sidebarNextTo,
  sidebarNextLabel,
  pageTitle = 'Edit Plan Year',
}: PlanYearWizardLayoutProps) {
  const navigate = useNavigate();
  const { planYearId } = useParams<{ planYearId: string }>();
  const selectedPlanYear = benefitPlanYears.find((planYear) => planYear.id === planYearId);
  const planYearName = selectedPlanYear?.name ?? planYearId ?? 'Plan Year';
  const activeStepIndex = wizardSteps.findIndex((step) => step.id === activeStep);

  return (
    <div className="min-h-full">
      <div className="bg-[var(--surface-neutral-xx-weak)] rounded-[24px] p-6 min-h-[740px]">
        <button
          onClick={() => navigate('/settings')}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)] mb-4"
        >
          <Icon name="chevron-left" size={12} />
          Plan Years
        </button>

        <div className="flex items-end gap-4 mb-8">
          <h1
            className="text-[48px] font-bold text-[var(--color-primary-strong)]"
            style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '58px' }}
          >
            {pageTitle}
          </h1>
          <p
            className="text-[26px] font-semibold text-[var(--text-neutral-medium)]"
            style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '34px' }}
          >
            {planYearName}
          </p>
        </div>

        <div className="flex gap-8">
          <aside className="w-[304px] shrink-0">
            <div className="space-y-2">
              {wizardSteps.map((step, index) => {
                const isComplete = index < activeStepIndex;
                const isActive = index === activeStepIndex;

                return (
                  <Link
                    key={step.id}
                    to={`/settings/plan-years/${planYearId}${step.suffix}`}
                    className={`flex items-center gap-3 px-4 py-4 rounded-[16px] ${
                      isActive ? 'bg-[var(--surface-neutral-white)]' : ''
                    }`}
                  >
                    <span className="size-6 flex items-center justify-center">
                      {isComplete && (
                        <Icon name="check-circle" size={24} className="text-[var(--color-primary-strong)]" />
                      )}
                      {isActive && <Icon name="circle" variant="regular" size={22} className="text-[var(--color-primary-strong)]" />}
                      {!isActive && !isComplete && (
                        <Icon name="circle" variant="regular" size={22} className="text-[var(--text-neutral-strong)]" />
                      )}
                    </span>
                    <span
                      className={`text-[16px] leading-[24px] ${
                        isActive
                          ? 'font-bold text-[var(--color-primary-strong)]'
                          : isComplete
                            ? 'font-medium text-[var(--color-primary-strong)]'
                            : 'font-medium text-[var(--text-neutral-strong)]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="h-px bg-[var(--border-neutral-x-weak)] my-7 mx-6" />

            {sidebarActions === 'plans' ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(sidebarNextTo ?? `/settings/plan-years/${planYearId}/new-hires`)}
                  className="w-full h-10 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-[15px] font-semibold text-white"
                >
                  {sidebarNextLabel ?? 'Next: New Hires'}
                </button>
                <button className="w-full h-10 mt-2 rounded-[var(--radius-full)] text-[15px] font-semibold text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-white)]">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button className="w-full h-10 rounded-[var(--radius-full)] bg-[var(--surface-neutral-x-weak)] text-[15px] font-semibold text-[var(--text-neutral-medium)]">
                  Save & Finish Later
                </button>
                <button className="w-full h-10 mt-4 text-[15px] font-semibold text-[#0b4fd1]">
                  Cancel
                </button>
              </>
            )}
          </aside>

          {children}
        </div>
      </div>
    </div>
  );
}

export default PlanYearWizardLayout;
