import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../components';
import { benefitPlanYears } from '../../data/settingsData';
import { getBenefitPlanYearsWithCustom, getPlanYearBasicsDraft, setPlanYearBasicsDraft } from './planYearWizardState';
import { PlanYearWizardLayout } from './PlanYearWizardLayout';

const toInputDate = (value: string) => {
  const [month, day, year] = value.split('/');
  if (!month || !day || !year) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const getFallbackDurationByPlanYearId = (planYearId: string) => {
  const year = Number.parseInt(planYearId, 10);
  if (!Number.isFinite(year)) return '01/01/2026 - 12/31/2026';
  return `01/01/${year} - 12/31/${year}`;
};

export function PlanYearDetail() {
  const navigate = useNavigate();
  const { planYearId = 'default' } = useParams<{ planYearId: string }>();
  const allPlanYears = getBenefitPlanYearsWithCustom(benefitPlanYears);
  const selectedPlanYear = allPlanYears.find((planYear) => planYear.id === planYearId);

  const planYearName = selectedPlanYear?.name ?? planYearId ?? 'Plan Year';
  const [planYearStarted = '01/01/2026', planYearEnds = '12/31/2026'] = (
    selectedPlanYear?.duration ?? getFallbackDurationByPlanYearId(planYearId)
  ).split(' - ');

  const persistedBasics = getPlanYearBasicsDraft(planYearId, {
    name: selectedPlanYear ? planYearName : '',
    startDate: toInputDate(planYearStarted),
    endDate: toInputDate(planYearEnds),
  });

  const [editablePlanYearName, setEditablePlanYearName] = useState(persistedBasics.name);
  const [editablePlanYearStart, setEditablePlanYearStart] = useState(persistedBasics.startDate);
  const [editablePlanYearEnd, setEditablePlanYearEnd] = useState(persistedBasics.endDate);

  const onPlanYearNameChange = (value: string) => {
    setEditablePlanYearName(value);
    setPlanYearBasicsDraft(planYearId, {
      name: value,
      startDate: editablePlanYearStart,
      endDate: editablePlanYearEnd,
    });
  };

  const onPlanYearStartChange = (value: string) => {
    setEditablePlanYearStart(value);
    const nextEndDate = editablePlanYearEnd && editablePlanYearEnd < value ? value : editablePlanYearEnd;
    if (nextEndDate !== editablePlanYearEnd) {
      setEditablePlanYearEnd(nextEndDate);
    }
    setPlanYearBasicsDraft(planYearId, {
      name: editablePlanYearName,
      startDate: value,
      endDate: nextEndDate,
    });
  };

  const onPlanYearEndChange = (value: string) => {
    setEditablePlanYearEnd(value);
    setPlanYearBasicsDraft(planYearId, {
      name: editablePlanYearName,
      startDate: editablePlanYearStart,
      endDate: value,
    });
  };

  return (
    <PlanYearWizardLayout activeStep="details">
      <section className="flex-1 h-full min-h-0 rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-8 pt-8 pb-6">
            <div className="max-w-[860px] mx-auto">
              <h2
                className="text-[32px] font-semibold text-[var(--text-neutral-x-strong)] mb-6"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '40px' }}
              >
                Let&apos;s Start With The Basics...
              </h2>

              <label className="block text-[15px] font-medium text-[var(--text-neutral-strong)] mb-2">Plan Year Name</label>
              <input
                type="text"
                value={editablePlanYearName}
                onChange={(event) => onPlanYearNameChange(event.target.value)}
                placeholder="Enter plan year name"
                className="w-[420px] h-11 px-4 border border-[var(--border-neutral-medium)] rounded-[10px] text-[15px] text-[var(--text-neutral-strong)] mb-5 bg-[var(--surface-neutral-white)]"
              />

              <div className="flex items-end gap-3 mb-8">
                <div className="w-[278px]">
                  <label className="block text-[15px] font-medium text-[var(--text-neutral-strong)] mb-2">Plan Year Starts</label>
                  <div className="h-11 px-4 border border-[var(--border-neutral-medium)] rounded-[10px] flex items-center gap-3 text-[15px] text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]">
                    <input
                      type="date"
                      value={editablePlanYearStart}
                      onChange={(event) => onPlanYearStartChange(event.target.value)}
                      className="w-full bg-transparent outline-none"
                    />
                    <div className="flex items-center gap-3">
                      <div className="w-px h-6 bg-[var(--border-neutral-x-weak)]" />
                      <Icon name="calendar" size={16} className="text-[var(--icon-neutral-strong)]" />
                    </div>
                  </div>
                </div>

                <span className="pb-3 text-[24px] text-[var(--text-neutral-medium)]">-</span>

                <div className="w-[278px]">
                  <label className="block text-[15px] font-medium text-[var(--text-neutral-strong)] mb-2">Plan Year Ends</label>
                  <div className="h-11 px-4 border border-[var(--border-neutral-medium)] rounded-[10px] flex items-center gap-3 text-[15px] text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]">
                    <input
                      type="date"
                      value={editablePlanYearEnd}
                      min={editablePlanYearStart}
                      onChange={(event) => onPlanYearEndChange(event.target.value)}
                      className="w-full bg-transparent outline-none"
                    />
                    <div className="flex items-center gap-3">
                      <div className="w-px h-6 bg-[var(--border-neutral-x-weak)]" />
                      <Icon name="calendar" size={16} className="text-[var(--icon-neutral-strong)]" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <footer className="sticky bottom-0 z-20 border-t border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] px-9 py-8 flex items-center justify-between">
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
