import React from 'react';
import { TemplateProps } from './types';

export function ClassicTemplate({ resumeJson, density = 'standard' }: TemplateProps) {
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
    <div className={`font-serif text-black bg-white p-6 sm:p-10 max-w-full ${textSize} transition-all`}>
      {/* Header - Centered traditional */}
      <header className="text-center border-b-2 border-black pb-3 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-black mb-1">
          {info.fullName || 'Your Full Name'}
        </h1>
        {info.title && (
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-700 mb-2">
            {info.title}
          </p>
        )}

        <div className="flex flex-wrap justify-center items-center gap-x-2 text-xs text-neutral-800 font-sans">
          {info.location && <span>{info.location}</span>}
          {info.phone && (
            <>
              <span>•</span>
              <span>{info.phone}</span>
            </>
          )}
          {info.email && (
            <>
              <span>•</span>
              <a href={`mailto:${info.email}`} className="hover:underline">
                {info.email}
              </a>
            </>
          )}
          {info.linkedin && (
            <>
              <span>•</span>
              <a
                href={info.linkedin.startsWith('http') ? info.linkedin : `https://${info.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                LinkedIn
              </a>
            </>
          )}
          {info.github && (
            <>
              <span>•</span>
              <a
                href={info.github.startsWith('http') ? info.github : `https://${info.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                GitHub
              </a>
            </>
          )}
        </div>
      </header>

      {/* Summary */}
      {resumeJson.summary && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-neutral-400 pb-0.5 mb-1.5 font-sans">
            Professional Summary
          </h2>
          <p className={`text-neutral-900 ${bulletLeading} text-justify`}>
            {resumeJson.summary}
          </p>
        </section>
      )}

      {/* Education - Classic resumes often place Education first or after summary */}
      {education && education.length > 0 && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-neutral-400 pb-0.5 mb-1.5 font-sans">
            Education
          </h2>
          <div className="space-y-1.5">
            {education.map((edu: any, i: number) => (
              <div key={edu.id || i} className="page-break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-black">{edu.institution}</span>
                  <span className="text-xs text-neutral-700 italic font-sans">
                    {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-xs text-neutral-800">
                  <span>
                    {edu.degree}
                    {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                  </span>
                  {edu.gpa && <span className="italic font-sans">GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {experience && experience.length > 0 && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-neutral-400 pb-0.5 mb-2 font-sans">
            Professional Experience
          </h2>
          <div className={itemGap}>
            {experience.map((exp: any, i: number) => (
              <div key={exp.id || i} className="page-break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-black">
                    {exp.company}
                    {exp.location ? <span className="font-normal italic">, {exp.location}</span> : ''}
                  </span>
                  <span className="text-xs text-neutral-700 italic font-sans">
                    {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                <div className="text-xs font-semibold italic text-neutral-800 mb-1">
                  {exp.title}
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className={`list-disc list-outside ml-5 space-y-1 text-neutral-900 ${bulletLeading}`}>
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
          <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-neutral-400 pb-0.5 mb-2 font-sans">
            Key Projects
          </h2>
          <div className={itemGap}>
            {projects.map((proj: any, i: number) => (
              <div key={proj.id || i} className="page-break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-black">{proj.name}</span>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <span className="text-xs italic text-neutral-700 font-sans">
                      {proj.technologies.join(', ')}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className={`text-neutral-800 text-xs italic mb-1 ${bulletLeading}`}>{proj.description}</p>
                )}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className={`list-disc list-outside ml-5 space-y-1 text-neutral-900 ${bulletLeading}`}>
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

      {/* Skills */}
      {skills && Object.keys(skills).length > 0 && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-neutral-400 pb-0.5 mb-1.5 font-sans">
            Technical Skills
          </h2>
          <div className="space-y-1 text-xs">
            {skills.languages && skills.languages.length > 0 && (
              <div>
                <span className="font-bold text-black">Languages: </span>
                <span className="text-neutral-800">{skills.languages.join(', ')}</span>
              </div>
            )}
            {skills.frameworks && skills.frameworks.length > 0 && (
              <div>
                <span className="font-bold text-black">Frameworks & Technologies: </span>
                <span className="text-neutral-800">{skills.frameworks.join(', ')}</span>
              </div>
            )}
            {skills.tools && skills.tools.length > 0 && (
              <div>
                <span className="font-bold text-black">Tools & Platforms: </span>
                <span className="text-neutral-800">{skills.tools.join(', ')}</span>
              </div>
            )}
            {skills.core && skills.core.length > 0 && (
              <div>
                <span className="font-bold text-black">Core Concepts: </span>
                <span className="text-neutral-800">{skills.core.join(', ')}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section className={sectionGap}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-neutral-400 pb-0.5 mb-1.5 font-sans">
            Certifications
          </h2>
          <div className="space-y-1 text-xs">
            {certifications.map((cert: any, i: number) => (
              <div key={cert.id || i} className="flex justify-between items-baseline">
                <span>
                  <span className="font-bold text-black">{cert.name}</span> — {cert.issuer}
                </span>
                {cert.date && <span className="text-neutral-600 font-sans">{cert.date}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
