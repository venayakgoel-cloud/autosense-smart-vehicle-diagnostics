import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Bluetooth,
  BookOpen,
  CalendarClock,
  Car,
  Search,
  Thermometer,
  Wrench,
} from 'lucide-react';
import { HealthScoreGauge, TelemetryTrendChart } from '../components/TelemetryCharts';
import { findObdCodeDetails, SEVERITY_GUIDANCE } from '../data/obdCodes';
import type {
  AppSection,
  DiagnosticScan,
  MaintenanceRecord,
  NotificationItem,
  ObdCodeEntry,
  UserProfile,
  Vehicle,
} from '../types/autosense';

interface DashboardPageProps {
  userProfile: UserProfile;
  activeVehicle: Vehicle | undefined;
  latestScan: DiagnosticScan | undefined;
  vehicleScans: DiagnosticScan[];
  maintenance: MaintenanceRecord[];
  notifications: NotificationItem[];
  customCodes: ObdCodeEntry[];
  onNavigate: (section: AppSection) => void;
}

export function DashboardPage({
  userProfile,
  activeVehicle,
  latestScan,
  vehicleScans,
  maintenance,
  notifications,
  customCodes,
  onNavigate,
}: DashboardPageProps) {
  const firstName = userProfile.fullName.split(' ')[0] || 'Driver';
  const upcomingMaintenance = maintenance
    .filter((m) => m.status !== 'completed')
    .slice(0, 3);
  const recentActivity = notifications.slice(0, 4);

  const batterySupported = latestScan ? latestScan.supportedSensors.battery : false;
  const coolantSupported = latestScan ? latestScan.supportedSensors.coolantTemp : false;

  const overallScore = latestScan?.overallHealthScore ?? activeVehicle?.lastHealthScore ?? 0;
  const engineScore = latestScan?.engineHealthScore ?? 0;

  return (
    <div className="space-y-6">
      {/* Welcome & Vehicle Banner */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Welcome back, {firstName}
          </h1>
          {activeVehicle ? (
            <p className="text-sm text-slate-300">
              Connected Vehicle:{' '}
              <span className="font-mono font-bold text-blue-300">
                {activeVehicle.registrationNumber}
              </span>{' '}
              ·{' '}
              <span className="font-semibold text-white">
                {activeVehicle.year} {activeVehicle.manufacturer} {activeVehicle.model}
              </span>{' '}
              · {activeVehicle.fuelType} ·{' '}
              <span className="font-mono tabular-nums">
                {activeVehicle.odometerKm.toLocaleString()} km
              </span>
              {activeVehicle.isDemoData && ' · DEMO DATA'}
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              No vehicle selected yet. Add your car in My Garage to start tracking diagnostics.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('diagnostics')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors min-h-[44px] whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            Start Diagnostic Scan
          </button>
          <button
            type="button"
            onClick={() => onNavigate('connect')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-sm font-medium text-slate-200 transition-colors min-h-[44px] whitespace-nowrap"
          >
            <Bluetooth className="w-4 h-4" />
            Connect Vehicle
          </button>
        </div>
      </section>

      {/* Quick Actions Strip */}
      <section aria-label="Quick Actions" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { id: 'connect' as AppSection, label: 'Connect Vehicle', icon: Bluetooth },
          { id: 'diagnostics' as AppSection, label: 'Start Diagnostic Scan', icon: Search },
          { id: 'health' as AppSection, label: 'View Vehicle Health', icon: Activity },
          { id: 'codes' as AppSection, label: 'View Error Codes', icon: BookOpen },
          { id: 'maintenance' as AppSection, label: 'Maintenance Guide', icon: Wrench },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onNavigate(action.id)}
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-blue-500/60 hover:bg-slate-800/70 text-left transition-colors min-h-[48px]"
            >
              <Icon className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">
                {action.label}
              </span>
            </button>
          );
        })}
      </section>

      {/* Primary Metrics Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Vehicle Health Score</h2>
            {latestScan?.isDemoData && (
              <span className="text-[11px] font-mono text-amber-300">DEMO DATA</span>
            )}
          </div>
          {activeVehicle ? (
            <HealthScoreGauge score={overallScore} />
          ) : (
            <p className="text-sm text-slate-400 py-6">
              Add a vehicle and run a scan to compute your Vehicle Health Score.
            </p>
          )}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Last Scan</span>
            <span className="font-mono tabular-nums text-slate-200">
              {latestScan?.scannedAtIso
                ? new Date(latestScan.scannedAtIso).toLocaleString()
                : 'No scans recorded'}
            </span>
          </div>
        </div>

        {/* Subsystem Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-400" />
                Engine Health
              </span>
              <span>{latestScan ? (latestScan.isDemoData ? 'DEMO DATA' : 'Supported') : 'Unavailable'}</span>
            </div>
            <p className="text-2xl font-display font-bold text-white tabular-nums">
              {latestScan ? `${engineScore}/100` : 'Unavailable'}
            </p>
            <p className="text-xs text-slate-400">
              {latestScan
                ? engineScore >= 85
                  ? 'Powertrain operating within expected parameters.'
                  : 'Review detected trouble codes for inspection advice.'
                : 'Run a diagnostic scan to evaluate engine telemetry.'}
            </p>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-blue-400" />
                Battery Status
              </span>
              <span>
                {!latestScan
                  ? 'Unavailable'
                  : batterySupported
                  ? latestScan.isDemoData
                    ? 'DEMO DATA'
                    : 'Supported'
                  : 'Unsupported'}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-white tabular-nums">
              {latestScan && batterySupported && latestScan.batteryVoltage > 0
                ? `${latestScan.batteryVoltage.toFixed(1)} V`
                : 'Not Supported'}
            </p>
            <p className="text-xs text-slate-400">
              {latestScan && batterySupported
                ? latestScan.batteryVoltage < 12.1
                  ? 'Voltage below ideal resting level; load check advised.'
                  : 'Nominal 12V resting & charging voltage.'
                : 'Battery voltage PID is unavailable for this vehicle scan.'}
            </p>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-blue-400" />
                Engine Temperature
              </span>
              <span>
                {!latestScan
                  ? 'Unavailable'
                  : coolantSupported
                  ? latestScan.isDemoData
                    ? 'DEMO DATA'
                    : 'Supported'
                  : 'Unsupported'}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-white tabular-nums">
              {latestScan && coolantSupported ? `${latestScan.coolantTempC} °C` : 'Not Supported'}
            </p>
            <p className="text-xs text-slate-400">
              {latestScan && coolantSupported
                ? latestScan.coolantTempC > 105
                  ? 'Elevated coolant temperature — monitor closely.'
                  : 'Normal operating coolant temperature.'
                : 'Coolant temperature PID is unavailable for this scan.'}
            </p>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-blue-400" />
                Diagnostic Trouble Codes
              </span>
              <span>{latestScan?.status === 'resolved' ? 'Cleared' : 'Active'}</span>
            </div>
            <p className="text-2xl font-display font-bold text-white tabular-nums">
              {latestScan ? latestScan.detectedCodes.length : 0}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('diagnostics')}
              className="text-xs font-medium text-blue-400 hover:underline"
            >
              View full diagnostic breakdown →
            </button>
          </div>
        </div>
      </section>

      {/* Chart + Active Codes */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <TelemetryTrendChart
            scans={vehicleScans}
            metric="overallHealthScore"
            title="Health Score History"
            unit="/100"
          />
        </div>

        <div className="lg:col-span-6 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Detected Trouble Codes</h2>
            <button
              type="button"
              onClick={() => onNavigate('diagnostics')}
              className="text-xs text-blue-400 hover:underline"
            >
              Inspect All
            </button>
          </div>

          {!latestScan || latestScan.detectedCodes.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm text-slate-300">No trouble codes detected in latest scan.</p>
              <p className="text-xs text-slate-500">
                Run a scan anytime from Diagnostics to check vehicle modules.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestScan.detectedCodes.map((code) => {
                const detail = findObdCodeDetails(code, customCodes);
                const sev = SEVERITY_GUIDANCE[detail.severity];
                return (
                  <div
                    key={code}
                    className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800/80 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{detail.code}</span>
                        <span className="text-xs text-slate-400">· {detail.category}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-200 truncate">{detail.name}</p>
                      <p className="text-xs text-slate-400 line-clamp-2">{sev.actionSummary}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border shrink-0 ${sev.badgeClass}`}>
                      {sev.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Maintenance Reminders & Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-blue-400" />
              Maintenance Reminders
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('maintenance')}
              className="text-xs text-blue-400 hover:underline"
            >
              Manage Reminders
            </button>
          </div>

          {upcomingMaintenance.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">
              All scheduled maintenance items are completed.
            </p>
          ) : (
            <div className="divide-y divide-slate-800">
              {upcomingMaintenance.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-slate-400">
                      {item.category} · Due {item.dueDate} ·{' '}
                      <span className="font-mono tabular-nums">
                        {item.dueOdometerKm.toLocaleString()} km
                      </span>
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium shrink-0 ${
                      item.status === 'overdue' ? 'text-red-400' : 'text-blue-400'
                    }`}
                  >
                    {item.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Vehicle Activity</h2>
            <button
              type="button"
              onClick={() => onNavigate('notifications')}
              className="text-xs text-blue-400 hover:underline"
            >
              Notification Centre
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">No recent vehicle events logged yet.</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentActivity.map((act) => (
                <div key={act.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white truncate">{act.title}</p>
                    <span className="text-[11px] text-slate-500 font-mono shrink-0">
                      {act.createdAtIso ? new Date(act.createdAtIso).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{act.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
