import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Gauge,
  Loader2,
  Lock,
  MessageSquare,
  Play,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Truck,
  Wrench,
} from 'lucide-react';
import { DEMO_SCAN_PRESETS } from '../data/demoData';
import {
  classifySensorBypassEligibility,
  findObdCodeDetails,
  SEVERITY_GUIDANCE,
  TRANSIT_CONTROL_PROFILES,
  TRANSIT_GUIDANCE,
} from '../data/obdCodes';
import { runDiagnosticSequence, type ObdScanProgress } from '../services/obdService';
import { downloadDiagnosticPdf } from '../services/pdfReport';
import type {
  AppSection,
  ConnectionMode,
  DiagnosticScan,
  ObdCodeEntry,
  TransitControlProfile,
  TransitControlProfileId,
  Vehicle,
} from '../types/autosense';

interface DiagnosticsPageProps {
  activeVehicle: Vehicle | undefined;
  connectionMode: ConnectionMode;
  latestScan: DiagnosticScan | undefined;
  customCodes: ObdCodeEntry[];
  onSaveNewScan: (
    scan: Omit<DiagnosticScan, 'id' | 'scannedAt' | 'updatedAt'>
  ) => Promise<string | void>;
  onApplyControlledBypass: (
    scan: DiagnosticScan,
    bypassedCodes: string[],
    profile: TransitControlProfile,
    newlyModifiedCodes: string[],
    blockedCodes: string[]
  ) => Promise<void>;
  onAskAiAboutCode: (code: string) => void;
  onNavigate: (section: AppSection) => void;
}

export function DiagnosticsPage({
  activeVehicle,
  connectionMode,
  latestScan,
  customCodes,
  onSaveNewScan,
  onApplyControlledBypass,
  onAskAiAboutCode,
  onNavigate,
}: DiagnosticsPageProps) {
  const [selectedPresetId, setSelectedPresetId] = useState(DEMO_SCAN_PRESETS[1].id);
  const [customDtcInput, setCustomDtcInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [applyingBypass, setApplyingBypass] = useState(false);
  const [selectedBypassCodes, setSelectedBypassCodes] = useState<string[]>([]);
  const [selectedProfileId, setSelectedProfileId] =
    useState<TransitControlProfileId>('city_crawl');
  const [activeTransitBanner, setActiveTransitBanner] = useState<{
    profile: TransitControlProfile;
    bypassedCodes: string[];
    blockedCodes: string[];
  } | null>(null);
  const [progress, setProgress] = useState<ObdScanProgress | null>(null);
  const [justCompletedScan, setJustCompletedScan] = useState<DiagnosticScan | null>(null);
  const [scanError, setScanError] = useState('');

  const displayScan = justCompletedScan ?? latestScan;

  const parsedCustomCodes = useMemo(() => {
    if (!customDtcInput.trim()) return [];
    return customDtcInput
      .split(/[\s,;]+/)
      .map((c) => c.trim().toUpperCase())
      .filter((c) => /^[PCBU][0-3][0-9A-F]{3}$/.test(c));
  }, [customDtcInput]);

  const codeRows = useMemo(() => {
    if (!displayScan) return [];
    return displayScan.detectedCodes.map((code) => {
      const detail = findObdCodeDetails(code, customCodes);
      const eligibility = classifySensorBypassEligibility(detail);
      return { detail, eligibility };
    });
  }, [displayScan, customCodes]);

  const eligibleCodes = useMemo(
    () => codeRows.filter((r) => r.eligibility.canBypassInTransit).map((r) => r.detail.code),
    [codeRows]
  );

  const blockedRows = useMemo(
    () => codeRows.filter((r) => !r.eligibility.canBypassInTransit),
    [codeRows]
  );

  // Sync default selected eligible sensors whenever the displayed scan changes
  useEffect(() => {
    if (!displayScan) {
      setSelectedBypassCodes([]);
      return;
    }
    const alreadyResolved = new Set(displayScan.resolvedCodes);
    const defaultEligible = eligibleCodes.filter((c) => !alreadyResolved.has(c));
    setSelectedBypassCodes(defaultEligible.length > 0 ? defaultEligible : eligibleCodes);
    setActiveTransitBanner(null);
  }, [displayScan?.id, eligibleCodes.join(',')]);

  const hasModerateOrHighSelected = useMemo(
    () =>
      codeRows.some(
        (r) =>
          selectedBypassCodes.includes(r.detail.code) &&
          r.eligibility.tier === 'ModerateLimpCapped'
      ),
    [codeRows, selectedBypassCodes]
  );

  // Auto-cap profile to at most 'city_crawl' when moderate/limp faults are selected
  useEffect(() => {
    if (hasModerateOrHighSelected && selectedProfileId === 'direct_service') {
      setSelectedProfileId('city_crawl');
    }
  }, [hasModerateOrHighSelected, selectedProfileId]);

  const selectedProfile = useMemo(
    () =>
      TRANSIT_CONTROL_PROFILES.find((p) => p.id === selectedProfileId) ??
      TRANSIT_CONTROL_PROFILES[1],
    [selectedProfileId]
  );

  const toggleBypassCode = (code: string) => {
    setSelectedBypassCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleStartScan = async () => {
    if (!activeVehicle) {
      setScanError('Please add or select a vehicle in My Garage before starting a diagnostic scan.');
      return;
    }
    if (customDtcInput.trim() && parsedCustomCodes.length === 0) {
      setScanError(
        'Enter valid 5-character OBD-II codes separated by commas (e.g. P0335, P1610, P0455).'
      );
      return;
    }
    setScanError('');
    setActiveTransitBanner(null);
    setScanning(true);
    setJustCompletedScan(null);
    try {
      const result = await runDiagnosticSequence(
        activeVehicle,
        connectionMode,
        selectedPresetId,
        (prog) => setProgress(prog),
        parsedCustomCodes.length > 0 ? parsedCustomCodes : undefined
      );
      const savedId = await onSaveNewScan(result);
      setJustCompletedScan({
        ...result,
        id: savedId || `scan_${Date.now()}`,
      });
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Diagnostic scan failed.');
    } finally {
      setScanning(false);
    }
  };

  const handleActivateControlledBypass = async () => {
    if (!displayScan || selectedBypassCodes.length === 0) return;
    setApplyingBypass(true);
    setScanError('');
    try {
      const combinedResolved = Array.from(
        new Set([...displayScan.resolvedCodes, ...selectedBypassCodes])
      );
      const blockedList = blockedRows.map((b) => b.detail.code);
      await onApplyControlledBypass(
        displayScan,
        combinedResolved,
        selectedProfile,
        [...selectedBypassCodes],
        blockedList
      );
      if (justCompletedScan && justCompletedScan.id === displayScan.id) {
        const allCleared = displayScan.detectedCodes.every((c) => combinedResolved.includes(c));
        setJustCompletedScan({
          ...justCompletedScan,
          resolvedCodes: combinedResolved,
          status: allCleared ? 'resolved' : 'active',
        });
      }
      setActiveTransitBanner({
        profile: selectedProfile,
        bypassedCodes: [...selectedBypassCodes],
        blockedCodes: blockedList,
      });
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : 'Unable to apply controlled transit bypass.'
      );
    } finally {
      setApplyingBypass(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanner Control Panel */}
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
                Vehicle Diagnostics
              </h1>
              <span className="text-xs font-mono text-amber-300 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded">
                DEMO DATA SIMULATOR
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {activeVehicle
                ? `Target Vehicle: ${activeVehicle.year} ${activeVehicle.manufacturer} ${activeVehicle.model} (${activeVehicle.registrationNumber})`
                : 'Select a vehicle in My Garage to run a diagnostic scan.'}
            </p>
          </div>

          <button
            type="button"
            disabled={scanning || !activeVehicle}
            onClick={handleStartScan}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-semibold text-white transition-colors min-h-[48px] whitespace-nowrap shrink-0"
          >
            {scanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning Vehicle...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Scan
              </>
            )}
          </button>
        </div>

        {/* Demo Scenario Selector */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400">
            Select Demonstration Scan Scenario (Simulates Multi-Brand OBD-II ECU Responses):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEMO_SCAN_PRESETS.map((preset) => {
              const active = selectedPresetId === preset.id && parsedCustomCodes.length === 0;
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={scanning}
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    setCustomDtcInput('');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-colors ${
                    active
                      ? 'bg-blue-600/15 border-blue-500 text-white'
                      : 'bg-[#0B1120] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-semibold text-white">{preset.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{preset.subtitle}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Custom Multi-Brand DTC Simulator Input */}
        <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-2">
          <label htmlFor="custom-dtc-input" className="block text-xs font-medium text-slate-300">
            Optional: Test Mixed High-Risk &amp; Low-Risk OEM Codes (e.g. P0335, P0455, P0101)
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="custom-dtc-input"
              type="text"
              disabled={scanning}
              value={customDtcInput}
              onChange={(e) => setCustomDtcInput(e.target.value)}
              placeholder="e.g. P0101, P0455 or P0335, P1610 (leave blank to use preset above)"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 focus:border-blue-500 focus:outline-none text-xs font-mono text-white min-h-[40px]"
            />
            {customDtcInput && (
              <button
                type="button"
                onClick={() => setCustomDtcInput('')}
                className="px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 min-h-[40px]"
              >
                Clear Custom Codes
              </button>
            )}
          </div>
        </div>

        {scanError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-200">
            {scanError}
          </div>
        )}

        {/* Animated Scanning Progress */}
        {scanning && progress && (
          <div className="p-5 rounded-xl bg-[#0B1120] border border-blue-500/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-300 font-medium">{progress.stage}</span>
              <span className="font-mono text-white tabular-nums">{progress.percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Scan Completion & Code Details */}
      {displayScan && (
        <section className="space-y-5">
          {/* Summary Banner */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <h2 className="font-display font-bold text-lg text-white">
                  {justCompletedScan ? 'Diagnostic Scan Complete' : 'Latest Diagnostic Scan'}
                </h2>
                {displayScan.isDemoData && (
                  <span className="text-[11px] font-mono text-amber-300">· DEMO DATA</span>
                )}
              </div>
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">{displayScan.summary}</p>
              <p className="text-xs text-slate-400 font-mono tabular-nums">
                Health Score: {displayScan.overallHealthScore}/100 · Engine: {displayScan.engineHealthScore}/100 ·{' '}
                Battery: {displayScan.supportedSensors.battery ? `${displayScan.batteryVoltage}V` : 'Unsupported'} ·{' '}
                Coolant: {displayScan.supportedSensors.coolantTemp ? `${displayScan.coolantTempC}°C` : 'Unsupported'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => downloadDiagnosticPdf(displayScan, activeVehicle, customCodes)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-white transition-colors min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                Download PDF Report
              </button>
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors min-h-[44px]"
              >
                <Wrench className="w-4 h-4" />
                Find Service Centre
              </button>
            </div>
          </div>

          {/* Risk-Gated Controlled Sensor Bypass & Vehicle Transit Limiter */}
          {displayScan.detectedCodes.length > 0 && (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Sliders className="w-5 h-5 text-blue-400" />
                    <h3 className="font-display font-bold text-base sm:text-lg text-white">
                      Controlled Sensor Bypass &amp; Vehicle Transit Limiter
                    </h3>
                    <span className="text-[11px] font-mono text-amber-300 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded">
                      SIMULATED ECU CAP · DEMO
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                    Only <strong className="text-slate-200">Low-Risk</strong> or{' '}
                    <strong className="text-slate-200">Moderate Fallback</strong> sensors can be
                    bypassed or cleared under strict speed &amp; RPM limits to reach a service
                    centre. <strong className="text-red-300">Very High-Risk</strong> starting,
                    timing, immobilizer, fuel-pressure, and HV-isolation lockouts are permanently
                    blocked by hardware safety rules.
                  </p>
                </div>
              </div>

              {/* Per-Sensor Risk Gate Matrix */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-slate-300">
                  1. Per-Sensor Risk Assessment &amp; Bypass Selection
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {codeRows.map(({ detail, eligibility }) => {
                    const isChecked = selectedBypassCodes.includes(detail.code);
                    const isBlocked = !eligibility.canBypassInTransit;
                    const alreadyCleared = displayScan.resolvedCodes.includes(detail.code);
                    return (
                      <label
                        key={detail.code}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                          isBlocked
                            ? 'bg-red-950/20 border-red-500/35 cursor-not-allowed'
                            : isChecked
                            ? 'bg-blue-600/10 border-blue-500/50 cursor-pointer'
                            : 'bg-[#0B1120] border-slate-800 cursor-pointer hover:border-slate-700'
                        }`}
                      >
                        {isBlocked ? (
                          <Lock className="w-4 h-4 text-red-400 shrink-0 mt-1" />
                        ) : (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleBypassCode(detail.code)}
                            className="mt-1 h-4 w-4 rounded border-slate-600 bg-[#0B1120] text-blue-600 focus:ring-blue-500"
                          />
                        )}
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono text-sm font-bold text-white">
                              {detail.code}
                            </span>
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                                isBlocked
                                  ? 'border-red-500/40 bg-red-500/10 text-red-300'
                                  : eligibility.tier === 'ModerateLimpCapped'
                                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                  : 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                              }`}
                            >
                              {eligibility.label}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-200">{detail.name}</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {eligibility.reason}
                          </p>
                          {alreadyCleared && (
                            <p className="text-[11px] font-mono text-emerald-400">
                              ✓ Included in simulated Mode $04 / transit bypass
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Speed / RPM Transit Limit Selector (only shown when at least 1 sensor is eligible) */}
              {eligibleCodes.length > 0 ? (
                <div className="space-y-4 pt-2 border-t border-slate-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-300">
                      2. Vehicle Speed, RPM &amp; Distance Safety Cap for Workshop Transit
                    </p>
                    {hasModerateOrHighSelected && (
                      <span className="text-[11px] text-amber-300">
                        Max speed automatically capped at 40 km/h due to moderate fallback fault
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {TRANSIT_CONTROL_PROFILES.map((profile) => {
                      const disabledForRisk =
                        Boolean(profile.requiresAllClearable) && hasModerateOrHighSelected;
                      const active = selectedProfileId === profile.id && !disabledForRisk;
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          disabled={disabledForRisk}
                          onClick={() => setSelectedProfileId(profile.id)}
                          className={`p-4 rounded-xl border text-left transition-colors space-y-2 ${
                            disabledForRisk
                              ? 'bg-[#0B1120]/50 border-slate-800/60 opacity-45 cursor-not-allowed'
                              : active
                              ? 'bg-blue-600/15 border-blue-500 text-white'
                              : 'bg-[#0B1120] border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-white">{profile.label}</span>
                            <Gauge className="w-4 h-4 text-blue-400 shrink-0" />
                          </div>
                          <p className="font-mono text-xs text-blue-300 tabular-nums">
                            {profile.maxSpeedKmh} km/h · {profile.maxRpm.toLocaleString()} RPM ·{' '}
                            {profile.maxDistanceKm} km
                          </p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {profile.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Safety Monitors + Execution Bar */}
                  <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Core Protection Monitors Stay Active (Never Bypassed)
                      </p>
                      <p className="text-slate-400">
                        Coolant overheat protection, oil pressure cutoff, ABS/brake hydraulics,
                        airbags, and selected limit ({selectedProfile.maxSpeedKmh} km/h ·{' '}
                        {selectedProfile.maxThrottlePct}% throttle) remain strictly enforced.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={applyingBypass || selectedBypassCodes.length === 0}
                      onClick={() => void handleActivateControlledBypass()}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white transition-colors whitespace-nowrap min-h-[44px] shrink-0"
                    >
                      {applyingBypass ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Applying Transit Cap...
                        </>
                      ) : (
                        <>
                          <Sliders className="w-4 h-4" />
                          Apply {selectedProfile.maxSpeedKmh} km/h Transit Limit &amp; Bypass (
                          {selectedBypassCodes.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-950/25 border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-red-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      All Detected Faults Are Very High Risk — Bypass Disabled
                    </p>
                    <p className="text-xs text-red-200/80 leading-relaxed">
                      No non-critical sensors are eligible for controlled transit bypass on this
                      scan. Do not force engine start; arrange professional towing to a workshop.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('services')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-colors whitespace-nowrap min-h-[44px] shrink-0"
                  >
                    <Truck className="w-4 h-4" />
                    Request Tow &amp; Service
                  </button>
                </div>
              )}

              {/* Active Enforced Transit HUD Banner */}
              {activeTransitBanner && (
                <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-sm font-semibold text-white">
                        Simulated Transit Cap Active: {activeTransitBanner.profile.label} (DEMO)
                      </span>
                    </div>
                    <span className="font-mono text-xs text-blue-300 tabular-nums">
                      MAX {activeTransitBanner.profile.maxSpeedKmh} km/h ·{' '}
                      {activeTransitBanner.profile.maxRpm.toLocaleString()} RPM ·{' '}
                      {activeTransitBanner.profile.maxThrottlePct}% THROTTLE ·{' '}
                      {activeTransitBanner.profile.maxDistanceKm} km RANGE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Bypassed/masked in demo transit:{' '}
                    <span className="font-mono text-white">
                      {activeTransitBanner.bypassedCodes.join(', ')}
                    </span>
                    .
                    {activeTransitBanner.blockedCodes.length > 0 && (
                      <span className="text-red-300">
                        {' '}
                        Still locked &amp; requiring tow/workshop verification:{' '}
                        <span className="font-mono font-semibold">
                          {activeTransitBanner.blockedCodes.join(', ')}
                        </span>
                        .
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onNavigate('services')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white min-h-[40px]"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Book Workshop Arrival Now
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('history')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-200 min-h-[40px]"
                    >
                      View Bypass Actions Audit Log
                    </button>
                    <span className="text-[11px] text-slate-400">
                      Reminder: Real-vehicle speed/RPM capping relies on OEM ECU limp-home support;
                      standard OBD-II adapters only issue Mode $04 clears.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Safety Caution */}
          <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Diagnostic Safety Standard:</strong> An OBD-II trouble
              code identifies which system reported an irregular reading—it does not alone confirm a
              specific broken part. AutoSense never bypasses critical safety sensors or recommends
              unsafe DIY mechanical tampering.
            </p>
          </div>

          {/* Breakdown per Trouble Code */}
          {displayScan.detectedCodes.length === 0 ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-base font-semibold text-white">No Trouble Codes Detected</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                All scanned modules reported zero stored or pending diagnostic trouble codes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {codeRows.map(({ detail }) => {
                const sev = SEVERITY_GUIDANCE[detail.severity];
                const transit = detail.transitEligibility
                  ? TRANSIT_GUIDANCE[detail.transitEligibility]
                  : TRANSIT_GUIDANCE.Clearable;
                return (
                  <article
                    key={detail.code}
                    className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-xl font-bold text-white">
                            {detail.code}
                          </span>
                          <span className="text-xs text-slate-400">
                            · {detail.brand ?? 'Universal (SAE / ISO)'}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${sev.badgeClass}`}
                          >
                            {sev.label} Severity
                          </span>
                          <span
                            className={`text-xs font-medium px-2.5 py-0.5 rounded border ${transit.badgeClass}`}
                          >
                            {transit.label}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-white mt-1">
                          {detail.name}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => onAskAiAboutCode(detail.code)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-xs font-semibold text-blue-300 transition-colors whitespace-nowrap min-h-[40px]"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Ask AutoSense AI about {detail.code}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-400">1. What does it mean?</p>
                        <p className="text-slate-200 leading-relaxed">{detail.meaning}</p>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-400">2. Possible reasons</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-200">
                          {detail.possibleCauses.map((cause) => (
                            <li key={cause}>{cause}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-400">3. How serious is it?</p>
                        <p className={`font-medium ${sev.textClass}`}>
                          {sev.label} — {sev.actionSummary}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-400">
                          4. What should the owner do next?
                        </p>
                        <p className="text-slate-200 leading-relaxed">{detail.nextSteps}</p>
                      </div>

                      <div className="md:col-span-2 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400">
                            5. Should a mechanic inspect it?
                          </p>
                          <p className="text-slate-200 leading-relaxed">{detail.mechanicAdvice}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400">
                            6. Sensor Bypass &amp; Service Transit Status
                          </p>
                          <p className="text-slate-200 leading-relaxed">
                            {detail.transitNote ?? transit.summary}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
