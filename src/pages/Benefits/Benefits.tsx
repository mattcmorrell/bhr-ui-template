import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dropdown, Icon } from '../../components';
import { benefitPlanVersions } from '../../data/benefitsData';
import { benefitPlanYears } from '../../data/settingsData';
import { getBenefitPlanYearsWithCustom } from '../PlanYearDetail/planYearWizardState';

type ElectionTab = 'incomplete' | 'needs-approval' | 'complete';

type ElectionStatus = 'missing-rates' | 'review-coverage' | 'ready' | 'pending';

interface ElectionRow {
  id: number;
  name: string;
  title: string;
  planYear: string;
  window: string;
  updatedAt: string;
  status: ElectionStatus;
  tab: ElectionTab;
}

const electionRows: ElectionRow[] = [
  {
    id: 1,
    name: 'Jim Halpert',
    title: 'Sales Representative',
    planYear: '2026 - Core',
    window: 'Open Enrollment',
    updatedAt: 'Today 11:17 AM',
    status: 'missing-rates',
    tab: 'incomplete',
  },
  {
    id: 2,
    name: 'Dwight Schrute',
    title: 'Sales Manager',
    planYear: '2026 - Core',
    window: 'Open Enrollment',
    updatedAt: 'Today 11:17 AM',
    status: 'ready',
    tab: 'incomplete',
  },
  {
    id: 3,
    name: 'Oscar Martinez',
    title: 'Accountant',
    planYear: '2026 - Core',
    window: 'Open Enrollment',
    updatedAt: 'Today 11:17 AM',
    status: 'pending',
    tab: 'incomplete',
  },
  {
    id: 4,
    name: 'Meredith Palmer',
    title: 'Supplier Relations Rep',
    planYear: '2026 - Core',
    window: 'Open Enrollment',
    updatedAt: 'Today 11:17 AM',
    status: 'review-coverage',
    tab: 'incomplete',
  },
  {
    id: 5,
    name: 'Kelly Kapoor',
    title: 'Customer Service Rep',
    planYear: '2026 - Core',
    window: 'Open Enrollment',
    updatedAt: 'Today 11:17 AM',
    status: 'ready',
    tab: 'incomplete',
  },
  {
    id: 6,
    name: 'Darryl Philbin',
    title: 'Warehouse Manager',
    planYear: '2026 - Core',
    window: 'Open Enrollment',
    updatedAt: 'Today 11:17 AM',
    status: 'missing-rates',
    tab: 'incomplete',
  },
  {
    id: 7,
    name: 'Pam Beesly',
    title: 'Office Administrator',
    planYear: '2026 - Rollover',
    window: 'New Hire Enrollment',
    updatedAt: 'Yesterday 4:33 PM',
    status: 'review-coverage',
    tab: 'needs-approval',
  },
  {
    id: 8,
    name: 'Angela Martin',
    title: 'Accounting Lead',
    planYear: '2026 - Core',
    window: 'Open Enrollment',
    updatedAt: 'Yesterday 2:10 PM',
    status: 'pending',
    tab: 'needs-approval',
  },
  {
    id: 9,
    name: 'Stanley Hudson',
    title: 'Sales Representative',
    planYear: '2026 - Core',
    window: 'Open Enrollment',
    updatedAt: 'Feb 24, 2026',
    status: 'ready',
    tab: 'complete',
  },
];

const planYearOptions = [
  { value: 'all', label: 'All Plan Years (2)' },
  { value: 'core', label: '2026 - Core' },
  { value: 'rollover', label: '2026 - Rollover' },
];

const windowOptions = [
  { value: 'all', label: 'All Enrollment Windows' },
  { value: 'open', label: 'Open Enrollment' },
  { value: 'new-hire', label: 'New Hire Enrollment' },
];

const tabCounts: Record<ElectionTab, number> = {
  incomplete: 6,
  'needs-approval': 6,
  complete: 188,
};

function StatusPill({ status }: { status: ElectionStatus }) {
  const config = {
    'missing-rates': {
      text: 'Missing Rates',
      icon: 'pen-to-square' as const,
      className: 'bg-[#fff1e5] text-[#a14300]',
    },
    'review-coverage': {
      text: 'Review Coverage',
      icon: 'link' as const,
      className: 'bg-[#e6f5fe] text-[#00618b]',
    },
    ready: {
      text: 'Ready to Approve',
      icon: 'check-circle' as const,
      className: 'bg-[#e8fde8] text-[#016d00]',
    },
    pending: {
      text: 'EOI Pending',
      icon: 'clock' as const,
      className: 'bg-[#f0efed] text-[#676260]',
    },
  };

  const entry = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--radius-xx-small)] px-2 py-1 text-[13px] font-semibold leading-[19px] ${entry.className}`}
    >
      <Icon name={entry.icon} size={12} />
      {entry.text}
    </span>
  );
}

function EmployeeBadge({ name, title }: Pick<ElectionRow, 'name' | 'title'>) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-10 w-10 rounded-[var(--radius-xx-small)] bg-[#777270] text-white flex items-center justify-center shrink-0">
        <Icon name="circle-user" size={20} />
      </div>
      <div className="min-w-0">
        <a
          href="#"
          onClick={(event) => event.preventDefault()}
          className="block text-[15px] leading-[22px] font-semibold text-[var(--color-link)] hover:underline truncate"
        >
          {name}
        </a>
        <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)] truncate">{title}</p>
      </div>
    </div>
  );
}

export function Benefits() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ElectionTab>('incomplete');
  const [searchQuery, setSearchQuery] = useState('');
  const [planYearFilter, setPlanYearFilter] = useState('all');
  const [windowFilter, setWindowFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isPlanYearsScrolling, setIsPlanYearsScrolling] = useState(false);
  const planYearsScrollRef = useRef<HTMLDivElement | null>(null);
  const planYearsScrollTimeoutRef = useRef<number | null>(null);

  const progressPercent = 80;
  const eligibleEmployees = 55;

  const planYearCards = useMemo(() => {
    const allPlanYears = getBenefitPlanYearsWithCustom(benefitPlanYears);
    const sortedPlanYears = [...allPlanYears].sort((a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10));

    return sortedPlanYears.slice(0, 2).map((planYear) => {
      const carriersForYear = new Set(
        benefitPlanVersions
          .filter((plan) => plan.planYear === planYear.id)
          .map((plan) => plan.carrier),
      );

      const carrierCount = carriersForYear.size;
      const pending = planYear.pending ?? 0;
      const approved = planYear.approved ?? 0;
      const incomplete = planYear.incomplete ?? 0;

      return {
        id: planYear.id,
        title: planYear.name,
        status: planYear.status,
        duration: planYear.duration,
        plans: planYear.plans,
        carriers: carrierCount,
        electionsSummary: `${pending} Pending, ${approved} Approved, ${incomplete} Incomplete`,
      };
    });
  }, []);

  const filteredRows = useMemo(() => {
    return electionRows.filter((row) => {
      if (row.tab !== activeTab) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = row.name.toLowerCase().includes(query) || row.title.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (planYearFilter === 'core' && row.planYear !== '2026 - Core') return false;
      if (planYearFilter === 'rollover' && row.planYear !== '2026 - Rollover') return false;

      if (windowFilter === 'open' && row.window !== 'Open Enrollment') return false;
      if (windowFilter === 'new-hire' && row.window !== 'New Hire Enrollment') return false;

      return true;
    });
  }, [activeTab, planYearFilter, searchQuery, windowFilter]);

  const allSelected = filteredRows.length > 0 && filteredRows.every((row) => selectedRows.has(row.id));

  const toggleSelectAll = () => {
    const next = new Set(selectedRows);
    if (allSelected) {
      filteredRows.forEach((row) => next.delete(row.id));
    } else {
      filteredRows.forEach((row) => next.add(row.id));
    }
    setSelectedRows(next);
  };

  const toggleRow = (id: number) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const setPlanYearsScrollingActive = () => {
    setIsPlanYearsScrolling(true);
    if (planYearsScrollTimeoutRef.current) {
      window.clearTimeout(planYearsScrollTimeoutRef.current);
    }
    planYearsScrollTimeoutRef.current = window.setTimeout(() => {
      setIsPlanYearsScrolling(false);
    }, 700);
  };

  const scrollPlanYears = (direction: 'left' | 'right') => {
    const container = planYearsScrollRef.current;
    if (!container) return;
    const delta = direction === 'left' ? -380 : 380;
    container.scrollBy({ left: delta, behavior: 'smooth' });
    setPlanYearsScrollingActive();
  };

  useEffect(() => {
    return () => {
      if (planYearsScrollTimeoutRef.current) {
        window.clearTimeout(planYearsScrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-full bg-[var(--surface-neutral-xx-weak)] px-8 pt-8 pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1
          style={{
            fontFamily: 'Fields, system-ui, sans-serif',
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: '58px',
            color: 'var(--color-primary-strong)',
          }}
        >
          Benefits Administration
        </h1>
        <Button icon="clipboard" variant="standard">
          Manage Benefits
        </Button>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_315px] gap-[34px] items-start">
        <div className="min-w-0 space-y-6">
          <section className="rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] px-6 pt-5 pb-6 shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)]">
            <div className="flex items-start justify-between pb-6 border-b border-[var(--border-neutral-x-weak)]">
              <div>
                <h2
                  className="text-[24px] leading-[30px] font-semibold text-[var(--color-primary-strong)]"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif' }}
                >
                  Plan Years
                </h2>
                <p className="text-[15px] leading-[22px] text-[var(--text-neutral-strong)]">
                  The rules around who can enroll in what, and when
                </p>
              </div>
              <button
                aria-label="Add plan year"
                className="h-8 px-3 rounded-[var(--radius-full)] border border-[var(--color-primary-strong)] bg-[var(--surface-neutral-white)] text-[var(--color-primary-strong)] shadow-[var(--shadow-100)] inline-flex items-center justify-center gap-2 hover:bg-[var(--surface-neutral-x-weak)] transition-colors"
              >
                <Icon name="circle-plus" size={16} />
              </button>
            </div>

            <div className="mt-4 mb-3 flex items-center justify-end gap-2">
              <button
                aria-label="Scroll plan years left"
                onClick={() => scrollPlanYears('left')}
                className="h-8 px-3 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[var(--icon-neutral-x-strong)] shadow-[var(--shadow-100)] inline-flex items-center justify-center gap-2 hover:bg-[var(--surface-neutral-xx-weak)] transition-colors"
              >
                <Icon name="chevron-left" size={14} />
              </button>
              <button
                aria-label="Scroll plan years right"
                onClick={() => scrollPlanYears('right')}
                className="h-8 px-3 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[var(--icon-neutral-x-strong)] shadow-[var(--shadow-100)] inline-flex items-center justify-center gap-2 hover:bg-[var(--surface-neutral-xx-weak)] transition-colors"
              >
                <Icon name="chevron-right" size={14} />
              </button>
            </div>

            <div
              ref={planYearsScrollRef}
              onScroll={setPlanYearsScrollingActive}
              className={`benefits-plan-years-scroll overflow-x-auto pb-1 ${isPlanYearsScrolling ? 'is-scrolling' : ''}`}
            >
              <div className="flex items-stretch gap-4 min-w-max">
                {planYearCards.map((planYear) => (
                  <article key={planYear.id} className="w-[580px] shrink-0 rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] p-6 bg-[var(--surface-neutral-white)]">
                    <div className="flex items-center gap-4 justify-between mb-6">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[18px] leading-[24px] font-bold text-[var(--color-primary-strong)]">
                            {planYear.title}
                          </h3>
                          <span
                            className={`rounded-[4px] px-2 py-1 text-[13px] leading-[19px] font-medium ${
                              planYear.status === 'Active'
                                ? 'bg-[#e8fde8] text-[#016d00]'
                                : planYear.status === 'Closed'
                                ? 'bg-[#f0efed] text-[#676260]'
                                : 'bg-[#e6f5fe] text-[#00618b]'
                            }`}
                          >
                            {planYear.status}
                          </span>
                        </div>
                        <p className="text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">{planYear.duration}</p>
                      </div>
                      <Button
                        variant="standard"
                        size="small"
                        onClick={() => navigate(`/settings/plan-years/${planYear.id}`)}
                      >
                        Manage
                      </Button>
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 rounded-[var(--radius-x-small)] bg-[var(--surface-neutral-x-weak)] flex items-center justify-center text-[var(--color-primary-strong)] shrink-0">
                          <Icon name="file-lines" size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] leading-[22px] font-semibold text-[var(--text-neutral-x-strong)]">{planYear.plans} Plans</p>
                          <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">
                            {planYear.carriers > 0 ? `Offered by ${planYear.carriers} Carriers` : 'Carrier data unavailable'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 rounded-[var(--radius-x-small)] bg-[var(--surface-neutral-x-weak)] flex items-center justify-center text-[var(--color-primary-strong)] shrink-0">
                          <Icon name="user-check" size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] leading-[22px] font-semibold text-[var(--text-neutral-x-strong)]">Employee Elections</p>
                          <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">{planYear.electionsSummary}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[var(--radius-small)] bg-[var(--surface-neutral-white)] px-8 pt-5 pb-8 shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)]">
            <h2 className="text-[24px] leading-[30px] font-semibold text-[var(--color-primary-strong)] mb-6" style={{ fontFamily: 'Fields, system-ui, sans-serif' }}>
              Elections
            </h2>

            <div className="flex items-end justify-between mb-1">
              <span className="text-[16px] leading-[24px] font-semibold text-[var(--text-neutral-x-strong)]">{progressPercent}% Elections Approved</span>
              <span className="text-[14px] leading-[20px] font-medium text-[var(--text-neutral-x-strong)]">{eligibleEmployees} Eligible Employees</span>
            </div>

            <div className="h-3 rounded-[var(--radius-full)] bg-[var(--border-neutral-x-weak)] overflow-hidden mb-6">
              <div
                className="h-full bg-[#87c276]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex w-full items-center gap-4 mb-4">
              <div className="flex flex-1 min-w-0 items-center gap-3 h-10 rounded-[var(--radius-xx-small)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] px-3 shadow-[var(--shadow-100)]">
                <Icon name="magnifying-glass" size={16} className="text-[var(--text-neutral-strong)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by Name"
                  className="w-full bg-transparent text-[15px] leading-[22px] text-[var(--text-neutral-strong)] placeholder:text-[var(--text-neutral-strong)] outline-none"
                />
              </div>
              <Dropdown
                options={planYearOptions}
                value={planYearFilter}
                onChange={setPlanYearFilter}
                className="w-[224px]"
                variant="filter"
              />
              <Dropdown
                options={windowOptions}
                value={windowFilter}
                onChange={setWindowFilter}
                className="w-[280px]"
                variant="filter"
              />
            </div>

            <div className="border-b border-[var(--border-neutral-x-weak)] mb-6">
              <div className="flex items-center gap-7">
                <button
                  onClick={() => setActiveTab('incomplete')}
                  className={`pb-3 text-[15px] leading-[22px] font-semibold relative ${
                    activeTab === 'incomplete' ? 'text-[var(--color-primary-strong)]' : 'text-[var(--text-neutral-x-strong)]'
                  }`}
                >
                  Incomplete ({tabCounts.incomplete})
                  {activeTab === 'incomplete' && (
                    <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[var(--color-primary-strong)]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('needs-approval')}
                  className={`pb-3 text-[15px] leading-[22px] font-semibold relative ${
                    activeTab === 'needs-approval' ? 'text-[var(--color-primary-strong)]' : 'text-[var(--text-neutral-x-strong)]'
                  }`}
                >
                  Needs Approval ({tabCounts['needs-approval']})
                  {activeTab === 'needs-approval' && (
                    <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[var(--color-primary-strong)]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('complete')}
                  className={`pb-3 text-[15px] leading-[22px] font-semibold relative ${
                    activeTab === 'complete' ? 'text-[var(--color-primary-strong)]' : 'text-[var(--text-neutral-x-strong)]'
                  }`}
                >
                  Complete ({tabCounts.complete})
                  {activeTab === 'complete' && (
                    <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[var(--color-primary-strong)]" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <div className="h-10 rounded-[var(--radius-xx-small)] bg-[var(--surface-neutral-x-weak)] px-4 flex items-center text-[15px] font-semibold text-[var(--text-neutral-x-strong)] mb-3">
                <div className="w-[48px] flex justify-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-[var(--border-neutral-medium)]"
                  />
                </div>
                <div className="w-[238px]">Name</div>
                <div className="w-[146px]">Plan Year</div>
                <div className="w-[182px]">Window</div>
                <div className="flex-1 text-right pr-4">Status</div>
              </div>

              <div className="space-y-3">
                {filteredRows.map((row) => (
                  <div
                    key={row.id}
                    className={`rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] px-5 py-4 transition-colors ${
                      selectedRows.has(row.id) ? 'bg-[var(--surface-selected-weak)]' : 'bg-[var(--surface-neutral-white)]'
                    }`}
                    style={{ boxShadow: '1px 1px 0px 2px rgba(56, 49, 47, 0.03)' }}
                  >
                    <div className="flex items-center">
                      <div className="w-[32px] pr-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={() => toggleRow(row.id)}
                          className="h-4 w-4 rounded border-[var(--border-neutral-medium)]"
                        />
                      </div>
                      <div className="w-[234px] min-w-0">
                        <EmployeeBadge name={row.name} title={row.title} />
                      </div>
                      <div className="w-[146px] text-[14px] leading-[20px] text-[var(--text-neutral-strong)]">{row.planYear}</div>
                      <div className="w-[182px] text-[14px] leading-[20px] text-[var(--text-neutral-strong)]">{row.window}</div>
                      <div className="flex-1 text-right">
                        <div className="inline-flex items-center gap-[10px]">
                          <StatusPill status={row.status} />
                          {row.id === 1 && <StatusPill status="review-coverage" />}
                        </div>
                        <p className="mt-1 text-[13px] leading-[19px] text-[var(--text-neutral-weak)]">
                          Last updated: {row.updatedAt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] px-6 pt-5 pb-6 shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] sticky top-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-neutral-x-weak)]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-[var(--radius-x-small)] bg-[var(--surface-neutral-x-weak)] text-[var(--color-primary-strong)] flex items-center justify-center">
                <Icon name="bell" size={16} />
              </div>
              <h3 className="text-[34px] leading-[42px] font-bold text-[var(--color-primary-strong)]" style={{ fontFamily: 'Fields, system-ui, sans-serif' }}>
                Tasks
              </h3>
            </div>
            <button className="h-8 px-3 rounded-[var(--radius-full)] border border-[var(--color-primary-strong)] bg-[var(--surface-neutral-white)] text-[var(--color-primary-strong)] shadow-[var(--shadow-100)] inline-flex items-center justify-center gap-2 hover:bg-[var(--surface-neutral-x-weak)] transition-colors">
              <Icon name="rotate-left" size={14} />
            </button>
          </div>

          <div className="py-4 border-b border-[var(--border-neutral-x-weak)]">
            <h4 className="text-[16px] leading-[24px] font-semibold text-[var(--text-neutral-x-strong)] mb-1">Plan Year is Ending!</h4>
            <p className="text-[14px] leading-[20px] text-[var(--text-neutral-strong)] mb-3">
              It&apos;s almost time to prep for next year... how would you like to get started?
            </p>
            <div className="space-y-2">
              <Button size="small" variant="outlined" icon="sparkles">Generate New Plan Year</Button>
              <Button size="small" variant="standard">Start from Scratch</Button>
            </div>
          </div>

          <div className="pt-4">
            <h4 className="text-[16px] leading-[24px] font-semibold text-[var(--text-neutral-x-strong)] mb-1">
              2 Plans aren&apos;t connected to a plan year
            </h4>
            <p className="text-[14px] leading-[20px] text-[var(--text-neutral-strong)] mb-3">
              Add them so you can offer them to your employees
            </p>
            <Button size="small" variant="standard">Review Plans</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
