import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../Icon';
import { DeleteJobProfileModal } from '../DeleteJobProfileModal';
import {
  jobOrganizationNavItems,
  jobProfileGroups,
  type JobProfileGroup,
  type JobProfile,
} from '../../data/settingsData';

export function JobOrganizationCard() {
  const [activeTab, setActiveTab] = useState('job-profiles');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [deletedProfileIds, setDeletedProfileIds] = useState<Set<string>>(new Set());
  const [profileToDelete, setProfileToDelete] = useState<JobProfile | null>(null);

  const visibleGroups = useMemo(() => {
    return jobProfileGroups
      .map((group) => ({
        ...group,
        profiles: group.profiles.filter((p) => !deletedProfileIds.has(p.id)),
      }))
      .filter((g) => g.profiles.length > 0);
  }, [jobProfileGroups, deletedProfileIds]);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleDeleteProfile = (profile: JobProfile) => {
    setProfileToDelete(profile);
  };

  const handleConfirmDelete = () => {
    if (profileToDelete) {
      setDeletedProfileIds((prev) => new Set(prev).add(profileToDelete.id));
      setProfileToDelete(null);
    }
  };

  const navigate = useNavigate();
  const handleProfileClick = (profile: JobProfile) => {
    navigate(`/settings/job-profile/${profile.id}`);
  };

  return (
    <div className="flex min-h-[600px] bg-[var(--surface-neutral-white)] overflow-hidden">
      {/* Left Sidebar Navigation */}
      <nav className="w-[200px] shrink-0 flex flex-col gap-[var(--space-xxs)] p-[var(--space-m)] bg-[var(--surface-neutral-white)]">
        {jobOrganizationNavItems.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex items-center gap-[var(--space-xs)] px-[var(--space-s)] py-[var(--space-xs)] w-full rounded-[var(--radius-xx-small)]
                text-[14px] font-medium transition-colors text-left
                ${
                  isActive
                    ? 'bg-[var(--color-primary-strong)] text-white'
                    : 'text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-x-weak)]'
                }
              `}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Main Content - Job Profiles */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeTab === 'job-profiles' ? (
          <>
            {/* Section Header */}
            <div className="flex items-center justify-between px-[var(--space-m)] py-[var(--space-m)]">
              <div className="flex items-center gap-[var(--space-m)]">
                <h3
                  className="text-[18px] font-semibold text-[var(--color-primary-strong)]"
                  style={{ lineHeight: '26px' }}
                >
                  Job Profiles
                </h3>
                <button className="px-[var(--space-s)] py-[var(--space-xs)] text-[14px] font-medium text-[var(--text-neutral-strong)] border border-[var(--border-neutral-weak)] rounded-full hover:bg-[var(--surface-neutral-x-weak)] transition-colors">
                  History
                </button>
              </div>
              <div className="flex items-center gap-[11px]">
                <button className="flex items-center gap-[var(--space-xs)] px-[var(--space-s)] py-[var(--space-xs)] text-[14px] font-medium text-[var(--text-neutral-strong)] border border-[var(--border-neutral-weak)] rounded-full hover:bg-[var(--surface-neutral-x-weak)] transition-colors">
                  Add New
                  <Icon name="caret-down" size={12} className="text-[var(--icon-neutral-strong)]" />
                </button>
                <button className="flex items-center justify-center w-8 h-8 text-[var(--icon-neutral-strong)] border border-[var(--border-neutral-weak)] rounded-full hover:bg-[var(--surface-neutral-x-weak)] transition-colors">
                  <Icon name="gear" size={16} />
                </button>
              </div>
            </div>

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
                    <th className="bg-[var(--surface-neutral-x-weak)] px-[var(--space-m)] py-[var(--space-s)] text-left text-[15px] font-semibold text-[var(--text-neutral-strong)] w-[160px]">
                      People
                    </th>
                    <th className="bg-[var(--surface-neutral-x-weak)] px-[var(--space-m)] py-[var(--space-s)] w-[74px]" />
                  </tr>
                </thead>
                <tbody>
                  {visibleGroups.map((group) => (
                    <JobProfileGroupRows
                      key={group.id}
                      group={group}
                      collapsed={collapsedGroups[group.id] ?? false}
                      onToggle={() => toggleGroup(group.id)}
                      hoveredRowId={hoveredRowId}
                      onRowHover={setHoveredRowId}
                      onDeleteClick={handleDeleteProfile}
                      onProfileClick={handleProfileClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-[var(--space-xl)]">
            <p className="text-[15px] text-[var(--text-neutral-medium)]">
              {jobOrganizationNavItems.find((i) => i.id === activeTab)?.label} content coming soon.
            </p>
          </div>
        )}
      </div>

      {profileToDelete && (
        <DeleteJobProfileModal
          jobProfileName={profileToDelete.name}
          onClose={() => setProfileToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

interface JobProfileGroupRowsProps {
  group: JobProfileGroup;
  collapsed: boolean;
  onToggle: () => void;
  hoveredRowId: string | null;
  onRowHover: (id: string | null) => void;
  onDeleteClick: (profile: JobProfile) => void;
  onProfileClick: (profile: JobProfile) => void;
}

function JobProfileGroupRows({
  group,
  collapsed,
  onToggle,
  hoveredRowId,
  onRowHover,
  onDeleteClick,
  onProfileClick,
}: JobProfileGroupRowsProps) {
  return (
    <>
      {/* Group Header Row - spans all columns */}
      <tr>
        <td
          colSpan={4}
          className="bg-[var(--surface-neutral-x-weak)] px-[var(--space-m)] py-[6px]"
        >
          <button
            onClick={onToggle}
            className="flex items-center gap-[var(--space-xs)] px-[var(--space-xs)] py-1 text-[14px] font-semibold text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)] rounded-full transition-colors"
          >
            <Icon
              name="caret-down"
              size={16}
              className={`text-[var(--icon-neutral-medium)] transition-transform ${collapsed ? '-rotate-90' : ''}`}
            />
            {group.name}
          </button>
        </td>
      </tr>
      {!collapsed &&
        group.profiles.map((profile) => {
          const isHovered = hoveredRowId === profile.id;
          return (
            <tr
              key={profile.id}
              onMouseEnter={() => onRowHover(profile.id)}
              onMouseLeave={() => onRowHover(null)}
              className="bg-[var(--surface-neutral-white)]"
            >
              <td className="px-[var(--space-m)] py-[var(--space-m)]">
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
              <td className="px-[var(--space-m)] py-[var(--space-m)] text-[15px] text-[var(--color-link)]">
                {profile.people}
              </td>
              <td className="px-[var(--space-m)] py-[11px] text-right">
                {isHovered && (
                  <button
                    onClick={() => onDeleteClick(profile)}
                    className="inline-flex items-center justify-center w-8 h-8 text-[var(--icon-neutral-strong)] hover:text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)] rounded-full transition-colors"
                    aria-label="Delete"
                  >
                    <Icon name="trash-can" size={16} />
                  </button>
                )}
              </td>
            </tr>
          );
        })}
    </>
  );
}

export default JobOrganizationCard;
