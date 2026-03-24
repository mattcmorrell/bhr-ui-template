import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { JobTitleCatalogRow } from '../../data/parseJobLibCsv';
import { filterJobTitleCatalog } from '../../data/parseJobLibCsv';
import { careerTrackOptions } from '../../data/settingsData';

const MAX_SUGGESTIONS = 12;

export interface JobTitleCatalogComboboxProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectRow: (row: JobTitleCatalogRow) => void;
  rows: JobTitleCatalogRow[];
  className?: string;
  placeholder?: string;
}

export function JobTitleCatalogCombobox({
  label,
  value,
  onChange,
  onSelectRow,
  rows,
  className = '',
  placeholder,
}: JobTitleCatalogComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const suggestions = useMemo(() => {
    const list = filterJobTitleCatalog(value, rows);
    return list.slice(0, MAX_SUGGESTIONS);
  }, [value, rows]);

  const showList = open && value.trim().length > 0 && suggestions.length > 0;

  useEffect(() => {
    setHighlightedIndex(0);
  }, [value, suggestions.length]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  const pickRow = useCallback(
    (row: JobTitleCatalogRow) => {
      onSelectRow(row);
      setOpen(false);
    },
    [onSelectRow]
  );

  const suggestionSubtitle = (row: JobTitleCatalogRow) => {
    const family = row.jobFamilyName.trim() || '—';
    const code = row.careerTrack.trim();
    const trackLabel = code
      ? (careerTrackOptions.find((o) => o.value === code)?.label ?? code)
      : '—';
    const lvl = row.level.trim();
    const levelPart = lvl ? `Level ${lvl}` : '—';
    return `${family} · ${trackLabel} · ${levelPart}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) {
      if (e.key === 'ArrowDown' && value.trim()) {
        setOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const row = suggestions[highlightedIndex];
      if (row) pickRow(row);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor="job-title-catalog-input"
          className="text-[14px] font-medium leading-[20px] text-[var(--text-neutral-x-strong)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className="flex items-center gap-4 h-10 pl-4 pr-3 py-2 bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-medium)] rounded-[var(--radius-xx-small)]"
          style={{ boxShadow: '1px 1px 0px 1px rgba(56,49,47,0.04)' }}
        >
          <input
            ref={inputRef}
            id="job-title-catalog-input"
            type="text"
            role="combobox"
            aria-expanded={showList}
            aria-controls="job-title-catalog-listbox"
            aria-autocomplete="list"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (value.trim()) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            className="flex-1 bg-transparent text-[15px] leading-[22px] text-[var(--text-neutral-strong)] placeholder:text-[var(--text-neutral-weak)] outline-none min-w-0"
          />
        </div>

        {showList && (
          <ul
            id="job-title-catalog-listbox"
            role="listbox"
            className="absolute z-50 left-0 right-0 top-full mt-1 max-h-[min(320px,40vh)] overflow-y-auto rounded-[var(--radius-xx-small)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] py-1 shadow-lg list-none m-0 p-0"
            style={{ boxShadow: 'var(--shadow-100)' }}
          >
            {suggestions.map((row, index) => (
              <li key={row.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={index === highlightedIndex}
                  className={`w-full text-left px-3 py-2 border-0 cursor-pointer flex flex-col gap-0.5 ${
                    index === highlightedIndex
                      ? 'bg-[var(--surface-neutral-x-weak)]'
                      : 'bg-transparent hover:bg-[var(--surface-neutral-xx-weak)]'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickRow(row)}
                >
                  <span className="text-[15px] leading-[22px] text-[var(--text-neutral-strong)]">
                    {row.jobTitle}
                  </span>
                  <span className="text-[13px] leading-[18px] text-[var(--text-neutral-medium)]">
                    {suggestionSubtitle(row)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
