import React, { memo, useState } from 'react';
import {
  FolderGit2,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Globe,
  Code2,
  Tag,
  Sparkles,
  X,
} from 'lucide-react';

export interface ProjectItem {
  id?: string;
  name: string;
  description?: string;
  technologies: string[];
  link?: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  bullets: string[];
}

interface ProjectsFormProps {
  data: ProjectItem[];
  onChange: (data: ProjectItem[]) => void;
}

export const ProjectsForm = memo(function ProjectsForm({
  data = [],
  onChange,
}: ProjectsFormProps) {
  const projects = Array.isArray(data) ? data : [];
  const [techInputs, setTechInputs] = useState<Record<number, string>>({});

  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `proj-${Date.now()}`,
      name: '',
      description: '',
      technologies: [],
      link: '',
      githubUrl: '',
      bullets: [''],
    };
    onChange([...projects, newProj]);
  };

  const handleUpdateProject = (index: number, updatedFields: Partial<ProjectItem>) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], ...updatedFields };
    onChange(updated);
  };

  const handleDeleteProject = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  const handleDuplicateProject = (index: number) => {
    const item = projects[index];
    const duplicated: ProjectItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : `proj-${Date.now()}`,
      name: `${item.name} (Copy)`,
    };
    const updated = [...projects];
    updated.splice(index + 1, 0, duplicated);
    onChange(updated);
  };

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === projects.length - 1)
    )
      return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...projects];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
  };

  // Technologies Tag Handlers
  const handleAddTech = (projIdx: number) => {
    const tag = (techInputs[projIdx] || '').trim();
    if (!tag) return;
    const currentTech = projects[projIdx].technologies || [];
    if (!currentTech.includes(tag)) {
      handleUpdateProject(projIdx, { technologies: [...currentTech, tag] });
    }
    setTechInputs({ ...techInputs, [projIdx]: '' });
  };

  const handleRemoveTech = (projIdx: number, tagToRemove: string) => {
    const currentTech = projects[projIdx].technologies || [];
    handleUpdateProject(projIdx, {
      technologies: currentTech.filter((t) => t !== tagToRemove),
    });
  };

  // Bullets handlers
  const handleAddBullet = (projIdx: number) => {
    const updated = [...projects];
    const bullets = [...(updated[projIdx].bullets || []), ''];
    updated[projIdx] = { ...updated[projIdx], bullets };
    onChange(updated);
  };

  const handleUpdateBullet = (projIdx: number, bulletIndex: number, text: string) => {
    const updated = [...projects];
    const bullets = [...(updated[projIdx].bullets || [])];
    bullets[bulletIndex] = text;
    updated[projIdx] = { ...updated[projIdx], bullets };
    onChange(updated);
  };

  const handleDeleteBullet = (projIdx: number, bulletIndex: number) => {
    const updated = [...projects];
    const bullets = (updated[projIdx].bullets || []).filter((_, i) => i !== bulletIndex);
    updated[projIdx] = { ...updated[projIdx], bullets: bullets.length ? bullets : [''] };
    onChange(updated);
  };

  const handleMoveBullet = (projIdx: number, bulletIndex: number, direction: 'up' | 'down') => {
    const bullets = [...(projects[projIdx].bullets || [])];
    if (
      (direction === 'up' && bulletIndex === 0) ||
      (direction === 'down' && bulletIndex === bullets.length - 1)
    )
      return;
    const targetIndex = direction === 'up' ? bulletIndex - 1 : bulletIndex + 1;
    const [moved] = bullets.splice(bulletIndex, 1);
    bullets.splice(targetIndex, 0, moved);
    const updated = [...projects];
    updated[projIdx] = { ...updated[projIdx], bullets };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-violet-400" />
            Projects & Highlights
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Feature standout technical projects demonstrating your skills in production-like environments.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddProject}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-900/30 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center">
          <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">No projects added yet</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Showcase personal, open-source, or academic projects to validate your skills.
          </p>
          <button
            type="button"
            onClick={handleAddProject}
            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-300 hover:bg-violet-500/20"
          >
            <Plus className="w-4 h-4" />
            Add First Project
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((proj, projIdx) => (
            <div
              key={proj.id || `proj-${projIdx}`}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4 shadow-md transition-all hover:border-slate-700/80"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-400 border border-violet-500/20">
                    {projIdx + 1}
                  </span>
                  <span className="font-semibold text-sm text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                    {proj.name || 'Untitled Project'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveProject(projIdx, 'up')}
                    disabled={projIdx === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg disabled:opacity-30"
                    title="Move Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveProject(projIdx, 'down')}
                    disabled={projIdx === projects.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg disabled:opacity-30"
                    title="Move Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateProject(projIdx)}
                    className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg"
                    title="Duplicate Project"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(projIdx)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Project Name <span className="text-violet-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={proj.name || ''}
                    onChange={(e) => handleUpdateProject(projIdx, { name: e.target.value })}
                    placeholder="e.g. Distributed Task Orchestrator, E-Commerce AI Recommender"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                {/* Tech Stack Chips & Input */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    Tech Stack (Press Enter to add)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-slate-800 bg-slate-900/90 min-h-[42px]">
                    {(proj.technologies || []).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-lg bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(projIdx, t)}
                          className="hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={techInputs[projIdx] || ''}
                      onChange={(e) =>
                        setTechInputs({ ...techInputs, [projIdx]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTech(projIdx);
                        }
                      }}
                      onBlur={() => handleAddTech(projIdx)}
                      placeholder={proj.technologies?.length ? '+ Add more...' : 'e.g. Next.js, Go, Docker, Redis'}
                      className="flex-1 bg-transparent px-2 py-1 text-xs text-slate-100 placeholder-slate-600 focus:outline-none min-w-[120px]"
                    />
                  </div>
                </div>

                {/* Live Demo URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Live Demo / Product URL
                  </label>
                  <input
                    type="text"
                    value={proj.liveDemoUrl || proj.link || ''}
                    onChange={(e) =>
                      handleUpdateProject(projIdx, {
                        liveDemoUrl: e.target.value,
                        link: e.target.value,
                      })
                    }
                    placeholder="https://app.example.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>

                {/* GitHub Repository */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-slate-400" />
                    GitHub Repo URL
                  </label>
                  <input
                    type="text"
                    value={proj.githubUrl || ''}
                    onChange={(e) => handleUpdateProject(projIdx, { githubUrl: e.target.value })}
                    placeholder="https://github.com/username/project"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bullet Points Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    Project Details & Contributions
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddBullet(projIdx)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 hover:text-violet-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Bullet
                  </button>
                </div>

                <div className="space-y-2">
                  {(proj.bullets || ['']).map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 group">
                      <span className="text-slate-500 text-xs mt-2.5 select-none font-mono">•</span>
                      <textarea
                        value={bullet}
                        onChange={(e) => handleUpdateBullet(projIdx, bIdx, e.target.value)}
                        rows={2}
                        placeholder="Built scalable event processing pipeline in Go handling 10,000 req/sec with Apache Kafka..."
                        className="flex-1 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 leading-relaxed font-sans"
                      />
                      <div className="flex flex-col gap-1 pt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleMoveBullet(projIdx, bIdx, 'up')}
                          disabled={bIdx === 0}
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded disabled:opacity-20"
                          title="Move bullet up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveBullet(projIdx, bIdx, 'down')}
                          disabled={bIdx === (proj.bullets?.length || 1) - 1}
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded disabled:opacity-20"
                          title="Move bullet down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBullet(projIdx, bIdx)}
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
