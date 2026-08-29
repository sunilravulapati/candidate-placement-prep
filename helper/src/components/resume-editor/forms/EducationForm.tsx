import React, { memo } from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Building2,
  Calendar,
  Award,
} from 'lucide-react';

export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  bullets?: string[];
}

interface EducationFormProps {
  data: EducationItem[];
  onChange: (data: EducationItem[]) => void;
}

export const EducationForm = memo(function EducationForm({
  data = [],
  onChange,
}: EducationFormProps) {
  const educationList = Array.isArray(data) ? data : [];

  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      gpa: '',
      bullets: [],
    };
    onChange([...educationList, newItem]);
  };

  const handleUpdateItem = (index: number, updatedFields: Partial<EducationItem>) => {
    const updated = [...educationList];
    updated[index] = { ...updated[index], ...updatedFields };
    onChange(updated);
  };

  const handleDeleteItem = (index: number) => {
    onChange(educationList.filter((_, i) => i !== index));
  };

  const handleDuplicateItem = (index: number) => {
    const item = educationList[index];
    const duplicated: EducationItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : `edu-${Date.now()}`,
    };
    const updated = [...educationList];
    updated.splice(index + 1, 0, duplicated);
    onChange(updated);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === educationList.length - 1)
    )
      return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...educationList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-violet-400" />
            Education & Academics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            List degrees, institutions, graduation dates, GPA (if &gt; 3.5), and academic honors.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddEducation}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-900/30 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Degree
        </button>
      </div>

      {educationList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center">
          <GraduationCap className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">No education entries added yet</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Add your university degrees, colleges, or bootcamps.
          </p>
          <button
            type="button"
            onClick={handleAddEducation}
            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-300 hover:bg-violet-500/20"
          >
            <Plus className="w-4 h-4" />
            Add First Degree
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {educationList.map((edu, eduIdx) => (
            <div
              key={edu.id || `edu-${eduIdx}`}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4 shadow-md transition-all hover:border-slate-700/80"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-400 border border-violet-500/20">
                    {eduIdx + 1}
                  </span>
                  <span className="font-semibold text-sm text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                    {edu.degree || 'Degree'} {edu.institution ? `at ${edu.institution}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveItem(eduIdx, 'up')}
                    disabled={eduIdx === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg disabled:opacity-30"
                    title="Move Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveItem(eduIdx, 'down')}
                    disabled={eduIdx === educationList.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg disabled:opacity-30"
                    title="Move Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateItem(eduIdx)}
                    className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg"
                    title="Duplicate Degree"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(eduIdx)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                    title="Delete Degree"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Institution Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    University / Institution <span className="text-violet-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) => handleUpdateItem(eduIdx, { institution: e.target.value })}
                    placeholder="e.g. University of California, Berkeley"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                {/* Degree */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    Degree Type <span className="text-violet-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) => handleUpdateItem(eduIdx, { degree: e.target.value })}
                    placeholder="e.g. Bachelor of Science (B.S.)"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                {/* Field of Study */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Major / Field of Study
                  </label>
                  <input
                    type="text"
                    value={edu.fieldOfStudy || ''}
                    onChange={(e) => handleUpdateItem(eduIdx, { fieldOfStudy: e.target.value })}
                    placeholder="e.g. Computer Science, Data Engineering"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                {/* Date Range */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Start & Graduation Dates
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={edu.startDate || ''}
                      onChange={(e) => handleUpdateItem(eduIdx, { startDate: e.target.value })}
                      placeholder="e.g. Aug 2020"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={edu.endDate || ''}
                      onChange={(e) => handleUpdateItem(eduIdx, { endDate: e.target.value })}
                      placeholder="e.g. May 2024"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* GPA */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    GPA / Honors (Optional)
                  </label>
                  <input
                    type="text"
                    value={edu.gpa || ''}
                    onChange={(e) => handleUpdateItem(eduIdx, { gpa: e.target.value })}
                    placeholder="e.g. 3.85 / 4.0 (Dean's Honors List)"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
