import React from 'react';

export function SectionEditor({ section, data, onChange }: { section: string, data: any, onChange: (d: any) => void }) {
  if (!data) return <div className="p-8 text-gray-500">No data available for {section}</div>;

  if (typeof data === 'string') {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold mb-4 capitalize">{section}</h2>
        <textarea
          value={data}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4 capitalize">{section}</h2>
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Raw JSON Editor (Fallback for arrays/objects)</p>
        <textarea
          value={JSON.stringify(data, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch (err) {} // ignore parse errors until valid
          }}
          className="w-full h-[600px] p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg focus:outline-none"
        />
      </div>
    </div>
  );
}
