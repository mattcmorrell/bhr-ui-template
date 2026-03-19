import { useState } from 'react';
import { Dropdown, Icon } from '../../components';
import bambooIcon from '../../assets/images/bamboo-icon.svg';
import avatarSmall from '../../assets/images/avatar-small.png';

interface OneOnOnesTabContentProps {
  employeeName: string;
}

export function OneOnOnesTabContent({ employeeName }: OneOnOnesTabContentProps) {
  const [selectedMeeting, setSelectedMeeting] = useState('march-2-2026');
  const [agendaItems, setAgendaItems] = useState([
    { id: '1', label: 'New onboarding program project update', checked: false },
    { id: '2', label: 'Team updates and needs', checked: false },
    { id: '3', label: 'Review goals', checked: false },
  ]);

  const meetingOptions = [
    { value: 'march-2-2026', label: 'Upcoming: March 2, 2026' },
    { value: 'feb-2-2026', label: 'February 2, 2026' },
    { value: 'jan-5-2026', label: 'January 5, 2026' },
  ];

  const toggleAgendaItem = (id: string) => {
    setAgendaItems((prev) => prev.map((item) => (
      item.id === id ? { ...item, checked: !item.checked } : item
    )));
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-[26px] leading-[34px] font-semibold text-[var(--color-primary-strong)]">
            1:1s - Maja/McKenzie
          </h3>
          <button type="button" className="inline-flex items-center gap-1 text-[15px] text-[var(--color-link)] hover:underline">
            <Icon name="circle-question" size={16} className="text-current" />
            Who sees 1:1s?
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Dropdown
            options={meetingOptions}
            value={selectedMeeting}
            onChange={setSelectedMeeting}
            className="w-[270px] [&>button]:h-10"
          />
          <button
            type="button"
            className="w-10 h-10 rounded-full border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] inline-flex items-center justify-center"
            style={{ boxShadow: 'var(--shadow-100)' }}
            aria-label="Meeting settings"
          >
            <Icon name="gear" size={14} className="text-[var(--icon-neutral-strong)]" />
          </button>
        </div>
      </div>

      <div className="bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-x-weak)] rounded-[var(--radius-medium)] px-7 py-6">
        <h4 className="text-[22px] leading-[30px] font-semibold text-[var(--color-primary-strong)] mb-5">March 02, 2026</h4>

        <p className="text-[20px] leading-[28px] font-semibold text-[var(--text-neutral-strong)] mb-2">Agenda Items</p>

        <div className="space-y-1 mb-4">
          {agendaItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-2 py-1 rounded-[var(--radius-xx-small)] ${
                index === 0 ? 'bg-[var(--surface-neutral-x-weak)]' : ''
              }`}
            >
              <span className="text-[13px] text-[var(--icon-neutral-medium)]">⋮⋮</span>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleAgendaItem(item.id)}
                className="h-4 w-4 rounded border-[var(--border-neutral-medium)]"
              />
              <span className="text-[15px] leading-[22px] text-[var(--text-neutral-strong)] underline">
                {item.label}
              </span>
              {index === 0 && (
                <button type="button" className="ml-auto text-[var(--icon-neutral-medium)]">
                  <Icon name="xmark" size={14} className="text-current" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="inline-flex items-center gap-2 text-[15px] leading-[22px] text-[var(--color-link)] hover:underline mb-6">
          <Icon name="circle-plus" size={14} className="text-current" />
          Add item
        </button>

        <p className="text-[20px] leading-[28px] font-semibold text-[var(--text-neutral-strong)] mb-3">Notes</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-3">
          <div className="relative">
            <div
              className="absolute -left-4 top-3 w-8 h-8 rounded-full bg-[#7cb342] border border-white flex items-center justify-center"
              style={{ boxShadow: 'var(--shadow-100)' }}
            >
              <img src={bambooIcon} alt="Bamboo" className="w-4 h-4" />
            </div>
            <textarea
              placeholder="You can add notes here."
              className="w-full h-[114px] rounded-[var(--radius-small)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] px-4 py-3 text-[16px] text-[var(--text-neutral-strong)] placeholder:text-[var(--text-neutral-medium)] resize-none"
            />
          </div>

          <div className="relative">
            <img
              src={avatarSmall}
              alt={`${employeeName}`}
              className="absolute -left-4 top-3 w-8 h-8 rounded-[var(--radius-xx-small)] object-cover"
              style={{ boxShadow: 'var(--shadow-100)' }}
            />
            <textarea
              placeholder="Maja's notes will appear here."
              className="w-full h-[114px] rounded-[var(--radius-small)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] px-4 py-3 text-[16px] text-[var(--text-neutral-strong)] placeholder:text-[var(--text-neutral-medium)] resize-none"
            />
          </div>
        </div>

        <button type="button" className="inline-flex items-center gap-2 text-[15px] leading-[22px] text-[var(--color-link)] hover:underline mb-5">
          <Icon name="eye-slash" size={14} className="text-current" />
          Add Private Note
        </button>
      </div>

      <button
        type="button"
        className="mt-4 w-full h-[48px] rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-x-weak)] px-5 text-left flex items-center justify-between"
      >
        <span className="text-[15px] leading-[22px] font-semibold text-[var(--text-neutral-strong)]">
          Notes from your last 1:1 (February 2, 2026)
        </span>
        <Icon name="chevron-left" size={12} className="text-[var(--icon-neutral-medium)]" />
      </button>
    </div>
  );
}

export default OneOnOnesTabContent;
