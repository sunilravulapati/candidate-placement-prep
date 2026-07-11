// backend/src/features/resume/canonicalJsonToText.ts
//
// Shared utility: converts a CanonicalResume JSON object into human-readable
// plain text suitable for AI analysis pipelines.
//
// This is the single authoritative implementation. Every backend service
// (analyzeResume, tailoring, match engine) must use this instead of
// ad-hoc JSON.stringify() or partial serialization.
//
// The text format mirrors what a PDF-extracted resume would look like so that
// the analysis pipeline produces identical quality output for both sources.

import type { CanonicalResume } from './schema';

/**
 * Serializes a CanonicalResume JSON object into plain text for AI pipelines.
 *
 * Sections included (in order):
 *   Header → Summary → Skills → Experience → Projects → Education → Certifications
 *
 * @param resume - CanonicalResume or unknown JSON (graceful fallback)
 * @returns        Human-readable resume text
 */
export function resumeJsonToText(resume: CanonicalResume | Record<string, unknown> | null | undefined): string {
  if (!resume || typeof resume !== 'object') return '';

  const r = resume as any;
  const lines: string[] = [];

  const push = (value?: string | null) => {
    const v = value ? String(value).trim() : '';
    if (v) lines.push(v);
  };

  const pushSection = (title: string) => {
    lines.push('');
    lines.push(`=== ${title.toUpperCase()} ===`);
  };

  // ── Header ─────────────────────────────────────────────────────────────────

  const p = r.personalInfo || {};
  push(p.fullName || r.name);

  const contactParts: string[] = [];
  if (p.email) contactParts.push(p.email);
  if (p.phone) contactParts.push(p.phone);
  if (p.location) contactParts.push(p.location);
  if (p.linkedin) contactParts.push(p.linkedin);
  if (p.github) contactParts.push(p.github);
  if (p.portfolio) contactParts.push(p.portfolio);
  if (contactParts.length) lines.push(contactParts.join(' | '));

  // ── Summary ────────────────────────────────────────────────────────────────

  if (r.summary) {
    pushSection('Summary');
    push(r.summary);
  }

  // ── Skills ─────────────────────────────────────────────────────────────────

  const skills = r.skills;
  if (skills && typeof skills === 'object') {
    const skillGroups: string[] = [];
    const groups: Record<string, string> = {
      languages: 'Languages',
      frameworks: 'Frameworks',
      tools: 'Tools',
      core: 'Core',
    };
    for (const [key, label] of Object.entries(groups)) {
      const group = skills[key];
      if (Array.isArray(group) && group.length > 0) {
        skillGroups.push(`${label}: ${group.join(', ')}`);
      }
    }
    if (skillGroups.length) {
      pushSection('Skills');
      skillGroups.forEach(push);
    }
  }

  // ── Experience ─────────────────────────────────────────────────────────────

  const experience = Array.isArray(r.experience) ? r.experience : [];
  if (experience.length) {
    pushSection('Experience');
    for (const exp of experience) {
      if (!exp || typeof exp !== 'object') continue;
      const dateStr = `${exp.startDate || ''} – ${exp.current ? 'Present' : (exp.endDate || '')}`.trim();
      push(`${exp.title || 'Role'} at ${exp.company || 'Company'}${exp.location ? `, ${exp.location}` : ''}${dateStr ? ` (${dateStr})` : ''}`);
      const bullets = Array.isArray(exp.bullets) ? exp.bullets : [];
      bullets.forEach((b: string) => push(`• ${b}`));
    }
  }

  // ── Projects ───────────────────────────────────────────────────────────────

  const projects = Array.isArray(r.projects) ? r.projects : [];
  if (projects.length) {
    pushSection('Projects');
    for (const proj of projects) {
      if (!proj || typeof proj !== 'object') continue;
      push(proj.name || 'Project');
      if (proj.description) push(proj.description);
      const techs = Array.isArray(proj.technologies) ? proj.technologies : [];
      if (techs.length) push(`Technologies: ${techs.join(', ')}`);
      const bullets = Array.isArray(proj.bullets) ? proj.bullets : [];
      bullets.forEach((b: string) => push(`• ${b}`));
    }
  }

  // ── Education ──────────────────────────────────────────────────────────────

  const education = Array.isArray(r.education) ? r.education : [];
  if (education.length) {
    pushSection('Education');
    for (const edu of education) {
      if (!edu || typeof edu !== 'object') continue;
      const degree = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');
      const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');
      push(`${edu.institution || ''}${degree ? ` — ${degree}` : ''}${dates ? ` (${dates})` : ''}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`);
      const bullets = Array.isArray(edu.bullets) ? edu.bullets : [];
      bullets.forEach((b: string) => push(`• ${b}`));
    }
  }

  // ── Certifications ─────────────────────────────────────────────────────────

  const certs = Array.isArray(r.certifications) ? r.certifications : [];
  if (certs.length) {
    pushSection('Certifications');
    for (const cert of certs) {
      if (!cert) continue;
      if (typeof cert === 'string') { push(cert); continue; }
      push(`${cert.name || ''}${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`);
    }
  }

  // ── Achievements ───────────────────────────────────────────────────────────

  const achievements = Array.isArray(r.achievements) ? r.achievements : [];
  if (achievements.length) {
    pushSection('Achievements');
    achievements.forEach((a: any) => {
      if (typeof a === 'string') push(`• ${a}`);
      else if (a && typeof a === 'object') push(`• ${a.title || a.name || a.description || ''}`);
    });
  }

  return lines.join('\n').trim();
}
