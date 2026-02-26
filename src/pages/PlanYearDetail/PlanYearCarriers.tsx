import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../components';
import { benefitPlanYears } from '../../data/settingsData';
import { PlanYearWizardLayout } from './PlanYearWizardLayout';
import {
  getSelectedCarrierIdsForPlanYear,
  setSelectedCarrierIdsForPlanYear,
} from './planYearWizardState';

interface SelectableBoxProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

function SelectableBox({ label, selected, onToggle }: SelectableBoxProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full h-[72px] px-6 rounded-[16px] border transition-colors flex items-center justify-between ${
        selected
          ? 'border-[var(--color-primary-strong)]/50 bg-[#F6F6F4]'
          : 'border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] hover:border-[var(--border-neutral-medium)]'
      }`}
    >
      <span className={`text-[16px] text-[var(--color-primary-strong)] ${selected ? 'font-bold' : 'font-semibold'}`}>
        {label}
      </span>
      <span
        className={`w-6 h-6 rounded-[6px] border flex items-center justify-center ${
          selected
            ? 'bg-[var(--color-primary-strong)] border-[var(--color-primary-strong)]'
            : 'bg-[var(--surface-neutral-x-weak)] border-[var(--border-neutral-medium)]'
        }`}
      >
        {selected && <Icon name="check" size={12} className="text-white" />}
      </span>
    </button>
  );
}

const CARRIER_OPTIONS = [
  { id: 'united-healthcare', name: 'UnitedHealthcare' },
  { id: 'delta-dental', name: 'Delta Dental' },
  { id: 'vsp', name: 'VSP' },
  { id: 'aetna', name: 'Aetna' },
  { id: 'principal', name: 'Principal' },
  { id: 'fidelity', name: 'Fidelity' },
];

export function PlanYearCarriers() {
  const navigate = useNavigate();
  const { planYearId = 'default' } = useParams<{ planYearId: string }>();
  const hasPresetDefaults = benefitPlanYears.some((planYear) => planYear.id === planYearId);
  const defaultCarrierIds = CARRIER_OPTIONS.map((carrier) => carrier.id);
  const [selectedCarriers, setSelectedCarriers] = useState<Set<string>>(() => {
    const storedCarrierIds = getSelectedCarrierIdsForPlanYear(
      planYearId,
      hasPresetDefaults ? defaultCarrierIds : [],
    );
    return new Set(storedCarrierIds);
  });

  const toggleCarrier = (carrierId: string) => {
    setSelectedCarriers((prev) => {
      const next = new Set(prev);
      if (next.has(carrierId)) next.delete(carrierId);
      else next.add(carrierId);
      setSelectedCarrierIdsForPlanYear(planYearId, Array.from(next));
      return next;
    });
  };

  return (
    <PlanYearWizardLayout activeStep="carriers">
      <section className="flex-1 h-full min-h-0 rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-10 pt-12 pb-8">
            <div className="max-w-[760px] mx-auto flex flex-col items-center">
              <h2
                className="text-[32px] font-semibold text-[var(--text-neutral-x-strong)] mb-2 text-center"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '40px' }}
              >
                Next, which carrier are you going to be offering plans through this year?
              </h2>
              <p className="text-[15px] text-[var(--text-neutral-medium)] mb-8 text-center">
                Once we know who we&apos;re working with, we&apos;ll dive into adding plans for each carrier.
              </p>

              <div className="w-[720px] space-y-3">
                {CARRIER_OPTIONS.map((carrier) => (
                  <SelectableBox
                    key={carrier.id}
                    label={carrier.name}
                    selected={selectedCarriers.has(carrier.id)}
                    onToggle={() => toggleCarrier(carrier.id)}
                  />
                ))}
              </div>

              <button className="mt-8 h-10 px-6 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-medium)] bg-[var(--surface-neutral-white)]">
                Add Carrier
              </button>
            </div>
          </div>

          <footer className="sticky bottom-0 z-20 border-t border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] px-9 py-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(`/settings/plan-years/${planYearId}`)}
              className="h-12 px-10 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => navigate(`/settings/plan-years/${planYearId}/plans`)}
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

export default PlanYearCarriers;
