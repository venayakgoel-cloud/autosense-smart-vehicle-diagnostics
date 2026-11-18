import type {
  ConnectionHistoryEntry,
  DiagnosticScan,
  MaintenanceRecord,
  NotificationItem,
  ServiceCentre,
  Vehicle,
} from '../types/autosense';

export const DEMO_VEHICLES: Vehicle[] = [
  {
    id: 'demo-veh-civic',
    ownerId: 'demo-user',
    manufacturer: 'Honda',
    model: 'Civic Touring',
    year: 2022,
    fuelType: 'Petrol',
    registrationNumber: 'CA-8492-AS',
    odometerKm: 34820,
    vin: '19XFL1H8XNE004219',
    isPrimary: true,
    connectionStatus: 'demo_connected',
    lastHealthScore: 82,
    isDemoData: true,
  },
  {
    id: 'demo-veh-ioniq',
    ownerId: 'demo-user',
    manufacturer: 'Hyundai',
    model: 'Ioniq Hybrid',
    year: 2020,
    fuelType: 'Hybrid',
    registrationNumber: 'CA-3107-HV',
    odometerKm: 61450,
    vin: 'KMHC85LC0LU198340',
    isPrimary: false,
    connectionStatus: 'disconnected',
    lastHealthScore: 94,
    isDemoData: true,
  },
];

export const DEMO_SCANS: DiagnosticScan[] = [
  {
    id: 'demo-scan-latest',
    ownerId: 'demo-user',
    vehicleId: 'demo-veh-civic',
    vehicleLabel: '2022 Honda Civic Touring',
    isDemoData: true,
    connectionMode: 'DEMO_OBD',
    overallHealthScore: 82,
    engineHealthScore: 79,
    batteryVoltage: 12.5,
    coolantTempC: 91,
    fuelTrimPct: 7.4,
    emissionReadiness: 'Ready',
    supportedSensors: {
      battery: true,
      coolantTemp: true,
      fuelSystem: true,
      emissions: true,
      rpm: true,
    },
    detectedCodes: ['P0171', 'P0455'],
    resolvedCodes: [],
    status: 'active',
    summary:
      'Demo OBD scan detected a lean air-fuel trim warning (P0171) and a large EVAP vapor leak alert (P0455). Coolant temperature and 12V battery voltage remain within normal operating thresholds.',
    scannedAtIso: '2026-11-15T10:20:00Z',
  },
  {
    id: 'demo-scan-prev-1',
    ownerId: 'demo-user',
    vehicleId: 'demo-veh-civic',
    vehicleLabel: '2022 Honda Civic Touring',
    isDemoData: true,
    connectionMode: 'DEMO_OBD',
    overallHealthScore: 91,
    engineHealthScore: 92,
    batteryVoltage: 12.7,
    coolantTempC: 89,
    fuelTrimPct: 2.1,
    emissionReadiness: 'Ready',
    supportedSensors: {
      battery: true,
      coolantTemp: true,
      fuelSystem: true,
      emissions: true,
      rpm: true,
    },
    detectedCodes: ['P0455'],
    resolvedCodes: ['P0455'],
    status: 'resolved',
    summary:
      'Previous demo inspection flagged an EVAP cap alert (P0455) which cleared after tightening the fuel cap.',
    scannedAtIso: '2026-10-18T14:05:00Z',
  },
  {
    id: 'demo-scan-prev-2',
    ownerId: 'demo-user',
    vehicleId: 'demo-veh-civic',
    vehicleLabel: '2022 Honda Civic Touring',
    isDemoData: true,
    connectionMode: 'DEMO_OBD',
    overallHealthScore: 96,
    engineHealthScore: 97,
    batteryVoltage: 12.8,
    coolantTempC: 88,
    fuelTrimPct: 1.2,
    emissionReadiness: 'Ready',
    supportedSensors: {
      battery: true,
      coolantTemp: true,
      fuelSystem: true,
      emissions: true,
      rpm: true,
    },
    detectedCodes: [],
    resolvedCodes: [],
    status: 'resolved',
    summary: 'Baseline demonstration scan: all supported powertrain and emissions monitors nominal.',
    scannedAtIso: '2026-09-22T09:15:00Z',
  },
];

export const DEMO_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'demo-maint-1',
    ownerId: 'demo-user',
    vehicleId: 'demo-veh-civic',
    vehicleLabel: '2022 Honda Civic Touring',
    category: 'Oil Service',
    title: '0W-20 Full Synthetic Oil & Filter Change',
    notes: 'Recommended every 10,000 km or 6 months.',
    dueDate: '2026-11-28',
    dueOdometerKm: 36000,
    status: 'upcoming',
    isDemoData: true,
  },
  {
    id: 'demo-maint-2',
    ownerId: 'demo-user',
    vehicleId: 'demo-veh-civic',
    vehicleLabel: '2022 Honda Civic Touring',
    category: 'Tyre Maintenance',
    title: '4-Wheel Rotation & Alignment Inspection',
    notes: 'Check tread depth and cold inflation pressure (32 PSI).',
    dueDate: '2026-11-12',
    dueOdometerKm: 34500,
    status: 'overdue',
    isDemoData: true,
  },
  {
    id: 'demo-maint-3',
    ownerId: 'demo-user',
    vehicleId: 'demo-veh-civic',
    vehicleLabel: '2022 Honda Civic Touring',
    category: 'Brake Inspection',
    title: 'Front Pad Thickness & Brake Fluid Check',
    notes: 'Inspect rotors and moisture content in DOT 3/4 fluid.',
    dueDate: '2026-12-20',
    dueOdometerKm: 40000,
    status: 'upcoming',
    isDemoData: true,
  },
  {
    id: 'demo-maint-4',
    ownerId: 'demo-user',
    vehicleId: 'demo-veh-civic',
    vehicleLabel: '2022 Honda Civic Touring',
    category: 'Battery Inspection',
    title: '12V Battery Load & Terminal Clean',
    notes: 'Completed prior to winter driving season.',
    dueDate: '2026-10-05',
    dueOdometerKm: 33100,
    status: 'completed',
    completedAt: '2026-10-04',
    isDemoData: true,
  },
];

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'demo-notif-1',
    ownerId: 'demo-user',
    type: 'diagnostic',
    title: 'Attention: Lean Air-Fuel Code P0171',
    message:
      'Demo scan on 2022 Honda Civic Touring detected P0171 (Medium severity). Schedule an intake & sensor inspection soon.',
    isRead: false,
    relatedPath: 'diagnostics',
    createdAtIso: '2026-11-15T10:21:00Z',
  },
  {
    id: 'demo-notif-2',
    ownerId: 'demo-user',
    type: 'maintenance',
    title: 'Overdue: 4-Wheel Rotation & Alignment',
    message: 'Tyre maintenance reminder passed 34,500 km target on 2022 Honda Civic Touring.',
    isRead: false,
    relatedPath: 'maintenance',
    createdAtIso: '2026-11-13T08:00:00Z',
  },
  {
    id: 'demo-notif-3',
    ownerId: 'demo-user',
    type: 'connection',
    title: 'Demo OBD-II Adapter Active',
    message: 'AutoSense Interactive Demonstration Mode is simulating an ISO 15765-4 CAN link.',
    isRead: true,
    relatedPath: 'connect',
    createdAtIso: '2026-11-15T10:18:00Z',
  },
];

export const SAMPLE_SERVICE_CENTRES: ServiceCentre[] = [
  {
    id: 'sample-sc-1',
    name: 'Pacific Precision Auto Care',
    city: 'San Jose',
    address: '1480 West San Carlos St, Suite B',
    phone: '+1 (408) 555-0142',
    specialties: ['OBD-II Diagnostics', 'Engine & Ignition', 'Hybrid Service'],
    rating: 4.8,
    hours: 'Mon–Sat · 08:00–18:00',
    isSampleListing: true,
  },
  {
    id: 'sample-sc-2',
    name: 'Northgate Certified Mobility Workshop',
    city: 'San Francisco',
    address: '720 Harrison St, Bay 4',
    phone: '+1 (415) 555-0198',
    specialties: ['Emissions & EVAP', 'Brake Systems', 'Electrical Testing'],
    rating: 4.7,
    hours: 'Mon–Fri · 07:30–17:30',
    isSampleListing: true,
  },
  {
    id: 'sample-sc-3',
    name: 'ClearLine Family Garage & Diagnostics',
    city: 'Oakland',
    address: '2910 Telegraph Ave',
    phone: '+1 (510) 555-0167',
    specialties: ['Routine Maintenance', 'Tyres & Alignment', 'Battery & Charging'],
    rating: 4.9,
    hours: 'Mon–Sat · 08:30–17:30',
    isSampleListing: true,
  },
  {
    id: 'sample-sc-4',
    name: 'MetroTech Automotive Diagnostics',
    city: 'Los Angeles',
    address: '4120 Sunset Blvd',
    phone: '+1 (323) 555-0129',
    specialties: ['Transmission Control', 'CAN Bus Electrical', 'Cooling Systems'],
    rating: 4.6,
    hours: 'Tue–Sun · 09:00–18:00',
    isSampleListing: true,
  },
];

export const DEMO_CONNECTION_HISTORY: ConnectionHistoryEntry[] = [
  {
    id: 'conn-1',
    timestamp: '2026-11-15 10:18',
    method: 'DEMO_OBD',
    vehicleLabel: '2022 Honda Civic Touring',
    status: 'Connected',
    detail: 'Demo Mode · ISO 15765-4 CAN (11-bit, 500 kbps)',
    isDemoData: true,
  },
  {
    id: 'conn-2',
    timestamp: '2026-10-18 14:02',
    method: 'DEMO_OBD',
    vehicleLabel: '2022 Honda Civic Touring',
    status: 'Connected',
    detail: 'Demo Mode · Routine check session',
    isDemoData: true,
  },
  {
    id: 'conn-3',
    timestamp: '2026-09-22 09:11',
    method: 'BLUETOOTH',
    vehicleLabel: '2020 Hyundai Ioniq Hybrid',
    status: 'Timeout',
    detail: 'Hardware adapter not detected in browser session; switched to Demo Mode',
    isDemoData: true,
  },
];

export interface DemoScanPreset {
  id: string;
  title: string;
  subtitle: string;
  overallHealthScore: number;
  engineHealthScore: number;
  batteryVoltage: number;
  coolantTempC: number;
  fuelTrimPct: number;
  emissionReadiness: 'Ready' | 'Pending' | 'Unsupported';
  supportedSensors: {
    battery: boolean;
    coolantTemp: boolean;
    fuelSystem: boolean;
    emissions: boolean;
    rpm: boolean;
  };
  detectedCodes: string[];
  summary: string;
}

export const DEMO_SCAN_PRESETS: DemoScanPreset[] = [
  {
    id: 'preset-nominal',
    title: 'Healthy Vehicle Baseline',
    subtitle: 'All supported sensors nominal · 0 trouble codes',
    overallHealthScore: 96,
    engineHealthScore: 97,
    batteryVoltage: 12.8,
    coolantTempC: 89,
    fuelTrimPct: 1.4,
    emissionReadiness: 'Ready',
    supportedSensors: {
      battery: true,
      coolantTemp: true,
      fuelSystem: true,
      emissions: true,
      rpm: true,
    },
    detectedCodes: [],
    summary:
      'Demo scan completed cleanly: no stored or pending Diagnostic Trouble Codes were found across powertrain or emissions modules.',
  },
  {
    id: 'preset-misfire',
    title: 'Engine Misfire & Low Voltage Alert',
    subtitle: 'High severity · P0300 & P0562 detected',
    overallHealthScore: 61,
    engineHealthScore: 54,
    batteryVoltage: 11.7,
    coolantTempC: 94,
    fuelTrimPct: 9.8,
    emissionReadiness: 'Pending',
    supportedSensors: {
      battery: true,
      coolantTemp: true,
      fuelSystem: true,
      emissions: true,
      rpm: true,
    },
    detectedCodes: ['P0300', 'P0562'],
    summary:
      'Demo scan detected multiple cylinder misfires (P0300) alongside low system voltage (P0562). Prompt professional inspection is recommended.',
  },
  {
    id: 'preset-critical-coolant',
    title: 'Critical Cooling Sensor & Network Alert',
    subtitle: 'Critical severity · P0118 & P0420 detected',
    overallHealthScore: 48,
    engineHealthScore: 44,
    batteryVoltage: 12.4,
    coolantTempC: 114,
    fuelTrimPct: 4.5,
    emissionReadiness: 'Ready',
    supportedSensors: {
      battery: true,
      coolantTemp: true,
      fuelSystem: true,
      emissions: true,
      rpm: true,
    },
    detectedCodes: ['P0118', 'P0420'],
    summary:
      'Demo scan recorded a Critical coolant temperature sensor circuit reading (P0118) and an emissions efficiency notice (P0420). Stop safely if overheating occurs.',
  },
  {
    id: 'preset-limited-sensors',
    title: 'Partial Sensor Support Profile',
    subtitle: 'Simulates an older ECU where battery & emissions PIDs are unsupported',
    overallHealthScore: 84,
    engineHealthScore: 84,
    batteryVoltage: -1,
    coolantTempC: 90,
    fuelTrimPct: 6.2,
    emissionReadiness: 'Unsupported',
    supportedSensors: {
      battery: false,
      coolantTemp: true,
      fuelSystem: true,
      emissions: false,
      rpm: true,
    },
    detectedCodes: ['P0171'],
    summary:
      'Demo scan completed on a partial-PID vehicle profile: P0171 detected. Battery voltage and emissions readiness monitors are not reported by this simulated ECU.',
  },
];
