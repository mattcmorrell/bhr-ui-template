import { useParams } from 'react-router-dom';
import { Icon } from '../../components';
import { benefitPlanYears } from '../../data/settingsData';
import { PlanYearWizardLayout } from './PlanYearWizardLayout';

export function PlanYearDetail() {
  const { planYearId } = useParams<{ planYearId: string }>();
  const selectedPlanYear = benefitPlanYears.find((planYear) => planYear.id === planYearId);

  const planYearName = selectedPlanYear?.name ?? planYearId ?? 'Plan Year';
  const [planYearStarted = '-', planYearEnds = '-'] = (selectedPlanYear?.duration ?? '').split(' - ');

  return (
    <PlanYearWizardLayout activeStep="details">
      <section className="flex-1 min-h-[640px] rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 px-10 pt-12 pb-8">
            <div className="max-w-[760px] mx-auto flex flex-col items-center">
              <h2
                className="text-[32px] font-semibold text-[var(--text-neutral-x-strong)] mb-2"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '40px' }}
              >
                Let&apos;s start with the basics...
              </h2>
              <p className="text-[15px] text-[var(--text-neutral-medium)] mb-8 text-center">
                Name the timeframe of the benefits you are offering next year.
              </p>

              <div className="w-[720px] border border-[var(--border-neutral-x-weak)] rounded-[var(--radius-small)] p-7">
                <label className="block text-[15px] font-medium text-[var(--text-neutral-strong)] mb-2">
                  Plan Year Name
                </label>
                <div className="w-[420px] h-11 px-4 border border-[var(--border-neutral-medium)] rounded-[var(--radius-small)] flex items-center text-[15px] text-[var(--text-neutral-strong)] mb-6">
                  {planYearName}
                </div>

                <div className="flex items-end gap-3">
                  <div className="w-[278px]">
                    <label className="block text-[15px] font-medium text-[var(--text-neutral-strong)] mb-2">
                      Plan Year Started
                    </label>
                    <div className="h-11 px-4 border border-[var(--border-neutral-medium)] rounded-[var(--radius-small)] flex items-center justify-between text-[15px] text-[var(--text-neutral-strong)]">
                      <span>{planYearStarted}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-px h-6 bg-[var(--border-neutral-x-weak)]" />
                        <Icon name="calendar" size={16} className="text-[var(--icon-neutral-strong)]" />
                      </div>
                    </div>
                  </div>

                  <span className="pb-3 text-[var(--text-neutral-medium)]">-</span>

                  <div className="w-[278px]">
                    <label className="block text-[15px] font-medium text-[var(--text-neutral-strong)] mb-2">
                      Plan Year Ends
                    </label>
                    <div className="h-11 px-4 border border-[var(--border-neutral-medium)] rounded-[var(--radius-small)] flex items-center justify-between text-[15px] text-[var(--text-neutral-strong)]">
                      <span>{planYearEnds}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-px h-6 bg-[var(--border-neutral-x-weak)]" />
                        <Icon name="calendar" size={16} className="text-[var(--icon-neutral-strong)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="border-t border-[var(--border-neutral-x-weak)] px-9 py-8 flex items-center justify-between">
            <button className="h-12 px-10 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]">
              Previous
            </button>
            <button className="h-12 px-10 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-white text-[15px] font-semibold">
              Next
            </button>
          </footer>
        </div>
      </section>
    </PlanYearWizardLayout>
  );
}

export default PlanYearDetail;
