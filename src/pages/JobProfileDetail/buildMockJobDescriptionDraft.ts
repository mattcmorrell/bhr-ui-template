export type LinkedJobCodeEntry = { source: 'bamboohr' | 'mercer'; label: string };

export interface BuildMockJobDescriptionDraftParams {
  jobTitle: string;
  jobFamilyLabel?: string;
  careerTrackLabel?: string;
  levelLabel?: string;
  linkedJobCodes?: LinkedJobCodeEntry[];
}

type SeniorityBand = 'entry' | 'mid' | 'senior' | 'lead' | 'general';

function seniorityFromTitle(title: string): SeniorityBand {
  const t = title.toLowerCase();
  if (/\b(director|vp|vice president|head of|chief)\b/.test(t)) return 'lead';
  if (/\b(principal|staff|distinguished|fellow)\b/.test(t)) return 'lead';
  if (/\b(senior|sr\.?)\b/.test(t)) return 'senior';
  if (/\bassociate\b|\bjunior\b|\b intern\b/.test(t)) return 'entry';
  if (/\b i\b|\bi$/.test(t)) return 'entry';
  if (/\b ii\b|\b2$/.test(t)) return 'mid';
  if (/\b iii\b|\b iv\b|\b3\b|\b4\b/.test(t)) return 'mid';
  return 'general';
}

function roleKind(title: string): 'design' | 'engineering' | 'product' | 'marketing' | 'people' | 'general' {
  const t = title.toLowerCase();
  if (/\b(design|designer|ux|ui|creative)\b/.test(t)) return 'design';
  if (/\b(engineer|developer|devops|sre|architect)\b/.test(t)) return 'engineering';
  if (/\b(product manager|pm\b|program manager)\b/.test(t)) return 'product';
  if (/\b(market|brand|content|communications)\b/.test(t)) return 'marketing';
  if (/\b(hr|people|talent|recruit|compensation)\b/.test(t)) return 'people';
  return 'general';
}

/** Job Profile narrative: defines the role in the organization (not a hiring posting; competencies live elsewhere). */
function profileNarrativeBody(jobTitle: string): string {
  const title = jobTitle.trim() || 'this role';
  const band = seniorityFromTitle(title);
  const kind = roleKind(title);

  const seniorityClause =
    band === 'entry'
      ? 'This profile reflects an early-career scope with close guidance from more experienced peers.'
      : band === 'senior' || band === 'lead'
        ? 'This profile reflects expanded ownership, stakeholder influence, and judgment applied across complex or ambiguous work.'
        : 'This profile reflects a standard scope for the level, with clear expectations for quality and collaboration.';

  if (kind === 'design') {
    return `This role focuses on creating and refining concepts for new or improved products and experiences, balancing functionality, aesthetics, and user experience. Responsibilities include conducting user research, developing prototypes, and collaborating with engineering and marketing teams to ensure design feasibility and market fit. Proficiency in design software, strong visualization skills, and an understanding of how designs move into delivery are essential. The position often requires presenting ideas and revisions to stakeholders, as well as iterating designs based on feedback. Attention to detail, problem-solving, and project management abilities are key for successfully bringing innovative work to market. ${seniorityClause}`.trim();
  }

  if (kind === 'engineering') {
    return `This role focuses on designing, building, and operating reliable software that meets user and business needs. Responsibilities include translating requirements into working systems, collaborating with product and design partners, and improving quality through testing, review, and operational practices. Strong technical fundamentals, sound judgment on tradeoffs, and clear communication across disciplines are essential. The profile typically involves owning meaningful parts of the stack, participating in planning and estimation, and helping the team learn from incidents and delivery outcomes. ${seniorityClause}`.trim();
  }

  if (kind === 'product') {
    return `This role focuses on discovering the right problems to solve and aligning roadmap, metrics, and delivery with customer and business outcomes. Responsibilities include gathering input from users and internal partners, framing decisions with data and judgment, and working closely with engineering and design to ship coherent solutions. Strong communication, prioritization, and stakeholder management are essential. The profile typically involves owning scope for a product area, clarifying success criteria, and iterating based on feedback and results. ${seniorityClause}`.trim();
  }

  if (kind === 'marketing') {
    return `This role focuses on shaping how offerings are positioned, launched, and understood in the market. Responsibilities include developing messaging and campaigns, coordinating with sales and product partners, and measuring what resonates with target audiences. Strong writing, analytical thinking, and cross-functional collaboration are essential. The profile typically involves owning programs or channels, adapting plans based on performance, and representing customer and market context inside the organization. ${seniorityClause}`.trim();
  }

  if (kind === 'people') {
    return `This role focuses on delivering people programs and trusted guidance that support managers and employees. Responsibilities include applying policy and practice consistently, partnering with leaders on people decisions, and improving processes with an eye to fairness and compliance. Strong judgment, discretion, and communication across the organization are essential. The profile typically involves handling a mix of recurring operational work and more nuanced cases that require context and care. ${seniorityClause}`.trim();
  }

  return `This role focuses on delivering outcomes that depend on strong collaboration, clear communication, and sound judgment within its domain. Responsibilities typically include planning and executing work with partners across the organization, representing the function in cross-functional discussions, and improving how work gets done over time. Relevant domain knowledge, reliability, and adaptability are essential. The profile often requires balancing competing priorities, escalating when appropriate, and contributing to shared goals for the team and company. ${seniorityClause}`.trim();
}

function contextLeadIn(params: BuildMockJobDescriptionDraftParams): string | null {
  const { jobFamilyLabel, careerTrackLabel, levelLabel, jobTitle } = params;
  const title = jobTitle.trim() || 'this role';
  if (!jobFamilyLabel && !careerTrackLabel && !levelLabel) return null;

  const parts: string[] = [];
  if (jobFamilyLabel) parts.push(`the ${jobFamilyLabel} job family`);
  if (careerTrackLabel && levelLabel) {
    parts.push(`${careerTrackLabel} at level ${levelLabel}`);
  } else if (careerTrackLabel) {
    parts.push(careerTrackLabel);
  } else if (levelLabel) {
    parts.push(`level ${levelLabel}`);
  }

  const where = parts.join(', ');
  return `Within ${where}, the ${title} job profile describes how this role is expected to show up in the organization.`;
}

function externalCodesSentence(codes: LinkedJobCodeEntry[]): string {
  const mapped = codes
    .map((c) => (c.source === 'bamboohr' ? `BambooHR (${c.label})` : `Mercer (${c.label})`))
    .join(', ');
  return `For HRIS and market benchmarking alignment, this job profile maps to external job codes: ${mapped}.`;
}

export function buildMockJobDescriptionDraft(params: BuildMockJobDescriptionDraftParams): string {
  const lead = contextLeadIn(params);
  const body = profileNarrativeBody(params.jobTitle);
  const sections: string[] = [];
  if (lead) sections.push(lead);
  sections.push(body);
  if (params.linkedJobCodes?.length) {
    sections.push(externalCodesSentence(params.linkedJobCodes));
  }
  return sections.join('\n\n');
}

/** Mock “longer” pass for AI refine — appends an organizational-context paragraph. */
export function mockExpandJobDescription(text: string, jobTitle: string): string {
  const t = text.trim();
  const role = jobTitle.trim() || 'this role';
  const addition = `In practice, ${role} is expected to align day-to-day work with team commitments, document decisions when they affect others, and raise tradeoffs early when scope or timelines are at risk. This section complements competencies defined elsewhere on the job profile.`;
  return t ? `${t}\n\n${addition}` : addition;
}

/** Mock “shorter” pass — keeps roughly half of paragraphs or sentences. */
export function mockShortenJobDescription(text: string): string {
  const t = text.trim();
  if (!t) return '';
  const blocks = t.split(/\n\n+/).filter(Boolean);
  if (blocks.length >= 2) {
    const keep = Math.max(1, Math.ceil(blocks.length / 2));
    return blocks.slice(0, keep).join('\n\n');
  }
  const sentences = t.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [t];
  const n = Math.max(1, Math.ceil(sentences.length / 2));
  return sentences.slice(0, n).join(' ').trim();
}
