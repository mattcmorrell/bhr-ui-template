import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../components';
import { benefitPlanYears } from '../../data/settingsData';
import { PlanYearWizardLayout } from './PlanYearWizardLayout';

function deriveChangeTasks(input: string) {
  const normalized = input.toLowerCase();
  const tasks: string[] = [];

  if (normalized.includes('rate') || normalized.includes('premium')) tasks.push('Rate change');
  if (normalized.includes('carrier') || normalized.includes('vendor')) tasks.push('Carrier change');
  if (normalized.includes('eligibility')) tasks.push('Eligibility change');
  if (normalized.includes('deductible') || normalized.includes('copay') || normalized.includes('cost')) {
    tasks.push('Cost sharing change');
  }

  if (tasks.length === 0) {
    const firstChunk = input
      .split(/[\n.;]/)
      .map((part) => part.trim())
      .filter(Boolean)[0];
    if (firstChunk) tasks.push(firstChunk);
  }

  return tasks;
}

export function PlanYearDetail() {
  const navigate = useNavigate();
  const { planYearId = 'default' } = useParams<{ planYearId: string }>();
  const selectedPlanYear = benefitPlanYears.find((planYear) => planYear.id === planYearId);

  const planYearName = selectedPlanYear?.name ?? planYearId ?? 'Plan Year';
  const [planYearStarted = '01/01/2026', planYearEnds = '12/31/2027'] = (selectedPlanYear?.duration ?? '01/01/2026 - 12/31/2027').split(' - ');

  const [changeInput, setChangeInput] = useState('');
  const [changes, setChanges] = useState<string[]>(['Rate change', 'Carrier change']);

  const runAiTaskGeneration = () => {
    const trimmed = changeInput.trim();
    if (!trimmed) return;

    const generatedTasks = deriveChangeTasks(trimmed);
    setChanges((current) => {
      const next = [...current];
      generatedTasks.forEach((task) => {
        if (!next.some((existing) => existing.toLowerCase() === task.toLowerCase())) next.push(task);
      });
      return next;
    });
    setChangeInput('');
  };

  return (
    <PlanYearWizardLayout activeStep="details">
      <section className="flex-1 min-h-[760px] rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 px-8 pt-8 pb-6">
            <div className="max-w-[860px] mx-auto">
              <h2
                className="text-[32px] font-semibold text-[var(--text-neutral-x-strong)] mb-6"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '40px' }}
              >
                Let&apos;s Start With The Basics...
              </h2>

              <label className="block text-[15px] font-medium text-[var(--text-neutral-strong)] mb-2">Plan Year Name</label>
              <div className="w-[420px] h-11 px-4 border border-[var(--border-neutral-medium)] rounded-[10px] flex items-center text-[15px] text-[var(--text-neutral-strong)] mb-5">
                {selectedPlanYear ? planYearName : '[generated]'}
              </div>

              <div className="flex items-end gap-3 mb-8">
                <div className="w-[278px]">
                  <label className="block text-[15px] font-medium text-[var(--text-neutral-strong)] mb-2">Plan Year Starts</label>
                  <div className="h-11 px-4 border border-[var(--border-neutral-medium)] rounded-[10px] flex items-center justify-between text-[15px] text-[var(--text-neutral-strong)]">
                    <span>{planYearStarted}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-px h-6 bg-[var(--border-neutral-x-weak)]" />
                      <Icon name="calendar" size={16} className="text-[var(--icon-neutral-strong)]" />
                    </div>
                  </div>
                </div>

                <span className="pb-3 text-[24px] text-[var(--text-neutral-medium)]">-</span>

                <div className="w-[278px]">
                  <label className="block text-[15px] font-medium text-[var(--text-neutral-strong)] mb-2">Plan Year Ends</label>
                  <div className="h-11 px-4 border border-[var(--border-neutral-medium)] rounded-[10px] flex items-center justify-between text-[15px] text-[var(--text-neutral-strong)]">
                    <span>{planYearEnds}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-px h-6 bg-[var(--border-neutral-x-weak)]" />
                      <Icon name="calendar" size={16} className="text-[var(--icon-neutral-strong)]" />
                    </div>
                  </div>
                </div>
              </div>

              <h3
                className="text-[32px] font-semibold text-[var(--text-neutral-x-strong)] mb-3"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '38px' }}
              >
                What Changed from Last Year?
              </h3>

              <label className="block text-[15px] font-medium text-[var(--text-neutral-strong)] mb-2">Explain what changed*</label>
              <textarea
                value={changeInput}
                onChange={(event) => setChangeInput(event.target.value)}
                onBlur={runAiTaskGeneration}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    runAiTaskGeneration();
                  }
                }}
                placeholder="[user types in what changed from last year]"
                className="w-full max-w-[640px] min-h-[120px] px-4 py-3 border border-[var(--border-neutral-medium)] rounded-[10px] text-[15px] text-[var(--text-neutral-strong)] resize-none"
              />

              <p className="mt-5 mb-2 text-[15px] font-medium text-[var(--text-neutral-strong)]">List of changes</p>
              <div className="space-y-2 max-w-[860px]">
                {changes.map((change) => (
                  <div
                    key={change}
                    className="h-[46px] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] px-4 flex items-center justify-between"
                  >
                    <span className="text-[15px] text-[var(--text-neutral-strong)]">{change}</span>
                    <button
                      type="button"
                      onClick={() => setChanges((current) => current.filter((item) => item !== change))}
                      className="text-[var(--icon-neutral-strong)] hover:text-[var(--text-neutral-x-strong)]"
                      aria-label={`Remove ${change}`}
                    >
                      <Icon name="circle-x" size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <footer className="border-t border-[var(--border-neutral-x-weak)] px-9 py-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/settings', { state: { activeNav: 'benefits', benefitsSubTab: 'plan-years' } })}
              className="h-12 px-10 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => navigate(`/settings/plan-years/${planYearId}/carriers`)}
              className="h-12 px-10 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-white text-[15px] font-semibold"
            >
              Next
            </button>
          </footer>
        </div>
      </section>
    </PlanYearWizardLayout>
  );
}

export default PlanYearDetail;
