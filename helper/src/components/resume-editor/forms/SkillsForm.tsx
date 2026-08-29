import React, { memo, useState } from 'react';
import { Code, X, Layers, Wrench, Cpu, Lightbulb } from 'lucide-react';

export interface SkillsData {
  languages?: string[];
  frameworks?: string[];
  tools?: string[];
  core?: string[];
  libraries?: string[];
  databases?: string[];
  [key: string]: string[] | undefined;
}

interface SkillsFormProps {
  data: SkillsData;
  onChange: (data: SkillsData) => void;
}

interface CategoryConfig {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  examples: string[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'languages',
    label: 'Programming Languages',
    icon: Code,
    placeholder: 'Type a language and press Enter (e.g. Python, TypeScript, Go, Java, SQL, Rust)',
    examples: ['TypeScript', 'Python', 'Go', 'Java', 'SQL', 'C++', 'Rust', 'JavaScript'],
  },
  {
    key: 'frameworks',
    label: 'Frameworks & Libraries',
    icon: Layers,
    placeholder: 'Type a framework and press Enter (e.g. React, Next.js, Node.js, FastAPI, Spring)',
    examples: ['React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'Spring Boot', 'TailwindCSS'],
  },
  {
    key: 'tools',
    label: 'Developer Tools, Cloud & DevOps',
    icon: Wrench,
    placeholder: 'Type a tool/cloud tech and press Enter (e.g. AWS, Docker, Kubernetes, Git, Redis)',
    examples: ['AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'Git', 'Kafka', 'CI/CD'],
  },
  {
    key: 'core',
    label: 'Core Concepts & Architectures',
    icon: Cpu,
    placeholder: 'Type a core concept and press Enter (e.g. Distributed Systems, Microservices, REST APIs)',
    examples: ['Distributed Systems', 'Microservices', 'REST APIs', 'GraphQL', 'System Design', 'TDD'],
  },
];

export const SkillsForm = memo(function SkillsForm({
  data = {},
  onChange,
}: SkillsFormProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const handleAddTag = (categoryKey: string, tagToAdd?: string) => {
    const rawTag = tagToAdd || inputValues[categoryKey] || '';
    const tag = rawTag.trim();
    if (!tag) return;

    const currentList = Array.isArray(data[categoryKey]) ? (data[categoryKey] as string[]) : [];
    if (!currentList.includes(tag)) {
      onChange({
        ...data,
        [categoryKey]: [...currentList, tag],
      });
    }

    setInputValues({
      ...inputValues,
      [categoryKey]: '',
    });
  };

  const handleRemoveTag = (categoryKey: string, tagToRemove: string) => {
    const currentList = Array.isArray(data[categoryKey]) ? (data[categoryKey] as string[]) : [];
    onChange({
      ...data,
      [categoryKey]: currentList.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Code className="w-5 h-5 text-violet-400" />
          Technical Skills & Categorization
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Organize your technical competencies into clean, searchable categories to optimize ATS keyword matching.
        </p>
      </div>

      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const tags = Array.isArray(data[cat.key]) ? (data[cat.key] as string[]) : [];
          const currentInput = inputValues[cat.key] || '';

          return (
            <div
              key={cat.key}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3.5 shadow-md"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-violet-400" />
                  {cat.label}
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({tags.length} added)
                  </span>
                </label>
              </div>

              {/* Tag Chips Container */}
              <div className="flex flex-wrap items-center gap-2 min-h-[44px] rounded-xl border border-slate-800 bg-slate-900/90 p-2.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500/10 border border-violet-500/25 px-2.5 py-1 text-xs font-semibold text-violet-200 group transition-colors hover:border-rose-500/30"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(cat.key, tag)}
                      className="text-violet-400 hover:text-rose-400 transition-colors"
                      title={`Remove ${tag}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) =>
                    setInputValues({ ...inputValues, [cat.key]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(cat.key);
                    }
                  }}
                  onBlur={() => {
                    if (currentInput.trim()) handleAddTag(cat.key);
                  }}
                  placeholder={tags.length === 0 ? cat.placeholder : '+ Add more... (Press Enter)'}
                  className="flex-1 bg-transparent px-2 py-1 text-xs text-slate-100 placeholder-slate-600 focus:outline-none min-w-[200px]"
                />
              </div>

              {/* Quick suggestions if few tags */}
              {tags.length < 4 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-400" /> Suggestions:
                  </span>
                  {cat.examples
                    .filter((ex) => !tags.includes(ex))
                    .slice(0, 6)
                    .map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => handleAddTag(cat.key, ex)}
                        className="rounded-md border border-slate-800/80 bg-slate-900/60 px-2 py-0.5 text-[10px] font-medium text-slate-400 hover:border-violet-500/30 hover:text-violet-300 transition-colors"
                      >
                        +{ex}
                      </button>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
