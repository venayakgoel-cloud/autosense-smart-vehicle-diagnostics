import { useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { Loader2, MailCheck, Sparkles } from 'lucide-react';
import { AppShell } from './components/AppShell';
import {
  DEMO_BYPASS_LOGS,
  DEMO_CONNECTION_HISTORY,
  DEMO_MAINTENANCE,
  DEMO_NOTIFICATIONS,
  DEMO_SCANS,
  DEMO_VEHICLES,
} from './data/demoData';
import { auth, BOOTSTRAPPED_ADMIN_EMAIL, testFirestoreConnection } from './lib/firebase';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { AuthPages } from './pages/AuthPages';
import { CodeLibraryPage } from './pages/CodeLibraryPage';
import { ConnectVehiclePage } from './pages/ConnectVehiclePage';
import { DashboardPage } from './pages/DashboardPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { HistoryPage } from './pages/HistoryPage';
import { LandingPage, type PublicRoute } from './pages/LandingPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { MyGaragePage } from './pages/MyGaragePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { ServiceCentresPage } from './pages/ServiceCentresPage';
import { VehicleHealthPage } from './pages/VehicleHealthPage';
import {
  createBypassActionLog,
  createMaintenanceRecord,
  createNotification,
  createServiceEnquiry,
  createUserProfile,
  createVehicle,
  deleteMaintenanceRecord,
  getUserProfile,
  markNotificationRead,
  markScanResolved,
  removeVehicle,
  saveDiagnosticScan,
  subscribeCustomObdCodes,
  subscribeServiceCentres,
  subscribeUserBypassLogs,
  subscribeUserEnquiries,
  subscribeUserMaintenance,
  subscribeUserNotifications,
  subscribeUserScans,
  subscribeUserVehicles,
  updateMaintenanceRecord,
  updateUserProfile,
  updateVehicleDetails,
} from './services/firestoreService';
import type {
  AppSection,
  BypassActionLog,
  ConnectionHistoryEntry,
  ConnectionMode,
  ConnectionStatus,
  DiagnosticScan,
  MaintenanceRecord,
  NotificationItem,
  ObdCodeEntry,
  ServiceCentre,
  ServiceEnquiry,
  UserProfile,
  Vehicle,
} from './types/autosense';

const GUEST_DEMO_PROFILE: UserProfile = {
  uid: 'demo-user',
  fullName: 'Jordan Taylor',
  email: 'demo@autosense.app',
  phone: '+1 (408) 555-0190',
  city: 'San Jose',
  photoUrl: '/src/assets/images/avatar_driver_default_1795018622125.jpg',
  role: 'user',
  preferences: {
    emailAlerts: true,
    pushAlerts: true,
    maintenanceReminders: true,
    shareDiagnosticTelemetry: false,
  },
};

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [publicRoute, setPublicRoute] = useState<PublicRoute>('landing');
  const [oobCode, setOobCode] = useState<string>('');
  const [isDemoSession, setIsDemoSession] = useState(false);
  const [activeSection, setActiveSection] = useState<AppSection>('dashboard');

  // Cloud / Demo Workspace State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicleId, setActiveVehicleId] = useState<string>('');
  const [scans, setScans] = useState<DiagnosticScan[]>([]);
  const [bypassLogs, setBypassLogs] = useState<BypassActionLog[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);
  const [customCodes, setCustomCodes] = useState<ObdCodeEntry[]>([]);
  const [customCentres, setCustomCentres] = useState<ServiceCentre[]>([]);

  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('DEMO_OBD');
  const [connectionHistory, setConnectionHistory] = useState<ConnectionHistoryEntry[]>(
    DEMO_CONNECTION_HISTORY
  );
  const [prefilledAiPrompt, setPrefilledAiPrompt] = useState<string>('');
  const [verificationMsg, setVerificationMsg] = useState('');

  useEffect(() => {
    void testFirestoreConnection();

    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    const oobParam = params.get('oobCode');
    if (modeParam === 'resetPassword' && oobParam) {
      setOobCode(oobParam);
      setPublicRoute('reset');
    }

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setUserProfile(null);
        setAuthReady(true);
        return;
      }

      setIsDemoSession(false);
      if (user.emailVerified) {
        try {
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            profile = await createUserProfile({
              uid: user.uid,
              fullName: user.displayName || 'AutoSense Driver',
              email: user.email || '',
              photoUrl: user.photoURL || '',
            });
          }
          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to load user profile:', err);
        }
      }
      setAuthReady(true);
    });

    return () => unsubAuth();
  }, []);

  // Firestore real-time subscriptions when verified authenticated user is active
  useEffect(() => {
    if (!firebaseUser || !firebaseUser.emailVerified || isDemoSession) {
      return;
    }

    const uid = firebaseUser.uid;
    const unsubs = [
      subscribeUserVehicles(uid, (list) => {
        setVehicles(list);
        setActiveVehicleId((prev) => {
          if (prev && list.some((v) => v.id === prev)) return prev;
          return list.find((v) => v.isPrimary)?.id ?? list[0]?.id ?? '';
        });
      }),
      subscribeUserScans(uid, setScans),
      subscribeUserBypassLogs(uid, setBypassLogs),
      subscribeUserMaintenance(uid, setMaintenance),
      subscribeUserNotifications(uid, setNotifications),
      subscribeUserEnquiries(uid, setEnquiries),
      subscribeCustomObdCodes(setCustomCodes),
      subscribeServiceCentres(setCustomCentres),
    ];

    return () => {
      for (const u of unsubs) u();
    };
  }, [firebaseUser, isDemoSession]);

  const enterDemoSession = () => {
    setIsDemoSession(true);
    setUserProfile(GUEST_DEMO_PROFILE);
    setVehicles(DEMO_VEHICLES);
    setActiveVehicleId(DEMO_VEHICLES[0].id);
    setScans(DEMO_SCANS);
    setBypassLogs(DEMO_BYPASS_LOGS);
    setMaintenance(DEMO_MAINTENANCE);
    setNotifications(DEMO_NOTIFICATIONS);
    setEnquiries([]);
    setConnectionHistory(DEMO_CONNECTION_HISTORY);
    setActiveSection('dashboard');
  };

  const handleSeedDemoVehicleForUser = async () => {
    if (!firebaseUser) return;
    const vehId = await createVehicle(firebaseUser.uid, {
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
    });
    await saveDiagnosticScan(firebaseUser.uid, {
      vehicleId: vehId,
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
        'Demo baseline scan loaded: detected lean fuel trim notice (P0171) and EVAP cap check (P0455).',
    });
    await createMaintenanceRecord(firebaseUser.uid, {
      vehicleId: vehId,
      vehicleLabel: '2022 Honda Civic Touring',
      category: 'Oil Service',
      title: '0W-20 Full Synthetic Oil & Filter Change',
      notes: 'Recommended every 10,000 km or 6 months.',
      dueDate: '2026-12-01',
      dueOdometerKm: 36000,
      status: 'upcoming',
      isDemoData: true,
    });
    await createNotification(firebaseUser.uid, {
      type: 'scan',
      title: 'Sample Demo Vehicle Added',
      message: '2022 Honda Civic Touring loaded with demo OBD-II scan and maintenance reminders.',
      isRead: false,
      relatedPath: 'dashboard',
    });
    setActiveVehicleId(vehId);
  };

  const activeVehicle = useMemo(
    () => vehicles.find((v) => v.id === activeVehicleId) ?? vehicles[0],
    [vehicles, activeVehicleId]
  );

  const vehicleScans = useMemo(
    () => (activeVehicle ? scans.filter((s) => s.vehicleId === activeVehicle.id) : scans),
    [scans, activeVehicle]
  );

  const latestScan = vehicleScans[0];

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const isAdmin = Boolean(
    !isDemoSession &&
      firebaseUser?.emailVerified &&
      (userProfile?.role === 'admin' || firebaseUser.email === BOOTSTRAPPED_ADMIN_EMAIL)
  );

  // Handlers supporting both Firestore & Guest Demo Session seamlessly
  const handleAddVehicle = async (
    data: Omit<Vehicle, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (isDemoSession || !firebaseUser) {
      const id = `demo_veh_${Date.now()}`;
      const newVeh: Vehicle = { ...data, id, ownerId: 'demo-user', isDemoData: true };
      setVehicles((prev) => {
        const cleaned = data.isPrimary ? prev.map((p) => ({ ...p, isPrimary: false })) : prev;
        return [newVeh, ...cleaned];
      });
      setActiveVehicleId(id);
      return;
    }
    if (data.isPrimary) {
      for (const v of vehicles) {
        if (v.isPrimary) await updateVehicleDetails(v.id, { isPrimary: false });
      }
    }
    const newId = await createVehicle(firebaseUser.uid, data);
    setActiveVehicleId(newId);
  };

  const handleUpdateVehicle = async (
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
      >
    >
  ) => {
    if (isDemoSession || !firebaseUser) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, ...updates } : v))
      );
      return;
    }
    await updateVehicleDetails(vehicleId, updates);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (isDemoSession || !firebaseUser) {
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      return;
    }
    await removeVehicle(vehicleId);
  };

  const handleUpdateConnection = async (
    status: ConnectionStatus,
    mode: ConnectionMode,
    detail: string
  ) => {
    const label = activeVehicle
      ? `${activeVehicle.year} ${activeVehicle.manufacturer} ${activeVehicle.model}`
      : 'Selected Vehicle';

    setConnectionHistory((prev) => [
      {
        id: `conn_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        method: mode,
        vehicleLabel: label,
        status: status === 'disconnected' ? 'Disconnected' : 'Connected',
        detail,
        isDemoData: mode === 'DEMO_OBD',
      },
      ...prev,
    ]);

    if (!activeVehicle) return;
    if (isDemoSession || !firebaseUser) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === activeVehicle.id ? { ...v, connectionStatus: status } : v))
      );
      return;
    }
    await updateVehicleDetails(activeVehicle.id, { connectionStatus: status });
    await createNotification(firebaseUser.uid, {
      type: 'connection',
      title: `Vehicle Connection: ${mode}`,
      message: `${label} — ${detail}`,
      isRead: false,
      relatedPath: 'connect',
    });
  };

  const handleSaveNewScan = async (
    scan: Omit<DiagnosticScan, 'id' | 'scannedAt' | 'updatedAt'>
  ): Promise<string> => {
    if (isDemoSession || !firebaseUser) {
      const demoId = `demo_scan_${Date.now()}`;
      const created: DiagnosticScan = {
        ...scan,
        id: demoId,
      };
      setScans((prev) => [created, ...prev]);
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === scan.vehicleId ? { ...v, lastHealthScore: scan.overallHealthScore } : v
        )
      );
      setNotifications((prev) => [
        {
          id: `demo_notif_${Date.now()}`,
          ownerId: 'demo-user',
          type: scan.detectedCodes.length > 0 ? 'diagnostic' : 'scan',
          title:
            scan.detectedCodes.length > 0
              ? `Scan Detected ${scan.detectedCodes.join(', ')}`
              : 'Diagnostic Scan Completed Cleanly',
          message: scan.summary,
          isRead: false,
          relatedPath: 'diagnostics',
          createdAtIso: new Date().toISOString(),
        },
        ...prev,
      ]);
      return demoId;
    }

    const savedId = await saveDiagnosticScan(firebaseUser.uid, scan);
    await updateVehicleDetails(scan.vehicleId, {
      lastHealthScore: scan.overallHealthScore,
    });
    await createNotification(firebaseUser.uid, {
      type: scan.detectedCodes.length > 0 ? 'diagnostic' : 'scan',
      title:
        scan.detectedCodes.length > 0
          ? `Scan Detected ${scan.detectedCodes.join(', ')}`
          : 'Diagnostic Scan Completed Cleanly',
      message: scan.summary,
      isRead: false,
      relatedPath: 'diagnostics',
    });
    return savedId;
  };

  const handleResolveScan = async (scan: DiagnosticScan) => {
    if (isDemoSession || !firebaseUser) {
      setScans((prev) =>
        prev.map((s) =>
          s.id === scan.id
            ? { ...s, status: 'resolved', resolvedCodes: [...s.detectedCodes] }
            : s
        )
      );
      return;
    }
    await markScanResolved(scan.id, scan.detectedCodes, 'resolved');
  };

  const handleApplyControlledBypass = async (
    scan: DiagnosticScan,
    bypassedCodes: string[],
    profile: { label: string; maxSpeedKmh: number; maxRpm: number; maxDistanceKm: number },
    newlyModifiedCodes: string[],
    blockedCodes: string[]
  ) => {
    const allCleared = scan.detectedCodes.every((c) => bypassedCodes.includes(c));
    const nextStatus: 'active' | 'resolved' = allCleared ? 'resolved' : 'active';
    const notifTitle = `Transit Cap Active: ${profile.maxSpeedKmh} km/h · ${profile.maxRpm.toLocaleString()} RPM`;
    const notifMsg = `Controlled bypass/Mode $04 applied for non-critical sensor(s): ${newlyModifiedCodes.join(', ')} on ${scan.vehicleLabel}. Max workshop transit radius: ${profile.maxDistanceKm} km.`;

    const targetVehicle = vehicles.find((v) => v.id === scan.vehicleId) ?? activeVehicle;
    const logPayload: Omit<BypassActionLog, 'id' | 'ownerId' | 'occurredAt' | 'occurredAtIso'> = {
      vehicleId: scan.vehicleId,
      vehicleLabel: scan.vehicleLabel,
      scanId: scan.id,
      actionType: profile.maxSpeedKmh >= 55 ? 'mode04_reset' : 'controlled_bypass',
      modifiedSensors: newlyModifiedCodes,
      blockedSensors: blockedCodes,
      transitProfileLabel: profile.label,
      maxSpeedKmh: profile.maxSpeedKmh,
      maxRpm: profile.maxRpm,
      vehicleStatusSnapshot: {
        overallHealthScore: scan.overallHealthScore,
        engineHealthScore: scan.engineHealthScore,
        batteryVoltage: scan.batteryVoltage,
        coolantTempC: scan.coolantTempC,
        fuelTrimPct: scan.fuelTrimPct,
        odometerKm: targetVehicle?.odometerKm ?? 0,
        emissionReadiness: scan.emissionReadiness,
        connectionMode: scan.connectionMode,
      },
      isDemoData: scan.isDemoData,
      notes:
        blockedCodes.length > 0
          ? `Applied ${profile.label} (${profile.maxSpeedKmh} km/h · ${profile.maxRpm} RPM) for ${newlyModifiedCodes.join(', ')}. Very high-risk code(s) ${blockedCodes.join(', ')} stayed hardware-locked.`
          : `Applied ${profile.label} (${profile.maxSpeedKmh} km/h · ${profile.maxRpm} RPM) for non-critical sensor(s) ${newlyModifiedCodes.join(', ')} for workshop transit.`,
    };

    if (isDemoSession || !firebaseUser) {
      setScans((prev) =>
        prev.map((s) =>
          s.id === scan.id ? { ...s, status: nextStatus, resolvedCodes: bypassedCodes } : s
        )
      );
      setBypassLogs((prev) => [
        {
          ...logPayload,
          id: `demo_byp_${Date.now()}`,
          ownerId: 'demo-user',
          occurredAtIso: new Date().toISOString(),
        },
        ...prev,
      ]);
      setNotifications((prev) => [
        {
          id: `demo_notif_${Date.now()}`,
          ownerId: 'demo-user',
          type: 'diagnostic',
          title: notifTitle,
          message: notifMsg,
          isRead: false,
          relatedPath: 'diagnostics',
          createdAtIso: new Date().toISOString(),
        },
        ...prev,
      ]);
      return;
    }

    if (scan.status !== 'resolved') {
      await markScanResolved(scan.id, bypassedCodes, nextStatus);
    }
    await createBypassActionLog(firebaseUser.uid, logPayload);
    await createNotification(firebaseUser.uid, {
      type: 'diagnostic',
      title: notifTitle,
      message: notifMsg,
      isRead: false,
      relatedPath: 'diagnostics',
    });
  };

  const handleAddMaintenance = async (
    record: Omit<MaintenanceRecord, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (isDemoSession || !firebaseUser) {
      setMaintenance((prev) => [
        { ...record, id: `demo_maint_${Date.now()}`, ownerId: 'demo-user' },
        ...prev,
      ]);
      return;
    }
    await createMaintenanceRecord(firebaseUser.uid, record);
    await createNotification(firebaseUser.uid, {
      type: 'maintenance',
      title: `Reminder Added: ${record.title}`,
      message: `Scheduled for ${record.dueDate} (${record.dueOdometerKm.toLocaleString()} km) on ${record.vehicleLabel}.`,
      isRead: false,
      relatedPath: 'maintenance',
    });
  };

  const handleUpdateMaintenance = async (
    recordId: string,
    updates: Partial<
      Pick<
        MaintenanceRecord,
        'category' | 'title' | 'notes' | 'dueDate' | 'dueOdometerKm' | 'status' | 'completedAt'
      >
    >
  ) => {
    if (isDemoSession || !firebaseUser) {
      setMaintenance((prev) =>
        prev.map((m) => (m.id === recordId ? { ...m, ...updates } : m))
      );
      return;
    }
    await updateMaintenanceRecord(recordId, updates);
  };

  const handleDeleteMaintenance = async (recordId: string) => {
    if (isDemoSession || !firebaseUser) {
      setMaintenance((prev) => prev.filter((m) => m.id !== recordId));
      return;
    }
    await deleteMaintenanceRecord(recordId);
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    if (isDemoSession || !firebaseUser) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      return;
    }
    await markNotificationRead(notificationId);
  };

  const handleMarkAllNotificationsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (isDemoSession || !firebaseUser) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      return;
    }
    for (const item of unread) {
      await markNotificationRead(item.id);
    }
  };

  const handleUpdateProfile = async (
    updates: Partial<Pick<UserProfile, 'fullName' | 'phone' | 'city' | 'photoUrl' | 'preferences'>>
  ) => {
    if (isDemoSession || !firebaseUser) {
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : prev));
      return;
    }
    await updateUserProfile(firebaseUser.uid, updates);
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const handleSubmitEnquiry = async (enquiry: {
    ownerName: string;
    ownerEmail: string;
    type: 'appointment' | 'enquiry' | 'feedback';
    serviceCentreName?: string;
    vehicleLabel?: string;
    preferredDate?: string;
    subject: string;
    message: string;
  }) => {
    if (isDemoSession || !firebaseUser) {
      setEnquiries((prev) => [
        {
          id: `demo_enq_${Date.now()}`,
          ownerId: 'demo-user',
          ...enquiry,
          status: 'pending',
          createdAtIso: new Date().toISOString(),
        },
        ...prev,
      ]);
      return;
    }
    await createServiceEnquiry(firebaseUser.uid, enquiry);
  };

  const handleAskAiAboutCode = (code: string) => {
    setPrefilledAiPrompt(`What does diagnostic trouble code ${code} mean, and is it safe to drive?`);
    setActiveSection('assistant');
  };

  const handleLogout = async () => {
    if (isDemoSession) {
      setIsDemoSession(false);
      setUserProfile(null);
      setVehicles([]);
      setScans([]);
      setBypassLogs([]);
      setMaintenance([]);
      setNotifications([]);
      setPublicRoute('landing');
      return;
    }
    await signOut(auth);
    setPublicRoute('landing');
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#060A13] text-slate-200 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
        <span className="text-sm">Loading AutoSense...</span>
      </div>
    );
  }

  // Signed in with unverified email/password account
  if (firebaseUser && !firebaseUser.emailVerified && !isDemoSession) {
    return (
      <div className="min-h-screen bg-[#060A13] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-blue-400">
            <MailCheck className="w-6 h-6" />
            <h1 className="font-display font-bold text-lg text-white">Verify Your Email</h1>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            We sent a verification link to <strong>{firebaseUser.email}</strong>. Please click the
            link in your inbox to activate cloud storage for your vehicles and diagnostic reports.
          </p>
          {verificationMsg && (
            <p className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
              {verificationMsg}
            </p>
          )}
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={async () => {
                await reload(firebaseUser);
                if (auth.currentUser?.emailVerified) {
                  setFirebaseUser({ ...auth.currentUser });
                  window.location.reload();
                } else {
                  setVerificationMsg('Email is not verified yet. Please check your inbox or spam folder.');
                }
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white min-h-[44px]"
            >
              I Have Verified My Email
            </button>
            <button
              type="button"
              onClick={async () => {
                await sendEmailVerification(firebaseUser);
                setVerificationMsg('Verification email resent.');
              }}
              className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-200 min-h-[40px]"
            >
              Resend Verification Email
            </button>
            <button
              type="button"
              onClick={enterDemoSession}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white min-h-[40px]"
            >
              Explore Demo Mode Meanwhile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-white pt-1"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Public Unauthenticated Views
  if (!isDemoSession && (!firebaseUser || !userProfile)) {
    if (publicRoute === 'landing') {
      return (
        <LandingPage
          onNavigate={(r) => setPublicRoute(r)}
          onEnterDemo={enterDemoSession}
        />
      );
    }
    return (
      <AuthPages
        route={publicRoute}
        onNavigate={(r) => setPublicRoute(r)}
        onBackToLanding={() => setPublicRoute('landing')}
        onEnterDemo={enterDemoSession}
        oobCode={oobCode}
      />
    );
  }

  const activeProfile = userProfile ?? GUEST_DEMO_PROFILE;

  return (
    <AppShell
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      userProfile={activeProfile}
      vehicles={vehicles}
      activeVehicle={activeVehicle}
      onSelectVehicle={setActiveVehicleId}
      unreadNotifications={unreadNotifications}
      isDemoSession={isDemoSession}
      isAdmin={isAdmin}
      onLogout={() => void handleLogout()}
      onPromptSignIn={() => {
        setIsDemoSession(false);
        setPublicRoute('signin');
      }}
    >
      {/* Empty Cloud Garage Onboarding Helper for newly registered users */}
      {!isDemoSession && vehicles.length === 0 && activeSection === 'dashboard' && (
        <div className="mb-6 p-5 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Welcome to Your Cloud Garage
            </h2>
            <p className="text-xs text-slate-300">
              Add your own car in My Garage, or load a clearly labeled sample vehicle with demo
              scans to test every diagnostic feature right away.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => void handleSeedDemoVehicleForUser()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white min-h-[40px]"
            >
              Load Sample Demo Vehicle
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('garage')}
              className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-white min-h-[40px]"
            >
              Add My Car
            </button>
          </div>
        </div>
      )}

      {activeSection === 'dashboard' && (
        <DashboardPage
          userProfile={activeProfile}
          activeVehicle={activeVehicle}
          latestScan={latestScan}
          vehicleScans={vehicleScans}
          maintenance={maintenance}
          notifications={notifications}
          customCodes={customCodes}
          onNavigate={setActiveSection}
        />
      )}

      {activeSection === 'connect' && (
        <ConnectVehiclePage
          activeVehicle={activeVehicle}
          connectionHistory={connectionHistory}
          selectedMode={connectionMode}
          onChangeMode={setConnectionMode}
          onUpdateConnection={(st, mode, detail) => void handleUpdateConnection(st, mode, detail)}
          onNavigate={setActiveSection}
        />
      )}

      {activeSection === 'diagnostics' && (
        <DiagnosticsPage
          activeVehicle={activeVehicle}
          connectionMode={connectionMode}
          latestScan={latestScan}
          customCodes={customCodes}
          onSaveNewScan={handleSaveNewScan}
          onApplyControlledBypass={handleApplyControlledBypass}
          onAskAiAboutCode={handleAskAiAboutCode}
          onNavigate={setActiveSection}
        />
      )}

      {activeSection === 'codes' && (
        <CodeLibraryPage
          customCodes={customCodes}
          onAskAiAboutCode={handleAskAiAboutCode}
        />
      )}

      {activeSection === 'health' && (
        <VehicleHealthPage
          activeVehicle={activeVehicle}
          latestScan={latestScan}
          vehicleScans={vehicleScans}
          onNavigate={setActiveSection}
        />
      )}

      {activeSection === 'garage' && (
        <MyGaragePage
          vehicles={vehicles}
          activeVehicleId={activeVehicle?.id ?? ''}
          onSelectActive={setActiveVehicleId}
          onAddVehicle={handleAddVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onDeleteVehicle={handleDeleteVehicle}
        />
      )}

      {activeSection === 'maintenance' && (
        <MaintenancePage
          vehicles={vehicles}
          activeVehicle={activeVehicle}
          records={maintenance}
          onAddRecord={handleAddMaintenance}
          onUpdateRecord={handleUpdateMaintenance}
          onDeleteRecord={handleDeleteMaintenance}
        />
      )}

      {activeSection === 'history' && (
        <HistoryPage
          scans={scans}
          bypassLogs={bypassLogs}
          vehicles={vehicles}
          customCodes={customCodes}
          onResolveScan={handleResolveScan}
        />
      )}

      {activeSection === 'assistant' && (
        <AiAssistantPage
          activeVehicle={activeVehicle}
          latestScan={latestScan}
          customCodes={customCodes}
          prefilledPrompt={prefilledAiPrompt}
          onClearPrefilledPrompt={() => setPrefilledAiPrompt('')}
        />
      )}

      {activeSection === 'services' && (
        <ServiceCentresPage
          customCentres={customCentres}
          userProfile={activeProfile}
          vehicles={vehicles}
          enquiries={enquiries}
          onSubmitEnquiry={handleSubmitEnquiry}
        />
      )}

      {activeSection === 'notifications' && (
        <NotificationsPage
          notifications={notifications}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onNavigate={setActiveSection}
        />
      )}

      {(activeSection === 'profile' || activeSection === 'settings') && (
        <ProfileSettingsPage
          mode={activeSection}
          userProfile={activeProfile}
          vehicles={vehicles}
          isDemoSession={isDemoSession}
          onUpdateProfile={handleUpdateProfile}
          onSubmitFeedback={async (subject, message) => {
            await handleSubmitEnquiry({
              ownerName: activeProfile.fullName,
              ownerEmail: activeProfile.email,
              type: 'feedback',
              subject,
              message,
            });
          }}
          onNavigate={setActiveSection}
          onLogout={() => void handleLogout()}
        />
      )}

      {activeSection === 'admin' && isAdmin && (
        <AdminDashboardPage
          customCodes={customCodes}
          customCentres={customCentres}
        />
      )}
    </AppShell>
  );
}
