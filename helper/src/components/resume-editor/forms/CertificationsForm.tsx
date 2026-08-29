import React, { memo } from 'react';
import { Award, Plus, Trash2, Copy, ChevronUp, ChevronDown, Building2, Calendar, Link as LinkIcon } from 'lucide-react';

export interface CertificationItem {
  id?: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

interface CertificationsFormProps {
  data: CertificationItem[];
  onChange: (data: CertificationItem[]) => void;
}

export const CertificationsForm = memo(function CertificationsForm({
  data = [],
  onChange,
}: CertificationsFormProps) {
  const certsList = Array.isArray(data) ? data : [];

  const handleAddCert = () => {
    const newItem: CertificationItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
      url: '',
    };
    onChange([...certsList, newItem]);
  };

  const handleUpdateItem = (index: number, updatedFields: Partial<CertificationItem>) => {
    const updated = [...certsList];
    updated[index] = { ...updated[index], ...updatedFields };
    onChange(updated);
  };

  const handleDeleteItem = (index: number) => {
    onChange(certsList.filter((_, i) => i !== index));
  };

  const handleDuplicateItem = (index: number) => {
    const item = certsList[index];
    const duplicated: CertificationItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : `cert-${Date.now()}`,
      name: `${item.name} (Copy)`,
    };
    const updated = [...certsList];
    updated.splice(index + 1, 0, duplicated);
    onChange(updated);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === certsList.length - 1)
    )
      return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...certsList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-400" />
            Certifications & Licenses
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Add industry-recognized certifications (e.g. AWS Certified Solutions Architect, CKA, PMP).
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddCert}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-900/30 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Certificate
        </button>
      </div>

      {certsList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center">
          <Award className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">No certifications added yet</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Highlight technical credentials to give recruiters confidence in your skills.
          </p>
          <button
            type="button"
            onClick={handleAddCert}
            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-300 hover:bg-violet-500/20"
          >
            <Plus className="w-4 h-4" />
            Add First Certificate
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {certsList.map((cert, certIdx) => (
            <div
              key={cert.id || `cert-${certIdx}`}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4 shadow-md"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-400 border border-violet-500/20">
                    {certIdx + 1}
                  </span>
                  <span className="font-semibold text-sm text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                    {cert.name || 'Untitled Certification'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveItem(certIdx, 'up')}
                    disabled={certIdx === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg disabled:opacity-30"
                    title="Move Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveItem(certIdx, 'down')}
                    disabled={certIdx === certsList.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg disabled:opacity-30"
                    title="Move Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateItem(certIdx)}
                    className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(certIdx)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Certification Name <span className="text-violet-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={cert.name || ''}
                    onChange={(e) => handleUpdateItem(certIdx, { name: e.target.value })}
                    placeholder="e.g. AWS Certified Solutions Architect – Associate"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Issuing Organization <span className="text-violet-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={cert.issuer || ''}
                    onChange={(e) => handleUpdateItem(certIdx, { issuer: e.target.value })}
                    placeholder="e.g. Amazon Web Services, Linux Foundation"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Issue Date
                  </label>
                  <input
                    type="text"
                    value={cert.date || ''}
                    onChange={(e) => handleUpdateItem(certIdx, { date: e.target.value })}
                    placeholder="e.g. Sep 2023"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                    Credential Verification URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={cert.url || ''}
                    onChange={(e) => handleUpdateItem(certIdx, { url: e.target.value })}
                    placeholder="https://credly.com/badges/..."
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
