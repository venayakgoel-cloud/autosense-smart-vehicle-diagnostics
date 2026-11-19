import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  History,
  Lock,
  Sliders,
  X,
} from 'lucide-react';
import { findObdCodeDetails, SEVERITY_GUIDANCE } from '../data/obdCodes';
import { downloadBypassAuditPdf, downloadDiagnosticPdf } from '../services/pdfReport';
import type {
  BypassActionLog,
  DiagnosticScan,
  ObdCodeEntry,
  Vehicle,
} from '../types/autosense';

interface HistoryPageProps {
  scans: DiagnosticScan[];
  bypassLogs: BypassActionLog[];
  vehicles: Vehicle[];
  customCodes: ObdCodeEntry[];
  onResolveScan: (scan: DiagnosticScan) => Promise<void>;
}

type HistoryTab = 'all' | 'active' | 'resolved' | 'bypass_actions';

export function HistoryPage({
  scans,
  bypassLogs,
  vehicles,
  customCodes,
  onResolveScan,
}: HistoryPageProps) {
  const [activeTab, setActiveTab] = useState<HistoryTab>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [selectedScan, setSelectedScan] = useState<DiagnosticScan | null>(null);

  const filteredScans = useMemo(() => {
    return scans.filter((s) => {
      if (vehicleFilter !== 'all' && s.vehicleId !== vehicleFilter) return false;
      if (activeTab === 'active') return s.status === 'active';
      if (activeTab === 'resolved') return s.status === 'resolved';
      return true;
    });
  }, [scans, activeTab, vehicleFilter]);

  const filteredBypassLogs = useMemo(() => {
    return bypassLogs.filter((log) =>
      vehicleFilter === 'all' ? true : log.vehicleId === vehicleFilter
    );
  }, [bypassLogs, vehicleFilter]);

  const getVehicleForScan = (scan: DiagnosticScan) =>
    vehicles.find((v) => v.id === scan.vehicleId);

  const selectedScanBypassLogs = useMemo(() => {
    if (!selectedScan) return [];
    return bypassLogs.filter((log) => log.scanId === selectedScan.id);
  }, [selectedScan, bypassLogs]);

  return (
    <div className="space-y-6">
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
              Diagnostic History &amp; Bypass Audit Log
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Review past scans, export PDF reports, and inspect timestamped Bypass Actions for
              professional mechanics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: 'All Scans' },
                { id: 'active', label: 'Unresolved' },
                { id: 'resolved', label: 'Resolved' },
                { id: 'bypass_actions', label: `Bypass Actions (${bypassLogs.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors min-h-[40px] ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0B1120] border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Filter & Audit Export Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <label htmlFor="history-vehicle-filter" className="text-xs text-slate-400">
              Filter Vehicle:
            </label>
            <select
              id="history-vehicle-filter"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#0B1120] border border-slate-700 text-xs text-white min-h-[38px]"
            >
              <option value="all">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.manufacturer} {v.model} ({v.registrationNumber})
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'bypass_actions' && (
            <button
              type="button"
              onClick={() => downloadBypassAuditPdf(filteredBypassLogs, customCodes)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white min-h-[40px]"
            >
              <Download className="w-3.5 h-3.5" />
              Export Mechanic Audit Log (PDF)
            </button>
          )}
        </div>
      </section>

      {activeTab === 'bypass_actions' ? (
        filteredBypassLogs.length === 0 ? (
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-10 text-center space-y-2">
            <ClipboardList className="w-8 h-8 text-blue-400 mx-auto" />
            <p className="text-sm font-medium text-white">No Bypass Actions Recorded Yet</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Whenever a controlled transit limit or simulated Mode $04 sensor bypass is executed
              in Vehicle Diagnostics, an immutable timestamped record appears here for mechanics.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBypassLogs.map((log) => {
              const snap = log.vehicleStatusSnapshot;
              const matchedVehicle = vehicles.find((v) => v.id === log.vehicleId);
              return (
                <article
                  key={log.id}
                  className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4"
                >
                  {/* Header Timestamp & Action Scope */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-blue-300 tabular-nums">
                          {log.occurredAtIso
                            ? new Date(log.occurredAtIso).toLocaleString()
                            : 'Timestamp Recorded'}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-slate-400">
                          {snap.connectionMode} · Scan {log.scanId}
                        </span>
                        {log.isDemoData && (
                          <span className="text-[11px] font-mono text-amber-300">· DEMO DATA</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {matchedVehicle?.registrationNumber && (
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded border border-slate-700 bg-[#0B1120] text-blue-300">
                            {matchedVehicle.registrationNumber}
                          </span>
                        )}
                        <h2 className="text-base font-semibold text-white">{log.vehicleLabel}</h2>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border border-blue-500/40 bg-blue-500/10 text-blue-300">
                        <Sliders className="w-3.5 h-3.5" />
                        {log.actionType === 'mode04_reset'
                          ? 'Mode $04 Reset'
                          : 'Controlled Transit Bypass'}
                      </span>
                      <span className="text-xs font-mono px-2.5 py-1 rounded border border-slate-700 bg-[#0B1120] text-slate-200 tabular-nums">
                        {log.transitProfileLabel} · {log.maxSpeedKmh} km/h ·{' '}
                        {log.maxRpm.toLocaleString()} RPM
                      </span>
                    </div>
                  </div>

                  {/* Modified vs Blocked Sensors */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-2">
                      <p className="text-xs font-semibold text-slate-300">
                        Specific Sensors Modified ({log.modifiedSensors.length})
                      </p>
                      <ul className="space-y-1.5 text-xs">
                        {log.modifiedSensors.map((code) => {
                          const detail = findObdCodeDetails(code, customCodes);
                          return (
                            <li key={code} className="text-slate-200">
                              <span className="font-mono font-bold text-blue-300">{code}</span> —{' '}
                              {detail.name}{' '}
                              <span className="text-slate-400">({detail.category})</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-2">
                      <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-red-400" />
                        Very High-Risk Sensors Kept Locked ({log.blockedSensors.length})
                      </p>
                      {log.blockedSensors.length === 0 ? (
                        <p className="text-xs text-slate-400">
                          None — no very high-risk hardware lockouts present during this action.
                        </p>
                      ) : (
                        <ul className="space-y-1.5 text-xs">
                          {log.blockedSensors.map((code) => {
                            const detail = findObdCodeDetails(code, customCodes);
                            return (
                              <li key={code} className="text-red-200">
                                <span className="font-mono font-bold">{code}</span> — {detail.name}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Status Snapshot at Time of Action */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400">
                      Vehicle Status Snapshot at Time of Action
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800">
                        <p className="text-slate-400">Health / Engine</p>
                        <p className="font-mono font-bold text-white tabular-nums mt-0.5">
                          {snap.overallHealthScore}/100 · {snap.engineHealthScore}/100
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800">
                        <p className="text-slate-400">Coolant Temp</p>
                        <p className="font-mono font-bold text-white tabular-nums mt-0.5">
                          {snap.coolantTempC}°C
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800">
                        <p className="text-slate-400">Battery / Fuel Trim</p>
                        <p className="font-mono font-bold text-white tabular-nums mt-0.5">
                          {snap.batteryVoltage > 0 ? `${snap.batteryVoltage}V` : 'Unsupported'} ·{' '}
                          {snap.fuelTrimPct}%
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800">
                        <p className="text-slate-400">Odometer / Emissions</p>
                        <p className="font-mono font-bold text-white tabular-nums mt-0.5">
                          {snap.odometerKm.toLocaleString()} km · {snap.emissionReadiness}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mechanic Audit Note */}
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0B1120] border border-slate-800/80 rounded-xl p-3.5">
                    <strong className="text-white">Mechanic Audit Note:</strong> {log.notes}
                  </p>
                </article>
              );
            })}
          </div>
        )
      ) : filteredScans.length === 0 ? (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-10 text-center space-y-2">
          <History className="w-8 h-8 text-blue-400 mx-auto" />
          <p className="text-sm font-medium text-white">No diagnostic history in this filter</p>
          <p className="text-xs text-slate-400">
            Completed scans from the Diagnostics tab appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScans.map((scan) => {
            const vehicle = getVehicleForScan(scan);
            const scanBypassCount = bypassLogs.filter((b) => b.scanId === scan.id).length;
            return (
              <article
                key={scan.id}
                className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-slate-300 tabular-nums">
                      {scan.scannedAtIso ? new Date(scan.scannedAtIso).toLocaleString() : 'Recorded'}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-300">{scan.connectionMode}</span>
                    {scan.isDemoData && (
                      <span className="text-[11px] font-mono text-amber-300">· DEMO DATA</span>
                    )}
                    {scanBypassCount > 0 && (
                      <span className="text-[11px] font-mono text-blue-300">
                        · {scanBypassCount} Bypass Action{scanBypassCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {vehicle?.registrationNumber && (
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded border border-slate-700 bg-[#0B1120] text-blue-300">
                        {vehicle.registrationNumber}
                      </span>
                    )}
                    <h2 className="text-base font-semibold text-white">{scan.vehicleLabel}</h2>
                    <span className="text-xs font-mono font-semibold text-blue-400 tabular-nums">
                      Health {scan.overallHealthScore}/100
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded border ${
                        scan.status === 'resolved'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {scan.status === 'resolved' ? 'Resolved' : 'Unresolved Issues'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{scan.summary}</p>

                  {scan.detectedCodes.length > 0 && (
                    <p className="text-xs font-mono text-slate-400">
                      Codes: {scan.detectedCodes.join(', ')}
                      {scan.resolvedCodes.length > 0
                        ? ` · Cleared/Bypassed: ${scan.resolvedCodes.join(', ')}`
                        : ''}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedScan(scan)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-white min-h-[40px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Open Report
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadDiagnosticPdf(scan, vehicle, customCodes)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white min-h-[40px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>

                  {scan.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => onResolveScan(scan)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/40 hover:bg-emerald-500/10 text-xs font-medium text-emerald-300 min-h-[40px]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Resolved
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Historical Report Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{selectedScan.vehicleLabel}</h3>
                <p className="text-xs text-slate-400">
                  {selectedScan.scannedAtIso
                    ? new Date(selectedScan.scannedAtIso).toLocaleString()
                    : 'Scan Report'}{' '}
                  {selectedScan.isDemoData ? '· DEMO DATA' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="p-2 text-slate-400 hover:text-white"
                aria-label="Close report"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800">
                  <p className="text-slate-400">Health Score</p>
                  <p className="font-mono text-base font-bold text-white tabular-nums mt-0.5">
                    {selectedScan.overallHealthScore}/100
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800">
                  <p className="text-slate-400">Engine Score</p>
                  <p className="font-mono text-base font-bold text-white tabular-nums mt-0.5">
                    {selectedScan.engineHealthScore}/100
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800">
                  <p className="text-slate-400">Battery</p>
                  <p className="font-mono text-base font-bold text-white tabular-nums mt-0.5">
                    {selectedScan.supportedSensors.battery
                      ? `${selectedScan.batteryVoltage}V`
                      : 'Unsupported'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800">
                  <p className="text-slate-400">Coolant</p>
                  <p className="font-mono text-base font-bold text-white tabular-nums mt-0.5">
                    {selectedScan.supportedSensors.coolantTemp
                      ? `${selectedScan.coolantTempC}°C`
                      : 'Unsupported'}
                  </p>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed">{selectedScan.summary}</p>

              {selectedScan.detectedCodes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400">Detected Codes</h4>
                  {selectedScan.detectedCodes.map((c) => {
                    const info = findObdCodeDetails(c, customCodes);
                    const sev = SEVERITY_GUIDANCE[info.severity];
                    return (
                      <div
                        key={c}
                        className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-white">
                            {info.code} — {info.name}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded border ${sev.badgeClass}`}>
                            {sev.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{info.meaning}</p>
                        <p className="text-xs text-slate-400">{info.mechanicAdvice}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedScanBypassLogs.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-semibold text-blue-300">
                    Recorded Bypass Actions on This Scan ({selectedScanBypassLogs.length})
                  </h4>
                  {selectedScanBypassLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-[#0B1120] border border-blue-500/30 text-xs space-y-1"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-blue-300 tabular-nums">
                          {log.occurredAtIso
                            ? new Date(log.occurredAtIso).toLocaleString()
                            : 'Recorded'}
                        </span>
                        <span className="font-mono text-slate-300">
                          {log.transitProfileLabel} ({log.maxSpeedKmh} km/h · {log.maxRpm} RPM)
                        </span>
                      </div>
                      <p className="text-white font-medium">
                        Modified Sensors: {log.modifiedSensors.join(', ')}
                      </p>
                      <p className="text-slate-400">{log.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadDiagnosticPdf(
                    selectedScan,
                    getVehicleForScan(selectedScan),
                    customCodes
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
