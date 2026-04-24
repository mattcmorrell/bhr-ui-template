import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button } from '../../components';
import { AiOnboardingStepTracker } from '../../components/AiOnboardingStepTracker/AiOnboardingStepTracker';
import { jobProfileGroups, careerTrackOptions, type JobProfile, type JobProfileGroup } from '../../data/settingsData';
import {
  readExtraJobProfiles,
  upsertExtraJobProfile,
  findExtraJobProfileById,
} from '../../data/extraJobProfilesStorage';
import { bucketJobProfilesToGroups, UNASSIGNED_GROUP_ID } from '../../data/jobProfileGrouping';
import { buildMockJobDescriptionDraft } from '../JobProfileDetail/buildMockJobDescriptionDraft';

const AI_ACTION_TEAL = '#005b7f';
const AI_PRIMARY_GRADIENT =
  'linear-gradient(135deg, #0c5d6b 0%, #0f6b7a 42%, #127d8f 100%)';

const TRACK_LABEL: Record<string, string> = Object.fromEntries(
  careerTrackOptions.map((o) => [o.value, o.label]),
);
const TRACK_ORDER = ['P', 'T', 'S', 'M', 'E'];

function sortByLevel(profiles: JobProfile[]): JobProfile[] {
  return [...profiles].sort((a, b) => {
    const la = parseInt(a.careerTrackLevel?.slice(1) ?? '0', 10);
    const lb = parseInt(b.careerTrackLevel?.slice(1) ?? '0', 10);
    return la - lb;
  });
}

function groupByTrack(profiles: JobProfile[]): Array<{ letter: string; profiles: JobProfile[] }> {
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

const AI_JOB_DESC_PHASES = [
  'Comparing similar roles',
  'Looking at related job families',
  'Cross-checking tone',
] as const;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function AddJobDescriptions() {
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

  const [descriptions, setDescriptions] = useState<Record<string, string>>(() => {
    const result: Record<string, string> = {};
    const extraById = Object.fromEntries(readExtraJobProfiles().map((e) => [e.id, e]));
    for (const group of jobProfileGroups) {
      for (const profile of group.profiles) {
        const desc =
          extraById[profile.id]?.jobDescription ?? profile.jobDescription ?? '';
        if (desc) result[profile.id] = desc;
      }
    }
    return result;
  });

  // Per-profile generating phase label (null / absent = not generating)
  const [generatingPhases, setGeneratingPhases] = useState<Record<string, string | null>>({});
  const inFlightRef = useRef<Set<string>>(new Set());

  const generateForProfile = useCallback(async (profile: JobProfile, familyName: string) => {
    if (inFlightRef.current.has(profile.id)) return;
    inFlightRef.current.add(profile.id);

    for (const msg of AI_JOB_DESC_PHASES) {
      setGeneratingPhases((prev) => ({ ...prev, [profile.id]: msg }));
      await delay(420);
    }

    const draft = buildMockJobDescriptionDraft({
      jobTitle: profile.name,
      jobFamilyLabel: familyName !== 'Unassigned' ? familyName : undefined,
      careerTrackLabel: profile.careerTrackLevel || undefined,
    });

    setDescriptions((prev) => ({ ...prev, [profile.id]: draft }));
    setGeneratingPhases((prev) => {
      const next = { ...prev };
      delete next[profile.id];
      return next;
    });
    inFlightRef.current.delete(profile.id);
  }, []);

  const handleFillAll = useCallback(() => {
    for (const group of allGroups) {
      for (const profile of group.profiles) {
        if (!descriptions[profile.id]) {
          void generateForProfile(profile, group.name);
        }
      }
    }
  }, [allGroups, descriptions, generateForProfile]);

  const handleSave = () => {
    for (const group of allGroups) {
      for (const profile of group.profiles) {
        const desc = descriptions[profile.id];
        if (desc?.trim()) {
          const existing = findExtraJobProfileById(profile.id);
          upsertExtraJobProfile({ ...(existing ?? profile), jobDescription: desc });
        }
      }
    }
    navigate('/settings/job-profiles/build-competencies');
  };

  const isAnyGenerating = Object.keys(generatingPhases).length > 0;

  const emptyCount = allGroups.reduce(
    (acc, g) =>
      acc +
      g.profiles.filter((p) => !descriptions[p.id] && !generatingPhases[p.id]).length,
    0,
  );

  const filledGroups = allGroups.filter((g) => g.profiles.length > 0);

  return (
    <div className="min-h-full flex flex-col shrink-0 pb-10">
      {/* Back */}
      <div className="px-8 pt-8 pb-4">
        <button
          type="button"
          onClick={() =>
            navigate('/settings/job-profiles/organize', { state: { fromAiOnboarding: true } })
          }
          className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)] transition-colors"
        >
          <Icon name="chevron-left" size={16} className="text-[var(--icon-neutral-strong)]" />
          Back to Organize Job Families
        </button>
      </div>

      {/* Step tracker */}
      <div className="px-8 pb-5">
        <AiOnboardingStepTracker
          currentStep={2}
          steps={['Organize Job Families', 'Add Job Descriptions', 'Build Competencies']}
        />
      </div>

      {/* Title */}
      <div className="px-8 pb-6">
        <h1
          className="text-[44px] font-bold leading-[52px] text-[var(--color-primary-strong)] mb-0"
          style={{ fontFamily: 'Fields, system-ui, sans-serif' }}
        >
          Add Job Descriptions
        </h1>
        <p className="mt-2 text-[15px] text-[var(--text-neutral-medium)]">
          Add a description for each job profile. We'll use the job title, family, and career
          track &amp; level to draft one for you.
        </p>
      </div>

      {/* Action bar */}
      <div className="px-8 pb-6 flex items-center justify-end gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleFillAll}
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
            Fill All with AI{emptyCount > 0 ? ` (${emptyCount})` : ''}
          </button>
          <Button variant="primary" size="medium" disabled={isAnyGenerating} onClick={handleSave}>
            Save and Continue
          </Button>
        </div>
      </div>

      {/* Profile list */}
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
            generatingPhases={generatingPhases}
            onDescriptionChange={(profileId, val) =>
              setDescriptions((prev) => ({ ...prev, [profileId]: val }))
            }
            onGenerate={(profile) => generateForProfile(profile, group.name)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── FamilySection ────────────────────────────────────────────────────────────

interface FamilySectionProps {
  group: JobProfileGroup;
  descriptions: Record<string, string>;
  generatingPhases: Record<string, string | null>;
  onDescriptionChange: (profileId: string, val: string) => void;
  onGenerate: (profile: JobProfile) => void;
}

function FamilySection({
  group,
  descriptions,
  generatingPhases,
  onDescriptionChange,
  onGenerate,
}: FamilySectionProps) {
  const sortedProfiles = groupByTrack(group.profiles).flatMap((t) => t.profiles);

  return (
    <div>
      {/* Family section header */}
      <div className="flex items-end justify-between gap-3 pb-3 mb-4 border-b border-[var(--border-neutral-x-weak)]">
        <h2
          className="text-[22px] font-semibold leading-[30px] text-[var(--color-primary-strong)]"
          style={{ fontFamily: 'Fields, system-ui, sans-serif' }}
        >
          {group.id === UNASSIGNED_GROUP_ID ? 'Unassigned' : group.name}
        </h2>
        <span className="text-[14px] text-[var(--text-neutral-medium)] leading-[30px]">
          {group.profiles.length} profile{group.profiles.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cards — max 3 per row */}
      <div className="grid grid-cols-3 gap-4">
        {sortedProfiles.map((profile) => (
          <ProfileDescriptionCard
            key={profile.id}
            profile={profile}
            description={descriptions[profile.id] ?? ''}
            generatingPhase={generatingPhases[profile.id] ?? null}
            onDescriptionChange={(val) => onDescriptionChange(profile.id, val)}
            onGenerate={() => onGenerate(profile)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── ProfileDescriptionCard ───────────────────────────────────────────────────

interface ProfileDescriptionCardProps {
  profile: JobProfile;
  description: string;
  generatingPhase: string | null;
  onDescriptionChange: (val: string) => void;
  onGenerate: () => void;
}

function ProfileDescriptionCard({
  profile,
  description,
  generatingPhase,
  onDescriptionChange,
  onGenerate,
}: ProfileDescriptionCardProps) {
  const isGenerating = generatingPhase !== null;

  return (
    <article
      className="flex flex-col rounded-[var(--radius-medium)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(56, 49, 47, 0.08), 0 1px 2px rgba(56, 49, 47, 0.04)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <p className="text-[15px] font-semibold text-[var(--text-neutral-strong)] leading-[22px]">
          {profile.name}
        </p>
        {profile.careerTrackLevel && (
          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--surface-neutral-x-weak)] text-[var(--text-neutral-medium)]">
            {profile.careerTrackLevel}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="px-4 pb-4 flex-1 flex flex-col">
        {isGenerating ? (
          <div className="flex items-center gap-2 flex-1 min-h-[200px] px-3 py-2.5 rounded-[var(--radius-xx-small)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-xx-weak)] text-[15px] leading-[22px] text-[var(--text-neutral-medium)]">
            <Icon
              name="sparkles"
              size={16}
              style={{ color: AI_ACTION_TEAL }}
              className="shrink-0 animate-pulse"
            />
            <span className="animate-pulse">{generatingPhase}…</span>
          </div>
        ) : (
          <div className="relative flex-1">
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe the responsibilities, expectations, and context for this role…"
              rows={12}
              className="w-full text-[15px] text-[var(--text-neutral-strong)] leading-[22px] px-3 pt-2.5 pb-10 rounded-[var(--radius-xx-small)] border border-[var(--border-neutral-x-weak)] bg-[var(--surface-neutral-white)] placeholder:text-[var(--text-neutral-weak)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-medium)] focus:ring-offset-1 resize-none transition-colors"
            />
            <button
              type="button"
              onClick={onGenerate}
              className="absolute bottom-2 right-2 inline-flex items-center gap-2 h-8 px-4 rounded-[var(--radius-full)] text-[15px] font-semibold leading-[22px] transition-opacity hover:opacity-80"
              style={{
                color: AI_ACTION_TEAL,
                background:
                  'linear-gradient(var(--surface-neutral-white), var(--surface-neutral-white)) padding-box, linear-gradient(90deg, #b5dfc8 0%, #f3d9a8 100%) border-box',
                border: '1px solid transparent',
                boxShadow: 'var(--shadow-100)',
              }}
            >
              <Icon name="sparkles" size={16} style={{ color: AI_ACTION_TEAL }} aria-hidden />
              {description ? 'Regenerate' : 'Write it for me'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function AddJobDescriptionsPage() {
  return <AddJobDescriptions />;
}

export default AddJobDescriptions;
