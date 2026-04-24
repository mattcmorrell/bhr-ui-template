interface AiOnboardingStepTrackerProps {
  currentStep: number; // 1-indexed
  steps: string[];
}

export function AiOnboardingStepTracker({ currentStep, steps }: AiOnboardingStepTrackerProps) {
  return (
    <div
      className="flex items-center gap-1 px-4 py-3 rounded-[var(--radius-medium)] bg-[var(--surface-neutral-white)]"
      style={{ boxShadow: '2px 2px 0px 2px rgba(56, 49, 47, 0.05), 0 1px 3px rgba(56, 49, 47, 0.08)' }}
    >
      {steps.map((label, i) => {
        const stepNumber = i + 1;
        const isActive = stepNumber === currentStep;

        return (
          <div
            key={stepNumber}
            className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-small)] transition-colors ${
              isActive ? 'bg-[var(--color-primary-weak)]' : ''
            }`}
          >
            {/* Circled number */}
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full border-2 shrink-0 text-[13px] font-semibold leading-none ${
                isActive
                  ? 'border-[var(--color-primary-strong)] text-[var(--color-primary-strong)]'
                  : 'border-[var(--text-neutral-medium)] text-[var(--text-neutral-medium)]'
              }`}
            >
              {stepNumber}
            </div>

            {/* Label */}
            <span
              className={`text-[14px] leading-[20px] whitespace-nowrap ${
                isActive
                  ? 'font-semibold text-[var(--color-primary-strong)]'
                  : 'font-medium text-[var(--text-neutral-strong)]'
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
