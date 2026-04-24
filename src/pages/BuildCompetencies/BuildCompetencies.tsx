import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button, CompetencyEditModal, type CompetencyFormValues } from '../../components';
import { AiOnboardingStepTracker } from '../../components/AiOnboardingStepTracker/AiOnboardingStepTracker';
import {
  jobProfileGroups,
  careerTrackOptions,
  type JobProfile,
  type JobProfileGroup,
  type JobProfileCompetency,
} from '../../data/settingsData';
import {
  readExtraJobProfiles,
  upsertExtraJobProfile,
  findExtraJobProfileById,
} from '../../data/extraJobProfilesStorage';
import { bucketJobProfilesToGroups, UNASSIGNED_GROUP_ID } from '../../data/jobProfileGrouping';

const AI_ACTION_TEAL = '#005b7f';

// Track letter → full display label, e.g. { P: 'Professional (P)', M: 'Management/People Leader (M)' }
const TRACK_LABEL: Record<string, string> = Object.fromEntries(
  careerTrackOptions.map((o) => [o.value, o.label]),
);

// IC tracks first, leadership last
const TRACK_ORDER = ['P', 'T', 'S', 'M', 'E'];

function newCompetencyId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function buildMockSuggestedCompetencies(jobTitle: string): JobProfileCompetency[] {
  const role = jobTitle.trim();
  const analysisDefinition = role
    ? `The ability to evaluate information and tradeoffs relevant to ${role} in order to recommend options and surface risks.`
    : 'The ability to evaluate information, explain tradeoffs, and surface risks in order to recommend sound options and improve decisions.';
  return [
    {
      id: `ai-${newCompetencyId()}`,
      name: 'Communication',
      description:
        'The ability to clearly convey information and ideas to ensure mutual understanding and effective collaboration.',
      level: 'Intermediate',
    },
    {
      id: `ai-${newCompetencyId()}`,
      name: 'Collaboration',
      description:
        'The ability to share relevant information, seek input when needed, and contribute to shared goals in order to support dependable team delivery.',
      level: 'Basic',
    },
    {
      id: `ai-${newCompetencyId()}`,
      name: 'Analysis',
      description: analysisDefinition,
      level: 'Advanced',
    },
    {
      id: `ai-${newCompetencyId()}`,
      name: 'Influence',
      description:
        'The ability to align cross-functional stakeholders, address resistance, and resolve blockers in order to advance priorities in complex situations.',
      level: 'Expert',
    },
  ];
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function sortByLevel(profiles: JobProfile[]): JobProfile[] {
  return [...profiles].sort((a, b) => {
    const la = parseInt(a.careerTrackLevel?.slice(1) ?? '0', 10);
    const lb = parseInt(b.careerTrackLevel?.slice(1) ?? '0', 10);
    return la - lb;
  });
}

function groupByTrack(
  profiles: JobProfile[],
): Array<{ letter: string; profiles: JobProfile[] }> {
  const map = new Map<string, JobProfile[]>();
  for (const p of profiles) {
    const letter = (p.careerTrackLevel?.[0] ?? '?').toUpperCase();
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter)!.push(p);
  }
  const ordered = TRACK_ORDER.filter((l) => map.has(l)).map((l) => ({
    letter: l,
    profiles: sortByLevel(map.get(l)!),
  }));
  const rest = [...map.keys()]
    .filter((l) => !TRACK_ORDER.includes(l))
    .map((l) => ({ letter: l, profiles: sortByLevel(map.get(l)!) }));
  return [...ordered, ...rest];
}

export function BuildCompetencies() {
  const navigate = useNavigate();

  const allGroups = useMemo(
    () =>
      bucketJobProfilesToGroups(
        jobProfileGroups,
        readExtraJobProfiles(),
        new Set<string>(),
        {},
        'current',
      ),
    [],
  );

  // Job descriptions (read-only context), sourced from storage or static data
  const descriptions = useMemo(() => {
    const extraById = Object.fromEntries(readExtraJobProfiles().map((e) => [e.id, e]));
    const result: Record<string, string> = {};
    for (const group of allGroups) {
      for (const profile of group.profiles) {
        const desc = extraById[profile.id]?.jobDescription ?? profile.jobDescription ?? '';
        if (desc) result[profile.id] = desc;
      }
    }
    return result;
  }, [allGroups]);

  // Accepted competencies per profile (initialized from storage)
  const [accepted, setAccepted] = useState<Record<string, JobProfileCompetency[]>>(() => {
    const result: Record<string, JobProfileCompetency[]> = {};
    const extraById = Object.fromEntries(readExtraJobProfiles().map((e) => [e.id, e]));
    for (const group of jobProfileGroups) {
      for (const profile of group.profiles) {
        const competencies = extraById[profile.id]?.competencies ?? profile.competencies;
        if (competencies && competencies.length > 0) {
          result[profile.id] = competencies;
        }
      }
    }
    return result;
  });

  const [pending, setPending] = useState<Record<string, JobProfileCompetency[]>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [addModalProfileId, setAddModalProfileId] = useState<string | null>(null);
  const inFlightRef = useRef<Set<string>>(new Set());

  const generateForProfile = useCallback(async (profile: JobProfile) => {
    if (inFlightRef.current.has(profile.id)) return;
    inFlightRef.current.add(profile.id);
    setGenerating((prev) => ({ ...prev, [profile.id]: true }));
    await delay(1400);
    const suggestions = buildMockSuggestedCompetencies(profile.name);
    setPending((prev) => ({ ...prev, [profile.id]: suggestions }));
    setGenerating((prev) => {
      const next = { ...prev };
      delete next[profile.id];
      return next;
    });
    inFlightRef.current.delete(profile.id);
  }, []);

  const handleSuggestAll = useCallback(() => {
    for (const group of allGroups) {
      for (const profile of group.profiles) {
        const hasContent =
          (accepted[profile.id]?.length ?? 0) > 0 ||
          (pending[profile.id]?.length ?? 0) > 0;
        if (!hasContent && !generating[profile.id]) {
          void generateForProfile(profile);
        }
      }
    }
  }, [allGroups, accepted, pending, generating, generateForProfile]);

  const acceptCompetency = useCallback(
    (profileId: string, competency: JobProfileCompetency) => {
      setAccepted((prev) => ({
        ...prev,
        [profileId]: [
          ...(prev[profileId] ?? []),
          { ...competency, id: newCompetencyId() },
        ],
      }));
      setPending((prev) => ({
        ...prev,
        [profileId]: (prev[profileId] ?? []).filter((c) => c.id !== competency.id),
      }));
    },
    [],
  );

  const rejectCompetency = useCallback(
    (profileId: string, competency: JobProfileCompetency) => {
      setPending((prev) => ({
        ...prev,
        [profileId]: (prev[profileId] ?? []).filter((c) => c.id !== competency.id),
      }));
    },
    [],
  );

  const removeAccepted = useCallback((profileId: string, competencyId: string) => {
    setAccepted((prev) => ({
      ...prev,
      [profileId]: (prev[profileId] ?? []).filter((c) => c.id !== competencyId),
    }));
  }, []);

  const addCompetency = useCallback((profileId: string, values: CompetencyFormValues) => {
    setAccepted((prev) => ({
      ...prev,
      [profileId]: [...(prev[profileId] ?? []), { id: newCompetencyId(), ...values }],
    }));
  }, []);

  const acceptAllForFamily = useCallback(
    (group: JobProfileGroup) => {
      setAccepted((prevAccepted) => {
        const next = { ...prevAccepted };
        for (const profile of group.profiles) {
          const profilePending = pending[profile.id];
          if (!profilePending?.length) continue;
          next[profile.id] = [
            ...(prevAccepted[profile.id] ?? []),
            ...profilePending.map((c) => ({ ...c, id: newCompetencyId() })),
          ];
        }
        return next;
      });
      setPending((prev) => {
        const next = { ...prev };
        for (const profile of group.profiles) {
          if (prev[profile.id]?.length) next[profile.id] = [];
        }
        return next;
      });
    },
    [pending],
  );

  const handleSave = () => {
    for (const group of allGroups) {
      for (const profile of group.profiles) {
        const competencies = accepted[profile.id];
        if (competencies && competencies.length > 0) {
          const existing = findExtraJobProfileById(profile.id);
          upsertExtraJobProfile({ ...(existing ?? profile), competencies });
        }
      }
    }
    try {
      sessionStorage.setItem('bhr-wizard-complete', '1');
    } catch {
      /* ignore */
    }
    navigate('/settings', { state: { activeNav: 'job-organization' } });
  };

  const isAnyGenerating = Object.keys(generating).length > 0;

  const emptyCount = allGroups.reduce(
    (acc, g) =>
      acc +
      g.profiles.filter(
        (p) =>
          (accepted[p.id]?.length ?? 0) === 0 &&
          (pending[p.id]?.length ?? 0) === 0 &&
          !generating[p.id],
      ).length,
    0,
  );

  const filledGroups = allGroups.filter((g) => g.profiles.length > 0);

  const addModalProfile = addModalProfileId
    ? filledGroups.flatMap((g) => g.profiles).find((p) => p.id === addModalProfileId) ?? null
    : null;

  return (
    <div className="min-h-full flex flex-col shrink-0 pb-10">
      {/* Back */}
      <div className="px-8 pt-8 pb-4">
        <button
          type="button"
          onClick={() => navigate('/settings/job-profiles/add-descriptions')}
          className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)] transition-colors"
        >
          <Icon name="chevron-left" size={16} className="text-[var(--icon-neutral-strong)]" />
          Back to Add Job Descriptions
        </button>
      </div>

      {/* Step tracker */}
      <div className="px-8 pb-5">
        <AiOnboardingStepTracker
          currentStep={3}
          steps={['Organize Job Families', 'Add Job Descriptions', 'Build Competencies']}
        />
      </div>

      {/* Title */}
      <div className="px-8 pb-6">
        <h1
          className="text-[44px] font-bold leading-[52px] text-[var(--color-primary-strong)] mb-0"
          style={{ fontFamily: 'Fields, system-ui, sans-serif' }}
        >
          Build Competencies
        </h1>
        <p className="mt-2 text-[15px] text-[var(--text-neutral-medium)] max-w-[640px]">
          Add competencies to each job profile. Compare levels within a family side by side, accept
          AI suggestions, or open the Full Editor for more control.
        </p>
      </div>

      {/* Action bar */}
      <div className="px-8 pb-6 flex items-center justify-end gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleSuggestAll}
            disabled={emptyCount === 0 || isAnyGenerating}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-full)] px-5 text-[15px] font-semibold leading-[22px] transition-opacity disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:opacity-90"
            style={{
              color: AI_ACTION_TEAL,
              background:
                'linear-gradient(var(--surface-neutral-white), var(--surface-neutral-white)) padding-box, linear-gradient(90deg, #b5dfc8 0%, #f3d9a8 100%) border-box',
              border: '1px solid transparent',
              boxShadow: 'var(--shadow-100)',
            }}
          >
            <Icon name="sparkles" size={16} style={{ color: AI_ACTION_TEAL }} aria-hidden />
            Suggest All with AI{emptyCount > 0 ? ` (${emptyCount})` : ''}
          </button>
          <Button variant="primary" size="medium" disabled={isAnyGenerating} onClick={handleSave}>
            Save and Continue
          </Button>
        </div>
      </div>

      {/* Family sections */}
      <div className="px-8 flex flex-col gap-[42px]">
        {filledGroups.length === 0 && (
          <p className="text-[15px] text-[var(--text-neutral-medium)] py-8">
            No job profiles found.
          </p>
        )}
        {filledGroups.map((group) => (
          <FamilySection
            key={group.id}
            group={group}
            descriptions={descriptions}
            accepted={accepted}
            pending={pending}
            generating={generating}
            onGenerate={(profile) => generateForProfile(profile)}
            onAccept={(profileId, c) => acceptCompetency(profileId, c)}
            onReject={(profileId, c) => rejectCompetency(profileId, c)}
            onRemove={(profileId, id) => removeAccepted(profileId, id)}
            onAdd={(profileId) => setAddModalProfileId(profileId)}
            onAcceptAllFamily={() => acceptAllForFamily(group)}
            onNavigate={(path) => navigate(path)}
          />
        ))}
      </div>

      {/* Add competency modal */}
      <CompetencyEditModal
        open={addModalProfileId !== null}
        title={
          addModalProfile ? `Add competency — ${addModalProfile.name}` : 'New competency'
        }
        initial={null}
        onClose={() => setAddModalProfileId(null)}
        onSave={(values) => {
          if (addModalProfileId) addCompetency(addModalProfileId, values);
          setAddModalProfileId(null);
        }}
      />
    </div>
  );
}

// ─── FamilySection ────────────────────────────────────────────────────────────

interface FamilySectionProps {
  group: JobProfileGroup;
  descriptions: Record<string, string>;
  accepted: Record<string, JobProfileCompetency[]>;
  pending: Record<string, JobProfileCompetency[]>;
  generating: Record<string, boolean>;
  onGenerate: (profile: JobProfile) => void;
  onAccept: (profileId: string, c: JobProfileCompetency) => void;
  onReject: (profileId: string, c: JobProfileCompetency) => void;
  onRemove: (profileId: string, competencyId: string) => void;
  onAdd: (profileId: string) => void;
  onAcceptAllFamily: () => void;
  onNavigate: (path: string) => void;
}

function FamilySection({
  group,
  descriptions,
  accepted,
  pending,
  generating,
  onGenerate,
  onAccept,
  onReject,
  onRemove,
  onAdd,
  onAcceptAllFamily,
  onNavigate,
}: FamilySectionProps) {
  const trackGroups = groupByTrack(group.profiles);

  const familyPendingCount = group.profiles.reduce(
    (acc, p) => acc + (pending[p.id]?.length ?? 0),
    0,
  );

  return (
    <div>
      {/* Family heading row — matches AddJobDescriptions FamilySection style */}
      <div className="flex items-end justify-between gap-3 pb-3 mb-5 border-b border-[var(--border-neutral-x-weak)]">
        <h2
          className="text-[22px] font-semibold leading-[30px] text-[var(--color-primary-strong)]"
          style={{ fontFamily: 'Fields, system-ui, sans-serif' }}
        >
          {group.id === UNASSIGNED_GROUP_ID ? 'Unassigned' : group.name}
        </h2>
        <div className="flex items-center gap-3">
          {familyPendingCount > 0 && (
            <button
              type="button"
              onClick={onAcceptAllFamily}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold transition-opacity hover:opacity-80"
              style={{
                color: AI_ACTION_TEAL,
                background:
                  'linear-gradient(var(--surface-neutral-white), var(--surface-neutral-white)) padding-box, linear-gradient(90deg, #b5dfc8 0%, #f3d9a8 100%) border-box',
                border: '1px solid transparent',
                boxShadow: 'var(--shadow-100)',
              }}
            >
              <Icon name="check" size={12} style={{ color: AI_ACTION_TEAL }} aria-hidden />
              Accept all ({familyPendingCount})
            </button>
          )}
          <span className="text-[14px] text-[var(--text-neutral-medium)] leading-[30px]">
            {group.profiles.length} profile{group.profiles.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Track sections */}
      <div className="flex flex-col gap-6">
        {trackGroups.map(({ letter, profiles: trackProfiles }) => {
          const trackEmptyCount = trackProfiles.filter(
            (p) =>
              (accepted[p.id]?.length ?? 0) === 0 &&
              (pending[p.id]?.length ?? 0) === 0 &&
              !generating[p.id],
          ).length;
          const trackLabel = TRACK_LABEL[letter]
            ? TRACK_LABEL[letter].toUpperCase()
            : letter;

          return (
            <div key={letter}>
              {/* Track sub-header */}
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-[11px] font-semibold tracking-widest text-[var(--text-neutral-medium)] uppercase">
                  {trackLabel}
                </span>
                {trackEmptyCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      for (const profile of trackProfiles) {
                        const hasContent =
                          (accepted[profile.id]?.length ?? 0) > 0 ||
                          (pending[profile.id]?.length ?? 0) > 0;
                        if (!hasContent && !generating[profile.id]) {
                          onGenerate(profile);
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-semibold transition-opacity hover:opacity-80"
                    style={{
                      color: AI_ACTION_TEAL,
                      background:
                        'linear-gradient(var(--surface-neutral-white), var(--surface-neutral-white)) padding-box, linear-gradient(90deg, #b5dfc8 0%, #f3d9a8 100%) border-box',
                      border: '1px solid transparent',
                      boxShadow: 'var(--shadow-100)',
                    }}
                  >
                    <Icon name="sparkles" size={11} style={{ color: AI_ACTION_TEAL }} aria-hidden />
                    Suggest track ({trackEmptyCount})
                  </button>
                )}
              </div>

              {/* Horizontally scrolling card row */}
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-4 w-max">
                  {trackProfiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      jobDescription={descriptions[profile.id] ?? ''}
                      acceptedCompetencies={accepted[profile.id] ?? []}
                      pendingCompetencies={pending[profile.id] ?? []}
                      isGenerating={generating[profile.id] ?? false}
                      onGenerate={() => onGenerate(profile)}
                      onAccept={(c) => onAccept(profile.id, c)}
                      onReject={(c) => onReject(profile.id, c)}
                      onRemove={(id) => onRemove(profile.id, id)}
                      onAdd={() => onAdd(profile.id)}
                      onFullEditor={() => onNavigate(`/settings/job-profile/${profile.id}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ProfileCard ──────────────────────────────────────────────────────────────

interface ProfileCardProps {
  profile: JobProfile;
  jobDescription: string;
  acceptedCompetencies: JobProfileCompetency[];
  pendingCompetencies: JobProfileCompetency[];
  isGenerating: boolean;
  onGenerate: () => void;
  onAccept: (c: JobProfileCompetency) => void;
  onReject: (c: JobProfileCompetency) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onFullEditor: () => void;
}

function ProfileCard({
  profile,
  jobDescription,
  acceptedCompetencies,
  pendingCompetencies,
  isGenerating,
  onGenerate,
  onAccept,
  onReject,
  onRemove,
  onAdd,
  onFullEditor,
}: ProfileCardProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const hasAccepted = acceptedCompetencies.length > 0;
  const hasPending = pendingCompetencies.length > 0;
  const isEmpty = !hasAccepted && !hasPending && !isGenerating;

  return (
    <article
      className="flex flex-col w-96 shrink-0 rounded-[var(--radius-medium)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(56, 49, 47, 0.08), 0 1px 2px rgba(56, 49, 47, 0.04)' }}
    >
      {/* Header: name + level badge */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <p className="text-[14px] font-semibold text-[var(--text-neutral-strong)] leading-[20px]">
          {profile.name}
        </p>
        {profile.careerTrackLevel && (
          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--surface-neutral-x-weak)] text-[var(--text-neutral-medium)]">
            {profile.careerTrackLevel}
          </span>
        )}
      </div>

      {/* Job description (read-only context) */}
      <div className="px-4 pb-3">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-[var(--text-neutral-medium)] mb-1.5">
          Job Description
        </p>
        {jobDescription ? (
          <textarea
            readOnly
            value={jobDescription}
            rows={5}
            className="w-full text-[13px] leading-[20px] text-[var(--text-neutral-medium)] resize-none bg-transparent focus:outline-none overflow-y-auto p-0 border-0"
          />
        ) : (
          <p className="text-[13px] text-[var(--text-neutral-weak)] italic leading-[20px] min-h-[100px]">
            No description added.
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border-neutral-x-weak)] mx-4" />

      {/* Competencies section */}
      <div className="px-4 pt-3 pb-3 flex-1 flex flex-col gap-2">
        {/* Label + ADD */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-[var(--text-neutral-medium)]">
            Competencies
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="text-[12px] font-semibold text-[var(--color-link)] hover:underline"
          >
            + Add
          </button>
        </div>

        {/* Generating */}
        {isGenerating && (
          <div className="flex items-center gap-1.5 text-[13px] text-[var(--text-neutral-medium)] py-1">
            <Icon
              name="sparkles"
              size={13}
              style={{ color: AI_ACTION_TEAL }}
              className="shrink-0 animate-pulse"
            />
            <span className="animate-pulse">Suggesting competencies…</span>
          </div>
        )}

        {/* Pending AI suggestions — description shown inline for easy evaluation */}
        {hasPending && !isGenerating && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium text-[var(--text-neutral-medium)]">
              AI suggestions:
            </p>
            {pendingCompetencies.map((c) => (
              <div
                key={c.id}
                className="rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-xx-weak)] overflow-hidden"
              >
                {/* Name + level + actions */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="flex-1 text-[13px] font-medium text-[var(--text-neutral-strong)] min-w-0">
                    {c.name}
                  </span>
                  <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface-neutral-x-weak)] text-[var(--text-neutral-medium)]">
                    {c.level}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAccept(c)}
                    className="shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full hover:bg-[var(--surface-neutral-weak)] text-[var(--icon-neutral-strong)] transition-colors"
                    aria-label={`Accept ${c.name}`}
                  >
                    <Icon name="check" size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(c)}
                    className="shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full hover:bg-[var(--surface-neutral-weak)] text-[var(--icon-neutral-medium)] transition-colors"
                    aria-label={`Reject ${c.name}`}
                  >
                    <Icon name="xmark" size={12} />
                  </button>
                </div>
                {/* Description always visible for suggestions */}
                {c.description && (
                  <p className="px-3 pb-2.5 text-[12px] leading-[18px] text-[var(--text-neutral-medium)] border-t border-[var(--border-neutral-x-weak)]">
                    {c.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Accepted competencies — expandable rows */}
        {hasAccepted && (
          <div className="flex flex-col gap-1.5">
            {acceptedCompetencies.map((c) => {
              const isExpanded = expandedIds.has(c.id);
              return (
                <div
                  key={c.id}
                  className="rounded-[var(--radius-small)] border border-[var(--border-neutral-x-weak)] overflow-hidden"
                >
                  {/* Header row — click to expand */}
                  <button
                    type="button"
                    onClick={() => toggleExpanded(c.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--surface-neutral-xx-weak)] transition-colors"
                  >
                    <span className="flex-1 text-[13px] font-medium text-[var(--text-neutral-strong)] truncate min-w-0">
                      {c.name}
                    </span>
                    <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface-neutral-x-weak)] text-[var(--text-neutral-medium)]">
                      {c.level}
                    </span>
                    <Icon
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={12}
                      className="shrink-0 text-[var(--icon-neutral-medium)]"
                    />
                    {/* Remove — stopPropagation so it doesn't toggle expand */}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); onRemove(c.id); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onRemove(c.id); } }}
                      className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full text-[var(--icon-neutral-weak)] hover:text-[var(--icon-neutral-strong)] hover:bg-[var(--surface-neutral-x-weak)] transition-colors"
                      aria-label={`Remove ${c.name}`}
                    >
                      <Icon name="xmark" size={11} />
                    </span>
                  </button>

                  {/* Expanded description */}
                  {isExpanded && c.description && (
                    <p className="px-3 pb-2.5 pt-2 text-[12px] leading-[18px] text-[var(--text-neutral-medium)] border-t border-[var(--border-neutral-x-weak)]">
                      {c.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty hint */}
        {isEmpty && (
          <p className="text-[13px] text-[var(--text-neutral-weak)] italic">No competencies yet.</p>
        )}

        {/* Suggest button */}
        {!isGenerating && !hasPending && (
          <button
            type="button"
            onClick={onGenerate}
            className="mt-1 inline-flex items-center gap-1.5 self-start h-7 px-2.5 rounded-full text-[12px] font-semibold transition-opacity hover:opacity-80"
            style={{
              color: AI_ACTION_TEAL,
              background:
                'linear-gradient(var(--surface-neutral-white), var(--surface-neutral-white)) padding-box, linear-gradient(90deg, #b5dfc8 0%, #f3d9a8 100%) border-box',
              border: '1px solid transparent',
              boxShadow: 'var(--shadow-100)',
            }}
          >
            <Icon name="sparkles" size={11} style={{ color: AI_ACTION_TEAL }} aria-hidden />
            {hasAccepted ? 'Suggest more' : 'Suggest with AI'}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--border-neutral-x-weak)] px-4 py-3 flex justify-end">
        <button
          type="button"
          onClick={onFullEditor}
          className="text-[13px] font-medium text-[var(--color-link)] hover:underline"
        >
          Full Editor →
        </button>
      </div>
    </article>
  );
}

export function BuildCompetenciesPage() {
  return <BuildCompetencies />;
}

export default BuildCompetencies;
