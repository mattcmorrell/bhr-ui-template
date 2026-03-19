import { useState } from 'react';
import { Icon } from '../Icon';

interface DeleteJobProfileModalProps {
  jobProfileName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteJobProfileModal({
  jobProfileName,
  onClose,
  onConfirm,
}: DeleteJobProfileModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const canConfirm = confirmText === 'Delete';

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ backgroundColor: 'rgba(103, 98, 96, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-small)] w-full max-w-[400px] overflow-hidden"
        style={{ boxShadow: '2px 2px 0px 2px rgba(56, 49, 47, 0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[var(--space-m)] py-[var(--space-s)] bg-[var(--surface-neutral-xx-weak)]">
          <h3
            className="text-[18px] font-semibold text-[var(--color-primary-strong)]"
            style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '26px' }}
          >
            Delete Job Profile?
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border-neutral-weak)] hover:bg-[var(--surface-neutral-x-weak)] text-[var(--text-neutral-strong)] transition-colors"
            aria-label="Close"
          >
            <Icon name="xmark" size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-[var(--space-m)] py-[var(--space-xl)] bg-[var(--surface-neutral-white)]">
          {/* Trash icon */}
          <div className="flex justify-center mb-[var(--space-m)]">
            <div className="flex items-center justify-center w-12 h-12 rounded-[var(--radius-xx-small)] bg-[var(--color-danger-weak)]">
              <Icon name="trash-can" size={24} className="text-[var(--color-danger)]" />
            </div>
          </div>

          {/* Question */}
          <p className="text-[15px] font-semibold text-[var(--text-neutral-x-strong)] text-center mb-[var(--space-m)]" style={{ lineHeight: '22px' }}>
            Are you sure you want to delete all information for this Job Profile?
          </p>

          {/* Confirmation card */}
          <div className="rounded-[var(--radius-xx-small)] bg-[var(--surface-neutral-x-weak)] p-[var(--space-m)]">
            <p className="text-[15px] font-semibold text-[var(--text-neutral-x-strong)] mb-[var(--space-xs)]" style={{ lineHeight: '22px' }}>
              {jobProfileName}
            </p>
            <p className="text-[14px] text-[var(--color-danger)] mb-[var(--space-xs)]" style={{ lineHeight: '20px' }}>
              This <strong>CANNOT</strong> be undone. Type &apos;Delete&apos; to continue.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Delete"
              className="w-full h-10 px-4 py-2 bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-weak)] rounded-[var(--radius-xx-small)] text-[15px] text-[var(--text-neutral-strong)] placeholder:text-[var(--text-neutral-weak)] outline-none"
              style={{ boxShadow: '1px 1px 0px 1px rgba(56,49,47,0.04)' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[var(--space-m)] px-[var(--space-m)] py-[var(--space-s)] bg-[var(--surface-neutral-xx-weak)]">
          <button
            onClick={onClose}
            className="text-[15px] font-semibold text-[var(--color-link)] hover:underline"
          >
            No, Keep this Job Profile
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`px-6 py-2 text-[15px] font-semibold rounded-full transition-colors ${
              canConfirm
                ? 'bg-[var(--color-primary-strong)] text-white hover:opacity-90'
                : 'bg-[var(--surface-neutral-x-weak)] text-[var(--text-neutral-weak)] cursor-not-allowed'
            }`}
            style={canConfirm ? { boxShadow: '1px 1px 0px 1px rgba(56,49,47,0.04)' } : undefined}
          >
            Yes, Delete this Job Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteJobProfileModal;
