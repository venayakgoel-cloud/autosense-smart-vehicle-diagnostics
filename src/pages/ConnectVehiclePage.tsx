import { useState } from 'react';
import {
  AlertCircle,
  Bluetooth,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  History,
  Play,
  Wifi,
} from 'lucide-react';
import { attemptBluetoothPair, detectAdapterCapabilities } from '../services/obdService';
import type {
  AppSection,
  ConnectionHistoryEntry,
  ConnectionMode,
  ConnectionStatus,
  Vehicle,
} from '../types/autosense';

interface ConnectVehiclePageProps {
  activeVehicle: Vehicle | undefined;
  connectionHistory: ConnectionHistoryEntry[];
  selectedMode: ConnectionMode;
  onChangeMode: (mode: ConnectionMode) => void;
  onUpdateConnection: (status: ConnectionStatus, mode: ConnectionMode, detail: string) => void;
  onNavigate: (section: AppSection) => void;
}

const STEPS = [
  {
    num: '01',
    title: 'Locate the vehicle’s OBD-II port',
    detail:
      'Look beneath the steering column or lower driver-side dashboard for the 16-pin trapezoidal socket.',
  },
  {
    num: '02',
    title: 'Connect the compatible AutoSense diagnostic device',
    detail:
      'Firmly seat the AutoSense OBD-II adapter into the port until the subtle status bar illuminates.',
  },
  {
    num: '03',
    title: 'Turn on the vehicle as instructed by the manufacturer',
    detail:
      'Turn the key to Ignition ON (or press Start without depressing the brake on push-button cars) so ECU modules power up.',
  },
  {
    num: '04',
    title: 'Connect the device to the app',
    detail:
      'Select Bluetooth LE or Wi-Fi below to pair your adapter, or enable Interactive Demonstration Mode.',
  },
  {
    num: '05',
    title: 'Start the diagnostic scan',
    detail:
      'Open Diagnostics to read supported sensor values and translate any trouble codes into plain English.',
  },
];

const TROUBLESHOOTING = [
  {
    q: 'Adapter powers on, but Bluetooth pairing does not appear',
    a: 'Ensure ignition is in the ON position and verify no other smartphone app is currently holding an active Bluetooth connection to the dongle.',
  },
  {
    q: 'Wi-Fi OBD-II adapter connects, but ECU handshake times out',
    a: 'Check that your phone stays connected to the adapter’s local Wi-Fi network (default 192.168.0.10:35000) and confirm your vehicle is 1996+ OBD-II compliant.',
  },
  {
    q: 'Some sensors show "Unsupported" after connecting',
    a: 'Not every vehicle manufacturer broadcasts all PIDs (such as 12V battery voltage or fuel pressure) over standard OBD-II. AutoSense always labels unsupported readings honestly.',
  },
];

export function ConnectVehiclePage({
  activeVehicle,
  connectionHistory,
  selectedMode,
  onChangeMode,
  onUpdateConnection,
  onNavigate,
}: ConnectVehiclePageProps) {
  const [wifiHost, setWifiHost] = useState('192.168.0.10:35000');
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'ok' | 'info'; text: string } | null>(
    null
  );
  const [openTroubleIdx, setOpenTroubleIdx] = useState<number | null>(0);
  const capabilities = detectAdapterCapabilities();

  const handleBluetoothConnect = async () => {
    onChangeMode('BLUETOOTH');
    const result = await attemptBluetoothPair();
    if (result.connected) {
      onUpdateConnection('bluetooth_ready', 'BLUETOOTH', result.message);
      setStatusFeedback({ type: 'ok', text: result.message });
    } else {
      setStatusFeedback({ type: 'info', text: result.message });
    }
  };

  const handleWifiConnect = () => {
    onChangeMode('WIFI');
    setStatusFeedback({
      type: 'info',
      text: `Browser security restricts direct raw TCP sockets to ${wifiHost} without a local bridge. Hardware-ready ELM327 Wi-Fi profile saved; activate Interactive Demonstration Mode below to simulate a live scan.`,
    });
  };

  const handleDemoConnect = () => {
    onChangeMode('DEMO_OBD');
    onUpdateConnection(
      'demo_connected',
      'DEMO_OBD',
      'Interactive Demonstration Mode connected (simulated ISO 15765-4 CAN bus).'
    );
    setStatusFeedback({
      type: 'ok',
      text: 'Interactive Demonstration Mode is active. Simulated OBD-II telemetry is clearly labeled DEMO DATA across the app.',
    });
  };

  const statusText =
    activeVehicle?.connectionStatus === 'demo_connected'
      ? 'Connected (Interactive Demo Mode)'
      : activeVehicle?.connectionStatus === 'bluetooth_ready'
      ? 'Bluetooth OBD-II Connected'
      : activeVehicle?.connectionStatus === 'wifi_ready'
      ? 'Wi-Fi OBD-II Connected'
      : 'Disconnected';

  return (
    <div className="space-y-6">
      {/* Connection Status & Hardware Options */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
                Connect Your Vehicle
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Pair an AutoSense OBD-II adapter via Bluetooth or Wi-Fi, or run Interactive
                Demonstration Mode.
              </p>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded border ${
                activeVehicle?.connectionStatus && activeVehicle.connectionStatus !== 'disconnected'
                  ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300'
              }`}
            >
              {statusText}
            </span>
          </div>

          {statusFeedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${
                statusFeedback.type === 'ok'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}
            >
              {statusFeedback.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              )}
              <span>{statusFeedback.text}</span>
            </div>
          )}

          {/* Interface Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-xl border transition-colors space-y-3 ${
                selectedMode === 'BLUETOOTH'
                  ? 'bg-[#0B1120] border-blue-500'
                  : 'bg-[#0B1120] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Bluetooth className="w-4 h-4 text-blue-400" />
                  Bluetooth LE OBD-II
                </div>
                <span className="text-[11px] text-slate-400">
                  {capabilities.webBluetoothSupported ? 'API Ready' : 'Browser Restricted'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pairs directly with AutoSense BLE &amp; ELM327 v2.1+ Bluetooth adapters via Web
                Bluetooth GATT service.
              </p>
              <button
                type="button"
                onClick={handleBluetoothConnect}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors min-h-[40px]"
              >
                Scan for Bluetooth Adapter
              </button>
            </div>

            <div
              className={`p-4 rounded-xl border transition-colors space-y-3 ${
                selectedMode === 'WIFI'
                  ? 'bg-[#0B1120] border-blue-500'
                  : 'bg-[#0B1120] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Wifi className="w-4 h-4 text-blue-400" />
                  Wi-Fi OBD-II Bridge
                </div>
                <span className="text-[11px] text-slate-400">TCP / WS</span>
              </div>
              <input
                type="text"
                value={wifiHost}
                onChange={(e) => setWifiHost(e.target.value)}
                aria-label="Wi-Fi OBD-II IP and Port"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0F172A] border border-slate-700 text-xs font-mono text-white"
              />
              <button
                type="button"
                onClick={handleWifiConnect}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors min-h-[40px]"
              >
                Test Wi-Fi Adapter Link
              </button>
            </div>
          </div>

          {/* Interactive Demo Mode Box */}
          <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-white">
                  Interactive Demonstration Mode
                </span>
                <span className="text-[11px] font-mono text-amber-300">DEMO DATA</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                No physical OBD-II hardware connected? Simulate an ISO 15765-4 CAN link to run live
                scans and explore all diagnostic features.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDemoConnect}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors whitespace-nowrap min-h-[44px]"
              >
                Connect Demo OBD-II
              </button>
              <button
                type="button"
                onClick={() => onNavigate('diagnostics')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-white whitespace-nowrap min-h-[44px]"
              >
                <Play className="w-3.5 h-3.5" />
                Go to Scan
              </button>
            </div>
          </div>
        </div>

        {/* Device Visual & Vehicle Identification */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="h-48 bg-[#0B1120]">
            <img
              src="/src/assets/images/obd_dongle_device_1795018619924.jpg"
              alt="AutoSense OBD-II diagnostic adapter"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 space-y-4 flex-1">
            <h2 className="text-sm font-semibold text-white">Vehicle Identification Details</h2>
            {activeVehicle ? (
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-slate-400">Vehicle</dt>
                  <dd className="text-white font-medium mt-0.5">
                    {activeVehicle.year} {activeVehicle.manufacturer} {activeVehicle.model}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Registration</dt>
                  <dd className="text-white font-mono mt-0.5">{activeVehicle.registrationNumber}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Fuel / Powertrain</dt>
                  <dd className="text-white mt-0.5">{activeVehicle.fuelType}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Protocol</dt>
                  <dd className="text-white font-mono mt-0.5">
                    {activeVehicle.connectionStatus === 'disconnected'
                      ? 'Awaiting link'
                      : 'ISO 15765-4 CAN'}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-400">VIN</dt>
                  <dd className="text-white font-mono mt-0.5">
                    {activeVehicle.vin || 'Not provided (optional)'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-xs text-slate-400">
                Select or add a vehicle in My Garage to inspect vehicle identification details.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 5-Step Visual Connection Guide */}
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="font-display font-bold text-lg text-white">
            Step-by-Step OBD-II Connection Guide
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Follow these five safe steps before starting a vehicle diagnostic scan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 rounded-xl overflow-hidden border border-slate-800 bg-[#0B1120]">
            <img
              src="/src/assets/images/obd_port_guide_1795018619781.jpg"
              alt="Diagram highlighting driver-side 16-pin OBD-II port under dashboard"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 space-y-3">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800/90 flex items-start gap-3.5"
              >
                <span className="font-mono text-xs font-bold text-blue-400 tabular-nums pt-0.5">
                  Step {step.num}
                </span>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Troubleshooting & Connection History */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Connection Troubleshooting</h2>
          <div className="divide-y divide-slate-800">
            {TROUBLESHOOTING.map((item, idx) => {
              const isOpen = openTroubleIdx === idx;
              return (
                <div key={item.q} className="py-3">
                  <button
                    type="button"
                    onClick={() => setOpenTroubleIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 text-left text-sm font-medium text-slate-200 hover:text-white min-h-[40px]"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">{item.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            Connection History
          </h2>
          {connectionHistory.length === 0 ? (
            <p className="text-sm text-slate-400 py-6">No connection attempts logged yet.</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {connectionHistory.map((entry) => (
                <div key={entry.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-white">
                      {entry.vehicleLabel} · {entry.method}
                    </span>
                    <span
                      className={`font-medium ${
                        entry.status === 'Connected' ? 'text-blue-400' : 'text-amber-400'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{entry.detail}</p>
                  <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                    {entry.timestamp} {entry.isDemoData ? '· DEMO DATA' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
