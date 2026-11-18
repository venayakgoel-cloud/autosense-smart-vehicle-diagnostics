import type { ConnectionMode, DiagnosticScan, Vehicle } from '../types/autosense';
import { DEMO_SCAN_PRESETS, type DemoScanPreset } from '../data/demoData';

export interface ObdAdapterCapabilities {
  webBluetoothSupported: boolean;
  wifiBridgeSupported: boolean;
  recommendedMode: ConnectionMode;
}

export function detectAdapterCapabilities(): ObdAdapterCapabilities {
  const hasBluetooth =
    typeof navigator !== 'undefined' &&
    'bluetooth' in navigator &&
    typeof (navigator as unknown as { bluetooth?: { requestDevice?: unknown } }).bluetooth
      ?.requestDevice === 'function';

  return {
    webBluetoothSupported: hasBluetooth,
    wifiBridgeSupported: true,
    recommendedMode: 'DEMO_OBD',
  };
}

export interface ObdScanProgress {
  stage: string;
  percent: number;
}

export async function attemptBluetoothPair(): Promise<{
  connected: boolean;
  message: string;
}> {
  const nav = navigator as unknown as {
    bluetooth?: {
      requestDevice: (opts: {
        acceptAllDevices?: boolean;
        optionalServices?: string[];
      }) => Promise<{ name?: string; id: string }>;
    };
  };

  if (!nav.bluetooth?.requestDevice) {
    return {
      connected: false,
      message:
        'Web Bluetooth is not supported in this browser or preview frame. Use Interactive Demonstration Mode to test full diagnostic capabilities.',
    };
  }

  try {
    const device = await nav.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb'],
    });
    return {
      connected: true,
      message: `Paired with OBD-II BLE adapter "${device.name || device.id}". Hardware stream ready.`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Pairing cancelled.';
    return {
      connected: false,
      message: `Bluetooth adapter not paired (${msg}). You can continue with Interactive Demonstration Mode.`,
    };
  }
}

export async function runDiagnosticSequence(
  vehicle: Vehicle,
  connectionMode: ConnectionMode,
  presetId: string,
  onProgress: (progress: ObdScanProgress) => void
): Promise<Omit<DiagnosticScan, 'id' | 'scannedAt' | 'updatedAt'>> {
  const stages: ObdScanProgress[] = [
    { stage: 'Initializing OBD-II adapter handshake...', percent: 18 },
    { stage: 'Negotiating ISO 15765-4 CAN vehicle bus...', percent: 38 },
    { stage: 'Reading supported PIDs & sensor availability...', percent: 58 },
    { stage: 'Scanning powertrain & emission control modules...', percent: 80 },
    { stage: 'Computing vehicle health summary...', percent: 100 },
  ];

  for (const step of stages) {
    onProgress(step);
    await new Promise((resolve) => setTimeout(resolve, 480));
  }

  const preset: DemoScanPreset =
    DEMO_SCAN_PRESETS.find((p) => p.id === presetId) ?? DEMO_SCAN_PRESETS[0];

  return {
    ownerId: vehicle.ownerId,
    vehicleId: vehicle.id,
    vehicleLabel: `${vehicle.year} ${vehicle.manufacturer} ${vehicle.model}`,
    isDemoData: true,
    connectionMode,
    overallHealthScore: preset.overallHealthScore,
    engineHealthScore: preset.engineHealthScore,
    batteryVoltage: preset.batteryVoltage,
    coolantTempC: preset.coolantTempC,
    fuelTrimPct: preset.fuelTrimPct,
    emissionReadiness: preset.emissionReadiness,
    supportedSensors: preset.supportedSensors,
    detectedCodes: preset.detectedCodes,
    resolvedCodes: [],
    status: preset.detectedCodes.length > 0 ? 'active' : 'resolved',
    summary: preset.summary,
    scannedAtIso: new Date().toISOString(),
  };
}
