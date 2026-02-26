import { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: 'default' | 'filter';
}

export function Dropdown({ label, options, value, onChange, className = '', variant = 'default' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={dropdownRef}>
      {label && (
        <label className="mr-3 text-[15px] font-medium text-[var(--text-neutral-strong)] whitespace-nowrap">
          {label}
        </label>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center h-10
          bg-[var(--surface-neutral-white)]
          border border-[var(--border-neutral-medium)]
          text-[15px] text-[var(--text-neutral-strong)]
          hover:bg-[var(--surface-neutral-xx-weak)]
          transition-colors duration-200
          ${variant === 'filter'
            ? 'rounded-[var(--radius-small)] min-w-[180px]'
            : 'rounded-[var(--radius-full)] w-full px-4 py-2 gap-2 justify-between'
          }
        `}
        style={{ boxShadow: 'var(--shadow-100)' }}
      >
        <span className={variant === 'filter' ? 'flex-1 px-4 py-2 text-left' : ''}>
          {selectedOption?.label}
        </span>
        {variant === 'filter' && (
          <div className="h-6 w-px bg-[var(--border-neutral-medium)] shrink-0" />
        )}
        <span className={variant === 'filter' ? 'px-3 py-2 flex items-center' : ''}>
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            className={`transition-transform duration-200 text-[var(--icon-neutral-x-strong)] ${isOpen ? 'rotate-180' : ''}`}
          >
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div
          className="
            absolute z-50 top-full left-0 mt-2
            w-full min-w-max
            bg-[var(--surface-neutral-white)]
            border border-[var(--border-neutral-medium)]
            rounded-[var(--radius-small)]
            shadow-lg
            overflow-hidden
          "
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-4 py-3 text-left text-[15px]
                hover:bg-[var(--surface-neutral-xx-weak)]
                transition-colors duration-150
                ${
                  option.value === value
                    ? 'bg-[var(--surface-neutral-x-weak)] text-[var(--text-neutral-xx-strong)]'
                    : 'text-[var(--text-neutral-strong)]'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
