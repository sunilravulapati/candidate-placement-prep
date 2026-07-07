import React from 'react';

export function HtmlRenderer({ resumeJson }: { resumeJson: any }) {
  if (!resumeJson) return null;

  return (
    <div className="p-8 max-w-[21cm] mx-auto bg-white min-h-[29.7cm] shadow-sm">
      <div className="text-center mb-6 border-b-2 border-gray-900 pb-4">
        <h1 className="text-4xl font-serif text-gray-900 mb-2">{resumeJson.personalInfo?.fullName}</h1>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
          {resumeJson.personalInfo?.email && <span>{resumeJson.personalInfo.email}</span>}
          {resumeJson.personalInfo?.phone && <span>• {resumeJson.personalInfo.phone}</span>}
          {resumeJson.personalInfo?.location && <span>• {resumeJson.personalInfo.location}</span>}
          {resumeJson.personalInfo?.linkedin && <span>• {resumeJson.personalInfo.linkedin}</span>}
        </div>
      </div>

      {resumeJson.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 mb-2 uppercase tracking-wide">Professional Summary</h2>
          <p className="text-gray-800 text-sm leading-relaxed">{resumeJson.summary}</p>
        </div>
      )}

      {resumeJson.experience && resumeJson.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 mb-3 uppercase tracking-wide">Experience</h2>
          <div className="space-y-4">
            {resumeJson.experience.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                  <span className="text-sm text-gray-600 font-medium">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-gray-800 italic text-sm">{exp.company}</span>
                  <span className="text-gray-500 text-sm">{exp.location}</span>
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1">
                  {exp.bullets?.map((bullet: string, j: number) => (
                    <li key={j} className="text-sm text-gray-700 leading-relaxed">{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {resumeJson.projects && resumeJson.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 mb-3 uppercase tracking-wide">Projects</h2>
          <div className="space-y-4">
            {resumeJson.projects.map((proj: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                  {proj.technologies && (
                    <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {proj.technologies.join(', ')}
                    </span>
                  )}
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1">
                  {proj.bullets?.map((bullet: string, j: number) => (
                    <li key={j} className="text-sm text-gray-700 leading-relaxed">{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {resumeJson.skills && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 mb-3 uppercase tracking-wide">Skills</h2>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {resumeJson.skills.languages && resumeJson.skills.languages.length > 0 && (
              <div><span className="font-semibold text-gray-900">Languages:</span> <span className="text-gray-700">{resumeJson.skills.languages.join(', ')}</span></div>
            )}
            {resumeJson.skills.frameworks && resumeJson.skills.frameworks.length > 0 && (
              <div><span className="font-semibold text-gray-900">Frameworks:</span> <span className="text-gray-700">{resumeJson.skills.frameworks.join(', ')}</span></div>
            )}
            {resumeJson.skills.tools && resumeJson.skills.tools.length > 0 && (
              <div><span className="font-semibold text-gray-900">Tools:</span> <span className="text-gray-700">{resumeJson.skills.tools.join(', ')}</span></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
