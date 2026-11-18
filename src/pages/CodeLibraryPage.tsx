import { useMemo, useState } from 'react';
import { MessageSquare, Search } from 'lucide-react';
import { SEVERITY_GUIDANCE, STANDARD_OBD_CODES } from '../data/obdCodes';
import type { ObdCategory, ObdCodeEntry, SeverityLevel } from '../types/autosense';

interface CodeLibraryPageProps {
  customCodes: ObdCodeEntry[];
  onAskAiAboutCode: (code: string) => void;
}

const CATEGORIES: Array<'All' | ObdCategory> = [
  'All',
  'Engine',
  'Fuel & Air',
  'Ignition',
  'Emissions',
  'Transmission',
  'Electrical',
  'Sensors',
];

const SEVERITIES: Array<'All' | SeverityLevel> = ['All', 'Critical', 'High', 'Medium', 'Low'];

export function CodeLibraryPage({ customCodes, onAskAiAboutCode }: CodeLibraryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ObdCategory>('All');
  const [severityFilter, setSeverityFilter] = useState<'All' | SeverityLevel>('All');

  const mergedCodes = useMemo(() => {
    const map = new Map<string, ObdCodeEntry>();
    for (const c of STANDARD_OBD_CODES) {
      map.set(c.code.toUpperCase(), c);
    }
    for (const c of customCodes) {
      map.set(c.code.toUpperCase(), c);
    }
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [customCodes]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return mergedCodes.filter((item) => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (severityFilter !== 'All' && item.severity !== severityFilter) return false;
      if (!q) return true;
      return (
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q)
      );
    });
  }, [mergedCodes, searchTerm, categoryFilter, severityFilter]);

  return (
    <div className="space-y-6">
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
              OBD-II Error Code Library
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Search standard diagnostic trouble codes for simple explanations and recommended
              actions.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {filtered.length} of {mergedCodes.length} codes shown
          </span>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code (e.g. P0300) or error name (e.g. misfire, lean, coolant)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0B1120] border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Severity:</span>
            {SEVERITIES.map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  severityFilter === sev
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0B1120] border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-10 text-center space-y-2">
          <p className="text-sm font-medium text-white">No matching error codes found</p>
          <p className="text-xs text-slate-400">
            Try clearing one of your active filters or ask AutoSense AI about an extended code.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((entry) => {
            const sev = SEVERITY_GUIDANCE[entry.severity];
            return (
              <article
                key={entry.code}
                className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-lg font-bold text-white">{entry.code}</span>
                        <span className="text-xs text-slate-400">· {entry.category}</span>
                      </div>
                      <h2 className="text-base font-semibold text-white mt-0.5">{entry.name}</h2>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border shrink-0 ${sev.badgeClass}`}>
                      {sev.label}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">{entry.meaning}</p>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-1">Possible causes</p>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                      {entry.possibleCauses.map((cause) => (
                        <li key={cause}>{cause}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800/80 space-y-1 text-xs">
                    <p className="font-semibold text-white">Recommended Professional Action</p>
                    <p className="text-slate-300 leading-relaxed">{entry.mechanicAdvice}</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onAskAiAboutCode(entry.code)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 min-h-[36px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Ask AutoSense AI about {entry.code}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
