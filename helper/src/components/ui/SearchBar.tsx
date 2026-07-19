import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  className,
}: {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}) {
  const [query, setQuery] = useState('');

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        className="w-full bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-900/80 text-sm text-slate-200 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-600"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
