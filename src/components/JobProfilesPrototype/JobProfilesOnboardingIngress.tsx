import { useState } from 'react';
import { Icon } from '../Icon';

const STORAGE_KEY = 'bhr-job-profiles-onboarding-ingress-dismissed';

/** Title, sparkles, and dismiss — dark teal-blue from design */
const INGRESS_ACCENT = '#0f6b7a';

function readDismissedFromStorage(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export type JobProfilesOnboardingGroupingMode = 'mapped' | 'unassigned';

export interface JobProfilesOnboardingIngressProps {
  jobTitleCount: number;
  groupingMode: JobProfilesOnboardingGroupingMode;
  onGetStarted?: () => void;
}

/** Gradient border + soft interior gradient (mint/teal → blue → lavender) */
const BORDER_GRADIENT =
  'linear-gradient(135deg, #2dd4bf 0%, #38bdf8 42%, #c4b5fd 78%, #f0abfc 100%)';
const FILL_GRADIENT =
  'linear-gradient(135deg, #dff7f3 0%, #e2f1fb 38%, #f1ecf9 72%, #faf5fc 100%)';

export function JobProfilesOnboardingIngress({
  jobTitleCount,
  groupingMode,
  onGetStarted,
}: JobProfilesOnboardingIngressProps) {
  const [dismissed, setDismissed] = useState(readDismissedFromStorage);

  if (groupingMode !== 'unassigned' || jobTitleCount <= 0 || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="px-[var(--space-m)] pb-[var(--space-m)]">
      <div
        className="rounded-[var(--radius-small)] p-px"
        style={{ background: BORDER_GRADIENT }}
      >
        <div
          className="flex min-h-[88px] flex-wrap items-start justify-between gap-x-6 gap-y-4 px-5 py-4 sm:px-6 sm:py-5"
          style={{
            background: FILL_GRADIENT,
            borderRadius: 'calc(var(--radius-small) - 1px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)',
          }}
        >
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div
              className="relative h-[52px] w-[52px] shrink-0"
              style={{ color: INGRESS_ACCENT }}
              aria-hidden
            >
              <Icon name="sparkles" size={30} className="absolute left-0 top-0" />
              <Icon name="star" size={11} className="absolute right-0 top-1 opacity-95" />
              <Icon name="star" size={9} className="absolute bottom-1 right-2 opacity-90" />
            </div>

            <div className="min-w-0">
              <p
                className="text-[16px] font-semibold leading-[22px] sm:text-[17px] sm:leading-6"
                style={{ color: INGRESS_ACCENT }}
              >
                Start Building Your Job Profiles
              </p>
              <p className="mt-1 text-[14px] leading-[20px] text-[var(--text-neutral-strong)]">
                We&apos;ll match your {jobTitleCount} job titles to job families and suggest the
                rest—so you don&apos;t have to start from scratch.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => onGetStarted?.()}
              className="rounded-full border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] px-5 py-2.5 text-[14px] font-semibold text-[var(--text-neutral-strong)] transition-colors hover:bg-[var(--surface-neutral-xx-weak)]"
              style={{
                boxShadow:
                  '0 1px 2px rgba(56, 49, 47, 0.06), 0 2px 6px rgba(56, 49, 47, 0.05)',
              }}
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/[0.04]"
              style={{ color: INGRESS_ACCENT }}
            >
              <Icon name="xmark" size={16} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
