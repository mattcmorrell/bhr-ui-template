import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '../Icon';
import { Tabs } from '../Tabs';
import { DeleteJobProfileModal } from '../DeleteJobProfileModal';
import { CantArchiveJobProfileModal } from '../CantArchiveJobProfileModal';
import { JobProfilePeopleModal } from '../JobProfilePeopleModal';
import {
  jobOrganizationNavItems,
  jobProfileGroups,
  organizationDepartments,
  organizationDivisions,
  organizationEeoCategories,
  organizationLocations,
  organizationTeams,
  type JobProfileGroup,
  type JobProfile,
  type OrganizationCountRow,
  type OrganizationLocationRow,
} from '../../data/settingsData';
import { readExtraJobProfiles, removeExtraJobProfile, clearExtraJobProfiles } from '../../data/extraJobProfilesStorage';
import {
  bucketJobProfilesToGroups,
  bucketUnassignedStartingGroups,
} from '../../data/jobProfileGrouping';
import { applyBaselineToJobProfileGroups } from '../../data/jobProfilePrototypeBaseline';
import { JobProfilesOnboardingIngress } from '../JobProfilesPrototype/JobProfilesOnboardingIngress';
import { OrganizationLocationsTab, OrganizationTwoColumnTab } from './OrganizationListTab';

const gearMenuItems: { id: string; label: string }[] = [
  { id: 'export', label: 'Export job profiles' },
  { id: 'import', label: 'Import job profiles' },
  { id: 'mizu', label: 'MIZU' },
  { id: 'columns', label: 'RESTART PROTOTYPE' },
];

const organizeJobFamiliesGearItem = {
  id: 'organize-job-families',
  label: 'Organize job families',
} as const;

const addNewMenuItems: { id: string; label: string }[] = [
  { id: 'new-job-profile', label: 'New Job Profile' },
  { id: 'new-job-family', label: 'New Job Family' },
];

const profilesListTabs = [
  { id: 'current', label: 'Current' },
  { id: 'archived', label: 'Archived' },
];

function formatArchivedDateLabel() {
  return new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Prototype: simulate Power Edit clearing assignees without mutating static seed data. */
function applyJobProfilePeopleOverrides(
  groups: JobProfileGroup[],
  overrides: Record<string, number>,
): JobProfileGroup[] {
  if (Object.keys(overrides).length === 0) return groups;
  return groups.map((g) => ({
    ...g,
    profiles: g.profiles.map((p) => (p.id in overrides ? { ...p, people: overrides[p.id] } : p)),
  }));
}

export type JobOrganizationGroupingMode = 'mapped' | 'unassigned';

export interface JobOrganizationCardProps {
  groupingMode?: JobOrganizationGroupingMode;
}

export function JobOrganizationCard({ groupingMode = 'mapped' }: JobOrganizationCardProps) {
  const [activeTab, setActiveTab] = useState('job-profiles');
  const [profilesListTab, setProfilesListTab] = useState<'current' | 'archived'>('current');
  const [gearMenuOpen, setGearMenuOpen] = useState(false);
  const gearMenuRef = useRef<HTMLDivElement>(null);
  const [addNewMenuOpen, setAddNewMenuOpen] = useState(false);
  const addNewMenuRef = useRef<HTMLDivElement>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [deletedProfileIds, setDeletedProfileIds] = useState<Set<string>>(new Set());
  const [archivedAtByProfileId, setArchivedAtByProfileId] = useState<Record<string, string>>({});
  const [profileToDelete, setProfileToDelete] = useState<JobProfile | null>(null);
  const [profileBlockedFromArchive, setProfileBlockedFromArchive] = useState<JobProfile | null>(null);
  const [prototypePeopleByProfileId, setPrototypePeopleByProfileId] = useState<Record<string, number>>({});
  const [resetVersion, setResetVersion] = useState(0);
  const [peopleModal, setPeopleModal] = useState<{
    jobFamilyName: string;
    jobProfileName: string;
    peopleCount: number;
  } | null>(null);

  const [departmentRows, setDepartmentRows] = useState<OrganizationCountRow[]>(organizationDepartments);
  const [divisionRows, setDivisionRows] = useState<OrganizationCountRow[]>(organizationDivisions);
  const [teamRows, setTeamRows] = useState<OrganizationCountRow[]>(organizationTeams);
  const [locationRows, setLocationRows] =
    useState<OrganizationLocationRow[]>(organizationLocations);
  const [eeoRows, setEeoRows] = useState<OrganizationCountRow[]>(organizationEeoCategories);

  const location = useLocation();

  const currentGroups = useMemo(() => {
    const raw =
      groupingMode === 'unassigned'
        ? bucketUnassignedStartingGroups(
            jobProfileGroups,
            readExtraJobProfiles(),
            deletedProfileIds,
            archivedAtByProfileId,
            'current',
          )
        : bucketJobProfilesToGroups(
            jobProfileGroups,
            readExtraJobProfiles(),
            deletedProfileIds,
            archivedAtByProfileId,
            'current',
          );
    const withPeople = applyJobProfilePeopleOverrides(raw, prototypePeopleByProfileId);
    return applyBaselineToJobProfileGroups(withPeople, groupingMode, resetVersion);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- location.key: re-read sessionStorage when returning from detail
  }, [
    groupingMode,
    location.key,
    deletedProfileIds,
    archivedAtByProfileId,
    prototypePeopleByProfileId,
    resetVersion,
  ]);

  const archivedGroups = useMemo(() => {
    const raw =
      groupingMode === 'unassigned'
        ? bucketUnassignedStartingGroups(
            jobProfileGroups,
            readExtraJobProfiles(),
            deletedProfileIds,
            archivedAtByProfileId,
            'archived',
          )
        : bucketJobProfilesToGroups(
            jobProfileGroups,
            readExtraJobProfiles(),
            deletedProfileIds,
            archivedAtByProfileId,
            'archived',
          );
    const withPeople = applyJobProfilePeopleOverrides(raw, prototypePeopleByProfileId);
    return applyBaselineToJobProfileGroups(withPeople, groupingMode, resetVersion);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- location.key: re-read sessionStorage when returning from detail
  }, [
    groupingMode,
    location.key,
    deletedProfileIds,
    archivedAtByProfileId,
    prototypePeopleByProfileId,
    resetVersion,
  ]);

  const jobTitleCount = useMemo(
    () => currentGroups.reduce((acc, g) => acc + g.profiles.length, 0),
    [currentGroups],
  );

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleDeleteProfile = (profile: JobProfile) => {
    setProfileToDelete(profile);
  };

  const handleReassignWithPowerEdit = () => {
    if (!profileBlockedFromArchive) return;
    const { id } = profileBlockedFromArchive;
    setPrototypePeopleByProfileId((prev) => ({ ...prev, [id]: 0 }));
    setProfileBlockedFromArchive(null);
  };

  const handleArchiveClick = (profile: JobProfile) => {
    if (profile.people !== 0) {
      setProfileBlockedFromArchive(profile);
      return;
    }
    setArchivedAtByProfileId((prev) => ({
      ...prev,
      [profile.id]: formatArchivedDateLabel(),
    }));
  };

  const handleConfirmDelete = () => {
    if (profileToDelete) {
      const id = profileToDelete.id;
      removeExtraJobProfile(id);
      setDeletedProfileIds((prev) => new Set(prev).add(id));
      setArchivedAtByProfileId((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setProfileToDelete(null);
    }
  };

  const navigate = useNavigate();
  const { toggleMizu } = useTheme();

  const resolvedGearMenuItems = useMemo(
    () => [organizeJobFamiliesGearItem, ...gearMenuItems],
    [],
  );

  const handleGearMenuSelect = useCallback(
    (itemId: string) => {
      setGearMenuOpen(false);
      if (itemId === organizeJobFamiliesGearItem.id) {
        navigate('/settings/job-profiles/organize');
      } else if (itemId === 'mizu') {
        toggleMizu();
      } else if (itemId === 'columns') {
        clearExtraJobProfiles();
        try {
          sessionStorage.removeItem('bhr-wizard-complete');
          sessionStorage.removeItem('bhr-job-profiles-onboarding-ingress-dismissed');
        } catch { /* ignore */ }
        setDeletedProfileIds(new Set());
        setArchivedAtByProfileId({});
        setPrototypePeopleByProfileId({});
        setResetVersion((v) => v + 1);
      }
    },
    [navigate, toggleMizu],
  );

  const handleProfileClick = (profile: JobProfile) => {
    navigate(`/settings/job-profile/${profile.id}`);
  };

  useEffect(() => {
    if (!gearMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (gearMenuRef.current && !gearMenuRef.current.contains(event.target as Node)) {
        setGearMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [gearMenuOpen]);

  useEffect(() => {
    if (!addNewMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (addNewMenuRef.current && !addNewMenuRef.current.contains(event.target as Node)) {
        setAddNewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addNewMenuOpen]);

  useEffect(() => {
    if (profilesListTab === 'archived') {
      setAddNewMenuOpen(false);
      setGearMenuOpen(false);
    }
  }, [profilesListTab]);

  return (
    <div className="flex gap-8">
      {/* Left Sidebar Navigation */}
      <div className="w-[160px] shrink-0">
        <nav className="flex flex-col">
          {jobOrganizationNavItems.map((item) => {
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  text-left px-3 py-2 text-[15px] transition-colors rounded-[var(--radius-small)]
                  ${
                    isActive
                      ? 'text-[var(--color-primary-strong)] font-semibold bg-[var(--surface-neutral-xx-weak)]'
                      : 'text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)]'
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content - Job Profiles */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeTab === 'job-profiles' ? (
          <>
            {/* Title row */}
            <div className="flex items-center justify-between px-[var(--space-m)] py-[var(--space-m)]">
              <h3
                className="text-[22px] font-semibold text-[var(--color-primary-strong)]"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
              >
                Job Profiles
              </h3>
              <button className="px-[var(--space-s)] py-[var(--space-xs)] text-[14px] font-medium text-[var(--text-neutral-strong)] border border-[var(--border-neutral-weak)] rounded-full hover:bg-[var(--surface-neutral-x-weak)] transition-colors">
                History
              </button>
            </div>

            <JobProfilesOnboardingIngress
              groupingMode={groupingMode}
              jobTitleCount={jobTitleCount}
              onGetStarted={() =>
                navigate('/settings/job-profiles/organize', { state: { fromAiOnboarding: true } })
              }
            />

            {/* Current / Archived tabs */}
            <div className="border-b border-[var(--border-neutral-x-weak)] px-[var(--space-m)]">
              <Tabs
                tabs={profilesListTabs}
                activeTab={profilesListTab}
                onTabChange={(id) => setProfilesListTab(id as 'current' | 'archived')}
              />
            </div>

            {/* Actions (Current tab only) */}
            {profilesListTab === 'current' && (
              <div className="flex items-center justify-between px-[var(--space-m)] py-[var(--space-m)]">
                <div className="relative shrink-0" ref={addNewMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setAddNewMenuOpen((open) => !open);
                      setGearMenuOpen(false);
                    }}
                    aria-expanded={addNewMenuOpen}
                    aria-haspopup="menu"
                    aria-label="Add new job profile or job family"
                    className="flex items-center gap-[var(--space-xs)] px-[var(--space-s)] py-[var(--space-xs)] text-[14px] font-medium text-[var(--text-neutral-strong)] border border-[var(--border-neutral-weak)] rounded-full hover:bg-[var(--surface-neutral-x-weak)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-medium)] focus-visible:ring-offset-2"
                  >
                    Add New
                    <Icon
                      name="caret-down"
                      size={12}
                      className={`text-[var(--icon-neutral-strong)] transition-transform ${addNewMenuOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                  {addNewMenuOpen && (
                    <div
                      role="menu"
                      aria-orientation="vertical"
                      className="absolute left-0 z-50 mt-2 min-w-[220px] rounded-[var(--radius-small)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] py-1 shadow-lg"
                      style={{ boxShadow: 'var(--shadow-300)' }}
                    >
                      {addNewMenuItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setAddNewMenuOpen(false);
                            if (item.id === 'new-job-profile') {
                              navigate('/settings/job-profile/new');
                            }
                          }}
                          className="flex w-full px-4 py-2.5 text-left text-[15px] text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)] transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative shrink-0" ref={gearMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setGearMenuOpen((open) => !open);
                      setAddNewMenuOpen(false);
                    }}
                    aria-expanded={gearMenuOpen}
                    aria-haspopup="menu"
                    aria-label="Job profiles options"
                    className="flex items-center gap-[var(--space-xs)] px-[var(--space-s)] py-[var(--space-xs)] text-[var(--icon-neutral-strong)] border border-[var(--border-neutral-weak)] rounded-full hover:bg-[var(--surface-neutral-x-weak)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-medium)] focus-visible:ring-offset-2"
                  >
                    <Icon name="gear" size={16} className="shrink-0" />
                    <Icon
                      name="caret-down"
                      size={12}
                      className={`shrink-0 text-[var(--icon-neutral-strong)] transition-transform ${gearMenuOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                  {gearMenuOpen && (
                    <div
                      role="menu"
                      aria-orientation="vertical"
                      className="absolute right-0 z-50 mt-2 min-w-[220px] rounded-[var(--radius-small)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] py-1 shadow-lg"
                      style={{ boxShadow: 'var(--shadow-300)' }}
                    >
                      {resolvedGearMenuItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          role="menuitem"
                          onClick={() => handleGearMenuSelect(item.id)}
                          className="flex w-full px-4 py-2.5 text-left text-[15px] text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)] transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-[var(--surface-neutral-x-weak)] px-[var(--space-m)] py-[var(--space-s)] text-left text-[15px] font-semibold text-[var(--text-neutral-strong)]">
                      Name
                    </th>
                    <th className="bg-[var(--surface-neutral-x-weak)] px-[var(--space-m)] py-[var(--space-s)] text-left text-[15px] font-semibold text-[var(--text-neutral-strong)]">
                      Career Track & Level
                    </th>
                    {profilesListTab === 'archived' ? (
                      <th className="bg-[var(--surface-neutral-x-weak)] px-[var(--space-m)] py-[var(--space-s)] text-left text-[15px] font-semibold text-[var(--text-neutral-strong)] w-[160px]">
                        Date archived
                      </th>
                    ) : (
                      <th className="bg-[var(--surface-neutral-x-weak)] px-[var(--space-m)] py-[var(--space-s)] text-left text-[15px] font-semibold text-[var(--text-neutral-strong)] w-[160px]">
                        People
                      </th>
                    )}
                    <th className="bg-[var(--surface-neutral-x-weak)] px-[var(--space-m)] py-[var(--space-s)] w-[74px]" />
                  </tr>
                </thead>
                <tbody>
                  {profilesListTab === 'archived' ? (
                    archivedGroups.length === 0 ? (
                      <tr className="bg-[var(--surface-neutral-white)]">
                        <td
                          colSpan={4}
                          className="px-[var(--space-m)] py-[var(--space-xl)] text-center text-[15px] text-[var(--text-neutral-medium)]"
                        >
                          No archived job profiles
                        </td>
                      </tr>
                    ) : (
                      archivedGroups.map((group) => (
                        <JobProfileGroupRows
                          key={group.id}
                          listMode="archived"
                          group={group}
                          archivedAtByProfileId={archivedAtByProfileId}
                          collapsed={collapsedGroups[group.id] ?? false}
                          onToggle={() => toggleGroup(group.id)}
                          hoveredRowId={hoveredRowId}
                          onRowHover={setHoveredRowId}
                          onArchiveClick={handleArchiveClick}
                          onDeleteClick={handleDeleteProfile}
                          onProfileClick={handleProfileClick}
                          onOpenPeopleModal={setPeopleModal}
                        />
                      ))
                    )
                  ) : (
                    currentGroups.map((group) => (
                      <JobProfileGroupRows
                        key={group.id}
                        listMode="current"
                        group={group}
                        archivedAtByProfileId={archivedAtByProfileId}
                        collapsed={collapsedGroups[group.id] ?? false}
                        onToggle={() => toggleGroup(group.id)}
                        hoveredRowId={hoveredRowId}
                        onRowHover={setHoveredRowId}
                        onArchiveClick={handleArchiveClick}
                        onDeleteClick={handleDeleteProfile}
                        onProfileClick={handleProfileClick}
                        onOpenPeopleModal={setPeopleModal}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === 'departments' ? (
          <OrganizationTwoColumnTab
            title="Department"
            nameColumnLabel="Department"
            rows={departmentRows}
            onRowsChange={setDepartmentRows}
            addVariant="inline"
          />
        ) : activeTab === 'divisions' ? (
          <OrganizationTwoColumnTab
            title="Division"
            nameColumnLabel="Division"
            rows={divisionRows}
            onRowsChange={setDivisionRows}
            addVariant="inline"
          />
        ) : activeTab === 'teams' ? (
          <OrganizationTwoColumnTab
            title="Teams"
            nameColumnLabel="Team Name"
            rows={teamRows}
            onRowsChange={setTeamRows}
            addVariant="outlineButton"
            outlineButtonLabel="New Team"
          />
        ) : activeTab === 'locations' ? (
          <OrganizationLocationsTab rows={locationRows} onRowsChange={setLocationRows} />
        ) : activeTab === 'eeo-categories' ? (
          <OrganizationTwoColumnTab
            title="EEO Categories"
            nameColumnLabel="EEO Category"
            rows={eeoRows}
            onRowsChange={setEeoRows}
            addVariant="editEeo"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-[var(--space-xl)]">
            <p className="text-[15px] text-[var(--text-neutral-medium)]">
              {jobOrganizationNavItems.find((i) => i.id === activeTab)?.label} content coming soon.
            </p>
          </div>
        )}
      </div>

      {profileBlockedFromArchive && (
        <CantArchiveJobProfileModal
          employeeCount={profileBlockedFromArchive.people}
          onClose={() => setProfileBlockedFromArchive(null)}
          onReassignWithPowerEdit={handleReassignWithPowerEdit}
        />
      )}

      {profileToDelete && (
        <DeleteJobProfileModal
          jobProfileName={profileToDelete.name}
          onClose={() => setProfileToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {peopleModal && (
        <JobProfilePeopleModal
          jobFamilyName={peopleModal.jobFamilyName}
          jobProfileName={peopleModal.jobProfileName}
          peopleCount={peopleModal.peopleCount}
          onClose={() => setPeopleModal(null)}
        />
      )}
    </div>
  );
}

interface JobProfileGroupRowsProps {
  listMode: 'current' | 'archived';
  group: JobProfileGroup;
  archivedAtByProfileId: Record<string, string>;
  collapsed: boolean;
  onToggle: () => void;
  hoveredRowId: string | null;
  onRowHover: (id: string | null) => void;
  onArchiveClick: (profile: JobProfile) => void;
  onDeleteClick: (profile: JobProfile) => void;
  onProfileClick: (profile: JobProfile) => void;
  onOpenPeopleModal: (payload: {
    jobFamilyName: string;
    jobProfileName: string;
    peopleCount: number;
  }) => void;
}

function JobProfileGroupRows({
  listMode,
  group,
  archivedAtByProfileId,
  collapsed,
  onToggle,
  hoveredRowId,
  onRowHover,
  onArchiveClick,
  onDeleteClick,
  onProfileClick,
  onOpenPeopleModal,
}: JobProfileGroupRowsProps) {
  const groupRegionId = `job-profile-group-${listMode}-${group.id}`;
  const hasProfiles = group.profiles.length > 0;

  return (
    <>
      {/* Group header row: four cells so column widths match profile rows below */}
      <tr className="bg-[var(--surface-neutral-x-weak)]">
        <td className="p-0 align-middle">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-controls={!collapsed && hasProfiles ? groupRegionId : undefined}
            aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${group.name} job profiles`}
            className="
              flex w-full min-h-[40px] items-center gap-[var(--space-xs)]
              px-[var(--space-m)] py-[6px] text-left
              text-[14px] font-semibold text-[var(--text-neutral-medium)]
              hover:bg-[var(--surface-neutral-xx-weak)] hover:text-[var(--text-neutral-strong)]
              transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary-medium)]
            "
          >
            <Icon
              name="caret-down"
              size={16}
              className={`shrink-0 text-[var(--icon-neutral-medium)] transition-transform ${collapsed ? '-rotate-90' : ''}`}
              aria-hidden
            />
            <span className="min-w-0 flex-1">{group.name}</span>
          </button>
        </td>
        <td className="p-0 align-middle" aria-hidden="true" />
        <td className="w-[160px] p-0 align-middle" aria-hidden="true" />
        <td className="w-[74px] p-0 align-middle" aria-hidden="true" />
      </tr>
      {!collapsed &&
        group.profiles.map((profile, rowIndex) => {
          const isHovered = hoveredRowId === profile.id;
          return (
            <tr
              key={profile.id}
              onMouseEnter={() => onRowHover(profile.id)}
              onMouseLeave={() => onRowHover(null)}
              className="bg-[var(--surface-neutral-white)]"
            >
              <td className="px-[var(--space-m)] py-[var(--space-m)]">
                {rowIndex === 0 && (
                  <span id={groupRegionId} className="sr-only">
                    Job profiles in {group.name}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onProfileClick(profile)}
                  className="text-[15px] text-[var(--color-link)] hover:underline text-left"
                >
                  {profile.name}
                </button>
              </td>
              <td className="px-[var(--space-m)] py-[var(--space-m)] text-[15px] text-[var(--text-neutral-x-strong)]">
                {profile.careerTrackLevel}
              </td>
              {listMode === 'archived' ? (
                <td className="px-[var(--space-m)] py-[var(--space-m)] text-[15px] text-[var(--text-neutral-x-strong)] w-[160px]">
                  {archivedAtByProfileId[profile.id] ?? '—'}
                </td>
              ) : profile.people > 0 ? (
                <td className="px-[var(--space-m)] py-[var(--space-m)] text-[15px]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPeopleModal({
                        jobFamilyName: group.name,
                        jobProfileName: profile.name,
                        peopleCount: profile.people,
                      });
                    }}
                    className="text-[var(--color-link)] hover:underline text-left"
                  >
                    {profile.people}
                  </button>
                </td>
              ) : (
                <td className="px-[var(--space-m)] py-[var(--space-m)] text-[15px] text-[var(--text-neutral-x-strong)]">
                  {profile.people}
                </td>
              )}
              <td className="px-[var(--space-m)] py-[11px] text-right">
                {isHovered &&
                  (listMode === 'current' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchiveClick(profile);
                      }}
                      className="inline-flex items-center justify-center w-8 h-8 text-[var(--icon-neutral-strong)] hover:text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)] rounded-full transition-colors"
                      aria-label="Archive"
                    >
                      <Icon name="box-archive" size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick(profile);
                      }}
                      className="inline-flex items-center justify-center w-8 h-8 text-[var(--icon-neutral-strong)] hover:text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)] rounded-full transition-colors"
                      aria-label="Delete"
                    >
                      <Icon name="trash-can" size={16} />
                    </button>
                  ))}
              </td>
            </tr>
          );
        })}
    </>
  );
}

export default JobOrganizationCard;
