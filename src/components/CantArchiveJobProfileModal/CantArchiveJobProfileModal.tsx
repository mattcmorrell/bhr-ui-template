import { Icon } from '../Icon';

interface CantArchiveJobProfileModalProps {
  employeeCount: number;
  onClose: () => void;
}

export function CantArchiveJobProfileModal({ employeeCount, onClose }: CantArchiveJobProfileModalProps) {
  const primaryLine =
    employeeCount === 1
      ? "You've got 1 employee assigned to this Job Profile."
      : `You've got ${employeeCount} employees assigned to this Job Profile.`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ backgroundColor: 'rgba(103, 98, 96, 0.5)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-small)] w-full max-w-[440px] overflow-hidden border border-[var(--border-neutral-x-weak)]"
        style={{ boxShadow: '2px 2px 0px 2px rgba(56, 49, 47, 0.08)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cant-archive-title"
      >
        <div className="flex items-center justify-between px-[var(--space-m)] py-[var(--space-s)] bg-[var(--surface-neutral-white)] border-b border-[var(--border-neutral-x-weak)]">
          <h3
            id="cant-archive-title"
            className="text-[18px] font-semibold text-[var(--color-primary-strong)] pr-2"
            style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '26px' }}
          >
            Can&apos;t Archive Yet…
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full border border-[var(--border-neutral-weak)] hover:bg-[var(--surface-neutral-x-weak)] text-[var(--text-neutral-strong)] transition-colors"
            aria-label="Close"
          >
            <Icon name="xmark" size={14} />
          </button>
        </div>

        <div className="px-[var(--space-m)] py-[var(--space-xl)] bg-[var(--surface-neutral-white)]">
          <div className="flex justify-center mb-[var(--space-m)]">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-[var(--radius-xx-small)]"
              style={{ backgroundColor: '#f5f0e8' }}
            >
              <Icon name="triangle-exclamation" size={28} className="text-[#ea580c]" />
            </div>
          </div>

          <p
            className="text-[16px] font-semibold text-[var(--text-neutral-x-strong)] text-center mb-[var(--space-s)]"
            style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '24px' }}
          >
            {primaryLine}
          </p>
          <p className="text-[15px] text-[var(--text-neutral-medium)] text-center" style={{ lineHeight: '22px' }}>
            Don&apos;t leave them hanging; move them to another Job Profile before archiving this.
          </p>
        </div>

        <div className="flex items-center justify-end gap-[var(--space-m)] px-[var(--space-m)] py-[var(--space-s)] bg-[var(--surface-neutral-xx-weak)]">
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-semibold text-[var(--color-link)] hover:underline"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-[15px] font-semibold rounded-full bg-[var(--color-primary-strong)] text-white hover:opacity-90 transition-opacity"
            style={{ boxShadow: '1px 1px 0px 1px rgba(56,49,47,0.04)' }}
          >
            I&apos;ll Fix It
          </button>
        </div>
      </div>
    </div>
  );
}

export default CantArchiveJobProfileModal;
