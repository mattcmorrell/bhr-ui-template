import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { TextInput } from '../TextInput';
import { FormDropdown } from '../FormDropdown';
import {
  competencyLevelOptions,
  type JobProfileCompetencyLevel,
} from '../../data/settingsData';

export interface CompetencyFormValues {
  name: string;
  description: string;
  level: JobProfileCompetencyLevel;
}

interface CompetencyEditModalProps {
  open: boolean;
  title: string;
  initial: CompetencyFormValues | null;
  onClose: () => void;
  onSave: (values: CompetencyFormValues) => void;
}

const emptyForm: CompetencyFormValues = {
  name: '',
  description: '',
  level: 'Basic',
};

export function CompetencyEditModal({
  open,
  title,
  initial,
  onClose,
  onSave,
}: CompetencyEditModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<JobProfileCompetencyLevel>('Basic');

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setDescription(initial.description);
      setLevel(initial.level);
    } else {
      setName(emptyForm.name);
      setDescription(emptyForm.description);
      setLevel(emptyForm.level);
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed, description: description.trim(), level });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ backgroundColor: 'rgba(103, 98, 96, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-small)] w-full max-w-[520px] max-h-[min(90vh,720px)] overflow-hidden flex flex-col"
        style={{ boxShadow: '2px 2px 0px 2px rgba(56, 49, 47, 0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-[var(--space-m)] py-[var(--space-s)] bg-[var(--surface-neutral-xx-weak)] shrink-0">
          <h3
            className="text-[18px] font-semibold text-[var(--color-primary-strong)] m-0"
            style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '26px' }}
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border-neutral-weak)] hover:bg-[var(--surface-neutral-x-weak)] text-[var(--text-neutral-strong)] transition-colors"
            aria-label="Close"
          >
            <Icon name="xmark" size={14} />
          </button>
        </div>

        <div className="px-[var(--space-m)] py-[var(--space-xl)] bg-[var(--surface-neutral-white)] overflow-y-auto flex-1 min-h-0 space-y-4">
          <TextInput label="Competency name" value={name} onChange={setName} placeholder="" />
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium leading-[20px] text-[var(--text-neutral-x-strong)]">
              Description
            </label>
            <div
              className="flex items-start px-4 py-[9px] bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-medium)] rounded-[var(--radius-xx-small)]"
              style={{ boxShadow: '1px 1px 0px 1px rgba(56,49,47,0.04)' }}
            >
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what success looks like for this competency…"
                rows={5}
                className="flex-1 w-full min-h-[120px] bg-transparent text-[15px] leading-[22px] text-[var(--text-neutral-strong)] placeholder:text-[var(--text-neutral-weak)] outline-none resize-y"
              />
            </div>
          </div>
          <FormDropdown
            label="Proficiency"
            options={competencyLevelOptions}
            value={level}
            onChange={(v) => setLevel(v as JobProfileCompetencyLevel)}
            placeholder="-Select-"
          />
        </div>

        <div className="flex items-center justify-end gap-[var(--space-m)] px-[var(--space-m)] py-[var(--space-s)] bg-[var(--surface-neutral-xx-weak)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-semibold text-[var(--color-link)] hover:underline"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className={`px-6 py-2 text-[15px] font-semibold rounded-full transition-colors ${
              name.trim()
                ? 'bg-[var(--color-primary-strong)] text-white hover:opacity-90'
                : 'bg-[var(--surface-neutral-x-weak)] text-[var(--text-neutral-weak)] cursor-not-allowed'
            }`}
            style={name.trim() ? { boxShadow: '1px 1px 0px 1px rgba(56,49,47,0.04)' } : undefined}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompetencyEditModal;
