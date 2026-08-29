import React from 'react';
import { TemplateProps } from './types';

export function MinimalAtsTemplate({ resumeJson, density = 'standard' }: TemplateProps) {
  if (!resumeJson) return null;

  const info = resumeJson.personalInfo || {};
  const skills = resumeJson.skills || {};
  const experience = resumeJson.experience || [];
  const projects = resumeJson.projects || [];
  const education = resumeJson.education || [];
  const certifications = resumeJson.certifications || [];

  const sectionGap = density === 'compact' ? 'mb-3.5' : density === 'relaxed' ? 'mb-6' : 'mb-4.5';
  const itemGap = density === 'compact' ? 'space-y-2' : density === 'relaxed' ? 'space-y-3.5' : 'space-y-2.5';
  const bulletLeading = density === 'compact' ? 'leading-snug' : density === 'relaxed' ? 'leading-relaxed' : 'leading-normal';
  const textSize = density === 'compact' ? 'text-[12px]' : density === 'relaxed' ? 'text-[14px]' : 'text-[13px]';

  return (
    <div className={`font-sans text-neutral-900 bg-white p-6 sm:p-10 max-w-full ${textSize} transition-all`}>
      {/* Header - Left-aligned clean */}
      <header className="border-b-2 border-neutral-900 pb-2.5 mb-3.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 uppercase mb-0.5">
          {info.fullName || 'Your Full Name'}
        </h1>
        {info.title && (
          <div className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            {info.title}
          </div>
        )}

        <div className="text-xs text-neutral-700 space-x-2">
          {info.email && <span>{info.email}</span>}
          {info.phone && <span>| {info.phone}</span>}
          {info.location && <span>| {info.location}</span>}
          {info.linkedin && (
            <span>
              |{' '}
              <a
                href={info.linkedin.startsWith('http') ? info.linkedin : `https://${info.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                LinkedIn
              </a>
            </span>
          )}
          {info.github && (
            <span>
              |{' '}
              <a
                href={info.github.startsWith('http') ? info.github : `https://${info.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                GitHub
              </a>
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {resumeJson.summary && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-950 border-b border-neutral-300 pb-0.5 mb-1.5">
            Summary
          </h2>
          <p className={`text-neutral-800 ${bulletLeading}`}>
            {resumeJson.summary}
          </p>
        </section>
      )}

      {/* Skills */}
      {skills && Object.keys(skills).length > 0 && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-950 border-b border-neutral-300 pb-0.5 mb-1.5">
            Technical Skills
          </h2>
          <div className="space-y-1 text-xs text-neutral-800">
            {skills.languages && skills.languages.length > 0 && (
              <div>
                <span className="font-semibold text-neutral-950">Languages: </span>
                <span>{skills.languages.join(', ')}</span>
              </div>
            )}
            {skills.frameworks && skills.frameworks.length > 0 && (
              <div>
                <span className="font-semibold text-neutral-950">Frameworks & Libraries: </span>
                <span>{skills.frameworks.join(', ')}</span>
              </div>
            )}
            {skills.tools && skills.tools.length > 0 && (
              <div>
                <span className="font-semibold text-neutral-950">Tools & Cloud: </span>
                <span>{skills.tools.join(', ')}</span>
              </div>
            )}
            {skills.core && skills.core.length > 0 && (
              <div>
                <span className="font-semibold text-neutral-950">Core Concepts: </span>
                <span>{skills.core.join(', ')}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-950 border-b border-neutral-300 pb-0.5 mb-2">
            Experience
          </h2>
          <div className={itemGap}>
            {experience.map((exp: any, i: number) => (
              <div key={exp.id || i} className="page-break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-neutral-950">
                    {exp.title}, <span className="font-medium">{exp.company}</span>
                  </span>
                  <span className="text-xs text-neutral-600 shrink-0">
                    {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                {exp.location && (
                  <div className="text-[11px] text-neutral-500 mb-1">{exp.location}</div>
                )}
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className={`list-disc list-outside ml-4 space-y-1 text-neutral-800 ${bulletLeading}`}>
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-950 border-b border-neutral-300 pb-0.5 mb-2">
            Projects
          </h2>
          <div className={itemGap}>
            {projects.map((proj: any, i: number) => (
              <div key={proj.id || i} className="page-break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-neutral-950">
                    {proj.name}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="font-normal text-xs text-neutral-600">
                        {' '}
                        | {proj.technologies.join(', ')}
                      </span>
                    )}
                  </span>
                  {proj.link && (
                    <a
                      href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-600 underline"
                    >
                      Link
                    </a>
                  )}
                </div>
                {proj.description && (
                  <div className={`text-neutral-700 text-xs mb-1 ${bulletLeading}`}>{proj.description}</div>
                )}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className={`list-disc list-outside ml-4 space-y-1 text-neutral-800 ${bulletLeading}`}>
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-950 border-b border-neutral-300 pb-0.5 mb-1.5">
            Education
          </h2>
          <div className="space-y-1.5">
            {education.map((edu: any, i: number) => (
              <div key={edu.id || i} className="flex justify-between items-baseline page-break-inside-avoid">
                <div>
                  <span className="font-bold text-neutral-950">{edu.institution}</span>
                  <span className="text-neutral-800">
                    {' '}
                    — {edu.degree}
                    {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                    {edu.gpa ? ` (GPA: ${edu.gpa})` : ''}
                  </span>
                </div>
                <span className="text-xs text-neutral-600 shrink-0">
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-950 border-b border-neutral-300 pb-0.5 mb-1.5">
            Certifications
          </h2>
          <div className="space-y-1 text-xs text-neutral-800">
            {certifications.map((cert: any, i: number) => (
              <div key={cert.id || i} className="flex justify-between items-baseline">
                <span>
                  <span className="font-semibold text-neutral-950">{cert.name}</span> — {cert.issuer}
                </span>
                {cert.date && <span className="text-neutral-600">{cert.date}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
