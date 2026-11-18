import {
  Activity,
  BatteryCharging,
  Flame,
  Fuel,
  Gauge,
  Thermometer,
  Wind,
} from 'lucide-react';
import { HealthScoreGauge, TelemetryTrendChart } from '../components/TelemetryCharts';
import type { AppSection, DiagnosticScan, Vehicle } from '../types/autosense';

interface VehicleHealthPageProps {
  activeVehicle: Vehicle | undefined;
  latestScan: DiagnosticScan | undefined;
  vehicleScans: DiagnosticScan[];
  onNavigate: (section: AppSection) => void;
}

export function VehicleHealthPage({
  activeVehicle,
  latestScan,
  vehicleScans,
  onNavigate,
}: VehicleHealthPageProps) {
  const sensors = latestScan?.supportedSensors;

  const subsystems = [
    {
      title: 'Engine Diagnostics',
      icon: Gauge,
      supported: Boolean(latestScan),
      value: latestScan ? `${latestScan.engineHealthScore} / 100` : 'Unavailable',
      status: latestScan
        ? latestScan.engineHealthScore >= 85
          ? 'Nominal'
          : 'Inspection Advised'
        : 'No Scan Data',
      detail: latestScan
        ? `${latestScan.detectedCodes.length} trouble ${
            latestScan.detectedCodes.length === 1 ? 'code' : 'codes'
          } reported in latest session.`
        : 'Run a diagnostic scan to inspect engine module status.',
    },
    {
      title: 'Battery System',
      icon: BatteryCharging,
      supported: Boolean(latestScan && sensors?.battery && latestScan.batteryVoltage > 0),
      value:
        latestScan && sensors?.battery && latestScan.batteryVoltage > 0
          ? `${latestScan.batteryVoltage.toFixed(1)} V`
          : 'Unsupported / Unavailable',
      status:
        latestScan && sensors?.battery && latestScan.batteryVoltage > 0
          ? latestScan.batteryVoltage >= 12.2
            ? 'Supported · Healthy'
            : 'Supported · Low Voltage'
          : 'Unsupported on ECU',
      detail:
        latestScan && sensors?.battery && latestScan.batteryVoltage > 0
          ? 'Measured 12V control module supply voltage.'
          : 'This vehicle profile or scan did not report 12V battery voltage PIDs.',
    },
    {
      title: 'Fuel System Trim',
      icon: Fuel,
      supported: Boolean(latestScan && sensors?.fuelSystem),
      value:
        latestScan && sensors?.fuelSystem
          ? `${latestScan.fuelTrimPct > 0 ? '+' : ''}${latestScan.fuelTrimPct.toFixed(1)}%`
          : 'Unsupported / Unavailable',
      status:
        latestScan && sensors?.fuelSystem
          ? Math.abs(latestScan.fuelTrimPct) <= 5
            ? 'Supported · Balanced'
            : 'Supported · Elevated Trim'
          : 'Unsupported on ECU',
      detail:
        latestScan && sensors?.fuelSystem
          ? 'Long-term air-fuel compensation percentage.'
          : 'Fuel trim PIDs are unavailable for this scan.',
    },
    {
      title: 'Emission System Readiness',
      icon: Wind,
      supported: Boolean(latestScan && sensors?.emissions && latestScan.emissionReadiness !== 'Unsupported'),
      value: latestScan ? latestScan.emissionReadiness : 'Unavailable',
      status:
        latestScan && sensors?.emissions && latestScan.emissionReadiness !== 'Unsupported'
          ? 'Supported'
          : 'Unsupported on ECU',
      detail:
        latestScan && sensors?.emissions && latestScan.emissionReadiness !== 'Unsupported'
          ? 'Catalytic and evaporative monitor readiness state.'
          : 'Emissions readiness monitors were not exposed in this scan.',
    },
    {
      title: 'Coolant Temperature',
      icon: Thermometer,
      supported: Boolean(latestScan && sensors?.coolantTemp),
      value:
        latestScan && sensors?.coolantTemp
          ? `${latestScan.coolantTempC} °C`
          : 'Unsupported / Unavailable',
      status:
        latestScan && sensors?.coolantTemp
          ? latestScan.coolantTempC > 105
            ? 'Supported · Elevated'
            : 'Supported · Normal Range'
          : 'Unsupported on ECU',
      detail:
        latestScan && sensors?.coolantTemp
          ? 'Typical warm operating range is 85 °C – 102 °C.'
          : 'Engine coolant sensor PID is unavailable.',
    },
    {
      title: 'RPM & Combustion Monitor',
      icon: Flame,
      supported: Boolean(latestScan && sensors?.rpm),
      value: latestScan && sensors?.rpm ? 'Idle & Load Monitored' : 'Unsupported / Unavailable',
      status: latestScan && sensors?.rpm ? 'Supported' : 'Unsupported on ECU',
      detail:
        latestScan && sensors?.rpm
          ? 'Crankshaft speed and misfire counter telemetry supported.'
          : 'RPM telemetry is unavailable until connected.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-blue-400" />
            <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
              Vehicle Health Overview
            </h1>
            {latestScan?.isDemoData && (
              <span className="text-xs font-mono text-amber-300 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded">
                DEMO DATA
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Subsystems below explicitly show whether each sensor reading is supported by the vehicle
            ECU, unsupported, or currently unavailable.
          </p>
        </div>

        <div className="shrink-0">
          {latestScan ? (
            <HealthScoreGauge score={latestScan.overallHealthScore} label="Composite Health" />
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('diagnostics')}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white min-h-[44px]"
            >
              Run Initial Health Scan
            </button>
          )}
        </div>
      </section>

      {/* Subsystems Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subsystems.map((sub) => {
          const Icon = sub.icon;
          return (
            <div
              key={sub.title}
              className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <Icon className="w-4 h-4 text-blue-400" />
                  {sub.title}
                </span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                    sub.supported
                      ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                      : 'border-slate-700 bg-slate-800 text-slate-400'
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              <p className="text-xl font-mono font-bold text-white tabular-nums">{sub.value}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{sub.detail}</p>
            </div>
          );
        })}
      </section>

      {/* Historical Sensor Charts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-white">
            Historical Sensor Telemetry{activeVehicle ? ` · ${activeVehicle.model}` : ''}
          </h2>
          <span className="text-xs text-slate-400">
            Plots appear only for supported historical readings
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <TelemetryTrendChart
            scans={vehicleScans}
            metric="overallHealthScore"
            title="Overall Health Score"
            unit="/100"
          />
          <TelemetryTrendChart
            scans={vehicleScans}
            metric="coolantTempC"
            title="Coolant Temperature"
            unit=" °C"
          />
          <TelemetryTrendChart
            scans={vehicleScans}
            metric="batteryVoltage"
            title="12V Battery Voltage"
            unit=" V"
          />
        </div>
      </section>
    </div>
  );
}
