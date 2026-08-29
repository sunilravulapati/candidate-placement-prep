import React from 'react';
import { TemplateProps } from './types';
import { Mail, Phone, MapPin, Globe, ExternalLink, Link2, Code2 } from 'lucide-react';

export function ModernTechTemplate({ resumeJson, density = 'standard' }: TemplateProps) {
  if (!resumeJson) return null;

  const info = resumeJson.personalInfo || {};
  const skills = resumeJson.skills || {};
  const experience = resumeJson.experience || [];
  const projects = resumeJson.projects || [];
  const education = resumeJson.education || [];
  const certifications = resumeJson.certifications || [];

  // Spacing presets based on density
  const sectionGap = density === 'compact' ? 'mb-4' : density === 'relaxed' ? 'mb-7' : 'mb-5';
  const itemGap = density === 'compact' ? 'space-y-2.5' : density === 'relaxed' ? 'space-y-4' : 'space-y-3';
  const bulletLeading = density === 'compact' ? 'leading-snug' : density === 'relaxed' ? 'leading-relaxed' : 'leading-normal';
  const textSize = density === 'compact' ? 'text-[12px]' : density === 'relaxed' ? 'text-[14px]' : 'text-[13px]';

  return (
    <div className={`font-sans text-slate-900 bg-white p-6 sm:p-10 max-w-full ${textSize} transition-all`}>
      {/* Header */}
      <header className="border-b border-slate-200 pb-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mb-1">
          {info.fullName || 'Your Full Name'}
        </h1>
        {info.title && (
          <p className="text-sm font-semibold text-violet-700 mb-2.5">{info.title}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
          {info.email && (
            <a href={`mailto:${info.email}`} className="flex items-center gap-1 hover:text-violet-700">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{info.email}</span>
            </a>
          )}
          {info.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{info.phone}</span>
            </span>
          )}
          {info.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{info.location}</span>
            </span>
          )}
          {info.linkedin && (
            <a
              href={info.linkedin.startsWith('http') ? info.linkedin : `https://${info.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-violet-700"
            >
              <Link2 className="w-3 h-3 text-slate-400" />
              <span>{info.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'in/')}</span>
            </a>
          )}
          {info.github && (
            <a
              href={info.github.startsWith('http') ? info.github : `https://${info.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-violet-700"
            >
              <Code2 className="w-3 h-3 text-slate-400" />
              <span>{info.github.replace(/^https?:\/\/(www\.)?github\.com\//, 'github/')}</span>
            </a>
          )}
          {info.portfolio && (
            <a
              href={info.portfolio.startsWith('http') ? info.portfolio : `https://${info.portfolio}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-violet-700"
            >
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{info.portfolio.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      {resumeJson.summary && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-violet-900 border-b border-violet-100 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className={`text-slate-700 ${bulletLeading} text-justify`}>
            {resumeJson.summary}
          </p>
        </section>
      )}

      {/* Technical Skills */}
      {skills && Object.keys(skills).length > 0 && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-violet-900 border-b border-violet-100 pb-1 mb-2">
            Technical Skills
          </h2>
          <div className="space-y-1.5 text-xs">
            {skills.languages && skills.languages.length > 0 && (
              <div className="flex items-baseline">
                <span className="font-bold text-slate-800 w-32 shrink-0">Languages:</span>
                <span className="text-slate-700">{skills.languages.join(', ')}</span>
              </div>
            )}
            {skills.frameworks && skills.frameworks.length > 0 && (
              <div className="flex items-baseline">
                <span className="font-bold text-slate-800 w-32 shrink-0">Frameworks & Libs:</span>
                <span className="text-slate-700">{skills.frameworks.join(', ')}</span>
              </div>
            )}
            {skills.tools && skills.tools.length > 0 && (
              <div className="flex items-baseline">
                <span className="font-bold text-slate-800 w-32 shrink-0">Tools & Cloud:</span>
                <span className="text-slate-700">{skills.tools.join(', ')}</span>
              </div>
            )}
            {skills.core && skills.core.length > 0 && (
              <div className="flex items-baseline">
                <span className="font-bold text-slate-800 w-32 shrink-0">Core Competencies:</span>
                <span className="text-slate-700">{skills.core.join(', ')}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {experience && experience.length > 0 && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-violet-900 border-b border-violet-100 pb-1 mb-2.5">
            Work Experience
          </h2>
          <div className={itemGap}>
            {experience.map((exp: any, i: number) => (
              <div key={exp.id || i} className="page-break-inside-avoid">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-0.5">
                  <span className="font-bold text-slate-900">
                    {exp.title} <span className="font-normal text-slate-600">at</span>{' '}
                    <span className="font-semibold text-slate-800">{exp.company}</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500 shrink-0">
                    {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                {exp.location && (
                  <p className="text-[11px] text-slate-500 italic mb-1.5">{exp.location}</p>
                )}
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className={`list-disc list-outside ml-4 space-y-1 text-slate-700 ${bulletLeading}`}>
                    {exp.bullets.filter(Boolean).map((bullet: string, j: number) => (
                      <li key={j}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-violet-900 border-b border-violet-100 pb-1 mb-2.5">
            Featured Projects
          </h2>
          <div className={itemGap}>
            {projects.map((proj: any, i: number) => (
              <div key={proj.id || i} className="page-break-inside-avoid">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{proj.name}</span>
                    {proj.link && (
                      <a
                        href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 hover:text-violet-800 inline-flex items-center gap-0.5 text-xs font-medium"
                      >
                        <span>Demo</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <span className="text-[11px] font-mono text-violet-800 bg-violet-50 px-2 py-0.5 rounded border border-violet-100/80">
                      {proj.technologies.join(' • ')}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className={`text-slate-600 mb-1 ${bulletLeading}`}>{proj.description}</p>
                )}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className={`list-disc list-outside ml-4 space-y-1 text-slate-700 ${bulletLeading}`}>
                    {proj.bullets.filter(Boolean).map((bullet: string, j: number) => (
                      <li key={j}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-violet-900 border-b border-violet-100 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu: any, i: number) => (
              <div key={edu.id || i} className="flex justify-between items-baseline page-break-inside-avoid">
                <div>
                  <span className="font-bold text-slate-900">{edu.institution}</span>
                  <p className="text-slate-700">
                    {edu.degree}
                    {edu.fieldOfStudy ? `, in ${edu.fieldOfStudy}` : ''}
                    {edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-500 shrink-0">
                  {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-violet-900 border-b border-violet-100 pb-1 mb-2">
            Certifications
          </h2>
          <div className="space-y-1 text-xs">
            {certifications.map((cert: any, i: number) => (
              <div key={cert.id || i} className="flex justify-between items-baseline">
                <span className="font-semibold text-slate-800">
                  {cert.name} <span className="font-normal text-slate-600">— {cert.issuer}</span>
                </span>
                {cert.date && <span className="text-slate-500">{cert.date}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
