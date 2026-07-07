// backend/src/features/resume/normalizer.ts
//
// Resume data normalization pipeline.
// Ported and improved from:
//   - resume-ai-backend/utils/normalizeResume.js   → normalizeResume()
//
// Link normalization is delegated to the existing utility:
//   - backend/src/utils/normalizeLinks.ts           → normalizeLink(), normalizeBasicsLinks()
//
// The normalizer accepts raw AI-extracted JSON (unknown shape) and produces
// a strongly-typed NormalizedResume object safe for downstream pipeline stages.
//
// Pure function — no side effects, no I/O, no AI calls.

import { PERSONAL_PROJECT_MARKERS } from './constants';
import { normalizeLink, normalizeBasicsLinks } from '../../utils/normalizeLinks';

// ---------------------------------------------------------------------------
// Sub-interfaces
// ---------------------------------------------------------------------------

/** Basics / contact block of a resume. */
export interface ResumeBasics {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  location: string;
  tagline: string;
}

/** A single skill category row (e.g. { label: "Languages", value: "Python, TypeScript" }). */
export interface SkillRow {
  label: string;
  value: string;
}

/** A single work experience entry. */
export interface ExperienceEntry {
  title: string;
  company: string;
  location: string;
  dates: string;
  tech: string;
  bullets: string[];
}

/** A single project entry. */
export interface ProjectEntry {
  title: string;
  tech: string;
  meta: string;
  bullets: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
}

/** A single education entry. */
export interface EducationEntry {
  institution: string;
  degree: string;
  dates: string;
  gpa: string;
  extras: string;
}

/** A single award entry. */
export interface AwardEntry {
  title: string;
  org: string;
  desc: string;
  date: string;
}

/** A single certification entry. */
export interface CertificationEntry {
  title: string;
  org: string;
  dates: string;
  url: string;
}

/** A single extracurricular entry. */
export interface ExtracurricularEntry {
  title: string;
  bullets: string[];
}

/** Parsed result of a pipe/slash-delimited meta string. */
export interface ParsedMeta {
  company: string;
  location: string;
  dates: string;
}

// ---------------------------------------------------------------------------
// NormalizedResume
// ---------------------------------------------------------------------------

/**
 * The canonical, fully-typed representation of a parsed resume.
 *
 * Produced by `normalizeResume()` from raw AI-extracted data.
 * This is the contract type that all downstream pipeline stages
 * (deduplicator, resumeValidator, trimmer, exportPipeline) depend on.
 *
 * NOTE: `dsaProficiency` is an alias for `dsaProfiles` maintained for
 * backwards compatibility with the legacy JS codebase. Both contain the
 * same data — do not write to both independently.
 */
export interface NormalizedResume {
  /** Structured contact / basics block. */
  basics: ResumeBasics;
  /** Flattened basics fields (mirrors basics.*) for legacy consumers. */
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  location: string;
  tagline: string;
  /** Professional summary paragraph. */
  summary: string;
  /** Skill category rows. */
  skills: SkillRow[];
  /** Work experience entries (internships, jobs). */
  experience: ExperienceEntry[];
  /** Project entries (personal, academic, side projects). */
  projects: ProjectEntry[];
  /** Education entries. */
  education: EducationEntry[];
  /** Awards and achievement entries. */
  awards: AwardEntry[];
  /** Certification entries. */
  certifications: CertificationEntry[];
  /** Competitive programming profile / DSA statistics lines. */
  dsaProfiles: string[];
  /** Alias for dsaProfiles — legacy field. */
  dsaProficiency: string[];
  /** Extracurricular activity entries. */
  extracurricular: ExtracurricularEntry[];
  /** Comma-separated spoken languages string. */
  languages: string;
}

// ---------------------------------------------------------------------------
// parseMeta (exported for testing)
// ---------------------------------------------------------------------------

/**
 * Parses a pipe-delimited or slash-delimited metadata string into structured fields.
 *
 * Handles the following common formats from AI-extracted resume data:
 *  - "CompanyName | City | Jan 2023 – May 2023"  → pipe-separated
 *  - "CompanyName/City/Jan 2023"                  → slash-separated
 *  - "CompanyName Jan 2023 – Present"             → date-suffix extraction
 *  - Anything else                                → treated as company name only
 *
 * @param meta - The raw metadata string from an experience or project entry.
 * @returns      A ParsedMeta object with company, location, and dates fields.
 *
 * @example
 * parseMeta('Google | New York | Jun 2023 – Aug 2023')
 * // => { company: 'Google', location: 'New York', dates: 'Jun 2023 – Aug 2023' }
 *
 * parseMeta('OpenAI')
 * // => { company: 'OpenAI', location: '', dates: '' }
 */
export function parseMeta(meta = ''): ParsedMeta {
  if (!meta) return { company: '', location: '', dates: '' };

  // Pipe-delimited: "Company | Location | Dates"
  if (meta.includes('|')) {
    const parts = meta.split('|').map(p => p.trim());
    if (parts.length >= 3) {
      return { company: parts[0], location: parts[1], dates: parts[2] };
    }
    if (parts.length === 2) {
      return { company: parts[0], location: '', dates: parts[1] };
    }
  }

  // Slash-delimited: "Company/Location/Dates"
  if (meta.includes('/')) {
    const parts = meta.split('/').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      return {
        company: parts[0],
        location: parts.slice(1, -1).join(', '),
        dates: parts[parts.length - 1],
      };
    }
    if (parts.length === 2) {
      const datePattern = /\d{4}|present/i;
      if (datePattern.test(parts[1])) {
        return { company: parts[0], location: '', dates: parts[1] };
      }
      return { company: parts[0], location: parts[1], dates: '' };
    }
  }

  // Date-suffix extraction: "Company Name Jan 2023 – Present"
  const dateMatch = meta.match(
    /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4}\s*[–\-]\s*(?:Present|\w+ \d{4}|\d{4}))\s*$/i
  );
  if (dateMatch) {
    const dates = dateMatch[1].trim();
    const company = meta.slice(0, dateMatch.index).replace(/[,|·/]+$/, '').trim();
    return { company, location: '', dates };
  }

  // Fallback: treat entire string as company name
  return { company: meta, location: '', dates: '' };
}

// ---------------------------------------------------------------------------
// Internal: normalizeBasics
// ---------------------------------------------------------------------------

/** @internal */
function buildBasics(data: Record<string, unknown>): ResumeBasics {
  const basics = (data.basics as Record<string, unknown> | undefined) ?? {};

  const rawName = ((basics.name as string) || (data.name as string) || '').trim();
  // Reject strings that look like document titles rather than personal names
  const cleanName = /professional\s+summary|resume|curriculum\s+vitae|cv/i.test(rawName)
    ? ''
    : rawName.replace(/^[^a-zA-Z\s]+/g, '').trim();

  const pick = (bKey: string, dKey: string): string =>
    ((basics[bKey] as string) || (data[dKey] as string) || '').trim();

  const rawBasics = {
    email:     pick('email',     'email'),
    linkedin:  pick('linkedin',  'linkedin'),
    github:    pick('github',    'github'),
    portfolio: pick('portfolio', 'portfolio'),
  };

  const normalizedLinks = normalizeBasicsLinks(rawBasics);

  return {
    name:      cleanName,
    email:     normalizedLinks.email     ?? '',
    phone:     pick('phone', 'phone'),
    linkedin:  normalizedLinks.linkedin  ?? '',
    github:    normalizedLinks.github    ?? '',
    portfolio: normalizedLinks.portfolio ?? '',
    location:  pick('location',  'location'),
    tagline:   pick('tagline',   'tagline'),
  };
}

/** @internal Converts malformed optional collection fields to safe arrays. */
function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

// ---------------------------------------------------------------------------
// normalizeResume (main export)
// ---------------------------------------------------------------------------

/**
 * Normalizes raw AI-extracted resume data into a strongly-typed `NormalizedResume`.
 *
 * The input `data` is expected to be the JSON object returned by the AI tailoring
 * prompt's "original" block — but the function is defensive against any shape:
 * missing fields default to empty strings/arrays, never throw.
 *
 * Key normalizations applied:
 *  - Name: strips leading non-alpha characters; rejects document-title patterns.
 *  - Links: normalized via `normalizeBasicsLinks` (protocol, handle expansion).
 *  - Experience: entries with personal/side-project company names are rescued
 *    and merged into the `projects` array.
 *  - GPA: strips "CGPA:" / "GPA:" prefixes.
 *  - DSA: both `dsaProfiles` and `dsaProficiency` fields are unified.
 *  - Achievements: bullet items are flattened into the `awards` array.
 *
 * @param data - Raw AI-extracted resume JSON (unknown shape).
 * @returns      A fully-typed `NormalizedResume` object.
 *
 * @example
 * const normalized = normalizeResume(aiOutput.original);
 * console.log(normalized.basics.name);   // "Jane Doe"
 * console.log(normalized.skills.length); // 5
 */
export function normalizeResume(data: unknown): NormalizedResume {
  if (!data || typeof data !== 'object') {
    return buildEmptyResume();
  }

  const d = data as Record<string, unknown>;
  const basics = buildBasics(d);

  // ── Summary ──
  const summary = ((d.summary as string) || (d.tailoredSummary as string) || '').trim();

  // ── Skills ──
  const rawSkills = (d.skills || d.tailoredSkills) as unknown;
  let skills: SkillRow[] = [];
  if (Array.isArray(rawSkills)) {
    skills = rawSkills
      .map((s: unknown) => {
        if (typeof s === 'string') {
          return { label: 'Skills', value: s.trim() };
        }
        const skill = s as Record<string, unknown>;
        return {
          label: ((skill.label as string) || (skill.category as string) || '').trim(),
          value: (
            (skill.value as string) ||
            (Array.isArray(skill.items) ? (skill.items as string[]).join(', ') : String(skill.items ?? ''))
          ).trim(),
        };
      })
      .filter(s => s.label && s.value);
  } else if (rawSkills && typeof rawSkills === 'object') {
    skills = Object.entries(rawSkills as Record<string, unknown>).map(([k, v]) => ({
      label: k.trim(),
      value: Array.isArray(v) ? v.join(', ') : String(v).trim(),
    }));
  }

  // ── Experience (with project rescue) ──
  const experienceInput = d.experience || d.tailoredExperience;
  const rawExp = Array.isArray(experienceInput) ? experienceInput : [];
  const rescuedProjects: ProjectEntry[] = [];

  const experience: ExperienceEntry[] = rawExp
    .filter((exp: unknown) => {
      const e = exp as Record<string, unknown>;
      if (PERSONAL_PROJECT_MARKERS.test(((e.company as string) || '').trim())) {
        // Rescue into projects
        rescuedProjects.push({
          title: ((e.title as string) || '').trim(),
          tech:  ((e.tech as string) || '').trim(),
          meta:  ((e.meta as string) || (e.dates as string) || '').trim(),
          bullets: asArray(e.bullets)
            .map(b => String(b).trim())
            .filter(Boolean),
        });
        return false;
      }
      return true;
    })
    .map((exp: unknown): ExperienceEntry => {
      const e = exp as Record<string, unknown>;
      if (e.company && e.dates) {
        return {
          title:   ((e.title as string) || '').trim(),
          company: ((e.company as string) || '').trim(),
          location:((e.location as string) || '').trim(),
          dates:   ((e.dates as string) || '').trim(),
          tech:    ((e.tech as string) || '').trim(),
          bullets: asArray(e.bullets)
            .map(b => String(b).trim())
            .filter(Boolean),
        };
      }
      const parsed = parseMeta(((e.meta as string) || '') as string);
      return {
        title:   ((e.title as string) || '').trim(),
        company: parsed.company || ((e.company as string) || '').trim(),
        location:parsed.location || ((e.location as string) || '').trim(),
        dates:   parsed.dates || ((e.dates as string) || '').trim(),
        tech:    ((e.tech as string) || '').trim(),
        bullets: asArray(e.bullets)
          .map(b => String(b).trim())
          .filter(Boolean),
      };
    });

  // ── Projects ──
  const rawProjects = (Array.isArray(d.projects) ? d.projects : []).map(
    (p: unknown): ProjectEntry => {
      const proj = p as Record<string, unknown>;
      return {
        title:       ((proj.title as string) || '').trim(),
        tech:        ((proj.tech as string) || '').trim(),
        meta:        ((proj.meta as string) || '').trim(),
        bullets:     asArray(proj.bullets)
          .map(b => String(b).trim())
          .filter(Boolean),
        githubUrl:   ((proj.githubUrl as string) || '').trim() || undefined,
        liveDemoUrl: ((proj.liveDemoUrl as string) || '').trim() || undefined,
      };
    }
  );

  // Merge rescued projects (avoid title duplicates)
  const existingTitles = new Set(rawProjects.map(p => p.title.toLowerCase()));
  for (const rp of rescuedProjects) {
    if (rp.title && !existingTitles.has(rp.title.toLowerCase())) {
      rawProjects.push(rp);
      existingTitles.add(rp.title.toLowerCase());
    }
  }

  // ── Education ──
  const education: EducationEntry[] = (Array.isArray(d.education) ? d.education : []).map(
    (edu: unknown): EducationEntry => {
      const e = edu as Record<string, unknown>;
      const gpa = e.gpa
        ? String(e.gpa).replace(/(CGPA|GPA)\s*:?\s*/gi, '').trim()
        : '';
      const extrasArr = asArray(e.extra).filter(Boolean);
      const extras = (extrasArr as string[]).join(' · ');
      return {
        institution: ((e.institution as string) || '').trim(),
        degree:      ((e.degree as string) || '').trim(),
        dates:       ((e.dates as string) || '').trim(),
        gpa,
        extras,
      };
    }
  );

  // ── Awards (+ flattened achievements) ──
  const awards: AwardEntry[] = (Array.isArray(d.awards) ? d.awards : [])
    .map((a: unknown): AwardEntry => {
      const aw = a as Record<string, unknown>;
      return {
        title: ((aw.title as string) || '').trim(),
        org:   ((aw.org as string) || (aw.organization as string) || (aw.issuer as string) || '').trim(),
        desc:  ((aw.desc as string) || (aw.description as string) || '').trim(),
        date:  ((aw.date as string) || (aw.dates as string) || '').trim(),
      };
    })
    .filter(a => a.title);

  // Flatten achievements.bullets into awards
  const rawAchievements = Array.isArray(d.achievements) ? d.achievements : [];
  for (const ach of rawAchievements) {
    const a = ach as Record<string, unknown>;
    const bullets = asArray(a.bullets);
    for (const b of bullets) {
      const bullet = String(b).trim();
      if (bullet) {
        awards.push({ title: bullet, org: '', desc: '', date: '' });
      }
    }
  }

  // ── Certifications ──
  const certifications: CertificationEntry[] = (Array.isArray(d.certifications) ? d.certifications : [])
    .map((c: unknown): CertificationEntry => {
      const cert = c as Record<string, unknown>;
      return {
        title: ((cert.title as string) || '').trim(),
        org:   ((cert.org as string) || (cert.issuer as string) || '').trim(),
        dates: ((cert.dates as string) || (cert.date as string) || '').trim(),
        url:   ((cert.url as string) || (cert.link as string) || '').trim(),
      };
    })
    .filter(c => c.title);

  // ── DSA Profiles ──
  const rawDSA = (d.dsaProfiles || d.dsaProficiency) as unknown;
  const dsaProfiles = Array.isArray(rawDSA)
    ? rawDSA.map(item => String(item).trim()).filter(Boolean)
    : [];

  // ── Extracurricular ──
  const extracurricular: ExtracurricularEntry[] = (Array.isArray(d.extracurricular) ? d.extracurricular : []).map(
    (item: unknown): ExtracurricularEntry => {
      const it = item as Record<string, unknown>;
      return {
        title:   ((it.title as string) || (it.role as string) || '').trim(),
        bullets: asArray(it.bullets)
          .map(b => String(b).trim())
          .filter(Boolean),
      };
    }
  );

  // ── Languages ──
  const rawLangs = d.languages;
  const languages = Array.isArray(rawLangs)
    ? rawLangs.join(', ').trim()
    : ((rawLangs as string) || '').trim();

  return {
    basics,
    name:     basics.name,
    email:    basics.email,
    phone:    basics.phone,
    linkedin: basics.linkedin,
    github:   basics.github,
    portfolio:basics.portfolio,
    location: basics.location,
    tagline:  basics.tagline,
    summary,
    skills,
    experience,
    projects: rawProjects,
    education,
    awards,
    certifications,
    dsaProfiles,
    dsaProficiency: dsaProfiles, // alias
    extracurricular,
    languages,
  };
}

// ---------------------------------------------------------------------------
// buildEmptyResume (internal)
// ---------------------------------------------------------------------------

/** @internal Returns a zero-value NormalizedResume for error/empty inputs. */
function buildEmptyResume(): NormalizedResume {
  const basics: ResumeBasics = {
    name: '', email: '', phone: '', linkedin: '',
    github: '', portfolio: '', location: '', tagline: '',
  };
  return {
    basics,
    name: '', email: '', phone: '', linkedin: '',
    github: '', portfolio: '', location: '', tagline: '',
    summary: '', skills: [], experience: [], projects: [],
    education: [], awards: [], certifications: [],
    dsaProfiles: [], dsaProficiency: [],
    extracurricular: [], languages: '',
  };
}

// ---------------------------------------------------------------------------
// Re-export link utilities (convenience re-export)
// ---------------------------------------------------------------------------

export { normalizeLink, normalizeBasicsLinks };
