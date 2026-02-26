import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../../components';
import {
  defaultIncludedPlanIdsByYear,
  planYearCarrierOptions,
  unifiedBenefitPlansByCarrier,
} from '../../data/benefitPlansCatalog';
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
import {
  addCustomPlanForPlanYear,
  deletePlanYearById,
  getBenefitPlanYearsWithCustom,
  getCustomPlansForPlanYear,
  getIncludedPlanIdsForPlanYear,
  getSelectedCarrierIdsForPlanYear,
  setIncludedPlanIdsForPlanYear,
  setSelectedCarrierIdsForPlanYear,
} from '../PlanYearDetail/planYearWizardState';

const unifiedPlans = Object.values(unifiedBenefitPlansByCarrier).flat();
const unifiedPlanById = new Map(unifiedPlans.map((plan) => [plan.id, plan]));

function planKey(name: string, type: string) {
  return `${name.trim().toLowerCase()}::${type.trim().toLowerCase()}`;
}

interface SettingsPlanDetails {
  id: string;
  name: string;
  type: string;
  endDate: string;
}

interface SettingsPlanVersionDetails {
  id: string;
  versionLabel: string;
  effectiveStart: string;
  effectiveEnd: string;
  status: 'Active' | 'Inactive';
  planName: string;
  carrier: string;
  groupNumber: string;
  planType: string;
  planTypeId: string;
  summary: string;
  description: string;
  attachmentName: string;
}

export function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { activeNav?: string; benefitsSubTab?: string } | null;
  const [activeNav, setActiveNav] = useState(locationState?.activeNav ?? 'account');
  const [activeSubTab, setActiveSubTab] = useState('account-info');
  const [benefitsSubTab, setBenefitsSubTab] = useState(locationState?.benefitsSubTab ?? 'plan-years');
  const [isCreatePlanYearModalOpen, setIsCreatePlanYearModalOpen] = useState(false);
  const [planYearCreationMode, setPlanYearCreationMode] = useState<'existing' | 'scratch'>('existing');
  const [selectedSourcePlanYearId, setSelectedSourcePlanYearId] = useState('');
  const [isRenewPlanModalOpen, setIsRenewPlanModalOpen] = useState(false);
  const allBenefitPlanYears = getBenefitPlanYearsWithCustom(benefitPlanYears);
  const activeBenefitPlanYears = allBenefitPlanYears.filter((planYear) => planYear.status === 'Active');
  const [selectedRenewOption, setSelectedRenewOption] = useState<string>('');
  const [renewingPlanName, setRenewingPlanName] = useState('');
  const [renewingPlanType, setRenewingPlanType] = useState('Medical');
  const [openPlanYearActionsId, setOpenPlanYearActionsId] = useState<string | null>(null);
  const [isSettingsPlanDetailsOpen, setIsSettingsPlanDetailsOpen] = useState(false);
  const [activeSettingsPlanDetails, setActiveSettingsPlanDetails] = useState<SettingsPlanDetails | null>(null);
  const [selectedSettingsVersionId, setSelectedSettingsVersionId] = useState('');
  const [hiddenSettingsVersionIds, setHiddenSettingsVersionIds] = useState<Set<string>>(new Set());
  const [openVersionActionsId, setOpenVersionActionsId] = useState<string | null>(null);
  const [openEligibilityPlanId, setOpenEligibilityPlanId] = useState<string | null>(null);
  const selectedNavLabel = settingsNavItems.find((n) => n.id === activeNav)?.label ?? 'Settings';
  const buildEligibilityFilters = (eligibility: string) => {
    if (eligibility.toLowerCase().includes('30+ hrs')) {
      return [
        'Employment status: Full-Time',
        'Minimum scheduled hours: 30+ per week',
        'Benefits waiting period: 30 days',
        'Available to US employees only',
      ];
    }

    if (eligibility.toLowerCase().includes('full-time')) {
      return [
        'Employment status: Full-Time',
        'Benefits waiting period: 30 days',
        'Available to US employees only',
      ];
    }

    return [eligibility];
  };
  const summarizeEligibilityFilters = (filters: string[]) => {
    const toToken = (filter: string) => {
      if (filter.startsWith('Employment status:')) return filter.replace('Employment status:', '').trim();
      if (filter.startsWith('Minimum scheduled hours:')) {
        return filter.replace('Minimum scheduled hours:', '').replace(' per week', '').trim();
      }
      if (filter.startsWith('Benefits waiting period:')) {
        return `${filter.replace('Benefits waiting period:', '').trim()} wait`;
      }
      if (filter === 'Available to US employees only') return 'US employees only';
      return filter;
    };

    const tokens = filters.map(toToken).filter(Boolean);
    if (tokens.length === 0) return 'filters';
    if (tokens.length === 1) return tokens[0];
    if (tokens.length === 2) return `${tokens[0]}, ${tokens[1]}`;
    return `${tokens[0]}, ${tokens[1]} +${tokens.length - 2}`;
  };
  const planVersionGroups = benefitPlanGroups.map((group) => ({
    id: group.id,
    label: group.label,
    icon: group.icon,
    plans: group.plans.map((plan) => {
      const unifiedPlan = unifiedPlanById.get(plan.id);
      const planYear = unifiedPlan?.effectiveDate?.split('/')[2] ?? unifiedPlan?.endDate?.split('/')[2] ?? plan.endDate.split('/')[2];

      return {
        id: plan.id,
        name: plan.name,
        type: group.label,
        carrier: unifiedPlan?.carrierName ?? 'Unknown Carrier',
        planYear,
        isActive: planYear === (activeBenefitPlanYears[0]?.id ?? ''),
        startDate: unifiedPlan?.effectiveDate ?? '--',
        endDate: plan.endDate,
        eligibilityFilters: buildEligibilityFilters(plan.eligibility),
        eligibilitySummary: summarizeEligibilityFilters(buildEligibilityFilters(plan.eligibility)),
        status: plan.status,
      };
    }),
  })).filter((group) => group.plans.length > 0);

  const isPlanIncludedInPlanYear = (targetPlanYearId: string, planName: string, planType: string) => {
    const includedPlanIds = getIncludedPlanIdsForPlanYear(
      targetPlanYearId,
      defaultIncludedPlanIdsByYear[targetPlanYearId] ?? [],
    );
    const includedPlanKeys = new Set<string>();

    includedPlanIds.forEach((includedPlanId) => {
      const unifiedPlan = unifiedPlanById.get(includedPlanId);
      if (unifiedPlan) {
        includedPlanKeys.add(planKey(unifiedPlan.name, unifiedPlan.type));
      }
    });

    const customPlans = getCustomPlansForPlanYear(targetPlanYearId);
    customPlans.forEach((plan) => {
      includedPlanKeys.add(planKey(plan.name, plan.type));
    });

    return includedPlanKeys.has(planKey(planName, planType));
  };

  const buildRenewedPlanId = (planName: string, planYearId: string) => {
    const slug = planName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `renewed-${slug || 'plan'}-${planYearId}`;
  };

  const addRenewedPlanToPlanYear = (targetPlanYearId: string) => {
    if (isPlanIncludedInPlanYear(targetPlanYearId, renewingPlanName, renewingPlanType)) {
      return null;
    }

    const selectedPlanYear = allBenefitPlanYears.find((planYear) => planYear.id === targetPlanYearId);
    const [effectiveDate = '01/01/2026', endDate = '12/31/2026'] = (selectedPlanYear?.duration ?? '').split(' - ');
    const selectedCarrierIds = getSelectedCarrierIdsForPlanYear(
      targetPlanYearId,
      planYearCarrierOptions.map((carrier) => carrier.id),
    );
    const defaultCarrierId = selectedCarrierIds[0] ?? planYearCarrierOptions[0]?.id ?? 'united-healthcare';

    const existingCustomPlans = getCustomPlansForPlanYear(targetPlanYearId);
    const existingRenewedPlan = existingCustomPlans.find(
      (plan) =>
        plan.source === 'renewed' &&
        plan.name.toLowerCase() === renewingPlanName.toLowerCase() &&
        plan.type.toLowerCase() === renewingPlanType.toLowerCase(),
    );

    const renewedPlanId = existingRenewedPlan?.id ?? buildRenewedPlanId(renewingPlanName, targetPlanYearId);

    if (!existingRenewedPlan) {
      addCustomPlanForPlanYear(targetPlanYearId, {
        id: renewedPlanId,
        carrierId: defaultCarrierId,
        name: renewingPlanName,
        type: renewingPlanType,
        effectiveDate,
        endDate,
        summary: `Renewed from previous year`,
        status: 'Active',
        source: 'renewed',
      });
    }

    const includedPlanIds = getIncludedPlanIdsForPlanYear(
      targetPlanYearId,
      defaultIncludedPlanIdsByYear[targetPlanYearId] ?? [],
    );
    if (!includedPlanIds.includes(renewedPlanId)) {
      setIncludedPlanIdsForPlanYear(targetPlanYearId, [...includedPlanIds, renewedPlanId]);
    }

    return renewedPlanId;
  };

  const handleContinueCreatePlanYear = () => {
    const numericPlanYears = allBenefitPlanYears
      .map((planYear) => Number.parseInt(planYear.id, 10))
      .filter((year) => Number.isFinite(year));
    const latestKnownPlanYear = numericPlanYears.length > 0 ? Math.max(...numericPlanYears) : 2026;

    const sourceYear = Number.parseInt(selectedSourcePlanYearId, 10);
    const targetYear =
      planYearCreationMode === 'existing' && Number.isFinite(sourceYear)
        ? sourceYear + 1
        : latestKnownPlanYear + 1;
    const targetPlanYearId = String(targetYear);

    if (planYearCreationMode === 'existing' && selectedSourcePlanYearId) {
      const sourceIncludedPlans = getIncludedPlanIdsForPlanYear(
        selectedSourcePlanYearId,
        defaultIncludedPlanIdsByYear[selectedSourcePlanYearId] ?? [],
      );
      const sourceSelectedCarriers = getSelectedCarrierIdsForPlanYear(
        selectedSourcePlanYearId,
        planYearCarrierOptions.map((carrier) => carrier.id),
      );

      setIncludedPlanIdsForPlanYear(targetPlanYearId, sourceIncludedPlans);
      setSelectedCarrierIdsForPlanYear(targetPlanYearId, sourceSelectedCarriers);
    } else {
      setIncludedPlanIdsForPlanYear(targetPlanYearId, []);
      setSelectedCarrierIdsForPlanYear(targetPlanYearId, []);
    }

    setIsCreatePlanYearModalOpen(false);
    navigate(`/settings/plan-years/${targetPlanYearId}`);
  };

  const handleContinueRenewPlan = () => {
    if (!selectedRenewOption) {
      return;
    }

    if (selectedRenewOption === 'new') {
      if (planYearCreationMode === 'existing' && !selectedSourcePlanYearId) {
        return;
      }
      setIsRenewPlanModalOpen(false);
      handleContinueCreatePlanYear();
      return;
    }

    const renewedPlanId = addRenewedPlanToPlanYear(selectedRenewOption);
    if (!renewedPlanId) return;
    setIsRenewPlanModalOpen(false);
    navigate(`/settings/plan-years/${selectedRenewOption}/plans`, {
      state: {
        renewedPlanId,
        renewedPlanName: renewingPlanName,
      },
    });
  };

  const handleDeletePlanYear = (planYearId: string) => {
    deletePlanYearById(planYearId);
    setOpenPlanYearActionsId(null);
  };

  const openSettingsPlanDetails = (plan: SettingsPlanDetails) => {
    setActiveSettingsPlanDetails(plan);
    const defaultVersionId = allBenefitPlanYears.find((planYear) => planYear.status === 'Active')?.id ?? allBenefitPlanYears[0]?.id ?? 'current';
    setSelectedSettingsVersionId(defaultVersionId);
    setHiddenSettingsVersionIds(new Set());
    setOpenVersionActionsId(null);
    setIsSettingsPlanDetailsOpen(true);
  };

  const closeSettingsPlanDetails = () => {
    setIsSettingsPlanDetailsOpen(false);
    setOpenVersionActionsId(null);
  };

  const settingsPlanVersions: SettingsPlanVersionDetails[] = !activeSettingsPlanDetails
    ? []
    : (allBenefitPlanYears.length > 0
        ? allBenefitPlanYears
        : [
            {
              id: 'current',
              name: 'Current',
              plans: 0,
              status: 'Active' as const,
              duration: '01/01/2026 - 12/31/2026',
            },
          ]
      ).map((planYear, index) => ({
        id: planYear.id,
        versionLabel: planYear.status === 'Active' ? `${planYear.name} Active` : `${planYear.name} Inactive`,
        effectiveStart: planYear.duration.split(' - ')[0] ?? '--',
        effectiveEnd: planYear.duration.split(' - ')[1] ?? '--',
        status: planYear.status === 'Active' ? 'Active' : 'Inactive',
        planName: `${activeSettingsPlanDetails.name} ${index + 1}`,
        carrier: 'UnitedHealthCare',
        groupNumber: `A-${324589 + index * 279}`,
        planType: activeSettingsPlanDetails.type,
        planTypeId: index === 0 ? '--' : `HMO-${planYear.name.slice(-2)}`,
        summary: index === 0 ? 'Low Deductible Plan Family Eligible' : 'Family and Employee Coverage',
        description:
          index === 0
            ? 'The current active version gives employees flexibility to see trusted providers with broad coverage options.'
            : `This inactive version for ${planYear.name} captures prior plan-year details and archived terms.`,
        attachmentName: `PlanDoc-${planYear.id}.pdf`,
      }));

  const visibleSettingsPlanVersions = settingsPlanVersions.filter((version) => !hiddenSettingsVersionIds.has(version.id));
  const selectedSettingsVersion =
    visibleSettingsPlanVersions.find((version) => version.id === selectedSettingsVersionId) ?? visibleSettingsPlanVersions[0];
  const shouldScrollPlanVersions = visibleSettingsPlanVersions.length > 4;
  const isViewingOlderPlanVersion = selectedSettingsVersion?.status === 'Inactive';
  const deleteSettingsVersion = (versionId: string) => {
    setHiddenSettingsVersionIds((prev) => {
      const next = new Set(prev);
      next.add(versionId);
      return next;
    });
    setOpenVersionActionsId(null);
    if (selectedSettingsVersionId === versionId) {
      const nextVersion = visibleSettingsPlanVersions.find((version) => version.id !== versionId);
      setSelectedSettingsVersionId(nextVersion?.id ?? '');
    }
  };

  const moveSettingsVersionToSeries = () => {
    setOpenVersionActionsId(null);
  };

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
                onClick={() => {
                  setActiveNav(item.id);
                  if (item.id === 'benefits') setBenefitsSubTab('plan-years');
                }}
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
                  <button
                    type="button"
                    onClick={() => {
                      setPlanYearCreationMode('existing');
                      setSelectedSourcePlanYearId('');
                      setIsCreatePlanYearModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]"
                  >
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

                  {allBenefitPlanYears.map((planYear) => (
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
                      <div className="relative flex items-start justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenPlanYearActionsId((current) =>
                              current === planYear.id ? null : planYear.id,
                            )
                          }
                          className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]"
                        >
                          <Icon name="gear" size={16} />
                          <Icon name="caret-down" size={11} />
                        </button>

                        {openPlanYearActionsId === planYear.id && (
                          <div className="absolute right-0 top-12 z-20 min-w-[180px] rounded-[12px] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] p-1 shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)]">
                            <button
                              type="button"
                              onClick={() => handleDeletePlanYear(planYear.id)}
                              className="w-full rounded-[8px] px-3 py-2 text-left text-[14px] font-medium text-[#b42318] hover:bg-[#fff3f2]"
                            >
                              Delete plan year
                            </button>
                          </div>
                        )}
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
                  <div className="flex items-center">
                    <button className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]">
                      <Icon name="circle-plus" size={14} />
                      Create New Plan
                      <Icon name="caret-down" size={11} className="text-[var(--icon-neutral-strong)]" />
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
                  <div className="grid grid-cols-[1.5fr_1fr_0.7fr_1fr_1fr_1.2fr_120px] gap-4 px-4 py-3 bg-[var(--surface-neutral-xx-weak)] rounded-[var(--radius-small)] text-[15px] font-semibold text-[var(--text-neutral-strong)] mb-2">
                    <span>Plan Name</span>
                    <span>Carrier</span>
                    <span>Plan Year</span>
                    <span>Effective Dates</span>
                    <span>Eligibility</span>
                    <span>Status</span>
                    <span />
                  </div>

                  <div className="space-y-3">
                    {planVersionGroups.map((group) => (
                      <div key={group.id}>
                        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-neutral-xx-weak)] rounded-[var(--radius-small)] mb-1">
                          <Icon name={group.icon} size={14} className="text-[var(--icon-neutral-strong)]" />
                          <span className="text-[16px] font-semibold text-[var(--text-neutral-strong)]">{group.label}</span>
                        </div>
                        {group.plans.map((plan) => (
                          <div
                            key={plan.id}
                            className="group grid grid-cols-[1.5fr_1fr_0.7fr_1fr_1fr_1.2fr_120px] gap-4 px-4 py-5 border-b border-[var(--border-neutral-xx-weak)] transition-colors hover:bg-[var(--surface-neutral-xx-weak)]"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                openSettingsPlanDetails({
                                  id: plan.id,
                                  name: plan.name,
                                  type: plan.type,
                                  endDate: plan.endDate,
                                })
                              }
                              className="text-left text-[15px] text-[#0b4fd1] hover:underline"
                            >
                              <span>{plan.name}</span>
                              <span className={`block text-[12px] leading-[16px] ${plan.isActive ? 'text-[#15803d]' : 'text-[var(--text-neutral-weak)]'}`}>
                                {plan.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </button>
                            <span className="text-[15px] text-[var(--text-neutral-strong)]">{plan.carrier}</span>
                            <span>
                              <span className="inline-flex items-center justify-center h-7 px-3 rounded-[999px] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-xx-weak)] text-[13px] font-medium text-[var(--text-neutral-strong)]">
                                {plan.planYear}
                              </span>
                            </span>
                            <div className="text-[15px] text-[var(--text-neutral-strong)] leading-[20px]">
                              <div>{plan.startDate}</div>
                              <div className="text-[var(--text-neutral-medium)]">{plan.endDate}</div>
                            </div>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setOpenEligibilityPlanId((prev) => (prev === plan.id ? null : plan.id))}
                                className="text-left text-[14px] text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)]"
                              >
                                {plan.eligibilitySummary}
                              </button>
                              {openEligibilityPlanId === plan.id && (
                                <div className="absolute left-0 top-7 z-30 w-[280px] rounded-[10px] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] p-3 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                                  <p className="mb-2 text-[13px] font-semibold text-[var(--text-neutral-strong)]">
                                    Eligibility Filters
                                  </p>
                                  <ul className="space-y-1">
                                    {plan.eligibilityFilters.map((filter) => (
                                      <li key={filter} className="text-[13px] leading-[18px] text-[var(--text-neutral-medium)]">
                                        {filter}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <span className="text-[15px] text-[var(--text-neutral-strong)]">{plan.status}</span>
                            <div className="flex items-center justify-end gap-[6px]">
                              <div className="relative">
                                <button
                                  aria-label="renew plan"
                                  onClick={() => {
                                    setRenewingPlanName(plan.name);
                                    setRenewingPlanType(plan.type);
                                    setSelectedRenewOption('');
                                    setPlanYearCreationMode('existing');
                                    setSelectedSourcePlanYearId('');
                                    setIsRenewPlanModalOpen(true);
                                  }}
                                  className="peer w-9 h-9 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] flex items-center justify-center text-[var(--icon-neutral-strong)] bg-[var(--surface-neutral-white)] opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                                >
                                  <Icon name="arrows-rotate" size={13} />
                                </button>
                                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-[8px] bg-[var(--text-neutral-x-strong)] text-white text-[12px] leading-[16px] whitespace-nowrap opacity-0 transition-opacity peer-hover:opacity-100">
                                  renew plan
                                </span>
                              </div>
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

      {isCreatePlanYearModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#605b58]/95 flex items-center justify-center p-6"
          onClick={() => setIsCreatePlanYearModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create New Plan Year"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[830px] rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden border border-[var(--border-neutral-x-weak)]"
          >
            <header className="h-[84px] px-8 bg-[var(--surface-neutral-xx-weak)] border-b border-[var(--border-neutral-x-weak)] flex items-center justify-between">
              <h3
                className="text-[24px] font-semibold text-[var(--color-primary-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
              >
                Create New Plan Year
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatePlanYearModalOpen(false)}
                className="size-10 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[var(--text-neutral-strong)] shadow-[var(--shadow-100)] flex items-center justify-center"
                aria-label="Close"
              >
                <Icon name="xmark" size={16} />
              </button>
            </header>

            <div className="px-8 py-8">
              <h4
                className="text-center text-[21px] font-semibold text-[var(--text-neutral-x-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '26px' }}
              >
                How would you like to create this plan year?
              </h4>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPlanYearCreationMode('existing')}
                  className={`h-[120px] rounded-[16px] border px-6 flex items-center gap-5 text-left shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)] ${
                    planYearCreationMode === 'existing'
                      ? 'border-[var(--color-primary-medium)]'
                      : 'border-[var(--border-neutral-x-weak)]'
                  }`}
                >
                  <span className="size-16 rounded-[20px] bg-[var(--color-primary-strong)] text-white flex items-center justify-center">
                    <Icon name="sparkles" size={24} />
                  </span>
                  <span className="text-[16px] font-bold leading-[24px] text-[var(--color-primary-strong)]">
                    Start with Previous
                    <br />
                    Plan Year
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanYearCreationMode('scratch')}
                  className={`h-[120px] rounded-[16px] border px-6 flex items-center gap-5 text-left shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)] ${
                    planYearCreationMode === 'scratch'
                      ? 'border-[var(--color-primary-medium)]'
                      : 'border-[var(--border-neutral-x-weak)]'
                  }`}
                >
                  <span className="size-16 rounded-[20px] bg-[var(--surface-neutral-xx-weak)] text-[var(--color-primary-strong)] flex items-center justify-center">
                    <Icon name="grid-2-plus" size={24} />
                  </span>
                  <span className="text-[16px] font-medium leading-[24px] text-[var(--color-primary-strong)]">
                    Create Plan Year from
                    <br />
                    Scratch
                  </span>
                </button>
              </div>

              {planYearCreationMode === 'existing' && (
                <div className="mt-8 w-full max-w-[380px] mx-auto">
                  <label className="block text-[15px] font-medium leading-[22px] text-[var(--text-neutral-x-strong)] mb-2">
                    Select Plan Year:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSourcePlanYearId}
                      onChange={(event) => setSelectedSourcePlanYearId(event.target.value)}
                      className="w-full h-14 rounded-[12px] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] px-4 text-[15px] text-[var(--text-neutral-medium)] appearance-none"
                    >
                      <option value="">-Select-</option>
                      {allBenefitPlanYears.map((planYear) => (
                        <option key={planYear.id} value={planYear.id}>
                          {planYear.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--icon-neutral-weak)]">
                      <Icon name="caret-down" size={16} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            <footer className="h-[96px] bg-[var(--surface-neutral-xx-weak)] border-t border-[var(--border-neutral-x-weak)] px-8 flex items-center justify-end gap-6">
              <button
                type="button"
                onClick={() => setIsCreatePlanYearModalOpen(false)}
                className="h-10 text-[15px] font-semibold leading-[22px] text-[#0b4fd1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleContinueCreatePlanYear}
                className="h-10 px-8 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-white text-[15px] font-semibold leading-[22px] shadow-[var(--shadow-100)]"
              >
                Continue
              </button>
            </footer>
          </div>
        </div>
      )}

      {isSettingsPlanDetailsOpen && activeSettingsPlanDetails && (
        <div className="fixed inset-0 z-[60] bg-[#605b58]/95 p-8" onClick={closeSettingsPlanDetails}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${activeSettingsPlanDetails.name} Details`}
            onClick={(event) => event.stopPropagation()}
            className="h-full w-full rounded-[16px] bg-[var(--surface-neutral-xx-weak)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden flex flex-col"
          >
            <header className="h-[84px] px-8 border-b border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] flex items-center justify-between">
              <h2
                className="text-[44px] font-semibold text-[var(--color-primary-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '38px' }}
              >
                {activeSettingsPlanDetails.name}
              </h2>
              <button
                type="button"
                onClick={closeSettingsPlanDetails}
                className="size-10 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[var(--text-neutral-strong)] flex items-center justify-center bg-[var(--surface-neutral-white)] shadow-[var(--shadow-100)]"
                aria-label="Close"
              >
                <Icon name="xmark" size={16} />
              </button>
            </header>

            <div className="flex-1 min-h-0 px-8 py-6 flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[15px] font-medium leading-[22px] text-[var(--text-neutral-medium)]">Plan History</p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-[15px] font-medium leading-[22px] text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)]"
                  >
                    <Icon name="link" size={16} />
                    Link Old Version
                  </button>
                </div>
                <div className={`mt-3 ${shouldScrollPlanVersions ? 'overflow-x-auto pb-1' : ''}`}>
                  <div className={`flex items-stretch gap-4 ${shouldScrollPlanVersions ? 'min-w-max' : 'w-full'}`}>
                  {visibleSettingsPlanVersions.map((version) => {
                    const isSelected = selectedSettingsVersion?.id === version.id;
                    return (
                      <div
                        key={version.id}
                        className={`h-[86px] rounded-[16px] border bg-[var(--surface-neutral-white)] shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)] px-5 text-left ${
                          shouldScrollPlanVersions ? 'w-[300px] shrink-0' : 'flex-1 min-w-0'
                        } ${
                          isSelected ? 'border-[var(--color-primary-medium)]' : 'border-[var(--border-neutral-x-weak)]'
                        } relative group`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedSettingsVersionId(version.id)}
                          className="h-full w-full pr-8 text-left"
                        >
                          <p
                            className={`text-[16px] leading-[24px] whitespace-nowrap overflow-hidden text-ellipsis ${
                              isSelected ? 'font-bold text-[var(--color-primary-strong)]' : 'font-medium text-[var(--text-neutral-strong)]'
                            }`}
                            title={version.versionLabel}
                          >
                            {version.versionLabel}
                          </p>
                          <p className="text-[15px] leading-[22px] text-[var(--text-neutral-strong)] whitespace-nowrap overflow-hidden text-ellipsis">
                            {version.effectiveStart} - {version.effectiveEnd}
                          </p>
                        </button>
                        <button
                          type="button"
                          aria-label="Version actions"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenVersionActionsId((prev) => (prev === version.id ? null : version.id));
                          }}
                          className="absolute top-3 right-3 h-7 w-7 rounded-[999px] border border-transparent text-[var(--icon-neutral-strong)] opacity-0 transition-opacity group-hover:opacity-100 hover:border-[var(--border-neutral-medium)] hover:bg-[var(--surface-neutral-xx-weak)]"
                        >
                          <Icon name="ellipsis" size={14} />
                        </button>
                        {openVersionActionsId === version.id && (
                          <div className="absolute right-3 top-11 z-40 min-w-[200px] rounded-[10px] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] p-1 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                moveSettingsVersionToSeries();
                              }}
                              className="block w-full rounded-[8px] px-3 py-2 text-left text-[14px] text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)]"
                            >
                              Move to different series
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                deleteSettingsVersion(version.id);
                              }}
                              className="block w-full rounded-[8px] px-3 py-2 text-left text-[14px] text-[#b42318] hover:bg-[#fff3f2]"
                            >
                              Delete version
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                </div>
              </div>

              <section className="flex-1 min-h-0 rounded-[16px] bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-x-weak)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] p-6 flex gap-8 overflow-hidden">
                <aside className="w-[260px] shrink-0 border-r border-[var(--border-neutral-x-weak)] pr-6">
                  <div className="space-y-1 text-[var(--text-neutral-strong)]">
                    <div className="h-10 rounded-[8px] bg-[var(--surface-neutral-xx-weak)] px-3 flex items-center text-[14px] font-semibold text-[var(--color-primary-strong)]">
                      Plan Details
                    </div>
                    <div className="h-9 px-3 flex items-center text-[15px]">Coverage Options</div>
                    <div className="h-9 px-3 flex items-center text-[15px]">Premium Type</div>
                    <div className="h-9 px-3 flex items-center text-[15px]">Eligibility and Cost</div>
                    <div className="h-9 px-3 flex items-center text-[15px]">Employment Details</div>
                    <div className="h-9 px-3 flex items-center text-[15px]">Payroll Deductions</div>
                  </div>
                </aside>

                <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                  {isViewingOlderPlanVersion && (
                    <div className="mb-3 rounded-[8px] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-xx-weak)] px-3 py-2 text-[13px] leading-[18px] text-[var(--text-neutral-medium)]">
                      You are viewing an older version of this plan.
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="size-9 rounded-[10px] bg-[var(--surface-neutral-xx-weak)] flex items-center justify-center text-[var(--color-primary-strong)]">
                        <Icon name="table-cells" size={16} />
                      </span>
                      <h3 className="text-[21px] font-semibold text-[var(--color-primary-strong)]" style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '26px' }}>
                        Plan Details
                      </h3>
                    </div>
                    <button className="h-8 px-4 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] text-[15px] font-semibold text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-white)]">
                      Edit
                    </button>
                  </div>

                  <div className="space-y-4 text-[var(--text-neutral-x-strong)]">
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Plan Name</p>
                      <p className="text-[15px] leading-[22px]">{selectedSettingsVersion?.planName}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Carrier</p>
                      <p className="text-[15px] leading-[22px]">{selectedSettingsVersion?.carrier}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Group Number</p>
                      <p className="text-[15px] leading-[22px]">{selectedSettingsVersion?.groupNumber}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Plan Type</p>
                      <p className="text-[15px] leading-[22px]">{selectedSettingsVersion?.planType}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Plan Type ID</p>
                      <p className="text-[15px] leading-[22px]">{selectedSettingsVersion?.planTypeId}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Summary</p>
                      <p className="text-[15px] leading-[22px]">{selectedSettingsVersion?.summary}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Description</p>
                      <p className="text-[15px] leading-[22px]">{selectedSettingsVersion?.description}</p>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] text-[var(--text-neutral-medium)]">Attachments</p>
                      <button
                        type="button"
                        className="mt-2 h-10 px-4 rounded-[12px] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[#0b4fd1] text-[15px] leading-[22px] shadow-[var(--shadow-100)] inline-flex items-center gap-2"
                      >
                        {selectedSettingsVersion?.attachmentName}
                        <Icon name="paperclip" size={14} className="text-[var(--text-neutral-strong)]" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <footer className="h-[108px] px-8 border-t border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] flex items-center gap-4">
              <button
                type="button"
                onClick={closeSettingsPlanDetails}
                className="h-10 px-6 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-white text-[15px] font-semibold leading-[22px] shadow-[var(--shadow-100)]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={closeSettingsPlanDetails}
                className="h-10 px-1 text-[15px] font-semibold leading-[22px] text-[#0b4fd1]"
              >
                Cancel
              </button>
            </footer>
          </div>
        </div>
      )}

      {isRenewPlanModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#605b58]/95 flex items-center justify-center p-6"
          onClick={() => setIsRenewPlanModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Renew Plan ${renewingPlanName}`}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[830px] rounded-[16px] bg-[var(--surface-neutral-white)] shadow-[2px_2px_0px_2px_rgba(56,49,47,0.05)] overflow-hidden border border-[var(--border-neutral-x-weak)]"
          >
            <header className="px-5 py-4 bg-[var(--surface-neutral-xx-weak)] border-b border-[var(--border-neutral-x-weak)] flex items-center justify-between">
              <div className="flex flex-1 items-center justify-between pr-4">
                <h3
                  className="text-[24px] font-semibold text-[var(--color-primary-strong)]"
                  style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
                >
                  Renew Plan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRenewPlanModalOpen(false)}
                className="size-10 rounded-[var(--radius-full)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] text-[var(--text-neutral-strong)] shadow-[var(--shadow-100)] flex items-center justify-center"
                aria-label="Close"
              >
                <Icon name="xmark" size={16} />
              </button>
            </header>

            <div className="px-5 py-8">
              <h4
                className="text-center text-[21px] font-semibold text-[var(--text-neutral-x-strong)] mb-2"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '26px' }}
              >
                Renewing this plan for next year? Nice!
              </h4>
              <p className="text-center text-[15px] leading-[22px] text-[var(--text-neutral-x-strong)] mb-6">
                Which plan year should it be included in?
              </p>

              <div className="max-w-[920px] mx-auto space-y-4">
                {activeBenefitPlanYears.map((planYear) => {
                  const alreadyIncluded = isPlanIncludedInPlanYear(
                    planYear.id,
                    renewingPlanName,
                    renewingPlanType,
                  );

                  return (
                    <button
                      key={planYear.id}
                      type="button"
                      disabled={alreadyIncluded}
                      onClick={() => setSelectedRenewOption(planYear.id)}
                      className={`w-full min-h-[100px] rounded-[22px] border px-8 py-6 flex items-center gap-7 text-left shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)] disabled:opacity-60 disabled:cursor-not-allowed ${
                        selectedRenewOption === planYear.id
                          ? 'border-[var(--color-primary-medium)] bg-[var(--surface-neutral-white)]'
                          : 'border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)]'
                      }`}
                    >
                      <span className="size-14 rounded-[18px] bg-[var(--surface-neutral-xx-weak)] text-[var(--color-primary-strong)] flex items-center justify-center">
                        <Icon name="calendar" size={26} />
                      </span>
                      <span>
                        <span className="block text-[16px] font-medium leading-[24px] text-[var(--color-primary-strong)]">
                          {planYear.name}
                        </span>
                        <span className="block mt-1 text-[15px] leading-[22px] text-[var(--text-neutral-strong)]">
                          {planYear.duration}
                        </span>
                        {alreadyIncluded && (
                          <span className="block mt-1 text-[13px] leading-[19px] text-[var(--text-neutral-medium)]">
                            Plan already included in this plan year
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setSelectedRenewOption('new')}
                  className={`w-full min-h-[100px] rounded-[22px] border px-8 py-6 flex items-center gap-7 text-left shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)] ${
                    selectedRenewOption === 'new'
                      ? 'border-[var(--color-primary-medium)] bg-[var(--surface-neutral-white)]'
                      : 'border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)]'
                  }`}
                >
                  <span
                    className={`size-14 rounded-[18px] flex items-center justify-center ${
                      selectedRenewOption === 'new'
                        ? 'bg-[var(--color-primary-strong)] text-white'
                        : 'bg-[var(--surface-neutral-xx-weak)] text-[var(--color-primary-strong)]'
                    }`}
                  >
                    <Icon name="circle-plus-lined" size={26} />
                  </span>
                  <span className="text-[16px] font-semibold leading-[24px] text-[var(--color-primary-strong)]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    Create New Plan Year
                  </span>
                </button>

                {selectedRenewOption === 'new' && (
                  <div className="pt-1">
                    <p className="text-[15px] font-medium leading-[22px] text-[var(--text-neutral-x-strong)] mb-3">
                      How would you like to create this plan year?
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPlanYearCreationMode('existing')}
                        className={`h-[104px] rounded-[16px] border px-6 flex items-center gap-5 text-left shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)] ${
                          planYearCreationMode === 'existing'
                            ? 'border-[var(--color-primary-medium)]'
                            : 'border-[var(--border-neutral-x-weak)]'
                        }`}
                      >
                        <span className="size-12 rounded-[14px] bg-[var(--surface-neutral-xx-weak)] text-[var(--color-primary-strong)] flex items-center justify-center">
                          <Icon name="sparkles" size={20} />
                        </span>
                        <span className="text-[16px] font-medium leading-[24px] text-[var(--color-primary-strong)]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                          Start with Existing
                          <br />
                          Plan Year
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlanYearCreationMode('scratch')}
                        className={`h-[104px] rounded-[16px] border px-6 flex items-center gap-5 text-left shadow-[1px_1px_0px_2px_rgba(56,49,47,0.03)] ${
                          planYearCreationMode === 'scratch'
                            ? 'border-[var(--color-primary-medium)]'
                            : 'border-[var(--border-neutral-x-weak)]'
                        }`}
                      >
                        <span className="size-12 rounded-[14px] bg-[var(--surface-neutral-xx-weak)] text-[var(--color-primary-strong)] flex items-center justify-center">
                          <Icon name="grid-2-plus" size={20} />
                        </span>
                        <span className="text-[16px] font-medium leading-[24px] text-[var(--color-primary-strong)]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                          Create Plan Year
                          <br />
                          from Scratch
                        </span>
                      </button>
                    </div>

                    {planYearCreationMode === 'existing' && (
                      <div className="mt-6 w-full max-w-[460px]">
                        <label className="block text-[15px] font-medium leading-[22px] text-[var(--text-neutral-x-strong)] mb-2">
                          Select Plan Year:
                        </label>
                        <div className="relative">
                          <select
                            value={selectedSourcePlanYearId}
                            onChange={(event) => setSelectedSourcePlanYearId(event.target.value)}
                            className="w-full h-14 rounded-[12px] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] px-4 pr-16 text-[15px] text-[var(--text-neutral-medium)] appearance-none"
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                          >
                            <option value="">-Select-</option>
                            {allBenefitPlanYears.map((planYear) => (
                              <option key={planYear.id} value={planYear.id}>
                                {planYear.name}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute right-0 top-0 h-full w-[56px] border-l border-[var(--border-neutral-x-weak)] flex items-center justify-center text-[var(--icon-neutral-weak)]">
                            <Icon name="caret-down" size={16} />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <footer className="bg-[var(--surface-neutral-xx-weak)] border-t border-[var(--border-neutral-x-weak)] px-5 py-4 flex items-center justify-end gap-6">
              <button
                type="button"
                onClick={() => setIsRenewPlanModalOpen(false)}
                className="h-10 text-[15px] font-semibold leading-[22px] text-[#0b4fd1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleContinueRenewPlan}
                disabled={
                  !selectedRenewOption ||
                  (selectedRenewOption === 'new' &&
                    planYearCreationMode === 'existing' &&
                    !selectedSourcePlanYearId) ||
                  (selectedRenewOption !== 'new' &&
                    isPlanIncludedInPlanYear(selectedRenewOption, renewingPlanName, renewingPlanType))
                }
                className="h-10 px-8 rounded-[var(--radius-full)] bg-[var(--color-primary-strong)] text-white text-[15px] font-semibold leading-[22px] shadow-[var(--shadow-100)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
