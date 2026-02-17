import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components';
import {
  settingsNavItems,
  accountSubTabs,
  benefitsSubTabs,
  accountInfo,
  subscription,
  addOns,
  jobPostings,
  fileStorage,
  upgrades,
  dataCenter,
  accessRoles,
  approvalWorkflows,
  directoryFields,
  timeOffPolicies,
  payrollSettings,
  benefitPlanGroups,
  benefitPlanYears,
} from '../../data/settingsData';

export function Settings() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('account');
  const [activeSubTab, setActiveSubTab] = useState('account-info');
  const [benefitsSubTab, setBenefitsSubTab] = useState('plans');
  const selectedNavLabel = settingsNavItems.find((n) => n.id === activeNav)?.label ?? 'Settings';

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <h1
        className="text-[44px] font-bold text-[var(--color-primary-strong)] px-8 pt-8 pb-6"
        style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '52px' }}
      >
        Settings
      </h1>

      <div className="flex min-h-full">
        {/* Left Sidebar Navigation */}
        <div className="w-[280px] pl-8 pr-6 pb-8 overflow-y-auto flex-shrink-0">
          <nav className="space-y-1">
          {settingsNavItems.map((item) => {
            const isActive = item.id === activeNav;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`
                  group flex items-center gap-3 px-4 py-3 w-full rounded-[var(--radius-small)]
                  text-[15px] font-medium transition-colors text-left
                  ${
                    isActive
                      ? 'bg-[var(--color-primary-strong)] text-white'
                      : 'text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-white)] hover:text-[var(--color-primary-strong)]'
                  }
                `}
              >
                <Icon
                  name={item.icon}
                  size={18}
                  className={isActive ? 'text-white' : 'text-[var(--icon-neutral-strong)] group-hover:text-[var(--color-primary-strong)]'}
                />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

        {/* Main Content Area */}
        <main className="flex-1 px-10 pt-0 pb-10 overflow-y-auto">
          {activeNav === 'benefits' ? (
          /* Benefits Settings */
          <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-medium)] p-8">
            <div className="flex items-start justify-between mb-5">
              <h3
                className="text-[26px] font-semibold text-[var(--color-primary-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '34px' }}
              >
                Benefits
              </h3>
              <button className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]">
                <Icon name="gear" size={16} />
                <Icon name="caret-down" size={11} />
              </button>
            </div>

            <nav className="flex items-center gap-2 border-b border-[var(--border-neutral-x-weak)] mb-6 overflow-x-auto">
              {benefitsSubTabs.map((tab) => {
                const isActive = tab.id === benefitsSubTab;
                const iconName =
                  tab.id === 'carriers'
                    ? 'building'
                    : tab.id === 'carrier-pdfs'
                      ? 'file'
                      : tab.id === 'elections'
                        ? 'check-circle'
                        : tab.id === 'plans'
                          ? 'clipboard'
                          : 'calendar';

                return (
                  <button
                    key={tab.id}
                    onClick={() => setBenefitsSubTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-3 border-b-[3px] text-[16px] whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-[var(--color-primary-strong)] text-[var(--color-primary-strong)] font-semibold'
                        : 'border-transparent text-[var(--text-neutral-strong)] hover:text-[var(--color-primary-strong)]'
                    }`}
                  >
                    <Icon name={iconName} size={15} className={isActive ? 'text-[var(--color-primary-strong)]' : 'text-[var(--icon-neutral-strong)]'} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {benefitsSubTab === 'plan-years' ? (
              <div>
                <h4
                  className="text-[22px] font-semibold text-[var(--color-primary-strong)] mb-4"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
                >
                  Plan Years
                </h4>

                <div className="flex items-center justify-between mb-6 gap-4">
                  <button className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]">
                    <Icon name="circle-plus" size={14} />
                    New Plan Year
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-medium text-[var(--text-neutral-strong)]">Showing</span>
                    <button className="inline-flex items-center justify-between min-w-[250px] h-10 px-4 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[15px] text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]">
                      All Plan Years
                      <Icon name="caret-down" size={11} className="text-[var(--icon-neutral-strong)]" />
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <div className="grid grid-cols-[1.1fr_0.5fr_0.6fr_1.7fr_2.5fr_130px] gap-4 px-6 py-4 bg-[var(--surface-neutral-xx-weak)] rounded-[var(--radius-small)] text-[15px] font-semibold text-[var(--text-neutral-strong)] mb-1">
                    <span>Plan Year Name</span>
                    <span>Plans</span>
                    <span>Status</span>
                    <span>Duration</span>
                    <span>Employee Elections</span>
                    <span />
                  </div>

                  {benefitPlanYears.map((planYear) => (
                    <div
                      key={planYear.id}
                      className="grid grid-cols-[1.1fr_0.5fr_0.6fr_1.7fr_2.5fr_130px] gap-4 px-6 py-6 border-b border-[var(--border-neutral-xx-weak)]"
                    >
                      <div className="text-[15px] text-[var(--text-neutral-strong)]">
                        {planYear.nameIsLink ? (
                          <button
                            className="text-left text-[#0b4fd1] hover:underline"
                            onClick={() => navigate(`/settings/plan-years/${planYear.id}`)}
                          >
                            {planYear.name}
                          </button>
                        ) : (
                          planYear.name
                        )}
                      </div>
                      <span className="text-[15px] text-[var(--text-neutral-strong)]">{planYear.plans}</span>
                      <span className="text-[15px] text-[var(--text-neutral-strong)]">{planYear.status}</span>
                      <span className="text-[15px] text-[var(--text-neutral-strong)]">{planYear.duration}</span>
                      <div>
                        {planYear.pending !== undefined && planYear.approved !== undefined && planYear.incomplete !== undefined ? (
                          <>
                            <p className="text-[15px] text-[var(--text-neutral-strong)]">
                              <span className="font-semibold text-[var(--color-primary-strong)]">{planYear.pending} Pending</span>, {planYear.approved} Approved, {planYear.incomplete} Incomplete
                            </p>
                            {planYear.missingInfoCount !== undefined && (
                              <p className="text-[15px] text-[var(--text-neutral-medium)] mt-1">
                                {planYear.missingInfoCount} people are missing required information
                              </p>
                            )}
                            <button className="text-left text-[15px] text-[#0b4fd1] hover:underline mt-2">
                              Update Missing Info
                            </button>
                          </>
                        ) : (
                          <p className="text-[15px] text-[var(--text-neutral-medium)]">-</p>
                        )}
                      </div>
                      <div className="flex items-start justify-end">
                        <button className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]">
                          <Icon name="gear" size={16} />
                          <Icon name="caret-down" size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : benefitsSubTab === 'plans' ? (
              <div>
                <h4
                  className="text-[22px] font-semibold text-[var(--color-primary-strong)] mb-4"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
                >
                  Plans
                </h4>

                <div className="flex items-center justify-between mb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]">
                      <Icon name="arrows-rotate" size={14} />
                      Renew Plan
                    </button>
                    <button className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]">
                      <Icon name="circle-plus" size={14} />
                      Add Plan
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-medium text-[var(--text-neutral-strong)]">Showing</span>
                    <button className="inline-flex items-center justify-between min-w-[250px] h-10 px-4 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[15px] text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]">
                      Active Plans
                      <Icon name="caret-down" size={11} className="text-[var(--icon-neutral-strong)]" />
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <div className="grid grid-cols-[1.3fr_0.7fr_0.8fr_1.1fr_120px] gap-4 px-4 py-3 bg-[var(--surface-neutral-xx-weak)] rounded-[var(--radius-small)] text-[15px] font-semibold text-[var(--text-neutral-strong)] mb-2">
                    <span>Plan Name</span>
                    <span>End Date</span>
                    <span>Eligibility</span>
                    <span>Status</span>
                    <span />
                  </div>

                  <div className="space-y-3">
                    {benefitPlanGroups.map((group) => (
                      <div key={group.id}>
                        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-neutral-xx-weak)] rounded-[var(--radius-small)] mb-1">
                          <Icon name={group.icon} size={14} className="text-[var(--icon-neutral-strong)]" />
                          <span className="text-[16px] font-semibold text-[var(--text-neutral-strong)]">{group.label}</span>
                        </div>
                        {group.plans.map((plan) => (
                          <div
                            key={plan.id}
                            className="group grid grid-cols-[1.3fr_0.7fr_0.8fr_1.1fr_120px] gap-4 px-4 py-5 border-b border-[var(--border-neutral-xx-weak)] transition-colors hover:bg-[var(--surface-neutral-xx-weak)]"
                          >
                            <button className="text-left text-[15px] text-[#0b4fd1] hover:underline">{plan.name}</button>
                            <span className="text-[15px] text-[var(--text-neutral-strong)]">{plan.endDate}</span>
                            <span className="text-[15px] text-[var(--text-neutral-strong)]">{plan.eligibility}</span>
                            <span className="text-[15px] text-[var(--text-neutral-strong)]">{plan.status}</span>
                            <div className="flex items-center justify-end gap-[6px]">
                              <button className="w-9 h-9 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] flex items-center justify-center text-[var(--icon-neutral-strong)] bg-[var(--surface-neutral-white)] opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                                <Icon name="arrows-rotate" size={13} />
                              </button>
                              <button className="w-9 h-9 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] flex items-center justify-center text-[var(--icon-neutral-strong)] bg-[var(--surface-neutral-white)] opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                                <Icon name="pen-to-square" size={13} />
                              </button>
                              <button className="w-9 h-9 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] flex items-center justify-center text-[var(--icon-neutral-strong)] bg-[var(--surface-neutral-white)] opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                                <Icon name="trash-can" size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[15px] text-[var(--text-neutral-medium)]">
                {benefitsSubTabs.find((t) => t.id === benefitsSubTab)?.label} content coming soon.
              </p>
            )}
          </div>
          ) : activeNav === 'account' ? (
          /* Account Card */
          <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-medium)] p-8">
            {/* Account Heading */}
            <h2
              className="text-[22px] font-semibold text-[var(--color-primary-strong)] mb-6 pb-6 border-b border-[var(--border-neutral-x-weak)]"
              style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
            >
              Account
            </h2>

            {/* Content Layout - Vertical Tabs + Content */}
            <div className="flex gap-8">
              {/* Vertical Sub-tabs */}
              <div className="w-[160px] shrink-0">
                <nav className="flex flex-col">
                  {accountSubTabs.map((tab) => {
                    const isActive = tab.id === activeSubTab;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`
                          text-left px-3 py-2 text-[15px] transition-colors rounded-[var(--radius-small)]
                          ${
                            isActive
                              ? 'text-[var(--color-primary-strong)] font-semibold bg-[var(--surface-neutral-xx-weak)]'
                              : 'text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)]'
                          }
                        `}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Account Info Content */}
              <div className="flex-1">
                <h3
                  className="text-[22px] font-semibold text-[var(--color-primary-strong)] mb-4"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
                >
                  Account Info
                </h3>

            {/* Account Info Header */}
            <div className="mb-8">
              <h4
                className="text-[28px] font-bold text-[var(--text-neutral-x-strong)] mb-3"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '36px' }}
              >
                {accountInfo.companyName}
              </h4>
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[15px] text-[var(--text-neutral-medium)]">
                    <Icon name="building" size={16} className="text-[var(--icon-neutral-medium)]" />
                    {accountInfo.accountNumber}
                  </div>
                  <div className="flex items-center gap-2 text-[15px] text-[var(--text-neutral-medium)]">
                    <Icon name="link" size={16} className="text-[var(--icon-neutral-medium)]" />
                    {accountInfo.url}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={accountInfo.owner.avatar}
                    alt={accountInfo.owner.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[16px] font-semibold text-[var(--text-neutral-x-strong)]">
                      {accountInfo.owner.name}
                    </p>
                    <p className="text-[14px] text-[var(--text-neutral-medium)]">
                      {accountInfo.owner.role}
                    </p>
                  </div>
                  <Icon name="caret-down" size={12} className="text-[var(--icon-neutral-medium)]" />
                </div>
              </div>
            </div>

            {/* My Subscription Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4
                  className="text-[18px] font-semibold text-[var(--color-primary-strong)]"
                  style={{ lineHeight: '26px' }}
                >
                  My Subscription
                </h4>
                <button className="px-6 py-2 text-[15px] font-semibold text-[var(--color-primary-strong)] border-2 border-[var(--color-primary-strong)] rounded-[var(--radius-full)] hover:bg-[var(--color-primary-weak)] transition-colors">
                  Manage Subscription
                </button>
              </div>

              {/* Pro Package Card */}
              <div className="bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-x-weak)] rounded-[var(--radius-medium)] px-6 py-5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--surface-neutral-xx-weak)] rounded-[var(--radius-small)] flex items-center justify-center">
                      <Icon name="shield" size={24} className="text-[var(--color-primary-strong)]" />
                    </div>
                    <div>
                      <h5 className="text-[18px] font-bold text-[var(--text-neutral-x-strong)]">
                        {subscription.plan}
                      </h5>
                      <p className="text-[15px] text-[var(--text-neutral-medium)]">
                        {subscription.packageType}
                      </p>
                    </div>
                  </div>
                  <p className="text-[16px] text-[var(--text-neutral-medium)]">
                    {subscription.employees} Employees
                  </p>
                </div>
              </div>

              {/* Add-Ons Card */}
              <div className="bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-x-weak)] rounded-[var(--radius-medium)] px-6 py-5 mb-6">
                <h5 className="text-[16px] font-medium text-[var(--color-primary-strong)] mb-4">
                  Add-Ons
                </h5>
                <div className="space-y-4">
                  {addOns.map((addOn) => (
                    <div
                      key={addOn.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--surface-neutral-xx-weak)] rounded-[var(--radius-small)] flex items-center justify-center">
                          <Icon name={addOn.icon} size={24} className="text-[var(--color-primary-strong)]" />
                        </div>
                        <span className="text-[17px] font-medium text-[var(--text-neutral-x-strong)]">
                          {addOn.title}
                        </span>
                      </div>
                      {addOn.employees && (
                        <span className="text-[16px] text-[var(--text-neutral-medium)]">
                          {addOn.employees}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Postings & File Storage - Combined Card */}
              <div className="bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-x-weak)] rounded-[var(--radius-medium)] px-6 py-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[var(--surface-neutral-xx-weak)] rounded-[var(--radius-small)] flex items-center justify-center">
                        <Icon name="id-badge" size={24} className="text-[var(--color-primary-strong)]" />
                      </div>
                      <span className="text-[17px] font-medium text-[var(--text-neutral-x-strong)]">
                        Job Postings
                      </span>
                    </div>
                    <p className="text-[16px] text-[var(--text-neutral-medium)]">
                      {jobPostings.current} of {jobPostings.max}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[var(--surface-neutral-xx-weak)] rounded-[var(--radius-small)] flex items-center justify-center">
                        <Icon name="file" size={24} className="text-[var(--color-primary-strong)]" />
                      </div>
                      <span className="text-[17px] font-medium text-[var(--text-neutral-x-strong)]">
                        File Storage
                      </span>
                    </div>
                    <p className="text-[16px] text-[var(--text-neutral-medium)]">
                      {fileStorage.used} {fileStorage.unit} of {fileStorage.total} {fileStorage.unit}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Upgrades Section */}
            <div className="mb-8">
              <h4
                className="text-[18px] font-semibold text-[var(--color-primary-strong)] mb-4"
                style={{ lineHeight: '26px' }}
              >
                Available Upgrades
              </h4>
              <div className="space-y-4">
                {upgrades.map((upgrade) => (
                  <div
                    key={upgrade.id}
                    className="flex items-center justify-between bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-x-weak)] rounded-[var(--radius-medium)] px-6 py-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[var(--surface-neutral-xx-weak)] rounded-[var(--radius-small)] flex items-center justify-center">
                        <Icon name={upgrade.icon} size={28} className="text-[var(--color-primary-strong)]" />
                      </div>
                      <div>
                        <h5 className="text-[18px] font-bold text-[var(--text-neutral-x-strong)]">
                          {upgrade.title}
                        </h5>
                        <p className="text-[15px] text-[var(--text-neutral-medium)]">
                          {upgrade.subtitle}
                        </p>
                      </div>
                    </div>
                    <button className="text-[16px] font-medium text-[var(--color-primary-strong)] hover:underline">
                      Learn More
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Supercharge Your Workflow Section */}
            <div className="mb-8">
              <div className="bg-[var(--surface-neutral-xx-weak)] rounded-[var(--radius-small)] p-6">
                <h4
                  className="text-[18px] font-bold text-[var(--text-neutral-x-strong)] mb-2"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '26px' }}
                >
                  Supercharge Your Workflow
                </h4>
                <p className="text-[14px] text-[var(--text-neutral-medium)] mb-4">
                  Explore our growing library of integrations to help you work smarter and faster.
                </p>
                <button className="px-4 py-2 text-[14px] font-semibold text-[var(--text-neutral-x-strong)] bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-medium)] rounded-[var(--radius-small)] hover:bg-[var(--surface-neutral-x-weak)] transition-colors">
                  Explore Apps
                </button>
              </div>
            </div>

            {/* Data Section */}
            <div>
              <h4
                className="text-[18px] font-semibold text-[var(--color-primary-strong)] mb-3"
                style={{ lineHeight: '26px' }}
              >
                Data
              </h4>
              <p className="text-[14px] text-[var(--text-neutral-medium)] mb-1">
                Data Center Location
              </p>
              <div className="flex items-center gap-2">
                <Icon name="location-dot" size={14} className="text-[var(--color-primary-strong)]" />
                <span className="text-[15px] font-medium text-[var(--text-neutral-x-strong)]">
                  {dataCenter.location}
                </span>
              </div>
            </div>
          </div>
        </div>
          </div>
          ) : activeNav === 'access-levels' ? (
          <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-medium)] p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2
                  className="text-[22px] font-semibold text-[var(--color-primary-strong)]"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
                >
                  Access Levels
                </h2>
                <p className="text-[15px] text-[var(--text-neutral-medium)] mt-1">
                  Assign role-based access to keep data secure while teams can still work quickly.
                </p>
              </div>
              <button className="inline-flex items-center gap-2 h-10 px-5 bg-[var(--color-primary-strong)] text-white rounded-[var(--radius-full)] text-[15px] font-semibold hover:bg-[var(--color-primary-medium)] transition-colors">
                <Icon name="circle-plus" size={16} />
                New Role
              </button>
            </div>
            <div className="space-y-4">
              {accessRoles.map((role) => (
                <div
                  key={role.id}
                  className="border border-[var(--border-neutral-x-weak)] rounded-[var(--radius-medium)] px-6 py-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[18px] font-semibold text-[var(--text-neutral-x-strong)]">{role.name}</h3>
                    <span className="text-[14px] text-[var(--text-neutral-medium)]">{role.members} members</span>
                  </div>
                  <p className="text-[15px] text-[var(--text-neutral-medium)] mb-3">{role.description}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-full)] bg-[var(--surface-neutral-xx-weak)] text-[13px] text-[var(--text-neutral-strong)]">
                    <Icon name="lock" size={12} className="text-[var(--icon-neutral-strong)]" />
                    {role.scope}
                  </div>
                </div>
              ))}
            </div>
          </div>
          ) : activeNav === 'approvals' ? (
          <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-medium)] p-8">
            <h2
              className="text-[22px] font-semibold text-[var(--color-primary-strong)] mb-2"
              style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
            >
              Approvals
            </h2>
            <p className="text-[15px] text-[var(--text-neutral-medium)] mb-8">
              Configure approval routing for requests and operational changes.
            </p>
            <div className="space-y-4">
              {approvalWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="border border-[var(--border-neutral-x-weak)] rounded-[var(--radius-medium)] p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-[18px] font-semibold text-[var(--text-neutral-x-strong)]">{workflow.name}</h3>
                    <span className="text-[13px] text-[var(--text-neutral-medium)]">SLA: {workflow.sla}</span>
                  </div>
                  <p className="text-[15px] text-[var(--text-neutral-medium)] mb-3">{workflow.trigger}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {workflow.approvers.map((approver) => (
                      <span
                        key={approver}
                        className="px-3 py-1 text-[13px] rounded-[var(--radius-full)] bg-[var(--surface-neutral-xx-weak)] text-[var(--text-neutral-strong)]"
                      >
                        {approver}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          ) : activeNav === 'company-directory' ? (
          <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-medium)] p-8">
            <h2
              className="text-[22px] font-semibold text-[var(--color-primary-strong)] mb-2"
              style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
            >
              Company Directory
            </h2>
            <p className="text-[15px] text-[var(--text-neutral-medium)] mb-6">
              Control which profile fields are visible in your internal directory.
            </p>
            <div className="overflow-hidden border border-[var(--border-neutral-x-weak)] rounded-[var(--radius-medium)]">
              <div className="grid grid-cols-[1.5fr_1fr_1fr] px-5 py-3 bg-[var(--surface-neutral-xx-weak)] text-[13px] font-semibold text-[var(--text-neutral-medium)]">
                <span>Field</span>
                <span>Visibility</span>
                <span>Source</span>
              </div>
              {directoryFields.map((field) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr] px-5 py-4 border-t border-[var(--border-neutral-xx-weak)] text-[15px]"
                >
                  <span className="font-medium text-[var(--text-neutral-x-strong)]">{field.label}</span>
                  <span className="text-[var(--text-neutral-medium)]">{field.visibility}</span>
                  <span className="text-[var(--text-neutral-medium)]">{field.source}</span>
                </div>
              ))}
            </div>
          </div>
          ) : activeNav === 'time-off' ? (
          <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-medium)] p-8">
            <h2
              className="text-[22px] font-semibold text-[var(--color-primary-strong)] mb-2"
              style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
            >
              Time Off
            </h2>
            <p className="text-[15px] text-[var(--text-neutral-medium)] mb-8">
              Review policy accruals, carryover limits, and approval requirements.
            </p>
            <div className="space-y-4">
              {timeOffPolicies.map((policy) => (
                <div key={policy.id} className="border border-[var(--border-neutral-x-weak)] rounded-[var(--radius-medium)] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-[18px] font-semibold text-[var(--text-neutral-x-strong)]">{policy.name}</h3>
                    <span className="text-[13px] text-[var(--text-neutral-medium)]">
                      {policy.requiresApproval ? 'Approval required' : 'Auto approved'}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-[14px] text-[var(--text-neutral-medium)]">
                    <p>Accrual: {policy.accrual}</p>
                    <p>Carryover: {policy.carryover}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          ) : activeNav === 'payroll' ? (
          <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-medium)] p-8">
            <h2
              className="text-[22px] font-semibold text-[var(--color-primary-strong)] mb-2"
              style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
            >
              Payroll
            </h2>
            <p className="text-[15px] text-[var(--text-neutral-medium)] mb-8">
              Confirm foundational payroll settings before each processing cycle.
            </p>
            <div className="space-y-3">
              {payrollSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between border border-[var(--border-neutral-x-weak)] rounded-[var(--radius-small)] px-5 py-4"
                >
                  <div>
                    <p className="text-[16px] font-medium text-[var(--text-neutral-x-strong)]">{setting.label}</p>
                    <p className="text-[14px] text-[var(--text-neutral-medium)]">{setting.value}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-[var(--radius-full)] text-[12px] font-semibold ${
                      setting.status === 'configured'
                        ? 'bg-[var(--color-primary-weak)] text-[var(--color-primary-strong)]'
                        : 'bg-[#FDF2E8] text-[#B45309]'
                    }`}
                  >
                    {setting.status === 'configured' ? 'Configured' : 'Needs Review'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          ) : (
          <div className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-medium)] p-8">
            <p className="text-[15px] text-[var(--text-neutral-medium)]">
              {selectedNavLabel} settings coming soon.
            </p>
          </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Settings;
