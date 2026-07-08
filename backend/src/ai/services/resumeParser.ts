import { callStructuredAI } from './structuredOutput';
import { PARSE_RESUME_SYSTEM_PROMPT } from '../prompts/resume/parsePrompt';
import { AI_MODELS } from '../models';
import { logger } from '../../core/logger';
import { canonicalResumeSchema, CanonicalResume } from '../../features/resume/schema';

function asObject(value: any): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function asArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

function asString(value: any, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value)) return value.map((item) => asString(item)).filter(Boolean).join(', ') || fallback;
  if (typeof value === 'object') return fallback;
  return String(value).trim() || fallback;
}

function stringList(value: any): string[] {
  if (Array.isArray(value)) return value.map((item) => asString(item)).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeSkills(value: any) {
  const skills = asObject(value);
  if (Array.isArray(value) || typeof value === 'string') {
    return { core: stringList(value) };
  }

  return {
    languages: stringList(skills.languages || skills.programmingLanguages),
    frameworks: stringList(skills.frameworks || skills.libraries || skills.frameworksAndLibraries),
    tools: stringList(skills.tools || skills.platforms || skills.devOps || skills.devops),
    core: stringList(skills.core || skills.technical || skills.technicalSkills || skills.other),
  };
}

function normalizeResumeForSchema(data: any): CanonicalResume {
  const root = asObject(data?.resume || data?.canonicalResume || data);
  const personal = asObject(root.personalInfo || root.personal || root.contact || root.basics);
  const name = personal.fullName || personal.name || root.fullName || root.name;

  const rawExperience = asArray(root.experience || root.workExperience || root.employment || root.professionalExperience);
  const rawProjects = asArray(root.projects || root.projectExperience);
  const rawEducation = asArray(root.education);
  const rawCertifications = asArray(root.certifications || root.achievements);

  return {
    personalInfo: {
      fullName: asString(name),
      email: asString(personal.email || root.email) || undefined,
      phone: asString(personal.phone || root.phone) || undefined,
      location: asString(personal.location || root.location) || undefined,
      linkedin: asString(personal.linkedin || personal.linkedIn || root.linkedin) || undefined,
      portfolio: asString(personal.portfolio || personal.website || root.portfolio) || undefined,
      github: asString(personal.github || personal.gitHub || root.github) || undefined,
    },
    summary: asString(root.summary || root.professionalSummary || root.profile || root.objective),
    experience: rawExperience.map((item, index) => {
      const exp = asObject(item);
      const dateRange = asString(exp.dateRange || exp.duration || exp.period);
      const endDate = asString(exp.endDate || exp.end || exp.to || (dateRange.includes('-') ? dateRange.split('-').slice(1).join('-') : ''));
      return {
        title: asString(exp.title || exp.role || exp.position || exp.designation || exp.jobTitle, `Experience ${index + 1}`),
        company: asString(exp.company || exp.organization || exp.employer, 'Independent'),
        location: asString(exp.location) || undefined,
        startDate: asString(exp.startDate || exp.start || exp.from || (dateRange.includes('-') ? dateRange.split('-')[0] : dateRange)),
        endDate,
        current: typeof exp.current === 'boolean' ? exp.current : /present|current|now/i.test(endDate),
        bullets: stringList(exp.bullets || exp.responsibilities || exp.highlights || exp.description),
      };
    }),
    projects: rawProjects.map((item, index) => {
      const project = asObject(item);
      return {
        name: asString(project.name || project.title, `Project ${index + 1}`),
        description: asString(project.description || project.summary) || undefined,
        technologies: stringList(project.technologies || project.techStack || project.stack || project.tools),
        link: asString(project.link || project.url) || undefined,
        bullets: stringList(project.bullets || project.highlights || project.responsibilities || project.description),
      };
    }),
    education: rawEducation.map((item, index) => {
      const edu = asObject(item);
      return {
        institution: asString(edu.institution || edu.school || edu.university || edu.college, `Education ${index + 1}`),
        degree: asString(edu.degree || edu.qualification || edu.program),
        fieldOfStudy: asString(edu.fieldOfStudy || edu.field || edu.major) || undefined,
        startDate: asString(edu.startDate || edu.start || edu.from) || undefined,
        endDate: asString(edu.endDate || edu.end || edu.to || edu.year) || undefined,
        gpa: asString(edu.gpa || edu.cgpa) || undefined,
        bullets: stringList(edu.bullets || edu.highlights),
      };
    }),
    skills: normalizeSkills(root.skills || root.technicalSkills),
    certifications: rawCertifications.map((item, index) => {
      const cert = asObject(item);
      if (typeof item === 'string') {
        return { name: item, issuer: 'Not specified' };
      }
      return {
        name: asString(cert.name || cert.title || cert.description, `Certification ${index + 1}`),
        issuer: asString(cert.issuer || cert.organization || cert.provider, 'Not specified'),
        date: asString(cert.date || cert.year) || undefined,
        url: asString(cert.url || cert.link) || undefined,
      };
    }),
  };
}

export async function parseResumeToCanonicalJson(resumeText: string): Promise<CanonicalResume> {
  const startTime = Date.now();
  logger.info('Starting Resume JSON parsing...');

  try {
    const result = await callStructuredAI(
      [
        { role: 'system', content: PARSE_RESUME_SYSTEM_PROMPT },
        { role: 'user', content: `Parse the following resume text into structured JSON:\n\n${resumeText}` }
      ],
      (data) => canonicalResumeSchema.parse(normalizeResumeForSchema(data)),
      { model: AI_MODELS.DEFAULT_TEXT }
    );

    const parsedData = result.data;

    logger.info(`Resume parsing completed in ${Date.now() - startTime}ms`);
    return parsedData;
  } catch (error) {
    logger.error('Error parsing resume to JSON:', error);
    throw new Error('Failed to parse resume into structured data. ' + (error as Error).message);
  }
}
