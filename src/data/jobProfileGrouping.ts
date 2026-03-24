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

  return result;
}
