import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Icon,
  Dropdown,
  Avatar,
} from '../../components';
import {
  benefitsEmployees,
  attentionItems,
  benefitPlanVersions,
  carriers,
} from '../../data/benefitsData';

type EnrollmentTab = 'incomplete' | 'needs-attention' | 'completed';
type PlanYearTab = 'employee-elections' | 'plans' | 'carriers';

export function Benefits() {
  const [enrollmentTab, setEnrollmentTab] = useState<EnrollmentTab>('completed');
  const [planYearTab, setPlanYearTab] = useState<PlanYearTab>('employee-elections');
  const [planSearchQuery, setPlanSearchQuery] = useState('');
  const [carrierSearchQuery, setCarrierSearchQuery] = useState('');
  const [carrierStatusFilter, setCarrierStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<number>>(new Set());

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'enrolled', label: 'Enrolled' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'incomplete', label: 'Incomplete' },
  ];

  const toggleEmployeeSelection = (id: number) => {
    const next = new Set(selectedEmployees);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEmployees(next);
  };

  // Employees filtered by selected tab (election category)
  const employeesInTab = useMemo(() => {
    return benefitsEmployees.filter((emp) => emp.electionCategory === enrollmentTab);
  }, [enrollmentTab]);

  const tabCounts = useMemo(() => ({
    incomplete: benefitsEmployees.filter((e) => e.electionCategory === 'incomplete').length,
    'needs-attention': benefitsEmployees.filter((e) => e.electionCategory === 'needs-attention').length,
    completed: benefitsEmployees.filter((e) => e.electionCategory === 'completed').length,
  }), []);

  const completedCount = tabCounts.completed;
  const totalEligible = benefitsEmployees.length;
  const completionPercent = totalEligible > 0 ? Math.round((completedCount / totalEligible) * 100) : 0;

  const toggleSelectAll = () => {
    const idsInTab = new Set(employeesInTab.map((e) => e.id));
    const allSelectedInTab = idsInTab.size > 0 && [...idsInTab].every((id) => selectedEmployees.has(id));
    if (allSelectedInTab) {
      const next = new Set(selectedEmployees);
      idsInTab.forEach((id) => next.delete(id));
      setSelectedEmployees(next);
    } else {
      const next = new Set(selectedEmployees);
      idsInTab.forEach((id) => next.add(id));
      setSelectedEmployees(next);
    }
  };

  const allSelected =
    employeesInTab.length > 0 &&
    employeesInTab.every((emp) => selectedEmployees.has(emp.id));

  const filteredEmployees = useMemo(() => {
    return employeesInTab.filter((emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employeesInTab, searchQuery]);

  const getStatusColor = (variant: string) => {
    if (variant === 'warning') return 'text-[#c2410c]'; // orange
    if (variant === 'success') return 'text-[var(--text-neutral-strong)]';
    return 'text-[var(--color-link)]';
  };

  return (
    <div className="flex flex-col min-h-full bg-[var(--surface-neutral-xx-weak)]">
      {/* Header */}
      <div className="flex items-center justify-between pr-10 pt-10 pb-6 pl-8">
        <h1
          style={{
            fontFamily: 'Fields, system-ui, sans-serif',
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: '56px',
            color: 'var(--color-primary-strong)',
          }}
        >
          Benefits
        </h1>
        <div className="flex items-center gap-3">
          <Button icon="circle-plus-lined" variant="standard">
            New Plan Year
          </Button>
          <button className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)] transition-colors">
            <Icon name="gear" size={16} />
            <Icon name="caret-down" size={10} />
          </button>
        </div>
      </div>

      {/* Enrollment Windows & Notifications */}
      <div className="px-8 pb-6">
        <div className="flex gap-6">
          {/* Enrollment Windows Card */}
          <div className="flex-1 min-w-0 bg-[var(--surface-neutral-white)] rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="flex items-center gap-2 text-[22px] font-semibold text-[var(--color-primary-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
              >
                <Icon name="calendar" size={20} className="text-[var(--color-primary-strong)]" />
                Enrollment Windows
              </h2>
              <button className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[var(--icon-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)] transition-colors">
                <Icon name="gear" size={16} />
              </button>
            </div>
            <div className="border-t border-[var(--border-neutral-x-weak)] divide-y divide-[var(--border-neutral-x-weak)]">
              <div className="flex items-center justify-between py-4">
                <span className="text-[15px] text-[var(--text-neutral-strong)]">Open Enrollment</span>
                <span className="text-[15px] text-[var(--text-neutral-medium)]">Oct 1, 2026</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="text-[15px] text-[var(--text-neutral-strong)]">New Hire</span>
                <span className="text-[15px] text-[var(--text-neutral-medium)]">Immediately After Hire</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="text-[15px] text-[var(--text-neutral-strong)]">QLE's</span>
                <span className="text-[15px] text-[var(--text-neutral-medium)]">90 Days From Event</span>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="flex-1 min-w-0 bg-[var(--surface-neutral-white)] rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="flex items-center gap-2 text-[22px] font-semibold text-[var(--color-primary-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
              >
                <Icon name="bell" size={20} className="text-[var(--color-primary-strong)]" />
                Notifications
              </h2>
              <button className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[var(--icon-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)] transition-colors">
                <Icon name="clock" size={16} />
              </button>
            </div>
            <div className="border-t border-[var(--border-neutral-x-weak)] divide-y divide-[var(--border-neutral-x-weak)]">
              {attentionItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <Icon
                      name={item.icon}
                      size={20}
                      className="text-[var(--icon-neutral-x-strong)] shrink-0 mt-0.5"
                    />
                    <span className="text-[15px] leading-[22px] text-[var(--text-neutral-strong)]">
                      {item.text}
                    </span>
                  </div>
                  <a
                    href="#"
                    className="text-[15px] font-medium text-[var(--color-link)] hover:underline shrink-0"
                    onClick={(e) => e.preventDefault()}
                  >
                    {item.link}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2026 Enrollments Banner */}
      <div className="mx-8 mb-6 bg-[var(--color-primary-strong)] rounded-[var(--radius-small)] pt-6 px-6 pb-0 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2
              className="text-[22px] font-semibold mb-2"
              style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
            >
              2026 Enrollments
            </h2>
            <div className="flex items-center gap-4 text-[15px] text-white/90">
              <span className="flex items-center gap-2">
                <Icon name="star" size={16} />
                Active Plan Year
              </span>
              <span className="flex items-center gap-2">
                <Icon name="calendar" size={16} />
                01/01/26 - 12/31/2026
              </span>
            </div>
          </div>
          <Link to="/benefits/edit-plan-year" className="inline-flex no-underline">
            <Button
              variant="standard"
              showCaret
              className="!bg-white !border-transparent !text-[var(--color-primary-strong)] hover:!bg-white/90"
            >
              Edit Plan Year
            </Button>
          </Link>
        </div>
        {/* Plan Year Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setPlanYearTab('employee-elections')}
            className={`flex-initial flex items-center gap-4 p-4 rounded-t-lg transition-colors whitespace-nowrap ${
              planYearTab === 'employee-elections'
                ? 'bg-[var(--surface-neutral-x-weak)] text-[var(--color-primary-strong)]'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
          >
            <Icon
              name="user-group"
              size={24}
              className={planYearTab === 'employee-elections' ? 'text-[var(--color-primary-strong)]' : 'text-white'}
            />
            <div className="text-left">
              <div className="text-[15px] font-medium">Employee Elections</div>
              <div className={`text-[15px] ${planYearTab === 'employee-elections' ? 'text-[var(--color-primary-strong)]/80' : 'text-white/90'}`}>
                99 Eligible Employees
              </div>
            </div>
          </button>
          <button
            onClick={() => setPlanYearTab('plans')}
            className={`flex-initial flex items-center gap-4 p-4 rounded-t-lg transition-colors whitespace-nowrap ${
              planYearTab === 'plans'
                ? 'bg-[var(--surface-neutral-x-weak)] text-[var(--color-primary-strong)]'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
          >
            <Icon
              name="clipboard"
              size={24}
              className={planYearTab === 'plans' ? 'text-[var(--color-primary-strong)]' : 'text-white'}
            />
            <div className="text-left">
              <div className="text-[15px] font-medium">Plans</div>
              <div className={`text-[15px] ${planYearTab === 'plans' ? 'text-[var(--color-primary-strong)]/80' : 'text-white/90'}`}>
                17 Active
              </div>
            </div>
          </button>
          <button
            onClick={() => setPlanYearTab('carriers')}
            className={`flex-initial flex items-center gap-4 p-4 rounded-t-lg transition-colors whitespace-nowrap ${
              planYearTab === 'carriers'
                ? 'bg-[var(--surface-neutral-x-weak)] text-[var(--color-primary-strong)]'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
          >
            <Icon
              name="building"
              size={24}
              className={planYearTab === 'carriers' ? 'text-[var(--color-primary-strong)]' : 'text-white'}
            />
            <div className="text-left">
              <div className="text-[15px] font-medium">Carriers</div>
              <div className={`text-[15px] ${planYearTab === 'carriers' ? 'text-[var(--color-primary-strong)]/80' : 'text-white/90'}`}>
                8 Total, 7 Connected
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content - Employee Enrollments (shown when Employee Elections tab is active) */}
      {planYearTab === 'employee-elections' && (
      <>
      {/* Employee Enrollments Section */}
      <div className="px-8 pb-10">
        <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] overflow-hidden">
          <div className="px-6 py-4">
            <h2
              className="text-[22px] font-semibold text-[var(--color-primary-strong)] mb-4"
              style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
            >
              Employee Enrollments
            </h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[15px] text-[var(--text-neutral-strong)]">
                {completionPercent}% Elections Completed
              </span>
              <span className="text-[15px] text-[var(--text-neutral-medium)]">
                {totalEligible} Eligible Employees
              </span>
            </div>
            <div className="h-2 bg-[var(--surface-neutral-xx-weak)] rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-[var(--color-primary-strong)]"
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-[var(--border-neutral-x-weak)] mb-4">
              <button
                onClick={() => setEnrollmentTab('incomplete')}
                className={`pb-3 text-[15px] font-medium transition-colors relative ${
                  enrollmentTab === 'incomplete'
                    ? 'text-[var(--color-primary-strong)]'
                    : 'text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)]'
                }`}
              >
                Incomplete ({tabCounts.incomplete})
                {enrollmentTab === 'incomplete' && (
                  <span
                    className="absolute left-0 right-0 bottom-0 h-[2px] bg-[var(--color-primary-strong)]"
                  />
                )}
              </button>
              <button
                onClick={() => setEnrollmentTab('needs-attention')}
                className={`pb-3 text-[15px] font-medium transition-colors relative ${
                  enrollmentTab === 'needs-attention'
                    ? 'text-[var(--color-primary-strong)]'
                    : 'text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)]'
                }`}
              >
                Needs Attention ({tabCounts['needs-attention']})
                {enrollmentTab === 'needs-attention' && (
                  <span
                    className="absolute left-0 right-0 bottom-0 h-[2px] bg-[var(--color-primary-strong)]"
                  />
                )}
              </button>
              <button
                onClick={() => setEnrollmentTab('completed')}
                className={`pb-3 text-[15px] font-medium transition-colors relative ${
                  enrollmentTab === 'completed'
                    ? 'text-[var(--color-primary-strong)]'
                    : 'text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)]'
                }`}
              >
                Completed ({tabCounts.completed})
                {enrollmentTab === 'completed' && (
                  <span
                    className="absolute left-0 right-0 bottom-0 h-[2px] bg-[var(--color-primary-strong)]"
                  />
                )}
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 h-10 px-4 py-2 bg-[var(--surface-neutral-xx-weak)] border border-[var(--border-neutral-medium)] rounded-[var(--radius-full)] flex-1 max-w-[280px]">
                <Icon name="magnifying-glass" size={16} className="text-[var(--icon-neutral-strong)]" />
                <input
                  type="text"
                  placeholder="Search by Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[14px] text-[var(--text-neutral-strong)] placeholder:text-[var(--text-neutral-weak)] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Dropdown
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
                <button className="inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] hover:bg-[var(--surface-neutral-xx-weak)] transition-colors">
                  <Icon name="sliders" size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="p-4">
          {/* Table Headers */}
          <div className="px-6 py-3 bg-[var(--surface-neutral-xx-weak)] flex items-center">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-3 mr-4"
            >
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-[var(--border-neutral-medium)] text-[var(--color-primary-strong)] focus:ring-[var(--color-primary-strong)]"
              />
            </button>
            <div className="flex-1 text-[15px] font-semibold text-[var(--text-neutral-x-strong)]">
              Name
            </div>
            <div className="w-[280px] text-right text-[15px] font-semibold text-[var(--text-neutral-x-strong)]">
              Status
            </div>
          </div>

          {/* Employee Rows */}
          <div>
            {filteredEmployees.map((employee, index) => {
              const isSelected = selectedEmployees.has(employee.id);
              return (
                <div key={employee.id}>
                  <div
                    className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                      isSelected
                        ? 'bg-[var(--surface-selected-weak)]'
                        : 'hover:bg-[var(--surface-neutral-xx-weak)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleEmployeeSelection(employee.id)}
                      className="w-4 h-4 rounded border-[var(--border-neutral-medium)] text-[var(--color-primary-strong)] focus:ring-[var(--color-primary-strong)]"
                    />
                    <Avatar src={employee.avatar} size="small" />
                    <div className="flex-1 min-w-0">
                      <a
                        href="#"
                        className="text-[15px] font-semibold text-[var(--color-link)] hover:underline block"
                        onClick={(e) => e.preventDefault()}
                      >
                        {employee.name}
                      </a>
                      <p className="text-[14px] text-[var(--text-neutral-medium)] mt-0.5">
                        {employee.title}
                      </p>
                    </div>
                    <div
                      className={`w-[280px] text-right text-[14px] ${getStatusColor(
                        employee.statusVariant
                      )}`}
                    >
                      {employee.status}
                    </div>
                  </div>
                  {index < filteredEmployees.length - 1 && (
                    <div className="mx-6 border-b border-[var(--border-neutral-x-weak)]" />
                  )}
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Plans Tab Content */}
      {planYearTab === 'plans' && (
        <div className="px-8 pb-10">
          <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] overflow-hidden">
            {/* Header */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-[22px] font-semibold text-[var(--color-primary-strong)]"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
                >
                  Active Plans
                </h2>
                <Button icon="pen-to-square" variant="standard">
                  Edit Plans
                </Button>
              </div>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2 h-10 px-4 py-2 bg-[var(--surface-neutral-xx-weak)] border border-[var(--border-neutral-medium)] rounded-[var(--radius-full)] min-w-0 w-[280px]">
                  <Icon name="magnifying-glass" size={16} className="text-[var(--icon-neutral-strong)] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by Name"
                    value={planSearchQuery}
                    onChange={(e) => setPlanSearchQuery(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-[14px] text-[var(--text-neutral-strong)] placeholder:text-[var(--text-neutral-weak)] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto px-6 pb-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--surface-neutral-xx-weak)]">
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-[var(--text-neutral-x-strong)] rounded-tl-[8px] rounded-bl-[8px]">
                      Plan Name
                    </th>
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-[var(--text-neutral-x-strong)]">
                      Carrier
                    </th>
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-[var(--text-neutral-x-strong)]">
                      Plan Year
                    </th>
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-[var(--text-neutral-x-strong)]">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-[var(--text-neutral-x-strong)]">
                      End Date
                    </th>
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-[var(--text-neutral-x-strong)]">
                      Eligibility
                    </th>
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-[var(--text-neutral-x-strong)]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {benefitPlanVersions
                    .filter((planVersion) =>
                      planSearchQuery
                        ? planVersion.name.toLowerCase().includes(planSearchQuery.toLowerCase()) ||
                          planVersion.carrier.toLowerCase().includes(planSearchQuery.toLowerCase())
                        : true
                    )
                    .map((planVersion) => (
                      <tr
                        key={planVersion.id}
                        className="border-t border-[var(--border-neutral-x-weak)] hover:bg-[var(--surface-neutral-xx-weak)] transition-colors"
                      >
                        <td className="px-6 py-4 text-[15px] text-[var(--text-neutral-strong)]">
                          {planVersion.name}
                        </td>
                        <td className="px-6 py-4 text-[15px] text-[var(--text-neutral-medium)]">
                          {planVersion.carrier}
                        </td>
                        <td className="px-6 py-4 text-[15px] text-[var(--text-neutral-medium)]">
                          {planVersion.planYear}
                        </td>
                        <td className="px-6 py-4 text-[15px] text-[var(--text-neutral-medium)]">
                          {planVersion.startDate}
                        </td>
                        <td className="px-6 py-4 text-[15px] text-[var(--text-neutral-medium)]">
                          {planVersion.endDate}
                        </td>
                        <td className="px-6 py-4 text-[15px] text-[var(--text-neutral-medium)]">
                          {planVersion.eligibility}
                        </td>
                        <td className="px-6 py-4 text-[15px] text-[var(--text-neutral-medium)]">
                          {planVersion.enrolledCount} Enrolled, {planVersion.notEnrolledCount} Not enrolled/Waived
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Carriers Tab Content */}
      {planYearTab === 'carriers' && (
        <div className="px-8 pb-10">
          <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] overflow-hidden">
            {/* Header */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-[22px] font-semibold text-[var(--color-primary-strong)]"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
                >
                  Carriers
                </h2>
                <Button icon="gear" variant="standard">
                  Edit Carriers
                </Button>
              </div>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2 h-10 px-4 py-2 bg-[var(--surface-neutral-xx-weak)] border border-[var(--border-neutral-medium)] rounded-[var(--radius-full)] min-w-0 w-[280px]">
                  <Icon name="magnifying-glass" size={16} className="text-[var(--icon-neutral-strong)] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by Name"
                    value={carrierSearchQuery}
                    onChange={(e) => setCarrierSearchQuery(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-[14px] text-[var(--text-neutral-strong)] placeholder:text-[var(--text-neutral-weak)] outline-none"
                  />
                </div>
                <Dropdown
                  label="Showing"
                  variant="filter"
                  options={[{ value: 'all', label: 'All Statuses' }]}
                  value={carrierStatusFilter}
                  onChange={setCarrierStatusFilter}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto px-6 pb-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--surface-neutral-xx-weak)]">
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-[var(--text-neutral-x-strong)]">
                      Carrier
                    </th>
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-[var(--text-neutral-x-strong)]">
                      Direct Connection Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {carriers
                    .filter((c) =>
                      carrierSearchQuery
                        ? c.name.toLowerCase().includes(carrierSearchQuery.toLowerCase())
                        : true
                    )
                    .map((carrier) => (
                      <tr
                        key={carrier.id}
                        className="border-t border-[var(--border-neutral-x-weak)] hover:bg-[var(--surface-neutral-xx-weak)] transition-colors"
                      >
                        <td className="px-6 py-4 text-[15px] text-[var(--text-neutral-strong)]">
                          {carrier.name}
                        </td>
                        <td className="px-6 py-4">
                          {carrier.statusType === 'connected' && (
                            <span className="text-[15px] text-[var(--text-neutral-strong)]">
                              Connected
                            </span>
                          )}
                          {carrier.statusType === 'pending' && (
                            <span className="text-[15px] text-[var(--text-neutral-strong)]">
                              Connection Pending
                            </span>
                          )}
                          {carrier.statusType === 'request' && (
                            <Button variant="standard" size="small">
                              Request Connection
                            </Button>
                          )}
                          {carrier.statusType === 'not-eligible' && (
                            <span className="flex items-center gap-2">
                              <span className="text-[15px] text-[var(--text-neutral-strong)]">
                                Not Eligible
                              </span>
                              <Icon
                                name="circle-question"
                                size={16}
                                className="text-[var(--icon-neutral-strong)]"
                              />
                            </span>
                          )}
                          {carrier.statusType === 'warning' && (
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] text-[#dc2626]">
                                {carrier.warningText}
                              </span>
                              <a
                                href="#"
                                className="text-[15px] text-[var(--color-link)] hover:underline"
                                onClick={(e) => e.preventDefault()}
                              >
                                View Plan
                              </a>
                              <button className="inline-flex items-center gap-1 h-10 px-3 rounded-[var(--radius-small)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)] transition-colors">
                                <Icon name="gear" size={16} />
                                <Icon name="caret-down" size={10} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
