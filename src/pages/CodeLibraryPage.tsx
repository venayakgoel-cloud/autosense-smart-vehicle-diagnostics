import { useMemo, useState } from 'react';
import { CarFront, MessageSquare, Search, ShieldAlert } from 'lucide-react';
import {
  findObdCodeDetails,
  SEVERITY_GUIDANCE,
  STANDARD_OBD_CODES,
  TRANSIT_GUIDANCE,
  VEHICLE_BRANDS,
} from '../data/obdCodes';
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
  const [brandFilter, setBrandFilter] = useState<string>('All Brands');
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
      const itemBrand = item.brand ?? 'Universal (SAE / ISO)';
      if (brandFilter !== 'All Brands' && itemBrand !== brandFilter) return false;
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (severityFilter !== 'All' && item.severity !== severityFilter) return false;
      if (!q) return true;
      return (
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        itemBrand.toLowerCase().includes(q)
      );
    });
  }, [mergedCodes, searchTerm, brandFilter, categoryFilter, severityFilter]);

  const decodedCustomMatch = useMemo(() => {
    const normalized = searchTerm.trim().toUpperCase();
    if (!/^[PCBU][0-3][0-9A-F]{3}$/.test(normalized)) return null;
    const existsInFiltered = filtered.some((item) => item.code.toUpperCase() === normalized);
    if (existsInFiltered) return null;
    return findObdCodeDetails(normalized, customCodes);
  }, [searchTerm, filtered, customCodes]);

  return (
    <div className="space-y-6">
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
              Multi-Brand OBD-II &amp; OEM Code Library
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Covers universal SAE/ISO codes plus manufacturer-specific faults across major global
              automakers and EV/Hybrid platforms. Type any 5-character code to decode it instantly.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums shrink-0">
            {filtered.length} of {mergedCodes.length} codes shown
          </span>
        </div>

        {/* Search & Brand Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search or decode any code (e.g. P0300, P1610, B2799, U0100, immobilizer)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white min-h-[44px]"
            />
          </div>

          <div className="lg:col-span-4 relative">
            <CarFront className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              aria-label="Filter by vehicle manufacturer"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white min-h-[44px]"
            >
              {VEHICLE_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category & Severity Filters */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] ${
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] ${
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

      {/* Universal SAE/OEM Fallback Decoder when user enters any valid 5-char code */}
      {decodedCustomMatch && (
        <article className="bg-[#0F172A] border border-blue-500/40 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono text-blue-400">
                UNIVERSAL SAE J2012 / OEM STRUCTURE DECODER
              </span>
              <div className="flex flex-wrap items-center gap-2.5 mt-1">
                <span className="font-mono text-xl font-bold text-white">
                  {decodedCustomMatch.code}
                </span>
                <span className="text-xs text-slate-400">
                  · {decodedCustomMatch.brand ?? 'Universal'} · {decodedCustomMatch.category}
                </span>
              </div>
              <h2 className="text-base font-semibold text-white mt-0.5">
                {decodedCustomMatch.name}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded border ${
                  SEVERITY_GUIDANCE[decodedCustomMatch.severity].badgeClass
                }`}
              >
                {SEVERITY_GUIDANCE[decodedCustomMatch.severity].label}
              </span>
              {decodedCustomMatch.transitEligibility && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded border ${
                    TRANSIT_GUIDANCE[decodedCustomMatch.transitEligibility].badgeClass
                  }`}
                >
                  {TRANSIT_GUIDANCE[decodedCustomMatch.transitEligibility].label}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{decodedCustomMatch.meaning}</p>

          <div className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-white">Recommended Professional Action</p>
            <p>{decodedCustomMatch.mechanicAdvice}</p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onAskAiAboutCode(decodedCustomMatch.code)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 min-h-[36px]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ask AutoSense AI for {decodedCustomMatch.code} Brand Details
            </button>
          </div>
        </article>
      )}

      {filtered.length === 0 && !decodedCustomMatch ? (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-10 text-center space-y-2">
          <ShieldAlert className="w-7 h-7 text-slate-500 mx-auto" />
          <p className="text-sm font-medium text-white">No matching error codes found</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try resetting your brand or category filters, or enter any valid 5-character OBD-II code
            (for example <span className="font-mono text-slate-200">P1345</span> or{' '}
            <span className="font-mono text-slate-200">U0121</span>) to decode its subsystem
            automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((entry) => {
            const sev = SEVERITY_GUIDANCE[entry.severity];
            const transit = entry.transitEligibility
              ? TRANSIT_GUIDANCE[entry.transitEligibility]
              : TRANSIT_GUIDANCE.Clearable;
            return (
              <article
                key={entry.code}
                className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-lg font-bold text-white">{entry.code}</span>
                        <span className="text-xs text-slate-400">
                          · {entry.brand ?? 'Universal / Admin'} · {entry.category}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-white mt-0.5">{entry.name}</h2>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded border shrink-0 ${sev.badgeClass}`}
                    >
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

                  <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-white">Driveability &amp; Transit Scope</span>
                      <span className={`font-medium px-2 py-0.5 rounded border ${transit.badgeClass}`}>
                        {transit.label}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {entry.transitNote ?? transit.summary}
                    </p>
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
