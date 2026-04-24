import { bucketJobProfilesToGroups } from './jobProfileGrouping';
import { applyBaselineToJobProfileGroups } from './jobProfilePrototypeBaseline';
import { jobProfileGroups, type JobProfileGroup } from './settingsData';
import { readExtraJobProfiles } from './extraJobProfilesStorage';

/** Simulated “AI sorted” starting point: mapped bucketing + library track/level from seed. */
export function buildOrganizeJobFamiliesInitialGroups(): JobProfileGroup[] {
  const raw = bucketJobProfilesToGroups(
    jobProfileGroups,
    readExtraJobProfiles(),
    new Set(),
    {},
    'current',
  );
  return applyBaselineToJobProfileGroups(raw, 'mapped', 0);
}
