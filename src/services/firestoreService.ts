import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  FIELD_LIMITS,
  type DiagnosticScan,
  type MaintenanceRecord,
  type NotificationItem,
  type ObdCodeEntry,
  type ServiceCentre,
  type ServiceEnquiry,
  type UserProfile,
  type Vehicle,
} from '../types/autosense';

function clampStr(val: string | undefined, max: number): string {
  return (val ?? '').trim().slice(0, max);
}

function makeDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${rand}`;
}

export function timestampToIso(ts: unknown, fallbackIso?: string): string {
  if (ts instanceof Timestamp) {
    return ts.toDate().toISOString();
  }
  if (ts && typeof ts === 'object' && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    return (ts as { toDate: () => Date }).toDate().toISOString();
  }
  return fallbackIso ?? new Date().toISOString();
}

// =========================================================
// User Profile Operations
// =========================================================

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createUserProfile(input: {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  photoUrl?: string;
}): Promise<UserProfile> {
  const path = `users/${input.uid}`;
  const payload: UserProfile = {
    uid: input.uid,
    fullName: clampStr(input.fullName || 'AutoSense Driver', FIELD_LIMITS.FULL_NAME_MAX),
    email: clampStr(input.email, FIELD_LIMITS.EMAIL_MAX),
    phone: clampStr(input.phone, FIELD_LIMITS.PHONE_MAX),
    city: clampStr(input.city, FIELD_LIMITS.CITY_MAX),
    photoUrl: clampStr(input.photoUrl, FIELD_LIMITS.PHOTO_URL_MAX),
    role: 'user',
    preferences: {
      emailAlerts: true,
      pushAlerts: true,
      maintenanceReminders: true,
      shareDiagnosticTelemetry: false,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', input.uid), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<UserProfile, 'fullName' | 'phone' | 'city' | 'photoUrl' | 'preferences'>>
): Promise<void> {
  const path = `users/${uid}`;
  const sanitized: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (updates.fullName !== undefined) {
    sanitized.fullName = clampStr(updates.fullName, FIELD_LIMITS.FULL_NAME_MAX) || 'Driver';
  }
  if (updates.phone !== undefined) {
    sanitized.phone = clampStr(updates.phone, FIELD_LIMITS.PHONE_MAX);
  }
  if (updates.city !== undefined) {
    sanitized.city = clampStr(updates.city, FIELD_LIMITS.CITY_MAX);
  }
  if (updates.photoUrl !== undefined) {
    sanitized.photoUrl = clampStr(updates.photoUrl, FIELD_LIMITS.PHOTO_URL_MAX);
  }
  if (updates.preferences !== undefined) {
    sanitized.preferences = {
      emailAlerts: Boolean(updates.preferences.emailAlerts),
      pushAlerts: Boolean(updates.preferences.pushAlerts),
      maintenanceReminders: Boolean(updates.preferences.maintenanceReminders),
      shareDiagnosticTelemetry: Boolean(updates.preferences.shareDiagnosticTelemetry),
    };
  }

  try {
    await updateDoc(doc(db, 'users', uid), sanitized);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// =========================================================
// Vehicle Operations
// =========================================================

export function subscribeUserVehicles(
  uid: string,
  onData: (vehicles: Vehicle[]) => void
): Unsubscribe {
  const q = query(collection(db, 'vehicles'), where('ownerId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ ...(d.data() as Omit<Vehicle, 'id'>), id: d.id }));
      list.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'vehicles')
  );
}

export async function createVehicle(
  uid: string,
  data: Omit<Vehicle, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = makeDocId('veh');
  const path = `vehicles/${id}`;
  const payload = {
    ownerId: uid,
    manufacturer: clampStr(data.manufacturer, FIELD_LIMITS.MANUFACTURER_MAX),
    model: clampStr(data.model, FIELD_LIMITS.MODEL_MAX),
    year: Math.min(2030, Math.max(1980, Math.round(Number(data.year) || 2022))),
    fuelType: data.fuelType,
    registrationNumber: clampStr(data.registrationNumber, FIELD_LIMITS.REG_NUMBER_MAX),
    odometerKm: Math.min(2000000, Math.max(0, Number(data.odometerKm) || 0)),
    vin: clampStr(data.vin, FIELD_LIMITS.VIN_MAX),
    isPrimary: Boolean(data.isPrimary),
    connectionStatus: data.connectionStatus ?? 'disconnected',
    lastHealthScore: Math.min(100, Math.max(0, Number(data.lastHealthScore) || 95)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'vehicles', id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateVehicleDetails(
  vehicleId: string,
  updates: Partial<
    Pick<
      Vehicle,
      | 'manufacturer'
      | 'model'
      | 'year'
      | 'fuelType'
      | 'registrationNumber'
      | 'odometerKm'
      | 'vin'
      | 'isPrimary'
      | 'connectionStatus'
      | 'lastHealthScore'
    >
  >
): Promise<void> {
  const path = `vehicles/${vehicleId}`;
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (updates.manufacturer !== undefined) payload.manufacturer = clampStr(updates.manufacturer, FIELD_LIMITS.MANUFACTURER_MAX);
  if (updates.model !== undefined) payload.model = clampStr(updates.model, FIELD_LIMITS.MODEL_MAX);
  if (updates.year !== undefined) payload.year = Math.min(2030, Math.max(1980, Math.round(Number(updates.year))));
  if (updates.fuelType !== undefined) payload.fuelType = updates.fuelType;
  if (updates.registrationNumber !== undefined) payload.registrationNumber = clampStr(updates.registrationNumber, FIELD_LIMITS.REG_NUMBER_MAX);
  if (updates.odometerKm !== undefined) payload.odometerKm = Math.min(2000000, Math.max(0, Number(updates.odometerKm)));
  if (updates.vin !== undefined) payload.vin = clampStr(updates.vin, FIELD_LIMITS.VIN_MAX);
  if (updates.isPrimary !== undefined) payload.isPrimary = Boolean(updates.isPrimary);
  if (updates.connectionStatus !== undefined) payload.connectionStatus = updates.connectionStatus;
  if (updates.lastHealthScore !== undefined) payload.lastHealthScore = Math.min(100, Math.max(0, Number(updates.lastHealthScore)));

  try {
    await updateDoc(doc(db, 'vehicles', vehicleId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeVehicle(vehicleId: string): Promise<void> {
  const path = `vehicles/${vehicleId}`;
  try {
    await deleteDoc(doc(db, 'vehicles', vehicleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// =========================================================
// Diagnostic Scans
// =========================================================

export function subscribeUserScans(
  uid: string,
  onData: (scans: DiagnosticScan[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'diagnosticScans'),
    where('ownerId', '==', uid),
    orderBy('scannedAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data() as Omit<DiagnosticScan, 'id'>;
        return {
          ...data,
          id: d.id,
          scannedAtIso: timestampToIso(data.scannedAt, data.scannedAtIso),
        };
      });
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'diagnosticScans')
  );
}

export async function saveDiagnosticScan(
  uid: string,
  scan: Omit<DiagnosticScan, 'id' | 'ownerId' | 'scannedAt' | 'updatedAt' | 'scannedAtIso'>
): Promise<string> {
  const id = makeDocId('scan');
  const path = `diagnosticScans/${id}`;
  const payload = {
    ownerId: uid,
    vehicleId: scan.vehicleId,
    vehicleLabel: clampStr(scan.vehicleLabel, 120),
    isDemoData: Boolean(scan.isDemoData),
    connectionMode: scan.connectionMode,
    overallHealthScore: Math.min(100, Math.max(0, Number(scan.overallHealthScore))),
    engineHealthScore: Math.min(100, Math.max(0, Number(scan.engineHealthScore))),
    batteryVoltage: Number(scan.batteryVoltage),
    coolantTempC: Number(scan.coolantTempC),
    fuelTrimPct: Number(scan.fuelTrimPct),
    emissionReadiness: scan.emissionReadiness,
    supportedSensors: scan.supportedSensors,
    detectedCodes: scan.detectedCodes.slice(0, 20),
    resolvedCodes: scan.resolvedCodes.slice(0, 20),
    status: scan.status,
    summary: clampStr(scan.summary, FIELD_LIMITS.SUMMARY_MAX),
    scannedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'diagnosticScans', id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function markScanResolved(
  scanId: string,
  detectedCodes: string[]
): Promise<void> {
  const path = `diagnosticScans/${scanId}`;
  try {
    await updateDoc(doc(db, 'diagnosticScans', scanId), {
      resolvedCodes: detectedCodes.slice(0, 20),
      status: 'resolved',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// =========================================================
// Maintenance Records
// =========================================================

export function subscribeUserMaintenance(
  uid: string,
  onData: (records: MaintenanceRecord[]) => void
): Unsubscribe {
  const q = query(collection(db, 'maintenanceRecords'), where('ownerId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        ...(d.data() as Omit<MaintenanceRecord, 'id'>),
        id: d.id,
      }));
      list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'maintenanceRecords')
  );
}

export async function createMaintenanceRecord(
  uid: string,
  record: Omit<MaintenanceRecord, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = makeDocId('maint');
  const path = `maintenanceRecords/${id}`;
  const payload = {
    ownerId: uid,
    vehicleId: record.vehicleId,
    vehicleLabel: clampStr(record.vehicleLabel, 120),
    category: record.category,
    title: clampStr(record.title, FIELD_LIMITS.TITLE_MAX),
    notes: clampStr(record.notes, FIELD_LIMITS.NOTES_MAX),
    dueDate: clampStr(record.dueDate, 30),
    dueOdometerKm: Math.min(2000000, Math.max(0, Number(record.dueOdometerKm) || 0)),
    status: record.status,
    isDemoData: Boolean(record.isDemoData),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'maintenanceRecords', id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateMaintenanceRecord(
  recordId: string,
  updates: Partial<
    Pick<
      MaintenanceRecord,
      'category' | 'title' | 'notes' | 'dueDate' | 'dueOdometerKm' | 'status' | 'completedAt'
    >
  >
): Promise<void> {
  const path = `maintenanceRecords/${recordId}`;
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.title !== undefined) payload.title = clampStr(updates.title, FIELD_LIMITS.TITLE_MAX);
  if (updates.notes !== undefined) payload.notes = clampStr(updates.notes, FIELD_LIMITS.NOTES_MAX);
  if (updates.dueDate !== undefined) payload.dueDate = clampStr(updates.dueDate, 30);
  if (updates.dueOdometerKm !== undefined) payload.dueOdometerKm = Math.min(2000000, Math.max(0, Number(updates.dueOdometerKm)));
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.completedAt !== undefined) payload.completedAt = clampStr(updates.completedAt, 40);

  try {
    await updateDoc(doc(db, 'maintenanceRecords', recordId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteMaintenanceRecord(recordId: string): Promise<void> {
  const path = `maintenanceRecords/${recordId}`;
  try {
    await deleteDoc(doc(db, 'maintenanceRecords', recordId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// =========================================================
// Notifications
// =========================================================

export function subscribeUserNotifications(
  uid: string,
  onData: (items: NotificationItem[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'notifications'),
    where('ownerId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data() as Omit<NotificationItem, 'id'>;
        return {
          ...data,
          id: d.id,
          createdAtIso: timestampToIso(data.createdAt, data.createdAtIso),
        };
      });
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'notifications')
  );
}

export async function createNotification(
  uid: string,
  item: Omit<NotificationItem, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'createdAtIso'>
): Promise<void> {
  const id = makeDocId('notif');
  const path = `notifications/${id}`;
  try {
    await setDoc(doc(db, 'notifications', id), {
      ownerId: uid,
      type: item.type,
      title: clampStr(item.title, FIELD_LIMITS.TITLE_MAX),
      message: clampStr(item.message, FIELD_LIMITS.NOTES_MAX),
      isRead: Boolean(item.isRead),
      relatedPath: clampStr(item.relatedPath, 60),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const path = `notifications/${notificationId}`;
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// =========================================================
// Service Centres, Enquiries, Feedback, & Custom OBD Codes
// =========================================================

export function subscribeCustomObdCodes(
  onData: (codes: ObdCodeEntry[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'obdCodes'),
    (snap) => {
      const list = snap.docs.map((d) => ({
        ...(d.data() as ObdCodeEntry),
        id: d.id,
        isCustomFromAdmin: true,
      }));
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'obdCodes')
  );
}

export function subscribeServiceCentres(
  onData: (centres: ServiceCentre[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'serviceCentres'),
    (snap) => {
      const list = snap.docs.map((d) => ({
        ...(d.data() as Omit<ServiceCentre, 'id'>),
        id: d.id,
      }));
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'serviceCentres')
  );
}

export function subscribeUserEnquiries(
  uid: string,
  onData: (items: ServiceEnquiry[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'serviceEnquiries'),
    where('ownerId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data() as Omit<ServiceEnquiry, 'id'>;
        return {
          ...data,
          id: d.id,
          createdAtIso: timestampToIso(data.createdAt, data.createdAtIso),
        };
      });
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'serviceEnquiries')
  );
}

export async function createServiceEnquiry(
  uid: string,
  enquiry: {
    ownerName: string;
    ownerEmail: string;
    type: 'appointment' | 'enquiry' | 'feedback';
    serviceCentreName?: string;
    vehicleLabel?: string;
    preferredDate?: string;
    subject: string;
    message: string;
  }
): Promise<string> {
  const id = makeDocId('enq');
  const path = `serviceEnquiries/${id}`;
  try {
    await setDoc(doc(db, 'serviceEnquiries', id), {
      ownerId: uid,
      ownerName: clampStr(enquiry.ownerName, FIELD_LIMITS.FULL_NAME_MAX),
      ownerEmail: clampStr(enquiry.ownerEmail, FIELD_LIMITS.EMAIL_MAX),
      type: enquiry.type,
      serviceCentreName: clampStr(enquiry.serviceCentreName, 120),
      vehicleLabel: clampStr(enquiry.vehicleLabel, 120),
      preferredDate: clampStr(enquiry.preferredDate, 30),
      subject: clampStr(enquiry.subject, FIELD_LIMITS.SUBJECT_MAX),
      message: clampStr(enquiry.message, FIELD_LIMITS.MESSAGE_MAX),
      status: 'pending',
      adminNote: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// =========================================================
// Admin Queries & Mutations
// =========================================================

export async function adminFetchAllData(): Promise<{
  users: UserProfile[];
  vehicles: Vehicle[];
  scans: DiagnosticScan[];
  enquiries: ServiceEnquiry[];
}> {
  try {
    const [usersSnap, vehSnap, scansSnap, enqSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'vehicles')),
      getDocs(collection(db, 'diagnosticScans')),
      getDocs(collection(db, 'serviceEnquiries')),
    ]);

    return {
      users: usersSnap.docs.map((d) => d.data() as UserProfile),
      vehicles: vehSnap.docs.map((d) => ({ ...(d.data() as Omit<Vehicle, 'id'>), id: d.id })),
      scans: scansSnap.docs.map((d) => {
        const data = d.data() as Omit<DiagnosticScan, 'id'>;
        return { ...data, id: d.id, scannedAtIso: timestampToIso(data.scannedAt) };
      }),
      enquiries: enqSnap.docs.map((d) => {
        const data = d.data() as Omit<ServiceEnquiry, 'id'>;
        return { ...data, id: d.id, createdAtIso: timestampToIso(data.createdAt) };
      }),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'admin/all');
  }
}

export async function adminUpsertObdCode(entry: ObdCodeEntry): Promise<void> {
  const id = entry.id || `code_${entry.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')}`;
  const path = `obdCodes/${id}`;
  try {
    await setDoc(doc(db, 'obdCodes', id), {
      code: clampStr(entry.code.toUpperCase(), 12),
      name: clampStr(entry.name, 120),
      category: entry.category,
      severity: entry.severity,
      meaning: clampStr(entry.meaning, 600),
      possibleCauses: entry.possibleCauses.slice(0, 10).map((c) => clampStr(c, 140)),
      nextSteps: clampStr(entry.nextSteps, 500),
      mechanicAdvice: clampStr(entry.mechanicAdvice, 400),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function adminDeleteObdCode(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'obdCodes', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `obdCodes/${id}`);
  }
}

export async function adminUpsertServiceCentre(centre: Omit<ServiceCentre, 'id'> & { id?: string }): Promise<void> {
  const id = centre.id || makeDocId('sc');
  const path = `serviceCentres/${id}`;
  try {
    await setDoc(doc(db, 'serviceCentres', id), {
      name: clampStr(centre.name, 120),
      city: clampStr(centre.city, 80),
      address: clampStr(centre.address, 200),
      phone: clampStr(centre.phone, 30),
      specialties: centre.specialties.slice(0, 10).map((s) => clampStr(s, 60)),
      rating: Math.min(5, Math.max(0, Number(centre.rating) || 4.5)),
      hours: clampStr(centre.hours, 80),
      isSampleListing: Boolean(centre.isSampleListing),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function adminDeleteServiceCentre(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'serviceCentres', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `serviceCentres/${id}`);
  }
}

export async function adminUpdateEnquiryStatus(
  enquiryId: string,
  status: ServiceEnquiry['status'],
  adminNote: string
): Promise<void> {
  const path = `serviceEnquiries/${enquiryId}`;
  try {
    await updateDoc(doc(db, 'serviceEnquiries', enquiryId), {
      status,
      adminNote: clampStr(adminNote, 500),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
