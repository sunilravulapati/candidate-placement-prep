import React, { memo } from 'react';
import { AlignLeft, Lightbulb } from 'lucide-react';

interface SummaryFormProps {
  data: string;
  onChange: (value: string) => void;
}

export const SummaryForm = memo(function SummaryForm({
  data = '',
  onChange,
}: SummaryFormProps) {
  const wordCount = data.trim() ? data.trim().split(/\s+/).length : 0;
  const charCount = data.length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <AlignLeft className="w-5 h-5 text-violet-400" />
          Professional Summary
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          A concise 2–4 sentence summary highlighting your core expertise, years of experience, top tech stack, and key accomplishments.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            Summary Content
          </label>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>{wordCount} words</span>
            <span>•</span>
            <span className={charCount > 450 ? 'text-amber-400' : 'text-slate-400'}>
              {charCount} / 400 chars (recommended)
            </span>
          </div>
        </div>

        <textarea
          value={data}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          placeholder="Passionate Full-Stack Software Engineer with 4+ years of experience designing high-throughput distributed systems in Go and TypeScript. Proven track record of scaling cloud infrastructures and mentoring junior developers to ship robust features on time..."
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 leading-relaxed font-sans"
        />
      </div>

      {/* Writing Tips Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
          Pro-Tips for an ATS-Friendly Summary
        </div>
        <ul className="text-xs text-slate-400 space-y-1 pl-6 list-disc">
          <li>Include your exact target job title (e.g., <em>Frontend Engineer</em>, <em>DevOps Architect</em>).</li>
          <li>Mention your top 3–4 primary technologies and years of experience.</li>
          <li>Avoid fluff words like &quot;hardworking&quot; or &quot;motivated&quot;; focus on concrete technical domains.</li>
        </ul>
      </div>
    </div>
  );
});
