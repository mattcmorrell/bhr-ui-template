import { useEffect, useMemo } from 'react';
import { Icon } from '../Icon';

export interface JobProfilePeopleModalProps {
  jobFamilyName: string;
  jobProfileName: string;
  peopleCount: number;
  onClose: () => void;
}

const DISPLAY_ROW_CAP = 50;

const DUMMY_POOL: { preferred: string; last: string; hireDate: string }[] = [
  { preferred: 'Cheryl', last: 'Barnet', hireDate: '02/25/2022' },
  { preferred: 'Yasmine', last: 'Dean', hireDate: '06/27/2024' },
  { preferred: 'Aaron', last: 'Eckerly', hireDate: '06/27/2024' },
  { preferred: 'Morgan', last: 'Ellis', hireDate: '11/08/2021' },
  { preferred: 'Jordan', last: 'Nguyen', hireDate: '03/14/2023' },
  { preferred: 'Riley', last: 'Patel', hireDate: '09/02/2020' },
  { preferred: 'Casey', last: 'Ortiz', hireDate: '01/19/2025' },
  { preferred: 'Taylor', last: 'Brooks', hireDate: '07/30/2022' },
];

const thClass =
  'bg-[var(--surface-neutral-x-weak)] px-[var(--space-m)] py-[var(--space-s)] text-left text-[15px] font-semibold text-[var(--text-neutral-strong)]';
const tdClass =
  'px-[var(--space-m)] py-[var(--space-m)] text-[15px] border-t border-[var(--border-neutral-x-weak)]';

function buildRows(
  count: number,
  jobTitle: string,
): { preferred: string; last: string; jobTitle: string; hireDate: string }[] {
  const n = Math.min(Math.max(0, count), DISPLAY_ROW_CAP);
  const out: { preferred: string; last: string; jobTitle: string; hireDate: string }[] = [];
  for (let i = 0; i < n; i++) {
    const d = DUMMY_POOL[i % DUMMY_POOL.length];
    out.push({
      preferred: d.preferred,
      last: d.last,
      jobTitle,
      hireDate: d.hireDate,
    });
  }
  return out;
}

export function JobProfilePeopleModal({
  jobFamilyName,
  jobProfileName,
  peopleCount,
  onClose,
}: JobProfilePeopleModalProps) {
  const rows = useMemo(
    () => buildRows(peopleCount, jobProfileName),
    [peopleCount, jobProfileName],
  );

  const subtitle = `${jobFamilyName} (${peopleCount})`;

  useEffect(() => {
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbarW > 0) {
      body.style.paddingRight = `${scrollbarW}px`;
    }
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ backgroundColor: 'rgba(103, 98, 96, 0.5)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-small)] w-full max-w-[640px] max-h-[min(90vh,720px)] flex flex-col overflow-hidden"
        style={{ boxShadow: '2px 2px 0px 2px rgba(56, 49, 47, 0.08)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-profile-people-modal-heading"
      >
        <div className="flex shrink-0 items-center justify-between px-[var(--space-m)] py-[var(--space-s)] bg-[var(--surface-neutral-white)] border-b border-[var(--border-neutral-x-weak)]">
          <h2
            id="job-profile-people-modal-heading"
            className="text-[18px] font-semibold text-[var(--color-primary-strong)] pr-2"
            style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '26px' }}
          >
            Job Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full border border-[var(--border-neutral-weak)] hover:bg-[var(--surface-neutral-x-weak)] text-[var(--text-neutral-strong)] transition-colors"
            aria-label="Close"
          >
            <Icon name="xmark" size={14} />
          </button>
        </div>

        <div className="shrink-0 flex items-center gap-[var(--space-m)] px-[var(--space-m)] py-[var(--space-m)] bg-[var(--surface-neutral-white)] border-b border-[var(--border-neutral-x-weak)]">
          <div
            className="flex shrink-0 items-center justify-center w-11 h-11 rounded-[var(--radius-xx-small)] bg-[var(--surface-neutral-x-weak)]"
            aria-hidden
          >
            <Icon name="user-group" size={22} className="text-[var(--color-primary-strong)]" />
          </div>
          <p
            className="min-w-0 text-[18px] font-semibold text-[var(--text-neutral-x-strong)]"
            style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '26px' }}
          >
            {subtitle}
          </p>
        </div>

        {/* Table body scrolls vertically within the modal; height follows viewport so the dialog stays on-screen */}
        <div className="min-h-0 flex-1 px-[var(--space-m)] pt-[var(--space-m)] pb-0">
          <div
            className="max-h-[min(calc(90vh-13rem),560px)] overflow-y-auto overflow-x-auto rounded-t-[var(--radius-xx-small)] border border-b-0 border-[var(--border-neutral-x-weak)] [scrollbar-gutter:stable]"
          >
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-[1]">
                <tr>
                  <th className={`${thClass} rounded-tl-[var(--radius-xx-small)]`}>Preferred Name</th>
                  <th className={thClass}>Last Name</th>
                  <th className={thClass}>Job Title</th>
                  <th className={`${thClass} rounded-tr-[var(--radius-xx-small)]`}>Hire Date</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--surface-neutral-white)]">
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className={tdClass}>
                      <span className="text-[var(--color-link)] hover:underline cursor-default">
                        {row.preferred}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <span className="text-[var(--color-link)] hover:underline cursor-default">
                        {row.last}
                      </span>
                    </td>
                    <td className={`${tdClass} text-[var(--text-neutral-x-strong)]`}>{row.jobTitle}</td>
                    <td className={`${tdClass} text-[var(--text-neutral-x-strong)]`}>{row.hireDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="shrink-0 flex justify-end gap-[var(--space-m)] px-[var(--space-m)] py-[var(--space-s)] bg-[var(--surface-neutral-x-weak)] border border-t-0 border-[var(--border-neutral-x-weak)] rounded-b-[var(--radius-small)] -mt-px">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-[15px] font-semibold rounded-full bg-[var(--color-primary-strong)] text-white hover:opacity-90 transition-opacity"
            style={{ boxShadow: '1px 1px 0px 1px rgba(56,49,47,0.04)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobProfilePeopleModal;
