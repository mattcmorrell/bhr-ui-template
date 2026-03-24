import jobLibCsvRaw from '../../job-lib-data.csv?raw';

export interface JobTitleCatalogRow {
  id: string;
  jobTitle: string;
  jobFamilyId: string;
  jobFamilyName: string;
  careerTrack: string;
  level: string;
  jobDescription: string;
  bambooJobCode: string;
}

/** Parse CSV with optional quoted fields (handles commas inside quotes). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let i = 0;
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = '';
  };

  const pushRow = () => {
    pushCell();
    if (row.some((x) => x.trim() !== '')) {
      rows.push(row);
    }
    row = [];
  };

  while (i < text.length) {
    const c = text[i]!;

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += c;
      i += 1;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ',') {
      pushCell();
      i += 1;
      continue;
    }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      pushRow();
      i += 1;
      continue;
    }
    cell += c;
    i += 1;
  }

  pushCell();
  if (row.some((x) => x.trim() !== '')) {
    rows.push(row);
  }

  return rows;
}

export function slugifyJobFamily(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const CAREER_LEVEL_RE = /^([EMPTS])(\d+)/;

function parseCareerTrackAndLevel(raw: string): { careerTrack: string; level: string } | null {
  const m = raw.trim().match(CAREER_LEVEL_RE);
  if (!m) return null;
  const careerTrack = m[1]!;
  let levelNum = parseInt(m[2]!, 10);
  if (Number.isNaN(levelNum) || levelNum < 1) return null;
  if (levelNum > 10) levelNum = 10;
  return { careerTrack, level: String(levelNum) };
}

function buildCatalogFromRaw(raw: string): {
  rows: JobTitleCatalogRow[];
  profileGroups: Array<{ id: string; name: string; profiles: [] }>;
} {
  const grid = parseCsv(raw);
  if (grid.length < 2) {
    return { rows: [], profileGroups: [] };
  }

  const header = grid[0]!.map((h) => h.trim());
  const idxTitle = header.indexOf('Job Title');
  const idxFamily = header.indexOf('Job Family');
  const idxCareer = header.indexOf('Career Track and Level');
  const idxDesc = header.indexOf('Job Description');
  if (idxTitle < 0 || idxFamily < 0 || idxCareer < 0 || idxDesc < 0) {
    return { rows: [], profileGroups: [] };
  }

  const familyByLabel = new Map<string, { id: string; name: string; profiles: [] }>();
  const rows: JobTitleCatalogRow[] = [];
  const seenRowKeys = new Set<string>();
  let seq = 0;

  for (let r = 1; r < grid.length; r += 1) {
    const line = grid[r]!;
    const jobTitle = (line[idxTitle] ?? '').trim();
    if (!jobTitle) continue;

    const jobFamilyName = (line[idxFamily] ?? '').trim();
    const careerRaw = (line[idxCareer] ?? '').trim();
    const jobDescription = (line[idxDesc] ?? '').trim();

    const parsed = parseCareerTrackAndLevel(careerRaw);
    if (!parsed) continue;

    const dedupeKey = `${jobTitle}\0${jobFamilyName}\0${careerRaw}\0${jobDescription}`;
    if (seenRowKeys.has(dedupeKey)) continue;
    seenRowKeys.add(dedupeKey);

    const jobFamilyId = jobFamilyName ? slugifyJobFamily(jobFamilyName) : '';
    if (jobFamilyName && jobFamilyId && !familyByLabel.has(jobFamilyName)) {
      familyByLabel.set(jobFamilyName, {
        id: jobFamilyId,
        name: jobFamilyName,
        profiles: [],
      });
    }

    seq += 1;
    const id = `lib-${String(seq).padStart(3, '0')}`;
    rows.push({
      id,
      jobTitle,
      jobFamilyId,
      jobFamilyName,
      careerTrack: parsed.careerTrack,
      level: parsed.level,
      jobDescription,
      bambooJobCode: `BHR-LIB-${String(seq).padStart(3, '0')}`,
    });
  }

  const profileGroups = [...familyByLabel.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return { rows, profileGroups };
}

const built = buildCatalogFromRaw(jobLibCsvRaw);

export const jobTitleCatalogRows: JobTitleCatalogRow[] = built.rows;
export const jobLibProfileGroups = built.profileGroups;

export function filterJobTitleCatalog(
  query: string,
  catalog: JobTitleCatalogRow[] = jobTitleCatalogRows
): JobTitleCatalogRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matches = catalog.filter((row) => row.jobTitle.toLowerCase().includes(q));

  return matches.sort((a, b) => {
    const ta = a.jobTitle.toLowerCase();
    const tb = b.jobTitle.toLowerCase();
    const as = ta.startsWith(q) ? 0 : 1;
    const bs = tb.startsWith(q) ? 0 : 1;
    if (as !== bs) return as - bs;
    if (ta.length !== tb.length) return ta.length - tb.length;
    return ta.localeCompare(tb);
  });
}
