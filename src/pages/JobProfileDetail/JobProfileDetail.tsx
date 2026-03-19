import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon, Button, TextInput, FormDropdown } from '../../components';
import {
  jobProfileGroups,
  jobFamilies,
  careerTrackOptions,
  levelOptions,
} from '../../data/settingsData';

export function JobProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const profile = jobProfileGroups.flatMap((g) => g.profiles).find((p) => p.id === id);
  const profileJobFamily = profile
    ? jobProfileGroups.find((g) => g.profiles.some((p) => p.id === profile.id))?.id ?? ''
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

  useEffect(() => {
    if (profile) {
      setJobTitle(profile.name);
      setJobDescription(profile.jobDescription ?? '');
      setInternalJobCode(profile.internalJobCode ?? '');
      const family = jobProfileGroups.find((g) => g.profiles.some((p) => p.id === profile.id))?.id ?? '';
      setJobFamily(family);
      setCareerTrack(profile.careerTrackLevel ? profile.careerTrackLevel[0] ?? '' : '');
      setLevel(
        profile.careerTrackLevel && profile.careerTrackLevel.length > 1
          ? profile.careerTrackLevel.slice(1)
          : ''
      );
    }
  }, [profile?.id]);

  if (!profile) {
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

  const handleSave = () => {
    // In a real app, would persist changes
    navigate('/settings', { state: { activeNav: 'job-organization' } });
  };

  const handleDiscard = () => {
    setJobTitle(profile.name);
    setJobDescription(profile.jobDescription ?? '');
    setInternalJobCode(profile.internalJobCode ?? '');
    const family = jobProfileGroups.find((g) => g.profiles.some((p) => p.id === profile.id))?.id ?? '';
    setJobFamily(family);
    setCareerTrack(profile.careerTrackLevel ? profile.careerTrackLevel[0] ?? '' : '');
    setLevel(
      profile.careerTrackLevel && profile.careerTrackLevel.length > 1
        ? profile.careerTrackLevel.slice(1)
        : ''
    );
  };

  const handleAddNewJobFamily = () => {
    // In a real app, would open modal or inline form to add job family
  };

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
            {profile.name}
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

      {/* White card with Details section */}
      <div
        className="mx-8 mb-0 bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-x-weak)] rounded-[var(--radius-medium)] overflow-hidden"
        style={{ boxShadow: '2px 2px 0px 2px rgba(56, 49, 47, 0.05)' }}
      >
        <div className="p-8">
          {/* Details section header */}
          <h2
            className="text-[22px] font-semibold text-[var(--color-primary-strong)] mb-6 pb-4 border-b border-[var(--border-neutral-x-weak)]"
            style={{ fontFamily: 'Fields, system-ui, sans-serif', lineHeight: '30px' }}
          >
            Details
          </h2>

          {/* Form fields */}
          <div className="space-y-6">
            {/* Row 1: Job Title | 20px | Job Family */}
            <div className="flex flex-wrap items-start" style={{ gap: '20px' }}>
              <div className="w-full max-w-[400px] shrink-0">
                <TextInput
                  className="w-full"
                  label="Job Title *"
                  value={jobTitle}
                  onChange={setJobTitle}
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

            {/* Job Description */}
            <div className="flex flex-col gap-2 max-w-[820px]">
              <label className="text-[14px] font-medium leading-[20px] text-[var(--text-neutral-x-strong)]">
                Job Description
              </label>
              <div
                className="flex items-start min-h-[183px] px-4 py-[9px] bg-[var(--surface-neutral-white)] border border-[var(--border-neutral-medium)] rounded-[var(--radius-xx-small)]"
                style={{ boxShadow: 'var(--shadow-100)' }}
              >
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Add your job description here..."
                  className="flex-1 w-full min-h-[160px] bg-transparent text-[15px] leading-[22px] text-[var(--text-neutral-strong)] placeholder:text-[var(--text-neutral-weak)] outline-none resize-none"
                />
              </div>
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
              <div className="flex items-center gap-4">
                <Button variant="text" icon="circle-plus-lined">
                  Link to BambooHR Job Code
                </Button>
                <Button variant="text" icon="circle-plus-lined">
                  Link to Mercer Job Code
                </Button>
              </div>
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
      </div>

      {/* Footer actions - 24px below the card */}
      <div className="mx-8 pl-8 mt-6 mb-10 flex items-center gap-4">
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
        <button
          onClick={handleDiscard}
          className="text-[15px] font-semibold text-[var(--color-link)] hover:underline"
        >
          Discard Changes
        </button>
      </div>
    </div>
  );
}

export default JobProfileDetail;
