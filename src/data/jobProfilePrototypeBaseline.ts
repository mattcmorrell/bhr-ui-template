import type { JobProfile } from './settingsData';

/**
 * Prototype display baseline after Reset / per tab:
 * - Mapped + resetVersion > 0: full mapping from seed, job descriptions cleared.
 * - Onboarding (unassigned tab): title + id + people only; no families, tracks, levels, descriptions, codes, competencies.
 * - Mapped + resetVersion === 0: raw seed (unchanged).
 */
export function applyJobProfileForPrototype(
  profile: JobProfile,
  tab: 'mapped' | 'unassigned',
  resetVersion: number,
): JobProfile {
  if (tab === 'unassigned') {
    return {
      ...profile,
      jobFamilyGroupId: null,
      careerTrackLevel: '',
      jobDescription: undefined,
      internalJobCode: undefined,
      competencies: undefined,
    };
  }
  if (resetVersion > 0) {
    return {
      id: profile.id,
      name: profile.name,
      people: profile.people,
      careerTrackLevel: '',
      jobFamilyGroupId: null,
      jobDescription: undefined,
      internalJobCode: undefined,
      competencies: undefined,
    };
  }
  return profile;
}

export function applyBaselineToJobProfileGroups(
  groups: { id: string; name: string; profiles: JobProfile[] }[],
  tab: 'mapped' | 'unassigned',
  resetVersion: number,
): { id: string; name: string; profiles: JobProfile[] }[] {
  return groups.map((g) => ({
    ...g,
    profiles: g.profiles.map((p) => applyJobProfileForPrototype(p, tab, resetVersion)),
  }));
}
