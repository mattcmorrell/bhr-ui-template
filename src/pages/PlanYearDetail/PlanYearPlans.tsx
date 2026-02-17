import { useNavigate, useParams } from 'react-router-dom';
import { Button, Icon } from '../../components';
import { PlanYearWizardLayout } from './PlanYearWizardLayout';

export function PlanYearPlans() {
  const navigate = useNavigate();
  const { planYearId = 'default' } = useParams<{ planYearId: string }>();

  return (
    <PlanYearWizardLayout
      activeStep="plans"
      sidebarActions="plans"
      sidebarNextTo={`/settings/plan-years/${planYearId}/open-enrollment`}
      sidebarNextLabel="Next: Open Enrollment"
      pageTitle="New Plan Year"
    >
      <section className="flex-1 min-h-[760px] rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden flex flex-col">
        <div className="flex-1 px-8 py-8 flex flex-col items-center">
          <h2
            className="text-[24px] font-semibold text-[var(--text-neutral-xx-strong)] text-center"
            style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
          >
            Add All plans offered in {`[Plan Year]`}
          </h2>

          <div className="mt-12 mb-6 size-[112px] rounded-[12px] border-2 border-[var(--border-neutral-medium)] text-[var(--border-neutral-medium)] flex items-center justify-center">
            <Icon name="file-lines" variant="regular" size={66} />
          </div>

          <p
            className="text-[40px] font-semibold text-[var(--text-neutral-medium)] text-center"
            style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '48px' }}
          >
            No Plans Included in {`[Plan Year]`}... Yet
          </p>

          <div className="mt-6 flex items-center gap-4">
            <Button variant="primary" size="medium" icon="chevron-right">
              Add Existing Plans
            </Button>
            <Button variant="standard" size="medium" icon="circle-plus-lined" showCaret>
              Create New Plan
            </Button>
          </div>
        </div>

        <footer className="h-[128px] border-t border-[var(--border-neutral-x-weak)] px-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`/settings/plan-years/${planYearId}/carriers`)}
            className="h-12 px-8 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[18px] font-semibold leading-[26px] text-[var(--text-neutral-strong)] shadow-[var(--shadow-100)]"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={() => navigate(`/settings/plan-years/${planYearId}/open-enrollment`)}
            className="h-12 px-9 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-white text-[18px] font-semibold leading-[26px] shadow-[var(--shadow-100)]"
          >
            Next
          </button>
        </footer>
      </section>
    </PlanYearWizardLayout>
  );
}

export default PlanYearPlans;

