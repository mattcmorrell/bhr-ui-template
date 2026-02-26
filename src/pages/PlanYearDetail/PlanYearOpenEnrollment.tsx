import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../components';
import { benefitPlanYears } from '../../data/settingsData';
import { getBenefitPlanYearsWithCustom } from './planYearWizardState';
import { PlanYearWizardLayout } from './PlanYearWizardLayout';

export function PlanYearOpenEnrollment() {
  const navigate = useNavigate();
  const { planYearId = 'default' } = useParams<{ planYearId: string }>();
  const allPlanYears = getBenefitPlanYearsWithCustom(benefitPlanYears);
  const selectedPlanYear = allPlanYears.find((planYear) => planYear.id === planYearId);
  const planYearName = selectedPlanYear?.name ?? planYearId ?? 'Plan Year';
  const openEnrollmentTitle = `Open Enrollment ${planYearName}`;

  return (
    <PlanYearWizardLayout activeStep="open-enrollment">
      <section className="flex-1 h-full min-h-0 rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-[57px] pt-[64px] pb-10">
          <div className="mx-auto w-full max-w-[790px] text-center">
            <h2
              className="mx-auto max-w-[668px] text-[36px] font-semibold text-[var(--text-neutral-xx-strong)]"
              style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '48px' }}
            >
              When is Open Enrollment for{' '}
              <br />
              {planYearName} Benefits?
            </h2>
            <p className="mx-auto mt-2 max-w-[616px] text-[15px] leading-[22px] text-[var(--text-neutral-medium)]">
              Employees who are eligible for benefits will receive enrollment details automatically.
            </p>

            <div className="mx-auto mt-12 flex w-full max-w-[380px] items-start justify-between gap-8 rounded-[16px] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] px-5 py-5 text-left shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)]">
              <div className="min-w-0">
                <h3
                  className="text-[22px] font-semibold text-[var(--color-primary-strong)]"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
                >
                  {openEnrollmentTitle}
                </h3>
                <div className="mt-4 flex items-start gap-9">
                  <div>
                    <p className="text-[14px] font-medium leading-[20px] text-[var(--text-neutral-x-strong)]">Starts</p>
                    <p className="text-[15px] leading-[22px] text-[var(--text-neutral-strong)]">10/01/2025</p>
                  </div>
                  <div>
                    <p className="text-[14px] font-medium leading-[20px] text-[var(--text-neutral-x-strong)]">Ends</p>
                    <p className="text-[15px] leading-[22px] text-[var(--text-neutral-strong)]">10/21/2025</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[var(--text-neutral-strong)]"
                aria-label="Edit open enrollment dates"
              >
                <Icon name="pen" size={18} />
              </button>
            </div>
          </div>
        </div>

        <footer className="sticky bottom-0 z-20 flex items-center justify-between border-t border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] px-10 py-10">
          <button
            type="button"
            onClick={() => navigate(`/settings/plan-years/${planYearId}/plans`)}
            className="h-12 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] px-8 text-[18px] font-semibold text-[var(--text-neutral-strong)]"
            style={{ lineHeight: '26px' }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => navigate(`/settings/plan-years/${planYearId}/new-hires`)}
            className="h-12 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] px-8 text-[18px] font-semibold text-white"
            style={{ lineHeight: '26px' }}
          >
            Next
          </button>
        </footer>
      </section>
    </PlanYearWizardLayout>
  );
}

export default PlanYearOpenEnrollment;
