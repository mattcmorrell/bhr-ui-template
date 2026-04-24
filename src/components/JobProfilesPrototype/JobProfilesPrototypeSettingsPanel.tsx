import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { JobOrganizationCard } from '../JobOrganizationCard';

const WIZARD_DONE_KEY = 'bhr-wizard-complete';

function readWizardComplete(): boolean {
  try {
    return sessionStorage.getItem(WIZARD_DONE_KEY) === '1';
  } catch {
    return false;
  }
}

export function JobProfilesPrototypeSettingsPanel() {
  const location = useLocation();
  const [wizardDone, setWizardDone] = useState(readWizardComplete);

  // Re-check sessionStorage whenever we navigate back to this panel
  useEffect(() => {
    setWizardDone(readWizardComplete());
  }, [location.key]);

  return (
    <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-medium)] p-8">
      <h2
        className="text-[22px] font-semibold text-[var(--color-primary-strong)] mb-6 pb-6 border-b border-[var(--border-neutral-x-weak)]"
        style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
      >
        Job Organization
      </h2>
      <JobOrganizationCard groupingMode={wizardDone ? 'mapped' : 'unassigned'} />
    </div>
  );
}
