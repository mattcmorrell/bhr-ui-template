import type { JobProfile, JobProfileGroup } from './settingsData';

export const UNASSIGNED_GROUP_ID = 'unassigned';

/** `nestingGroupId` null = profile not from static nested groups (e.g. sessionStorage); undefined jobFamilyGroupId then maps to Unassigned. */
export function resolveJobProfileGroupId(
  profile: JobProfile,
  nestingGroupId: string | null,
): string {
  if (profile.jobFamilyGroupId === undefined) {
    return nestingGroupId ?? UNASSIGNED_GROUP_ID;
  }
  if (profile.jobFamilyGroupId === null || profile.jobFamilyGroupId === '') {
    return UNASSIGNED_GROUP_ID;
  }
  return profile.jobFamilyGroupId;
}

export function bucketJobProfilesToGroups(
  staticGroups: JobProfileGroup[],
  extraProfiles: JobProfile[],
  deletedProfileIds: Set<string>,
  archivedAtByProfileId: Record<string, string>,
  mode: 'current' | 'archived',
): JobProfileGroup[] {
  const bucket = new Map<string, JobProfile[]>();

  const include = (p: JobProfile) => {
    if (deletedProfileIds.has(p.id)) return false;
    const isArchived = archivedAtByProfileId[p.id] !== undefined;
    return mode === 'archived' ? isArchived : !isArchived;
  };

  const push = (groupId: string, p: JobProfile) => {
    const list = bucket.get(groupId) ?? [];
    list.push(p);
    bucket.set(groupId, list);
  };

  for (const g of staticGroups) {
    for (const p of g.profiles) {
      if (!include(p)) continue;
      push(resolveJobProfileGroupId(p, g.id), p);
    }
  }

  for (const p of extraProfiles) {
    if (!include(p)) continue;
    push(resolveJobProfileGroupId(p, null), p);
  }

  const nameById = new Map<string, string>(staticGroups.map((g) => [g.id, g.name]));
  nameById.set(UNASSIGNED_GROUP_ID, 'Unassigned');

  const orderedIds = [...staticGroups.map((g) => g.id), UNASSIGNED_GROUP_ID];

  const result: JobProfileGroup[] = [];
  const seen = new Set<string>();

  for (const gid of orderedIds) {
    const profiles = bucket.get(gid);
    if (profiles?.length) {
      result.push({
        id: gid,
        name: nameById.get(gid) ?? gid,
        profiles,
      });
      seen.add(gid);
    }
  }

  for (const [gid, profiles] of bucket) {
    if (!seen.has(gid) && profiles.length > 0) {
      result.push({
        id: gid,
        name: nameById.get(gid) ?? gid,
        profiles,
      });
    }
  }

  // Deduplicate by name across all groups — first occurrence wins, people counts are summed.
  const seenNames = new Map<string, string>();
  const peopleById = new Map<string, number>();
  for (const g of result) {
    for (const p of g.profiles) {
      const key = p.name.trim().toLowerCase();
      if (!seenNames.has(key)) {
        seenNames.set(key, p.id);
        peopleById.set(p.id, p.people);
      } else {
        const keeperId = seenNames.get(key)!;
        peopleById.set(keeperId, (peopleById.get(keeperId) ?? 0) + p.people);
      }
    }
  }
  const emittedIds = new Set<string>();
  return result
    .map((g) => ({
      ...g,
      profiles: g.profiles
        .filter((p) => {
          const key = p.name.trim().toLowerCase();
          if (seenNames.get(key) !== p.id) return false;
          if (emittedIds.has(p.id)) return false;
          emittedIds.add(p.id);
          return true;
        })
        .map((p) => ({ ...p, people: peopleById.get(p.id) ?? p.people })),
    }))
    .filter((g) => g.profiles.length > 0);
}

/** Prototype: one Unassigned group with mapping fields cleared. */
export function bucketUnassignedStartingGroups(
  staticGroups: JobProfileGroup[],
  extraProfiles: JobProfile[],
  deletedProfileIds: Set<string>,
  archivedAtByProfileId: Record<string, string>,
  mode: 'current' | 'archived',
): JobProfileGroup[] {
  const mapped = bucketJobProfilesToGroups(
    staticGroups,
    extraProfiles,
    deletedProfileIds,
    archivedAtByProfileId,
    mode,
  );

  const seen = new Set<string>();
  const profiles: JobProfile[] = [];
  for (const g of mapped) {
    for (const p of g.profiles) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      profiles.push({
        ...p,
        jobFamilyGroupId: null,
        careerTrackLevel: '',
      });
    }
  }

  if (profiles.length === 0) return [];

  return [
    {
      id: UNASSIGNED_GROUP_ID,
      name: 'Unassigned',
      profiles,
    },
  ];
}
