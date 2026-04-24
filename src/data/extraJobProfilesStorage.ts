import type { JobProfile } from './settingsData';

const STORAGE_KEY = 'bhr-extra-job-profiles';

export function readExtraJobProfiles(): JobProfile[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as JobProfile[]) : [];
  } catch {
    return [];
  }
}

export function appendExtraJobProfile(profile: JobProfile): void {
  const next = [...readExtraJobProfiles(), profile];
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function upsertExtraJobProfile(profile: JobProfile): void {
  const all = readExtraJobProfiles();
  const i = all.findIndex((p) => p.id === profile.id);
  if (i >= 0) {
    all[i] = profile;
  } else {
    all.push(profile);
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function findExtraJobProfileById(id: string): JobProfile | undefined {
  return readExtraJobProfiles().find((p) => p.id === id);
}

export function removeExtraJobProfile(id: string): void {
  const next = readExtraJobProfiles().filter((p) => p.id !== id);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearExtraJobProfiles(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
