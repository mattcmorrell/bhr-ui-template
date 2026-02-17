import { PlanYearWizardLayout } from './PlanYearWizardLayout';

export function PlanYearNewHires() {
  return (
    <PlanYearWizardLayout activeStep="new-hires">
      <section className="flex-1 min-h-[640px] rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)]" />
    </PlanYearWizardLayout>
  );
}

export default PlanYearNewHires;
