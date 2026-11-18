export type UserRole = 'user' | 'admin';

export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | 'CNG';

export type ConnectionStatus =
  | 'disconnected'
  | 'demo_connected'
  | 'bluetooth_ready'
  | 'wifi_ready';

export type ConnectionMode = 'DEMO_OBD' | 'BLUETOOTH' | 'WIFI';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ObdCategory =
  | 'Engine'
  | 'Fuel & Air'
  | 'Ignition'
  | 'Emissions'
  | 'Transmission'
  | 'Electrical'
  | 'Sensors';

export type MaintenanceCategory =
  | 'Oil Service'
  | 'Battery Inspection'
  | 'Tyre Maintenance'
  | 'Brake Inspection'
  | 'General Service'
  | 'Custom';

export type MaintenanceStatus = 'upcoming' | 'overdue' | 'completed';

export interface UserPreferences {
  emailAlerts: boolean;
  pushAlerts: boolean;
  maintenanceReminders: boolean;
  shareDiagnosticTelemetry: boolean;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  photoUrl: string;
  role: UserRole;
  preferences: UserPreferences;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  manufacturer: string;
  model: string;
  year: number;
  fuelType: FuelType;
  registrationNumber: string;
  odometerKm: number;
  vin?: string;
  isPrimary: boolean;
  connectionStatus: ConnectionStatus;
  lastHealthScore: number;
  isDemoData?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SupportedSensors {
  battery: boolean;
  coolantTemp: boolean;
  fuelSystem: boolean;
  emissions: boolean;
  rpm: boolean;
}

export interface DiagnosticScan {
  id: string;
  ownerId: string;
  vehicleId: string;
  vehicleLabel: string;
  isDemoData: boolean;
  connectionMode: ConnectionMode;
  overallHealthScore: number;
  engineHealthScore: number;
  batteryVoltage: number;
  coolantTempC: number;
  fuelTrimPct: number;
  emissionReadiness: 'Ready' | 'Pending' | 'Unsupported';
  supportedSensors: SupportedSensors;
  detectedCodes: string[];
  resolvedCodes: string[];
  status: 'active' | 'resolved';
  summary: string;
  scannedAtIso?: string;
  scannedAt?: unknown;
  updatedAt?: unknown;
}

export interface MaintenanceRecord {
  id: string;
  ownerId: string;
  vehicleId: string;
  vehicleLabel: string;
  category: MaintenanceCategory;
  title: string;
  notes?: string;
  dueDate: string;
  dueOdometerKm: number;
  status: MaintenanceStatus;
  completedAt?: string;
  isDemoData: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NotificationItem {
  id: string;
  ownerId: string;
  type: 'diagnostic' | 'maintenance' | 'connection' | 'scan' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  relatedPath?: string;
  createdAtIso?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ObdCodeEntry {
  id?: string;
  code: string;
  name: string;
  category: ObdCategory;
  severity: SeverityLevel;
  meaning: string;
  possibleCauses: string[];
  nextSteps: string;
  mechanicAdvice: string;
  isCustomFromAdmin?: boolean;
}

export interface ServiceCentre {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  specialties: string[];
  rating: number;
  hours: string;
  isSampleListing: boolean;
}

export interface ServiceEnquiry {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  type: 'appointment' | 'enquiry' | 'feedback';
  serviceCentreName?: string;
  vehicleLabel?: string;
  preferredDate?: string;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'scheduled' | 'closed';
  adminNote?: string;
  createdAtIso?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ConnectionHistoryEntry {
  id: string;
  timestamp: string;
  method: ConnectionMode;
  vehicleLabel: string;
  status: 'Connected' | 'Disconnected' | 'Timeout';
  detail: string;
  isDemoData: boolean;
}

// Synchronized Field Length Constraints matching firebase-blueprint.json
export const FIELD_LIMITS = {
  ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  FULL_NAME_MAX: 100,
  EMAIL_MAX: 150,
  PHONE_MAX: 30,
  CITY_MAX: 80,
  PHOTO_URL_MAX: 500,
  MANUFACTURER_MAX: 60,
  MODEL_MAX: 60,
  REG_NUMBER_MAX: 30,
  VIN_MAX: 30,
  TITLE_MAX: 120,
  NOTES_MAX: 500,
  SUBJECT_MAX: 160,
  MESSAGE_MAX: 1000,
  SUMMARY_MAX: 500,
};

export type AppSection =
  | 'dashboard'
  | 'connect'
  | 'diagnostics'
  | 'codes'
  | 'health'
  | 'garage'
  | 'maintenance'
  | 'history'
  | 'assistant'
  | 'services'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'admin';
