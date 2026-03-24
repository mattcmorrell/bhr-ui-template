import { useMemo, useState } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import type { OrganizationCountRow, OrganizationLocationRow } from '../../data/settingsData';

const titleStyle = { fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' } as const;

const thClass =
  'bg-[var(--surface-neutral-x-weak)] px-[var(--space-m)] py-[var(--space-s)] text-left text-[15px] font-semibold text-[var(--text-neutral-strong)]';
const tdClass = 'px-[var(--space-m)] py-[var(--space-m)] text-[15px] text-[var(--text-neutral-x-strong)]';

function PeopleCell({ count }: { count: number }) {
  if (count > 0) {
    return (
      <button
        type="button"
        className="text-[15px] text-[var(--color-link)] hover:underline text-left"
      >
        {count}
      </button>
    );
  }
  return <span className="text-[15px] text-[var(--text-neutral-x-strong)]">{count}</span>;
}

export type OrganizationTwoColumnAddVariant = 'inline' | 'outlineButton' | 'editEeo';

export interface OrganizationTwoColumnTabProps {
  title: string;
  nameColumnLabel: string;
  rows: OrganizationCountRow[];
  onRowsChange: (rows: OrganizationCountRow[]) => void;
  addVariant: OrganizationTwoColumnAddVariant;
  outlineButtonLabel?: string;
}

export function OrganizationTwoColumnTab({
  title,
  nameColumnLabel,
  rows,
  onRowsChange,
  addVariant,
  outlineButtonLabel = 'New',
}: OrganizationTwoColumnTabProps) {
  const [sortAsc, setSortAsc] = useState(true);
  const [newItemName, setNewItemName] = useState('');

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortAsc]);

  const appendRow = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onRowsChange([
      ...rows,
      { id: `new-${Date.now()}`, name: trimmed, people: 0 },
    ]);
    setNewItemName('');
  };

  const handleInlineAdd = () => {
    appendRow(newItemName);
  };

  const handleOutlineAdd = () => {
    onRowsChange([...rows, { id: `new-${Date.now()}`, name: '', people: 0 }]);
  };

  return (
    <>
      <div className="px-[var(--space-m)] py-[var(--space-m)]">
        <h3
          className="text-[22px] font-semibold text-[var(--color-primary-strong)]"
          style={titleStyle}
        >
          {title}
        </h3>
        {addVariant === 'inline' && (
          <div className="mt-[var(--space-m)] flex items-center gap-[var(--space-s)]">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInlineAdd();
              }}
              placeholder="New Item"
              className="min-w-[200px] flex-1 max-w-md rounded-[var(--radius-small)] border border-[var(--border-neutral-weak)] px-[var(--space-s)] py-[var(--space-xs)] text-[15px] text-[var(--text-neutral-strong)] placeholder:text-[var(--text-neutral-medium)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-medium)]"
            />
            <button
              type="button"
              onClick={handleInlineAdd}
              className="shrink-0 rounded-full bg-[var(--color-primary-strong)] px-[var(--space-m)] py-[var(--space-xs)] text-[14px] font-medium text-white hover:opacity-95 transition-opacity"
            >
              Add
            </button>
          </div>
        )}
        {addVariant === 'outlineButton' && (
          <div className="mt-[var(--space-m)]">
            <button
              type="button"
              onClick={handleOutlineAdd}
              className="flex items-center gap-[var(--space-xs)] px-[var(--space-s)] py-[var(--space-xs)] text-[14px] font-medium text-[var(--text-neutral-strong)] border border-[var(--border-neutral-weak)] rounded-full hover:bg-[var(--surface-neutral-x-weak)] transition-colors"
            >
              <Icon name="circle-plus" size={16} className="text-[var(--icon-neutral-strong)]" />
              {outlineButtonLabel}
            </button>
          </div>
        )}
        {addVariant === 'editEeo' && (
          <div className="mt-[var(--space-m)]">
            <Button type="button" variant="standard" size="medium">
              Edit EEO Categories
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={`${thClass} rounded-tl-[var(--radius-small)]`}>
                <button
                  type="button"
                  onClick={() => setSortAsc((a) => !a)}
                  className="inline-flex items-center gap-1 font-semibold text-[var(--text-neutral-strong)] hover:text-[var(--text-neutral-x-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-medium)] rounded"
                >
                  {nameColumnLabel}
                  <Icon
                    name={sortAsc ? 'chevron-up' : 'chevron-down'}
                    size={12}
                    className="text-[var(--icon-neutral-strong)]"
                    aria-hidden
                  />
                </button>
              </th>
              <th className={`${thClass} rounded-tr-[var(--radius-small)] w-[120px] text-right`}>
                People
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.id} className="bg-[var(--surface-neutral-white)] border-t border-[var(--border-neutral-x-weak)]">
                <td className={tdClass}>{row.name || '—'}</td>
                <td className={`${tdClass} text-right`}>
                  <PeopleCell count={row.people} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export interface OrganizationLocationsTabProps {
  rows: OrganizationLocationRow[];
  onRowsChange: (rows: OrganizationLocationRow[]) => void;
}

export function OrganizationLocationsTab({ rows, onRowsChange }: OrganizationLocationsTabProps) {
  const [sortAsc, setSortAsc] = useState(true);

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortAsc]);

  const handleNewLocation = () => {
    onRowsChange([
      ...rows,
      {
        id: `loc-new-${Date.now()}`,
        name: '',
        address: '',
        people: 0,
      },
    ]);
  };

  return (
    <>
      <div className="px-[var(--space-m)] py-[var(--space-m)]">
        <h3
          className="text-[22px] font-semibold text-[var(--color-primary-strong)]"
          style={titleStyle}
        >
          Location
        </h3>
        <div className="mt-[var(--space-m)]">
          <button
            type="button"
            onClick={handleNewLocation}
            className="flex items-center gap-[var(--space-xs)] px-[var(--space-s)] py-[var(--space-xs)] text-[14px] font-medium text-[var(--text-neutral-strong)] border border-[var(--border-neutral-weak)] rounded-full hover:bg-[var(--surface-neutral-x-weak)] transition-colors"
          >
            <Icon name="circle-plus" size={16} className="text-[var(--icon-neutral-strong)]" />
            New Location
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={`${thClass} rounded-tl-[var(--radius-small)]`}>
                <button
                  type="button"
                  onClick={() => setSortAsc((a) => !a)}
                  className="inline-flex items-center gap-1 font-semibold text-[var(--text-neutral-strong)] hover:text-[var(--text-neutral-x-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-medium)] rounded"
                >
                  Location
                  <Icon
                    name={sortAsc ? 'chevron-up' : 'chevron-down'}
                    size={12}
                    className="text-[var(--icon-neutral-strong)]"
                    aria-hidden
                  />
                </button>
              </th>
              <th className={thClass}>Address</th>
              <th className={`${thClass} rounded-tr-[var(--radius-small)] w-[120px] text-right`}>
                People
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.id} className="bg-[var(--surface-neutral-white)] border-t border-[var(--border-neutral-x-weak)]">
                <td className={`${tdClass} font-semibold text-[var(--text-neutral-strong)]`}>
                  {row.name || '—'}
                </td>
                <td className={tdClass}>{row.address || '—'}</td>
                <td className={`${tdClass} text-right`}>
                  <PeopleCell count={row.people} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
