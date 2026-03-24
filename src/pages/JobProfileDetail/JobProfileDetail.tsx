import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Icon,
  Button,
  TextInput,
  FormDropdown,
  JobTitleCatalogCombobox,
  Tabs,
  CompetencyEditModal,
  type CompetencyFormValues,
} from '../../components';
import {
  jobProfileGroups,
  jobFamilies,
  careerTrackOptions,
  levelOptions,
  type JobProfileCompetency,
} from '../../data/settingsData';
import { findExtraJobProfileById, upsertExtraJobProfile } from '../../data/extraJobProfilesStorage';
import { simulateAIDelay } from '../JobAIPrototype/mockData';
import {
  buildMockJobDescriptionDraft,
  type LinkedJobCodeEntry,
} from './buildMockJobDescriptionDraft';
import { jobTitleCatalogRows, type JobTitleCatalogRow } from '../../data/parseJobLibCsv';
import { CompetencyCard } from './CompetencyCard';
import competenciesEmptyChart from '../../assets/images/competencies-empty-chart.png';

function newCompetencyId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `c-${Date.now()}`;
}

const AI_DRAFT_HINT_TEAL = '#005b7f';

function AiDraftTitleHint() {
  return (
    <div className="flex w-full justify-end">
      <div
        className="inline-flex max-w-full items-center gap-2.5 rounded-2xl px-4 py-2.5"
        style={{
          background: 'linear-gradient(90deg, #e3f2f8 0%, #eef0fb 55%, #f5f4fc 100%)',
        }}
        role="status"
      >
        <Icon
          name="sparkles"
          size={20}
          className="shrink-0"
          style={{ color: AI_DRAFT_HINT_TEAL }}
        />
        <span
          className="text-left text-[14px] font-semibold leading-[20px] shrink text-balance"
          style={{ color: AI_DRAFT_HINT_TEAL }}
        >
          Enter a job title to generate a draft.
        </span>
      </div>
    </div>
  );
}

/** Mock AI suggestions — copy follows `.cursor/rules/competency-framework.mdc` (name, 1–2 sentence definition, one proficiency level). */
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

export function JobProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isNew = id === 'new';
  const staticProfile =
    !isNew && id ? jobProfileGroups.flatMap((g) => g.profiles).find((p) => p.id === id) : undefined;
  const extraProfile = !isNew && id ? findExtraJobProfileById(id) : undefined;
  const profile = staticProfile ?? extraProfile;

  const nestedFamilyId = profile
    ? jobProfileGroups.find((g) => g.profiles.some((p) => p.id === profile.id))?.id
    : undefined;
  const profileJobFamily = profile
    ? nestedFamilyId ??
      (profile.jobFamilyGroupId == null || profile.jobFamilyGroupId === ''
        ? ''
        : profile.jobFamilyGroupId)
    : '';

  const [jobTitle, setJobTitle] = useState(profile?.name ?? '');
  const [jobDescription, setJobDescription] = useState(profile?.jobDescription ?? '');
  const [internalJobCode, setInternalJobCode] = useState(profile?.internalJobCode ?? '');
  const [jobFamily, setJobFamily] = useState(profileJobFamily);
  const [careerTrack, setCareerTrack] = useState(
    profile?.careerTrackLevel ? profile.careerTrackLevel[0] ?? '' : ''
  );
  const [level, setLevel] = useState(
    profile?.careerTrackLevel && profile.careerTrackLevel.length > 1
      ? profile.careerTrackLevel.slice(1)
      : ''
  );

  const [linkedJobCodes, setLinkedJobCodes] = useState<LinkedJobCodeEntry[]>([]);
  const [isAiDraftLoading, setIsAiDraftLoading] = useState(false);
  const [activeCardTab, setActiveCardTab] = useState<'details' | 'competencies'>('details');

  const [competencies, setCompetencies] = useState<JobProfileCompetency[]>(
    () => profile?.competencies ?? []
  );
  const [competencyModalOpen, setCompetencyModalOpen] = useState(false);
  const [competencyModalTitle, setCompetencyModalTitle] = useState('New competency');
  const [competencyEditInitial, setCompetencyEditInitial] = useState<CompetencyFormValues | null>(
    null
  );
  const [competencyEditingId, setCompetencyEditingId] = useState<string | null>(null);
  const [competencyToDelete, setCompetencyToDelete] = useState<JobProfileCompetency | null>(null);

  const [isAiCompetenciesLoading, setIsAiCompetenciesLoading] = useState(false);
  const [pendingAiCompetencies, setPendingAiCompetencies] = useState<JobProfileCompetency[] | null>(
    null
  );

  const cardTabs = [
    { id: 'details' as const, label: 'Details' },
    { id: 'competencies' as const, label: 'Competencies' },
  ];

  const resetAiDraftUi = () => {
    setIsAiDraftLoading(false);
  };

  if (!isNew && !profile) {
    return (
      <div className="p-10">
        <p className="text-[15px] text-[var(--text-neutral-strong)]">Job profile not found</p>
        <button
          onClick={() => navigate('/settings')}
          className="mt-4 text-[14px] font-medium text-[var(--color-link)] hover:underline"
        >
          Back to Settings
        </button>
      </div>
    );
  }

  const buildCareerTrackLevel = () =>
    careerTrack && level ? `${careerTrack}${level}` : careerTrack || level || '';

  const handleSave = () => {
    const careerTrackLevel = buildCareerTrackLevel();
    const jobFamilyResolved = jobFamily.trim() === '' ? null : jobFamily;

    if (isNew) {
      const newId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `jp-${Date.now()}`;
      upsertExtraJobProfile({
        id: newId,
        name: jobTitle.trim() || 'Untitled job profile',
        careerTrackLevel,
        people: 0,
        jobDescription: jobDescription.trim() ? jobDescription : undefined,
        internalJobCode: internalJobCode.trim() ? internalJobCode : undefined,
        jobFamilyGroupId: jobFamilyResolved,
        competencies: competencies.length > 0 ? competencies : undefined,
      });
      navigate('/settings', { state: { activeNav: 'job-organization' } });
      return;
    }

    if (extraProfile) {
      upsertExtraJobProfile({
        ...extraProfile,
        name: jobTitle.trim(),
        careerTrackLevel,
        jobDescription: jobDescription.trim() ? jobDescription : undefined,
        internalJobCode: internalJobCode.trim() ? internalJobCode : undefined,
        jobFamilyGroupId: jobFamilyResolved,
        competencies: competencies.length > 0 ? competencies : undefined,
      });
      navigate('/settings', { state: { activeNav: 'job-organization' } });
      return;
    }

    navigate('/settings', { state: { activeNav: 'job-organization' } });
  };

  /** Cancel: do not save; return to Settings → Job Profiles. */
  const handleCancel = () => {
    navigate('/settings', { state: { activeNav: 'job-organization' } });
  };

  const jobFamilyLabel = jobFamilies.find((f) => f.value === jobFamily)?.label;
  const careerTrackLabel = careerTrackOptions.find((o) => o.value === careerTrack)?.label;
  const levelLabel = levelOptions.find((o) => o.value === level)?.label;

  const headerSubtitle = isNew
    ? jobTitle.trim() || 'New job profile'
    : profile
      ? profile.name
      : '';

  const handleAiAutoDraft = async () => {
    const title = jobTitle.trim();
    if (!title || isAiDraftLoading) return;
    setIsAiDraftLoading(true);
    await simulateAIDelay();
    const draft = buildMockJobDescriptionDraft({
      jobTitle: title,
      jobFamilyLabel,
      careerTrackLabel,
      levelLabel,
      linkedJobCodes,
    });
    setJobDescription(draft);
    setIsAiDraftLoading(false);
  };

  const openCreateCompetencyModal = () => {
    setCompetencyModalTitle('New competency');
    setCompetencyEditingId(null);
    setCompetencyEditInitial(null);
    setCompetencyModalOpen(true);
  };

  const openEditCompetencyModal = (c: JobProfileCompetency) => {
    setCompetencyModalTitle('Edit competency');
    setCompetencyEditingId(c.id);
    setCompetencyEditInitial({
      name: c.name,
      description: c.description,
      level: c.level,
    });
    setCompetencyModalOpen(true);
  };

  const handleCompetencyModalSave = (values: CompetencyFormValues) => {
    if (competencyEditingId) {
      setCompetencies((prev) =>
        prev.map((row) => (row.id === competencyEditingId ? { ...row, ...values } : row))
      );
    } else {
      setCompetencies((prev) => [...prev, { id: newCompetencyId(), ...values }]);
    }
  };

  const confirmRemoveCompetency = () => {
    if (!competencyToDelete) return;
    setCompetencies((prev) => prev.filter((c) => c.id !== competencyToDelete.id));
    setCompetencyToDelete(null);
  };

  const handleAiSuggestCompetencies = async () => {
    if (isAiCompetenciesLoading) return;
    setIsAiCompetenciesLoading(true);
    setPendingAiCompetencies(null);
    await simulateAIDelay();
    setPendingAiCompetencies(buildMockSuggestedCompetencies(jobTitle));
    setIsAiCompetenciesLoading(false);
  };

  const acceptSuggestedCompetency = (c: JobProfileCompetency) => {
    setCompetencies((prev) => [...prev, { ...c, id: newCompetencyId() }]);
    setPendingAiCompetencies((prevList) => {
      if (!prevList) return null;
      const next = prevList.filter((x) => x.id !== c.id);
      return next.length > 0 ? next : null;
    });
  };

  const rejectSuggestedCompetency = (c: JobProfileCompetency) => {
    setPendingAiCompetencies((prevList) => {
      if (!prevList) return null;
      const next = prevList.filter((x) => x.id !== c.id);
      return next.length > 0 ? next : null;
    });
  };

  const appendLinkedCode = (entry: LinkedJobCodeEntry) => {
    setLinkedJobCodes((prev) => {
      if (entry.source === 'bamboohr') {
        return [...prev.filter((e) => e.source !== 'bamboohr'), entry];
      }
      const exists = prev.some((e) => e.source === entry.source && e.label === entry.label);
      if (exists) return prev;
      return [...prev, entry];
    });
  };

  const removeLinkedCode = (entry: LinkedJobCodeEntry) => {
    setLinkedJobCodes((prev) =>
      prev.filter((e) => !(e.source === entry.source && e.label === entry.label))
    );
  };

  const bambooLinkedEntry = linkedJobCodes.find((e) => e.source === 'bamboohr');
  const mercerLinkedCodes = linkedJobCodes.filter((e) => e.source === 'mercer');

  const handleSelectJobTitleCatalogRow = (row: JobTitleCatalogRow) => {
    setJobTitle(row.jobTitle);
    setJobFamily(row.jobFamilyId);
    setCareerTrack(row.careerTrack);
    setLevel(row.level);
    setJobDescription(row.jobDescription);
    setLinkedJobCodes((prev) => [
      ...prev.filter((e) => e.source !== 'bamboohr'),
      { source: 'bamboohr', label: row.bambooJobCode },
    ]);
    resetAiDraftUi();
  };

  const handleAddNewJobFamily = () => {
    // In a real app, would open modal or inline form to add job family
  };

  const jobDescriptionEmpty = jobDescription.trim() === '';

  return (
    <div className="min-h-full flex flex-col shrink-0">
      {/* Breadcrumb */}
      <div className="px-8 pt-8 pb-4">
        <button
          onClick={() => navigate('/settings', { state: { activeNav: 'job-organization' } })}
          className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-neutral-medium)] hover:text-[var(--text-neutral-strong)] transition-colors"
        >
          <Icon name="chevron-left" size={16} className="text-[var(--icon-neutral-strong)]" />
          Job Profiles
        </button>
      </div>

      {/* Header: Job Profile | 20px | job title | ellipsis */}
      <div className="flex items-center justify-between px-8 pb-6">
        <div className="flex items-center" style={{ gap: '20px' }}>
          <h1
            className="text-[44px] font-bold leading-[52px] text-[var(--color-primary-strong)] mb-0"
            style={{ fontFamily: 'Fields, system-ui, sans-serif' }}
          >
            Job Profile
          </h1>
          <span
            className="text-[22px] font-medium leading-[30px] text-[var(--text-neutral-medium)]"
            style={{ fontFamily: 'Fields, system-ui, sans-serif' }}
          >
            {headerSubtitle}
          </span>
        </div>
        <button
          className="flex items-center justify-center h-10 px-4 rounded-[var(--radius-small)] border border-[var(--border-neutral-medium)] bg-[var(--surface-neutral-white)] hover:bg-[var(--surface-neutral-xx-weak)] text-[var(--icon-neutral-strong)] transition-colors"
          style={{ boxShadow: 'var(--shadow-100)' }}
          aria-label="More options"
        >
          <Icon name="ellipsis" size={20} />
        </button>
      </div>

      {/* White card: lined tabs + panel */}
      <div
        className="mx-8 mb-0 bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-x-weak)] rounded-[var(--radius-medium)] overflow-hidden"
        style={{ boxShadow: '2px 2px 0px 2px rgba(56, 49, 47, 0.05)' }}
      >
        <div className="border-b border-[var(--border-neutral-x-weak)] px-8 pt-8">
          <Tabs
            className="-mb-px"
            tabs={cardTabs}
            activeTab={activeCardTab}
            onTabChange={(id) => setActiveCardTab(id as 'details' | 'competencies')}
          />
        </div>

        {activeCardTab === 'details' && (
        <div className="p-8 pt-6">
          <div className="space-y-6">
            {/* Row 1: Job Title | 20px | Job Family */}
            <div className="flex flex-wrap items-start" style={{ gap: '20px' }}>
              <div className="w-full max-w-[400px] shrink-0">
                <JobTitleCatalogCombobox
                  className="w-full"
                  label="Job Title *"
                  value={jobTitle}
                  onChange={setJobTitle}
                  onSelectRow={handleSelectJobTitleCatalogRow}
                  rows={jobTitleCatalogRows}
                  placeholder="Job profile name"
                />
              </div>
              <div className="min-w-0 w-max max-w-[400px]">
                <FormDropdown
                  label="Job Family"
                  options={jobFamilies}
                  value={jobFamily}
                  onChange={setJobFamily}
                  placeholder="-Select-"
                  footerAction={{
                    label: 'Add New Job Family',
                    onClick: handleAddNewJobFamily,
                  }}
                />
              </div>
            </div>

            {/* Row 2: Career Track | 20px | Level */}
            <div className="flex flex-wrap items-start" style={{ gap: '20px' }}>
              <div className="min-w-0 w-max max-w-[400px]">
                <FormDropdown
                  label="Career Track"
                  options={careerTrackOptions}
                  value={careerTrack}
                  onChange={setCareerTrack}
                  placeholder="-Select-"
                />
              </div>
              <div className="min-w-0 w-max max-w-[400px]">
                <FormDropdown
                  label="Level"
                  options={levelOptions}
                  value={level}
                  onChange={setLevel}
                  placeholder="-Select-"
                />
              </div>
            </div>

            {/* Job Description — AI draft button inside field; hint below when no title */}
            <div className="flex flex-col gap-2 w-full max-w-[1100px]">
              <label
                htmlFor="job-profile-description"
                className="text-[14px] font-medium leading-[20px] text-[var(--text-neutral-x-strong)]"
              >
                Job Description
              </label>
              <div
                className="relative flex items-start bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-medium)] rounded-[var(--radius-xx-small)]"
                style={{ boxShadow: 'var(--shadow-100)' }}
              >
                <textarea
                  id="job-profile-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Add your job description here..."
                  aria-busy={isAiDraftLoading}
                  className="flex-1 w-full min-h-[200px] md:min-h-[240px] pl-4 pr-4 pt-[9px] pb-14 bg-transparent text-[15px] leading-[22px] text-[var(--text-neutral-strong)] placeholder:text-[var(--text-neutral-weak)] outline-none resize-none"
                />
                <div className="absolute bottom-3 right-3">
                  <Button
                    type="button"
                    variant="outlined"
                    icon={isAiDraftLoading ? 'spinner' : 'sparkles'}
                    disabled={!jobTitle.trim() || isAiDraftLoading}
                    onClick={handleAiAutoDraft}
                    className={`shrink-0 shadow-sm ${isAiDraftLoading ? '[&_svg]:animate-spin' : ''}`}
                  >
                    {isAiDraftLoading
                      ? 'Drafting…'
                      : jobDescriptionEmpty
                        ? 'Write it for Me'
                        : 'Write a new draft'}
                  </Button>
                </div>
              </div>
              {!jobTitle.trim() && <AiDraftTitleHint />}
            </div>

            {/* Internal Job Code */}
            <div className="w-full max-w-[400px]">
              <TextInput
                className="w-full"
                label="Internal Job Code"
                value={internalJobCode}
                onChange={setInternalJobCode}
                placeholder=""
              />
            </div>

            {/* Linked Job Codes section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium leading-[20px] text-[var(--text-neutral-x-strong)]">
                  Linked Job Codes
                </span>
                <span title="Link job codes from external systems">
                  <Icon name="circle-info" variant="regular" size={16} className="text-[var(--icon-neutral-strong)]" />
                </span>
              </div>
              <div
                className="flex w-full flex-wrap items-center"
                style={{ gap: '20px' }}
              >
                {bambooLinkedEntry ? (
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full text-[13px] font-medium text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-x-weak)] border border-[var(--border-neutral-weak)] pl-3 pr-1 py-1 shrink-0"
                    role="status"
                    aria-label={`BambooHR job code ${bambooLinkedEntry.label}`}
                  >
                    <span className="pl-0.5">
                      BambooHR: {bambooLinkedEntry.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLinkedCode(bambooLinkedEntry)}
                      className="flex items-center justify-center h-7 w-7 rounded-full text-[var(--icon-neutral-strong)] hover:bg-[var(--surface-neutral-medium)] transition-colors shrink-0"
                      aria-label="Remove BambooHR job code"
                    >
                      <Icon name="xmark" size={14} />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="text"
                    icon="circle-plus-lined"
                    className="shrink-0"
                    onClick={() => appendLinkedCode({ source: 'bamboohr', label: 'BHR-102' })}
                  >
                    Link to BambooHR Job Code
                  </Button>
                )}
                <Button
                  type="button"
                  variant="text"
                  icon="circle-plus-lined"
                  className="shrink-0"
                  onClick={() => appendLinkedCode({ source: 'mercer', label: 'MRC-PD-4' })}
                >
                  Link to Mercer Job Code
                </Button>
              </div>
              {mercerLinkedCodes.length > 0 && (
                <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
                  {mercerLinkedCodes.map((code) => (
                    <li
                      key={`${code.source}-${code.label}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium text-[var(--text-neutral-strong)] bg-[var(--surface-neutral-x-weak)] border border-[var(--border-neutral-weak)]"
                    >
                      Mercer: {code.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Pay Transparency section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium leading-[20px] text-[var(--text-neutral-x-strong)]">
                  Pay Transparency
                </span>
                <span title="Link EEO categories for pay transparency reporting">
                  <Icon name="circle-info" variant="regular" size={16} className="text-[var(--icon-neutral-strong)]" />
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="text" icon="circle-plus-lined">
                  Link EEO Category
                </Button>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeCardTab === 'competencies' && (
          <div className="p-8 pt-6 space-y-4">
            {competencies.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="primary" icon="circle-plus" onClick={openCreateCompetencyModal}>
                  Create Competency
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  icon="sparkles"
                  disabled={isAiCompetenciesLoading}
                  onClick={handleAiSuggestCompetencies}
                >
                  Create with AI
                </Button>
              </div>
            )}

            {competencies.length === 0 && (
              <div className="flex flex-col items-center px-4 py-10 text-center">
                <img
                  src={competenciesEmptyChart}
                  alt=""
                  width={128}
                  height={128}
                  className="shrink-0 h-32 w-32"
                  aria-hidden
                />
                <h2
                  className="mt-6 max-w-[520px] text-[24px] font-bold leading-[30px] text-[var(--text-neutral-x-strong)] m-0"
                  style={{ fontFamily: 'var(--font-fields)' }}
                >
                  Set clear expectations for every role.
                </h2>
                <p className="mt-3 m-0 max-w-[480px] text-[15px] leading-[22px] text-[var(--text-neutral-medium)]">
                  Create job competencies manually or use AI to get a head start and refine as needed.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Button type="button" variant="standard" icon="circle-plus" onClick={openCreateCompetencyModal}>
                    Create Competency
                  </Button>
                  <button
                    type="button"
                    disabled={isAiCompetenciesLoading}
                    onClick={handleAiSuggestCompetencies}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-full)] px-5 text-[15px] font-semibold leading-[22px] transition-opacity disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:opacity-90"
                    style={{
                      color: AI_DRAFT_HINT_TEAL,
                      background:
                        'linear-gradient(var(--surface-neutral-white), var(--surface-neutral-white)) padding-box, linear-gradient(90deg, #b5dfc8 0%, #f3d9a8 100%) border-box',
                      border: '1px solid transparent',
                      boxShadow: 'var(--shadow-100)',
                    }}
                  >
                    <Icon name="sparkles" size={16} style={{ color: AI_DRAFT_HINT_TEAL }} />
                    Create with AI
                  </button>
                </div>
              </div>
            )}

            {(isAiCompetenciesLoading || (pendingAiCompetencies != null && pendingAiCompetencies.length > 0)) && (
              <div>
                {isAiCompetenciesLoading && (
                  <div className="flex flex-col items-center justify-center gap-3 min-h-[140px] px-4 py-6 rounded-[var(--radius-xx-small)] bg-[var(--color-primary-weak)] border border-[var(--color-primary-medium)]">
                    <Icon
                      name="sparkles"
                      size={20}
                      className="text-[var(--color-primary-strong)] animate-pulse shrink-0"
                    />
                    <span className="text-[14px] font-medium text-[var(--text-neutral-strong)] text-center">
                      Suggesting competencies…
                    </span>
                  </div>
                )}
                {pendingAiCompetencies != null &&
                  pendingAiCompetencies.length > 0 &&
                  !isAiCompetenciesLoading && (
                    <div
                      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                      role="region"
                      aria-label="AI competency suggestions"
                    >
                      {pendingAiCompetencies.map((c) => (
                        <CompetencyCard
                          key={c.id}
                          variant="suggestion"
                          competency={c}
                          onAccept={() => acceptSuggestedCompetency(c)}
                          onReject={() => rejectSuggestedCompetency(c)}
                        />
                      ))}
                    </div>
                  )}
              </div>
            )}

            {competencies.length > 0 && (
              <div className="-mx-8 flex-1 overflow-auto px-8 sm:mx-0 sm:px-0">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {competencies.map((c) => (
                    <CompetencyCard
                      key={c.id}
                      variant="saved"
                      competency={c}
                      onEdit={() => openEditCompetencyModal(c)}
                      onDelete={() => setCompetencyToDelete(c)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CompetencyEditModal
        open={competencyModalOpen}
        title={competencyModalTitle}
        initial={competencyEditInitial}
        onClose={() => setCompetencyModalOpen(false)}
        onSave={handleCompetencyModalSave}
      />

      {competencyToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          style={{ backgroundColor: 'rgba(103, 98, 96, 0.5)' }}
          onClick={() => setCompetencyToDelete(null)}
        >
          <div
            className="bg-[var(--surface-neutral-white)] rounded-[var(--radius-small)] w-full max-w-[400px] overflow-hidden"
            style={{ boxShadow: '2px 2px 0px 2px rgba(56, 49, 47, 0.08)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-[var(--space-m)] py-[var(--space-s)] bg-[var(--surface-neutral-xx-weak)]">
              <h3
                className="text-[18px] font-semibold text-[var(--color-primary-strong)] m-0"
                style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '26px' }}
              >
                Remove competency?
              </h3>
              <button
                type="button"
                onClick={() => setCompetencyToDelete(null)}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border-neutral-weak)] hover:bg-[var(--surface-neutral-x-weak)] text-[var(--text-neutral-strong)] transition-colors"
                aria-label="Close"
              >
                <Icon name="xmark" size={14} />
              </button>
            </div>
            <div className="px-[var(--space-m)] py-[var(--space-xl)]">
              <p className="text-[15px] text-[var(--text-neutral-x-strong)] m-0" style={{ lineHeight: '22px' }}>
                <span className="font-semibold">{competencyToDelete.name}</span> will be removed from this job
                profile. You can undo by discarding changes before save.
              </p>
            </div>
            <div className="flex items-center justify-end gap-[var(--space-m)] px-[var(--space-m)] py-[var(--space-s)] bg-[var(--surface-neutral-xx-weak)]">
              <button
                type="button"
                onClick={() => setCompetencyToDelete(null)}
                className="text-[15px] font-semibold text-[var(--color-link)] hover:underline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveCompetency}
                className="px-6 py-2 text-[15px] font-semibold rounded-full bg-[var(--color-primary-strong)] text-white hover:opacity-90 transition-colors"
                style={{ boxShadow: '1px 1px 0px 1px rgba(56,49,47,0.04)' }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer actions - 24px below the card */}
      <div className="mx-8 pl-8 mt-6 mb-10 flex items-center gap-4">
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-[15px] font-semibold text-[var(--color-link)] hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default JobProfileDetail;

/** Remount when `:id` changes so form state matches the loaded profile without a sync effect. */
export function JobProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <JobProfileDetail key={id ?? 'new'} />;
}
