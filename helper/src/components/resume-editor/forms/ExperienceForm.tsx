import React, { memo } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Building2,
  Calendar,
  MapPin,
  Sparkles,
} from 'lucide-react';

export interface ExperienceItem {
  id?: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

interface ExperienceFormProps {
  data: ExperienceItem[];
  onChange: (data: ExperienceItem[]) => void;
}

const ACTION_VERBS = [
  'Architected',
  'Spearheaded',
  'Engineered',
  'Optimized',
  'Automated',
  'Orchestrated',
  'Implemented',
  'Developed',
  'Streamlined',
  'Refactored',
];

export const ExperienceForm = memo(function ExperienceForm({
  data = [],
  onChange,
}: ExperienceFormProps) {
  const experiences = Array.isArray(data) ? data : [];

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `exp-${Date.now()}`,
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [''],
    };
    onChange([...experiences, newExp]);
  };

  const handleUpdateItem = (index: number, updatedFields: Partial<ExperienceItem>) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], ...updatedFields };
    onChange(updated);
  };

  const handleDeleteExperience = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  const handleDuplicateExperience = (index: number) => {
    const item = experiences[index];
    const duplicated: ExperienceItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : `exp-${Date.now()}`,
      title: `${item.title} (Copy)`,
    };
    const updated = [...experiences];
    updated.splice(index + 1, 0, duplicated);
    onChange(updated);
  };

  const handleMoveExperience = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === experiences.length - 1)
    )
      return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...experiences];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
  };

  // Bullet point handlers
  const handleAddBullet = (expIndex: number) => {
    const updated = [...experiences];
    const bullets = [...(updated[expIndex].bullets || []), ''];
    updated[expIndex] = { ...updated[expIndex], bullets };
    onChange(updated);
  };

  const handleUpdateBullet = (expIndex: number, bulletIndex: number, text: string) => {
    const updated = [...experiences];
    const bullets = [...(updated[expIndex].bullets || [])];
    bullets[bulletIndex] = text;
    updated[expIndex] = { ...updated[expIndex], bullets };
    onChange(updated);
  };

  const handleDeleteBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...experiences];
    const bullets = (updated[expIndex].bullets || []).filter((_, i) => i !== bulletIndex);
    updated[expIndex] = { ...updated[expIndex], bullets: bullets.length ? bullets : [''] };
    onChange(updated);
  };

  const handleMoveBullet = (expIndex: number, bulletIndex: number, direction: 'up' | 'down') => {
    const bullets = [...(experiences[expIndex].bullets || [])];
    if (
      (direction === 'up' && bulletIndex === 0) ||
      (direction === 'down' && bulletIndex === bullets.length - 1)
    )
      return;
    const targetIndex = direction === 'up' ? bulletIndex - 1 : bulletIndex + 1;
    const [moved] = bullets.splice(bulletIndex, 1);
    bullets.splice(targetIndex, 0, moved);
    const updated = [...experiences];
    updated[expIndex] = { ...updated[expIndex], bullets };
    onChange(updated);
  };

  const insertActionVerb = (expIndex: number, bulletIndex: number, verb: string) => {
    const currentText = experiences[expIndex].bullets?.[bulletIndex] || '';
    const newText = currentText ? `${verb} ${currentText}` : `${verb} `;
    handleUpdateBullet(expIndex, bulletIndex, newText);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-violet-400" />
            Work Experience
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            List your relevant roles in reverse-chronological order. Focus on measurable achievements.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddExperience}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-900/30 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Role
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center">
          <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">No work experience added yet</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Add full-time roles, internships, or freelance experience to strengthen your resume.
          </p>
          <button
            type="button"
            onClick={handleAddExperience}
            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-300 hover:bg-violet-500/20"
          >
            <Plus className="w-4 h-4" />
            Add First Experience
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((exp, expIdx) => (
            <div
              key={exp.id || `exp-${expIdx}`}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4 shadow-md transition-all hover:border-slate-700/80"
            >
              {/* Card Header & Controls */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-400 border border-violet-500/20">
                    {expIdx + 1}
                  </span>
                  <span className="font-semibold text-sm text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                    {exp.title || 'Untitled Role'} {exp.company ? `at ${exp.company}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveExperience(expIdx, 'up')}
                    disabled={expIdx === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveExperience(expIdx, 'down')}
                    disabled={expIdx === experiences.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateExperience(expIdx)}
                    className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg"
                    title="Duplicate Role"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExperience(expIdx)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                    title="Delete Role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Role Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Job Title / Role <span className="text-violet-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={exp.title || ''}
                    onChange={(e) => handleUpdateItem(expIdx, { title: e.target.value })}
                    placeholder="e.g. Software Engineer II"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Company Name <span className="text-violet-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={exp.company || ''}
                    onChange={(e) => handleUpdateItem(expIdx, { company: e.target.value })}
                    placeholder="e.g. Stripe, Amazon, Freelance"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={exp.location || ''}
                    onChange={(e) => handleUpdateItem(expIdx, { location: e.target.value })}
                    placeholder="e.g. Seattle, WA (Remote)"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                {/* Dates & Current */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Date Range
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!exp.current}
                        onChange={(e) =>
                          handleUpdateItem(expIdx, {
                            current: e.target.checked,
                            endDate: e.target.checked ? 'Present' : '',
                          })
                        }
                        className="rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500"
                      />
                      <span>Present</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.startDate || ''}
                      onChange={(e) => handleUpdateItem(expIdx, { startDate: e.target.value })}
                      placeholder="e.g. Jan 2022"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      disabled={!!exp.current}
                      value={exp.current ? 'Present' : exp.endDate || ''}
                      onChange={(e) => handleUpdateItem(expIdx, { endDate: e.target.value })}
                      placeholder="e.g. Present"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Bullet Points Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    Impact Bullet Points (Google X-Y-Z framework)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddBullet(expIdx)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 hover:text-violet-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Bullet
                  </button>
                </div>

                {/* Action Verbs Suggestion Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">
                    Quick Verbs:
                  </span>
                  {ACTION_VERBS.slice(0, 6).map((verb) => (
                    <button
                      key={verb}
                      type="button"
                      onClick={() =>
                        insertActionVerb(expIdx, (exp.bullets?.length || 1) - 1, verb)
                      }
                      className="shrink-0 rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-400 hover:border-violet-500/40 hover:text-violet-300"
                    >
                      +{verb}
                    </button>
                  ))}
                </div>

                {/* Bullets List */}
                <div className="space-y-2">
                  {(exp.bullets || ['']).map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 group">
                      <span className="text-slate-500 text-xs mt-2.5 select-none font-mono">
                        •
                      </span>
                      <textarea
                        value={bullet}
                        onChange={(e) => handleUpdateBullet(expIdx, bIdx, e.target.value)}
                        rows={2}
                        placeholder="Accomplished [X] as measured by [Y], by doing [Z] (e.g. Reduced API latency by 35% by rewriting queries in Go)..."
                        className="flex-1 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 leading-relaxed font-sans"
                      />
                      <div className="flex flex-col gap-1 pt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleMoveBullet(expIdx, bIdx, 'up')}
                          disabled={bIdx === 0}
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded disabled:opacity-20"
                          title="Move bullet up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveBullet(expIdx, bIdx, 'down')}
                          disabled={bIdx === (exp.bullets?.length || 1) - 1}
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded disabled:opacity-20"
                          title="Move bullet down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBullet(expIdx, bIdx)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded"
                          title="Delete bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
