import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../components';
import { PlanYearWizardLayout } from './PlanYearWizardLayout';

export function PlanYearNewHires() {
  const navigate = useNavigate();
  const { planYearId = 'default' } = useParams<{ planYearId: string }>();
  const [startTiming, setStartTiming] = useState('Immediately upon hire');
  const [durationAmount, setDurationAmount] = useState('1');
  const [durationUnit, setDurationUnit] = useState('month');

  return (
    <PlanYearWizardLayout activeStep="new-hires">
      <section className="flex-1 min-h-[760px] rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 px-8 pt-10 pb-8">
            <div className="max-w-[980px] mx-auto flex flex-col items-center">
              <h2
                className="text-[32px] font-semibold text-[var(--text-neutral-x-strong)] text-center mb-10"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '40px' }}
              >
                When are new employees able to elect benefits and how long do they have?
              </h2>

              <div className="w-[560px] rounded-[16px] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] p-6 shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)]">
                <label className="block text-[15px] font-medium text-[var(--text-neutral-strong)] mb-2">
                  When can new hires start their benefits enrollment?*
                </label>
                <div className="h-12 rounded-[10px] border border-[var(--border-neutral-medium)] px-4 flex items-center justify-between text-[15px] text-[var(--text-neutral-strong)]">
                  <span>{startTiming}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStartTiming('')}
                      className="text-[var(--icon-neutral-weak)] hover:text-[var(--text-neutral-strong)]"
                      aria-label="Clear enrollment timing"
                    >
                      <Icon name="xmark" size={16} />
                    </button>
                    <div className="w-px h-6 bg-[var(--border-neutral-x-weak)]" />
                    <Icon name="caret-down" size={11} className="text-[var(--icon-neutral-weak)]" />
                  </div>
                </div>

                <label className="block text-[15px] font-medium text-[var(--text-neutral-strong)] mt-6 mb-2">
                  How long do new employees have to complete elections?
                </label>
                <div className="flex items-center gap-3">
                  <input
                    value={durationAmount}
                    onChange={(event) => setDurationAmount(event.target.value)}
                    className="w-[112px] h-12 rounded-[10px] border border-[var(--border-neutral-medium)] px-4 text-[15px] text-[var(--text-neutral-strong)]"
                    aria-label="Duration amount"
                  />

                  <button
                    type="button"
                    onClick={() => setDurationUnit((current) => (current === 'month' ? 'days' : 'month'))}
                    className="w-[150px] h-12 rounded-[10px] border border-[var(--border-neutral-medium)] px-4 flex items-center justify-between text-[15px] text-[var(--text-neutral-strong)]"
                  >
                    <span>{durationUnit}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-px h-6 bg-[var(--border-neutral-x-weak)]" />
                      <Icon name="caret-down" size={11} className="text-[var(--icon-neutral-weak)]" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <footer className="h-[128px] border-t border-[var(--border-neutral-x-weak)] px-9 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(`/settings/plan-years/${planYearId}/open-enrollment`)}
              className="h-12 px-8 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)] shadow-[var(--shadow-100)]"
            >
              Previous
            </button>
            <button
              type="button"
              className="h-12 px-8 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-white text-[15px] font-semibold shadow-[var(--shadow-100)] inline-flex items-center gap-2"
            >
              <Icon name="check" size={14} className="text-white" />
              Finish Plan Year Setup
            </button>
          </footer>
        </div>
      </section>
    </PlanYearWizardLayout>
  );
}

export default PlanYearNewHires;
