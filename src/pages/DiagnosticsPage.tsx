import { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Loader2,
  MessageSquare,
  Play,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { DEMO_SCAN_PRESETS } from '../data/demoData';
import { findObdCodeDetails, SEVERITY_GUIDANCE } from '../data/obdCodes';
import { runDiagnosticSequence, type ObdScanProgress } from '../services/obdService';
import { downloadDiagnosticPdf } from '../services/pdfReport';
import type {
  AppSection,
  ConnectionMode,
  DiagnosticScan,
  ObdCodeEntry,
  Vehicle,
} from '../types/autosense';

interface DiagnosticsPageProps {
  activeVehicle: Vehicle | undefined;
  connectionMode: ConnectionMode;
  latestScan: DiagnosticScan | undefined;
  customCodes: ObdCodeEntry[];
  onSaveNewScan: (
    scan: Omit<DiagnosticScan, 'id' | 'scannedAt' | 'updatedAt'>
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
  onAskAiAboutCode,
  onNavigate,
}: DiagnosticsPageProps) {
  const [selectedPresetId, setSelectedPresetId] = useState(DEMO_SCAN_PRESETS[1].id);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<ObdScanProgress | null>(null);
  const [justCompletedScan, setJustCompletedScan] = useState<DiagnosticScan | null>(null);
  const [scanError, setScanError] = useState('');

  const displayScan = justCompletedScan ?? latestScan;

  const handleStartScan = async () => {
    if (!activeVehicle) {
      setScanError('Please add or select a vehicle in My Garage before starting a diagnostic scan.');
      return;
    }
    setScanError('');
    setScanning(true);
    setJustCompletedScan(null);
    try {
      const result = await runDiagnosticSequence(
        activeVehicle,
        connectionMode,
        selectedPresetId,
        (prog) => setProgress(prog)
      );
      await onSaveNewScan(result);
      setJustCompletedScan({
        ...result,
        id: `scan_${Date.now()}`,
      });
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Diagnostic scan failed.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanner Control Panel */}
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
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
            Select Demonstration Scan Scenario (Simulates OBD-II ECU Responses):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DEMO_SCAN_PRESETS.map((preset) => {
              const active = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={scanning}
                  onClick={() => setSelectedPresetId(preset.id)}
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

          {/* Safety Caution */}
          <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Diagnostic Safety Standard:</strong> An OBD-II trouble
              code identifies which system reported an irregular reading—it does not alone confirm a
              specific broken part. AutoSense never recommends unsafe DIY mechanical repairs. Always
              stop safely if a critical warning appears.
            </p>
          </div>

          {/* 7-Point Breakdown per Trouble Code */}
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
              {displayScan.detectedCodes.map((code) => {
                const detail = findObdCodeDetails(code, customCodes);
                const sev = SEVERITY_GUIDANCE[detail.severity];
                return (
                  <article
                    key={code}
                    className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xl font-bold text-white">
                            {detail.code}
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${sev.badgeClass}`}>
                            {sev.label} Severity
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

                      <div className="md:col-span-2 pt-3 border-t border-slate-800/80 space-y-1">
                        <p className="text-xs font-semibold text-slate-400">
                          5. Should a mechanic inspect it?
                        </p>
                        <p className="text-slate-200 leading-relaxed">{detail.mechanicAdvice}</p>
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
