import React, { useEffect, useState } from 'react';
import { Activity, BookOpen, Car, Loader2, MapPin, MessageSquare, Plus, ShieldCheck, Trash2, Users } from 'lucide-react';
import {
  adminDeleteObdCode,
  adminDeleteServiceCentre,
  adminFetchAllData,
  adminUpdateEnquiryStatus,
  adminUpsertObdCode,
  adminUpsertServiceCentre,
} from '../services/firestoreService';
import type {
  DiagnosticScan,
  ObdCategory,
  ObdCodeEntry,
  ServiceCentre,
  ServiceEnquiry,
  SeverityLevel,
  UserProfile,
  Vehicle,
} from '../types/autosense';

interface AdminDashboardPageProps {
  customCodes: ObdCodeEntry[];
  customCentres: ServiceCentre[];
}

type AdminTab = 'overview' | 'users' | 'codes' | 'centres' | 'support';

export function AdminDashboardPage({ customCodes, customCentres }: AdminDashboardPageProps) {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [scans, setScans] = useState<DiagnosticScan[]>([]);
  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);

  // OBD Code Form
  const [codeVal, setCodeVal] = useState('');
  const [codeName, setCodeName] = useState('');
  const [codeCat, setCodeCat] = useState<ObdCategory>('Engine');
  const [codeSev, setCodeSev] = useState<SeverityLevel>('Medium');
  const [codeMeaning, setCodeMeaning] = useState('');
  const [codeCauses, setCodeCauses] = useState('');
  const [codeNextSteps, setCodeNextSteps] = useState('');
  const [codeMechanic, setCodeMechanic] = useState('');

  // Service Centre Form
  const [scName, setScName] = useState('');
  const [scCity, setScCity] = useState('');
  const [scAddress, setScAddress] = useState('');
  const [scPhone, setScPhone] = useState('');
  const [scSpecialties, setScSpecialties] = useState('OBD-II Diagnostics, Maintenance');
  const [scHours, setScHours] = useState('Mon-Sat · 08:30-18:00');

  // Support note state
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await adminFetchAllData();
      setUsers(data.users);
      setVehicles(data.vehicles);
      setScans(data.scans);
      setEnquiries(data.enquiries);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to load admin telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleAddCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeVal.trim() || !codeName.trim() || !codeMeaning.trim()) return;
    await adminUpsertObdCode({
      code: codeVal.trim().toUpperCase(),
      name: codeName.trim(),
      category: codeCat,
      severity: codeSev,
      meaning: codeMeaning.trim(),
      possibleCauses: codeCauses
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      nextSteps: codeNextSteps.trim() || 'Arrange inspection with a certified workshop.',
      mechanicAdvice: codeMechanic.trim() || 'Yes — technician verification recommended.',
    });
    setCodeVal('');
    setCodeName('');
    setCodeMeaning('');
    setCodeCauses('');
    setCodeNextSteps('');
    setCodeMechanic('');
  };

  const handleAddCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scName.trim() || !scCity.trim() || !scAddress.trim()) return;
    await adminUpsertServiceCentre({
      name: scName.trim(),
      city: scCity.trim(),
      address: scAddress.trim(),
      phone: scPhone.trim() || '+1 (408) 555-0100',
      specialties: scSpecialties
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      rating: 4.8,
      hours: scHours.trim(),
      isSampleListing: false,
    });
    setScName('');
    setScCity('');
    setScAddress('');
    setScPhone('');
  };

  const handleTriageEnquiry = async (
    enq: ServiceEnquiry,
    nextStatus: ServiceEnquiry['status']
  ) => {
    const note = noteDrafts[enq.id] ?? enq.adminNote ?? '';
    await adminUpdateEnquiryStatus(enq.id, nextStatus, note);
    setEnquiries((prev) =>
      prev.map((item) =>
        item.id === enq.id ? { ...item, status: nextStatus, adminNote: note } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            Admin Console
          </h1>
          <p className="text-sm text-slate-400">
            Role-restricted management for users, vehicles, diagnostic activity, OBD codes, service
            centres, and support requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-white min-h-[40px]"
        >
          Refresh Metrics
        </button>
      </section>

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'overview', label: 'Overview & Activity' },
            { id: 'users', label: 'Users & Vehicles' },
            { id: 'codes', label: 'Error Code Library' },
            { id: 'centres', label: 'Service Centres' },
            { id: 'support', label: 'Feedback & Support' },
          ] as Array<{ id: AdminTab; label: string }>
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              tab === item.id
                ? 'bg-blue-600 text-white'
                : 'bg-[#0F172A] border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-200">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-12 flex items-center justify-center gap-3 text-sm text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          Loading administrator console...
        </div>
      ) : (
        <>
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Registered Users', val: users.length, icon: Users },
                  { label: 'Registered Vehicles', val: vehicles.length, icon: Car },
                  { label: 'Diagnostic Scans', val: scans.length, icon: Activity },
                  { label: 'Support & Feedback', val: enquiries.length, icon: MessageSquare },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{stat.label}</span>
                        <Icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-2xl font-mono font-bold text-white tabular-nums">
                        {stat.val}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-white">Recent Diagnostic Activity</h2>
                {scans.length === 0 ? (
                  <p className="text-xs text-slate-400">No cloud scans recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2.5 pr-4">Vehicle</th>
                          <th className="py-2.5 pr-4">Mode</th>
                          <th className="py-2.5 pr-4">Health</th>
                          <th className="py-2.5 pr-4">Codes</th>
                          <th className="py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {scans.slice(0, 12).map((s) => (
                          <tr key={s.id} className="text-slate-200">
                            <td className="py-2.5 pr-4 font-medium">{s.vehicleLabel}</td>
                            <td className="py-2.5 pr-4 font-mono">{s.connectionMode}</td>
                            <td className="py-2.5 pr-4 font-mono tabular-nums">
                              {s.overallHealthScore}/100
                            </td>
                            <td className="py-2.5 pr-4 font-mono">
                              {s.detectedCodes.length > 0 ? s.detectedCodes.join(', ') : 'None'}
                            </td>
                            <td className="py-2.5 capitalize">{s.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* USERS & VEHICLES */}
          {tab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-white">
                  Registered Users ({users.length})
                </h2>
                <div className="divide-y divide-slate-800 text-xs">
                  {users.map((u) => (
                    <div key={u.uid} className="py-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{u.fullName}</p>
                        <p className="text-slate-400 truncate">
                          {u.email} {u.city ? `· ${u.city}` : ''}
                        </p>
                      </div>
                      <span className="capitalize text-blue-300 shrink-0">{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-white">
                  Registered Vehicles ({vehicles.length})
                </h2>
                <div className="divide-y divide-slate-800 text-xs">
                  {vehicles.map((v) => (
                    <div key={v.id} className="py-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">
                          {v.year} {v.manufacturer} {v.model}
                        </p>
                        <p className="text-slate-400 font-mono">
                          {v.registrationNumber} · {v.fuelType}
                        </p>
                      </div>
                      <span className="font-mono text-white tabular-nums">
                        {v.lastHealthScore}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* OBD CODES MANAGER */}
          {tab === 'codes' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleAddCode}
                className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-3"
              >
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Add / Update Custom OBD Code
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={codeVal}
                    onChange={(e) => setCodeVal(e.target.value)}
                    placeholder="Code (e.g. P0442)"
                    className="px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white font-mono uppercase"
                  />
                  <select
                    value={codeSev}
                    onChange={(e) => setCodeSev(e.target.value as SeverityLevel)}
                    className="px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <select
                  value={codeCat}
                  onChange={(e) => setCodeCat(e.target.value as ObdCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
                >
                  <option value="Engine">Engine</option>
                  <option value="Fuel & Air">Fuel &amp; Air</option>
                  <option value="Ignition">Ignition</option>
                  <option value="Emissions">Emissions</option>
                  <option value="Transmission">Transmission</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Sensors">Sensors</option>
                </select>
                <input
                  type="text"
                  required
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value)}
                  placeholder="Plain-English error name"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
                />
                <textarea
                  required
                  rows={2}
                  value={codeMeaning}
                  onChange={(e) => setCodeMeaning(e.target.value)}
                  placeholder="What does it mean?"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
                />
                <input
                  type="text"
                  value={codeCauses}
                  onChange={(e) => setCodeCauses(e.target.value)}
                  placeholder="Possible causes (comma-separated)"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
                />
                <input
                  type="text"
                  value={codeNextSteps}
                  onChange={(e) => setCodeNextSteps(e.target.value)}
                  placeholder="Recommended next steps"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
                />
                <input
                  type="text"
                  value={codeMechanic}
                  onChange={(e) => setCodeMechanic(e.target.value)}
                  placeholder="Mechanic inspection advice"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white min-h-[40px]"
                >
                  <Plus className="w-4 h-4" />
                  Save Code to Library
                </button>
              </form>

              <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-3">
                <h2 className="text-sm font-semibold text-white">
                  Admin-Managed Codes ({customCodes.length})
                </h2>
                {customCodes.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No custom Firestore overrides yet. Standard curated OBD-II codes remain active.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-800 text-xs">
                    {customCodes.map((c) => (
                      <div key={c.code} className="py-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono font-bold text-white">
                            {c.code} — {c.name} ({c.severity})
                          </p>
                          <p className="text-slate-400 mt-0.5">{c.meaning}</p>
                        </div>
                        {c.id && (
                          <button
                            type="button"
                            onClick={() => void adminDeleteObdCode(c.id!)}
                            className="p-1.5 text-slate-400 hover:text-red-400"
                            aria-label={`Delete ${c.code}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SERVICE CENTRES MANAGER */}
          {tab === 'centres' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleAddCentre}
                className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-3"
              >
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  Add Verified Service Centre
                </h2>
                <input
                  type="text"
                  required
                  value={scName}
                  onChange={(e) => setScName(e.target.value)}
                  placeholder="Workshop Name"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
                />
                <input
                  type="text"
                  required
                  value={scCity}
                  onChange={(e) => setScCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
                />
                <input
                  type="text"
                  required
                  value={scAddress}
                  onChange={(e) => setScAddress(e.target.value)}
                  placeholder="Street Address"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
                />
                <input
                  type="text"
                  value={scPhone}
                  onChange={(e) => setScPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
                />
                <input
                  type="text"
                  value={scSpecialties}
                  onChange={(e) => setScSpecialties(e.target.value)}
                  placeholder="Specialties (comma-separated)"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
                />
                <input
                  type="text"
                  value={scHours}
                  onChange={(e) => setScHours(e.target.value)}
                  placeholder="Operating Hours"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white min-h-[40px]"
                >
                  Publish Service Centre
                </button>
              </form>

              <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-3">
                <h2 className="text-sm font-semibold text-white">
                  Firestore Service Centres ({customCentres.length})
                </h2>
                {customCentres.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No custom service centres published yet. Sample listings remain visible in
                    Service Centres.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-800 text-xs">
                    {customCentres.map((sc) => (
                      <div key={sc.id} className="py-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            {sc.name} · {sc.city}
                          </p>
                          <p className="text-slate-400">
                            {sc.address} · {sc.phone}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void adminDeleteServiceCentre(sc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400"
                          aria-label={`Remove ${sc.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUPPORT & FEEDBACK */}
          {tab === 'support' && (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white">
                Support Requests &amp; User Feedback ({enquiries.length})
              </h2>
              {enquiries.length === 0 ? (
                <p className="text-xs text-slate-400">No support requests or feedback submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {enquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-3 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-white">{enq.subject}</span>
                          <span className="text-slate-400 ml-2">
                            ({enq.type} · {enq.ownerName} · {enq.ownerEmail})
                          </span>
                        </div>
                        <span className="capitalize text-blue-300 font-medium">{enq.status}</span>
                      </div>

                      <p className="text-slate-300 leading-relaxed">{enq.message}</p>

                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <input
                          type="text"
                          value={noteDrafts[enq.id] ?? enq.adminNote ?? ''}
                          onChange={(e) =>
                            setNoteDrafts((prev) => ({ ...prev, [enq.id]: e.target.value }))
                          }
                          placeholder="Add admin response note..."
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-slate-700 text-xs text-white"
                        />
                        <div className="flex items-center gap-1.5">
                          {(['reviewed', 'scheduled', 'closed'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => void handleTriageEnquiry(enq, st)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-xs capitalize text-white transition-colors"
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
