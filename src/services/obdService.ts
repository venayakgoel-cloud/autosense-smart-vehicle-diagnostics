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
  onProgress: (progress: ObdScanProgress) => void,
  customDtcList?: string[]
): Promise<Omit<DiagnosticScan, 'id' | 'scannedAt' | 'updatedAt'>> {
  const stages: ObdScanProgress[] = [
    { stage: 'Initializing OBD-II adapter handshake...', percent: 18 },
    { stage: 'Negotiating ISO 15765-4 CAN / multi-brand ECU bus...', percent: 38 },
    { stage: 'Reading supported PIDs & sensor availability...', percent: 58 },
    { stage: 'Scanning powertrain, chassis, body & network modules...', percent: 80 },
    { stage: 'Computing vehicle health & transit safety summary...', percent: 100 },
  ];

  for (const step of stages) {
    onProgress(step);
    await new Promise((resolve) => setTimeout(resolve, 420));
  }

  const preset: DemoScanPreset =
    DEMO_SCAN_PRESETS.find((p) => p.id === presetId) ?? DEMO_SCAN_PRESETS[0];

  const normalizedCustom = (customDtcList ?? [])
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[PCBU][0-3][0-9A-F]{3}$/.test(c));

  const useCustom = normalizedCustom.length > 0;
  const detectedCodes = useCustom ? Array.from(new Set(normalizedCustom)) : preset.detectedCodes;
  const computedOverall = useCustom
    ? Math.max(38, 92 - detectedCodes.length * 14)
    : preset.overallHealthScore;
  const computedEngine = useCustom
    ? Math.max(35, 90 - detectedCodes.length * 15)
    : preset.engineHealthScore;

  return {
    ownerId: vehicle.ownerId,
    vehicleId: vehicle.id,
    vehicleLabel: `${vehicle.year} ${vehicle.manufacturer} ${vehicle.model}`,
    isDemoData: true,
    connectionMode,
    overallHealthScore: computedOverall,
    engineHealthScore: computedEngine,
    batteryVoltage: preset.batteryVoltage,
    coolantTempC: preset.coolantTempC,
    fuelTrimPct: preset.fuelTrimPct,
    emissionReadiness: preset.emissionReadiness,
    supportedSensors: preset.supportedSensors,
    detectedCodes,
    resolvedCodes: [],
    status: detectedCodes.length > 0 ? 'active' : 'resolved',
    summary: useCustom
      ? `Custom demo ECU scan for ${vehicle.manufacturer} ${vehicle.model} detected ${detectedCodes.join(', ')}. Review the Service Transit Advisor below before driving.`
      : preset.summary,
    scannedAtIso: new Date().toISOString(),
  };
}
