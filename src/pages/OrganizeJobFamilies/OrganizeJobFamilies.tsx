import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon, TextInput, FormDropdown } from '../../components';
import { AiOnboardingStepTracker } from '../../components/AiOnboardingStepTracker/AiOnboardingStepTracker';
import { JobProfilePeopleModal } from '../../components/JobProfilePeopleModal';
import {
  careerTrackOptions,
  levelOptions,
  type JobProfile,
  type JobProfileGroup,
} from '../../data/settingsData';
import { UNASSIGNED_GROUP_ID } from '../../data/jobProfileGrouping';
import { buildOrganizeJobFamiliesInitialGroups } from '../../data/buildOrganizeJobFamiliesInitialGroups';

const careerOpts = [{ value: '', label: '—' }, ...careerTrackOptions];
const levelOpts = [{ value: '', label: '—' }, ...levelOptions];

/** Aligns with Job Profile AI actions (e.g. Create with AI). */
const AI_ACTION_TEAL = '#005b7f';

const FAMILY_MOVE_DELAY_MS = 480;

/** Filled primary for onboarding CTA; pairs with onboarding ingress teal family. */
const AI_PRIMARY_GRADIENT =
  'linear-gradient(135deg, #0c5d6b 0%, #0f6b7a 42%, #127d8f 100%)';

type SortKind = 'az' | 'za' | 'largest' | 'smallest';

function parseCareerTrackLevel(careerTrackLevel: string): { track: string; level: string } {
  if (!careerTrackLevel) return { track: '', level: '' };
  return {
    track: careerTrackLevel[0] ?? '',
    level: careerTrackLevel.length > 1 ? careerTrackLevel.slice(1) : '',
  };
}

function buildCareerTrackLevel(track: string, level: string) {
  if (track && level) return `${track}${level}`;
  return track || level || '';
}

function newEntityId(prefix: string) {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}`;
}

function filterGroupsForSearch(groups: JobProfileGroup[], q: string): JobProfileGroup[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return groups;
  return groups
    .map((g) => {
      if (g.name.toLowerCase().includes(needle)) return g;
      const profs = g.profiles.filter((p) => p.name.toLowerCase().includes(needle));
      if (profs.length === 0) return null;
      return { ...g, profiles: profs };
    })
    .filter((x): x is JobProfileGroup => x != null);
}

function sortGroups(groups: JobProfileGroup[], sort: SortKind): JobProfileGroup[] {
  const copy = [...groups];
  const headcount = (g: JobProfileGroup) => g.profiles.reduce((s, p) => s + p.people, 0);
  switch (sort) {
    case 'az':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'za':
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case 'largest':
      return copy.sort((a, b) => headcount(b) - headcount(a));
    case 'smallest':
      return copy.sort((a, b) => headcount(a) - headcount(b));
    default:
      return copy;
  }
}

/** Unassigned card first whenever it has profiles (after search + sort on the rest). */
function pinUnassignedFirst(groups: JobProfileGroup[]): JobProfileGroup[] {
  const idx = groups.findIndex((g) => g.id === UNASSIGNED_GROUP_ID && g.profiles.length > 0);
  if (idx <= 0) return groups;
  const un = groups[idx];
  const rest = groups.filter((_, i) => i !== idx);
  return [un, ...rest];
}

function deleteFamilyMoveToUnassigned(groups: JobProfileGroup[], familyId: string): JobProfileGroup[] {
  if (familyId === UNASSIGNED_GROUP_ID) return groups;
  const family = groups.find((g) => g.id === familyId);
  if (!family) return groups;
  const moved = family.profiles.map((p) => ({ ...p, jobFamilyGroupId: null }));
  const rest = groups.filter((g) => g.id !== familyId);
  const un = rest.find((g) => g.id === UNASSIGNED_GROUP_ID);
  if (un) {
    return rest.map((g) =>
      g.id === UNASSIGNED_GROUP_ID ? { ...g, profiles: [...g.profiles, ...moved] } : g,
    );
  }
  return [...rest, { id: UNASSIGNED_GROUP_ID, name: 'Unassigned', profiles: moved }];
}

function autoGroupUnassigned(groups: JobProfileGroup[]): JobProfileGroup[] {
  const targets = groups.filter((g) => g.id !== UNASSIGNED_GROUP_ID);
  const un = groups.find((g) => g.id === UNASSIGNED_GROUP_ID);
  if (!un || un.profiles.length === 0 || targets.length === 0) return groups;

  const next = groups.map((g) => {
    if (g.id === UNASSIGNED_GROUP_ID) return { ...g, profiles: [] as JobProfile[] };
    return { ...g, profiles: [...g.profiles] };
  });
  let i = 0;
  for (const p of un.profiles) {
    const t = targets[i % targets.length];
    i++;
    const gi = next.findIndex((x) => x.id === t.id);
    if (gi >= 0) {
      next[gi] = {
        ...next[gi],
        profiles: [...next[gi].profiles, { ...p, jobFamilyGroupId: t.id }],
      };
    }
  }
  return next;
}

function addNewFamily(groups: JobProfileGroup[]): JobProfileGroup[] {
  const id = newEntityId('jf');
  const newG: JobProfileGroup = { id, name: 'New job family', profiles: [] };
  const unIdx = groups.findIndex((g) => g.id === UNASSIGNED_GROUP_ID);
  if (unIdx >= 0) {
    const copy = [...groups];
    copy.splice(unIdx, 0, newG);
    return copy;
  }
  return [...groups, newG];
}

function moveProfileToFamily(
  groups: JobProfileGroup[],
  profileId: string,
  fromGroupId: string,
  toGroupId: string,
): JobProfileGroup[] {
  if (fromGroupId === toGroupId) return groups;

  /** `bucketJobProfilesToGroups` omits Unassigned when empty, so the target group may not exist yet. */
  let working = groups;
  if (toGroupId === UNASSIGNED_GROUP_ID && !working.some((g) => g.id === UNASSIGNED_GROUP_ID)) {
    working = [...working, { id: UNASSIGNED_GROUP_ID, name: 'Unassigned', profiles: [] }];
  }

  const fromGroup = working.find((g) => g.id === fromGroupId);
  const toGroup = working.find((g) => g.id === toGroupId);
  if (!fromGroup || !toGroup) return groups;
  const prof = fromGroup.profiles.find((p) => p.id === profileId);
  if (!prof) return groups;

  const jobFamilyGroupId = toGroupId === UNASSIGNED_GROUP_ID ? null : toGroupId;
  const moved: JobProfile = { ...prof, jobFamilyGroupId };

  return working.map((g) => {
    if (g.id === fromGroupId) {
      return { ...g, profiles: g.profiles.filter((p) => p.id !== profileId) };
    }
    if (g.id === toGroupId) {
      return { ...g, profiles: [...g.profiles, moved] };
    }
    return g;
  });
}

export type OrganizeJobFamiliesLocationState = { fromAiOnboarding?: boolean };

export function OrganizeJobFamilies() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromAiOnboarding = Boolean(
    (location.state as OrganizeJobFamiliesLocationState | null)?.fromAiOnboarding,
  );

  const initialGroups = useMemo(() => buildOrganizeJobFamiliesInitialGroups(), []);
  const initialSnapshot = useMemo(() => structuredClone(initialGroups), [initialGroups]);

  const [draftGroups, setDraftGroups] = useState<JobProfileGroup[]>(() =>
    structuredClone(initialGroups),
  );
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKind>('az');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [peopleModal, setPeopleModal] = useState<{
    jobFamilyName: string;
    jobProfileName: string;
    peopleCount: number;
  } | null>(null);

  const [hoveredProfileId, setHoveredProfileId] = useState<string | null>(null);
  const [familyMovePendingIds, setFamilyMovePendingIds] = useState<Set<string>>(() => new Set());
  const familyMoveTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const scheduleFamilyMove = useCallback(
    (profileId: string, fromGroupId: string, toGroupId: string) => {
      if (fromGroupId === toGroupId) return;

      const existing = familyMoveTimeoutsRef.current.get(profileId);
      if (existing) clearTimeout(existing);

      setFamilyMovePendingIds((prev) => new Set(prev).add(profileId));

      const t = setTimeout(() => {
        familyMoveTimeoutsRef.current.delete(profileId);
        setDraftGroups((prev) => moveProfileToFamily(prev, profileId, fromGroupId, toGroupId));
        setFamilyMovePendingIds((prev) => {
          const next = new Set(prev);
          next.delete(profileId);
          return next;
        });
      }, FAMILY_MOVE_DELAY_MS);

      familyMoveTimeoutsRef.current.set(profileId, t);
    },
    [],
  );

  useEffect(() => {
    return () => {
      familyMoveTimeoutsRef.current.forEach((id) => clearTimeout(id));
      familyMoveTimeoutsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!addMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [addMenuOpen]);

  const unassignedCount = useMemo(() => {
    const u = draftGroups.find((g) => g.id === UNASSIGNED_GROUP_ID);
    return u?.profiles.length ?? 0;
  }, [draftGroups]);

  const displayGroups = useMemo(() => {
    const f = filterGroupsForSearch(draftGroups, search);
    const sorted = sortGroups(f, sort);
    return pinUnassignedFirst(sorted);
  }, [draftGroups, search, sort]);

  /** First row “-Select-” moves profile to Unassigned; other families A–Z (no duplicate Unassigned). */
  const familyDropdownOptions = useMemo(() => {
    const assignedFamilies = draftGroups
      .filter((g) => g.id !== UNASSIGNED_GROUP_ID)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((g) => ({ value: g.id, label: g.name }));
    return [{ value: UNASSIGNED_GROUP_ID, label: '-Select-' }, ...assignedFamilies];
  }, [draftGroups]);

  const updateProfile = (profileId: string, patch: Partial<JobProfile>) => {
    setDraftGroups((prev) =>
      prev.map((g) => ({
        ...g,
        profiles: g.profiles.map((p) => (p.id === profileId ? { ...p, ...patch } : p)),
      })),
    );
  };

  const renameGroup = (groupId: string, name: string) => {
    setDraftGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, name: name.trim() || g.name } : g)),
    );
  };

  const archiveProfile = (profileId: string) => {
    setDraftGroups((prev) =>
      prev.map((g) => ({ ...g, profiles: g.profiles.filter((p) => p.id !== profileId) })),
    );
  };

  const handleUndo = () => {
    setDraftGroups(structuredClone(initialSnapshot));
  };

  const handleSave = () => {
    if (fromAiOnboarding) {
      navigate('/settings/job-profiles/add-descriptions', { state: { fromAiOnboarding: true } });
    } else {
      navigate('/settings', { state: { activeNav: 'job-organization' } });
    }
  };

  const startEditName = (g: JobProfileGroup) => {
    setEditingGroupId(g.id);
    setEditingName(g.name);
  };

  const commitEditName = () => {
    if (editingGroupId) renameGroup(editingGroupId, editingName);
    setEditingGroupId(null);
  };

  return (
    <div className="min-h-full flex flex-col shrink-0 pb-10">
      <div className="px-8 pt-8 pb-4">
        <button
          type="button"
          onClick={() => navigate('/settings', { state: { activeNav: 'job-organization' } })}
          className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)] transition-colors"
        >
          <Icon name="chevron-left" size={16} className="text-[var(--icon-neutral-strong)]" />
          Back to Job Profiles
        </button>
      </div>

      {fromAiOnboarding && (
        <div className="px-8 pb-5">
          <AiOnboardingStepTracker
            currentStep={1}
            steps={['Organize Job Families', 'Add Job Descriptions', 'Build Competencies']}
          />
        </div>
      )}

      <div className="px-8 pb-6">
        <h1
          className="text-[44px] font-bold leading-[52px] text-[var(--color-primary-strong)] mb-0"
          style={{ fontFamily: 'Fields, system-ui, sans-serif' }}
        >
          Organize Job Families
        </h1>
      </div>

      <div className="px-8 pb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div className="relative shrink-0" ref={addMenuRef}>
            <button
              type="button"
              onClick={() => setAddMenuOpen((o) => !o)}
              aria-expanded={addMenuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-[var(--space-xs)] px-[var(--space-s)] py-[var(--space-xs)] text-[14px] font-medium text-[var(--text-neutral-strong)] border border-[var(--border-neutral-weak)] rounded-full hover:bg-[var(--surface-neutral-x-weak)] transition-colors"
            >
              Add New
              <Icon
                name="caret-down"
                size={12}
                className={`text-[var(--icon-neutral-strong)] transition-transform ${addMenuOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {addMenuOpen && (
              <div
                role="menu"
                className="absolute left-0 z-50 mt-2 min-w-[220px] rounded-[var(--radius-small)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] py-1 shadow-lg"
                style={{ boxShadow: 'var(--shadow-300)' }}
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full px-4 py-2.5 text-left text-[15px] text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)]"
                  onClick={() => {
                    setAddMenuOpen(false);
                    setDraftGroups((g) => addNewFamily(g));
                  }}
                >
                  Add New Job Family
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full px-4 py-2.5 text-left text-[15px] text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)]"
                  onClick={() => {
                    setAddMenuOpen(false);
                    navigate('/settings/job-profile/new');
                  }}
                >
                  Add New Job Profile
                </button>
              </div>
            )}
          </div>

          <TextInput
            value={search}
            onChange={setSearch}
            placeholder="Search families or job profiles…"
            icon="magnifying-glass"
            className="min-w-[200px] max-w-[320px] flex-1"
          />

          <label className="flex items-center gap-2 shrink-0 text-[14px] text-[var(--text-neutral-strong)]">
            <span className="font-medium whitespace-nowrap">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKind)}
              className="h-10 rounded-[var(--radius-xx-small)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] px-3 text-[15px] text-[var(--text-neutral-strong)]"
            >
              <option value="az">A to Z</option>
              <option value="za">Z to A</option>
              <option value="largest">Largest</option>
              <option value="smallest">Smallest</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setDraftGroups((g) => autoGroupUnassigned(g))}
            disabled={unassignedCount === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-full)] px-5 text-[14px] font-semibold leading-[22px] transition-opacity disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:opacity-90"
            style={{
              color: AI_ACTION_TEAL,
              background:
                'linear-gradient(var(--surface-neutral-white), var(--surface-neutral-white)) padding-box, linear-gradient(90deg, #b5dfc8 0%, #f3d9a8 100%) border-box',
              border: '1px solid transparent',
              boxShadow: 'var(--shadow-100)',
            }}
          >
            <Icon name="sparkles" size={16} style={{ color: AI_ACTION_TEAL }} aria-hidden />
            Auto-Group ({unassignedCount})
          </button>
          {fromAiOnboarding ? (
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-10 items-center justify-center rounded-[var(--radius-full)] px-5 text-[14px] font-semibold bg-[var(--color-primary-strong)] text-white hover:opacity-95 transition-opacity"
            >
              Save and Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-10 items-center justify-center rounded-[var(--radius-full)] px-5 text-[14px] font-semibold bg-[var(--color-primary-strong)] text-white hover:opacity-95 transition-opacity"
            >
              Save Changes
            </button>
          )}
          <button
            type="button"
            onClick={handleUndo}
            className="px-4 py-2 rounded-full text-[14px] font-medium border border-[var(--border-neutral-weak)] text-[var(--text-neutral-strong)] hover:bg-[var(--surface-neutral-x-weak)] transition-colors"
          >
            Undo Changes
          </button>
        </div>
      </div>

      <div className="px-8 flex flex-col gap-[42px]">
        {displayGroups.length === 0 && (
          <p className="text-[15px] text-[var(--text-neutral-medium)] py-8">
            No job families match your search.
          </p>
        )}
        {displayGroups.map((group) => (
          <div
            key={group.id}
            className="rounded-[var(--radius-medium)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] overflow-hidden"
            style={{ boxShadow: '2px 2px 0px 2px rgba(56, 49, 47, 0.05)' }}
          >
            <div className="flex items-center justify-between gap-4 px-[var(--space-m)] py-[var(--space-m)] border-b border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-x-weak)]">
              {editingGroupId === group.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={commitEditName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEditName();
                    if (e.key === 'Escape') setEditingGroupId(null);
                  }}
                  className="flex-1 min-w-0 text-[16px] font-semibold text-[var(--text-neutral-strong)] border border-[var(--border-neutral-medium)] rounded-[var(--radius-xx-small)] px-3 py-1.5 bg-[var(--surface-neutral-white)]"
                />
              ) : (
                <h2 className="text-[16px] font-semibold text-[var(--text-neutral-strong)] min-w-0 truncate">
                  {group.name}
                </h2>
              )}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  aria-label="Edit job family name"
                  onClick={() => startEditName(group)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--icon-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)] transition-colors"
                >
                  <Icon name="pen-to-square" size={16} />
                </button>
                {group.id !== UNASSIGNED_GROUP_ID && (
                  <button
                    type="button"
                    aria-label="Delete job family"
                    onClick={() => setDraftGroups((g) => deleteFamilyMoveToUnassigned(g, group.id))}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--icon-neutral-strong)] hover:bg-[var(--surface-neutral-xx-weak)] transition-colors"
                  >
                    <Icon name="trash-can" size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[880px]">
                <thead>
                  <tr>
                    <th className="text-left px-[var(--space-m)] py-[var(--space-s)] text-[14px] font-semibold text-[var(--text-neutral-strong)]">
                      Job Profile
                    </th>
                    <th className="text-left px-[var(--space-m)] py-[var(--space-s)] text-[14px] font-semibold text-[var(--text-neutral-strong)] w-[100px]">
                      People
                    </th>
                    <th className="text-left px-[var(--space-m)] py-[var(--space-s)] text-[14px] font-semibold text-[var(--text-neutral-strong)] min-w-[220px]">
                      Job family
                    </th>
                    <th className="text-left px-[var(--space-m)] py-[var(--space-s)] text-[14px] font-semibold text-[var(--text-neutral-strong)] min-w-[200px]">
                      Career track
                    </th>
                    <th className="text-left px-[var(--space-m)] py-[var(--space-s)] text-[14px] font-semibold text-[var(--text-neutral-strong)] min-w-[120px]">
                      Level
                    </th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {group.profiles.map((profile) => {
                    const { track, level } = parseCareerTrackLevel(profile.careerTrackLevel);
                    return (
                      <tr
                        key={profile.id}
                        className={`border-t border-[var(--border-neutral-x-weak)] transition-opacity duration-200 ${
                          familyMovePendingIds.has(profile.id) ? 'opacity-60' : ''
                        }`}
                        aria-busy={familyMovePendingIds.has(profile.id)}
                        onMouseEnter={() => setHoveredProfileId(profile.id)}
                        onMouseLeave={() => setHoveredProfileId(null)}
                      >
                        <td className="px-[var(--space-m)] py-[var(--space-m)] align-top text-[15px] text-[var(--text-neutral-strong)]">
                          {profile.name}
                        </td>
                        <td className="px-[var(--space-m)] py-[var(--space-m)] align-top text-[15px]">
                          {profile.people > 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPeopleModal({
                                  jobFamilyName: group.name,
                                  jobProfileName: profile.name,
                                  peopleCount: profile.people,
                                })
                              }
                              className="text-[var(--color-link)] hover:underline"
                            >
                              {profile.people}
                            </button>
                          ) : (
                            <span className="text-[var(--text-neutral-x-strong)]">{profile.people}</span>
                          )}
                        </td>
                        <td className="px-[var(--space-m)] py-3 align-top">
                          <FormDropdown
                            options={familyDropdownOptions}
                            value={group.id}
                            placeholder="-Select-"
                            disabled={familyMovePendingIds.has(profile.id)}
                            onChange={(toGroupId) =>
                              scheduleFamilyMove(profile.id, group.id, toGroupId)
                            }
                            className="!min-w-0 max-w-[280px]"
                          />
                          {familyMovePendingIds.has(profile.id) && (
                            <p
                              className="mt-1.5 text-[12px] font-medium text-[var(--text-neutral-medium)]"
                              role="status"
                              aria-live="polite"
                            >
                              Updating job family…
                            </p>
                          )}
                        </td>
                        <td className="px-[var(--space-m)] py-3 align-top">
                          <FormDropdown
                            options={careerOpts}
                            value={track}
                            placeholder="-Select-"
                            onChange={(v) =>
                              updateProfile(profile.id, {
                                careerTrackLevel: buildCareerTrackLevel(v, level),
                              })
                            }
                            className="!min-w-0"
                          />
                        </td>
                        <td className="px-[var(--space-m)] py-3 align-top">
                          <FormDropdown
                            options={levelOpts}
                            value={level}
                            placeholder="-Select-"
                            onChange={(v) =>
                              updateProfile(profile.id, {
                                careerTrackLevel: buildCareerTrackLevel(track, v),
                              })
                            }
                            className="!min-w-0"
                          />
                        </td>
                        <td className="px-2 py-3 align-top">
                          {profile.people === 0 && (
                            <button
                              type="button"
                              aria-label={`Archive ${profile.name}`}
                              onClick={() => archiveProfile(profile.id)}
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-[var(--icon-neutral-medium)] hover:bg-[var(--surface-neutral-xx-weak)] hover:text-[var(--icon-neutral-strong)] transition-all ${
                                hoveredProfileId === profile.id ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              <Icon name="box-archive" size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

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

export default OrganizeJobFamilies;

export function OrganizeJobFamiliesPage() {
  return <OrganizeJobFamilies />;
}
