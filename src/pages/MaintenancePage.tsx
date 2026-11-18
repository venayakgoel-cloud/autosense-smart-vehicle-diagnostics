import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Edit3, Plus, Trash2, Wrench, X } from 'lucide-react';
import {
  FIELD_LIMITS,
  type MaintenanceCategory,
  type MaintenanceRecord,
  type MaintenanceStatus,
  type Vehicle,
} from '../types/autosense';

interface MaintenancePageProps {
  vehicles: Vehicle[];
  activeVehicle: Vehicle | undefined;
  records: MaintenanceRecord[];
  onAddRecord: (
    record: Omit<MaintenanceRecord, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  onUpdateRecord: (
    recordId: string,
    updates: Partial<
      Pick<
        MaintenanceRecord,
        'category' | 'title' | 'notes' | 'dueDate' | 'dueOdometerKm' | 'status' | 'completedAt'
      >
    >
  ) => Promise<void>;
  onDeleteRecord: (recordId: string) => Promise<void>;
}

const CATEGORIES: MaintenanceCategory[] = [
  'Oil Service',
  'Battery Inspection',
  'Tyre Maintenance',
  'Brake Inspection',
  'General Service',
  'Custom',
];

export function MaintenancePage({
  vehicles,
  activeVehicle,
  records,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
}: MaintenancePageProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>(
    'all'
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [vehicleId, setVehicleId] = useState(activeVehicle?.id ?? vehicles[0]?.id ?? '');
  const [category, setCategory] = useState<MaintenanceCategory>('Oil Service');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-15');
  const [dueOdometerKm, setDueOdometerKm] = useState('40000');
  const [notes, setNotes] = useState('');

  const filteredRecords = useMemo(() => {
    return records.filter((r) => (filterStatus === 'all' ? true : r.status === filterStatus));
  }, [records, filterStatus]);

  const openAdd = () => {
    setEditingId(null);
    setVehicleId(activeVehicle?.id ?? vehicles[0]?.id ?? '');
    setCategory('Oil Service');
    setTitle('');
    setDueDate('2026-12-15');
    setDueOdometerKm(String((activeVehicle?.odometerKm ?? 30000) + 5000));
    setNotes('');
    setErrorMsg('');
    setFormOpen(true);
  };

  const openEdit = (rec: MaintenanceRecord) => {
    setEditingId(rec.id);
    setVehicleId(rec.vehicleId);
    setCategory(rec.category);
    setTitle(rec.title);
    setDueDate(rec.dueDate);
    setDueOdometerKm(String(rec.dueOdometerKm));
    setNotes(rec.notes ?? '');
    setErrorMsg('');
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetVehicle = vehicles.find((v) => v.id === vehicleId) ?? activeVehicle;
    if (!targetVehicle) {
      setErrorMsg('Please add a vehicle in My Garage first.');
      return;
    }
    if (!title.trim() || !dueDate.trim()) {
      setErrorMsg('Please enter a reminder title and due date.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const todayIso = new Date().toISOString().slice(0, 10);
      const computedStatus: MaintenanceStatus = dueDate < todayIso ? 'overdue' : 'upcoming';

      if (editingId) {
        await onUpdateRecord(editingId, {
          category,
          title: title.trim(),
          dueDate,
          dueOdometerKm: Math.max(0, Number(dueOdometerKm) || 0),
          notes: notes.trim(),
          status: computedStatus,
        });
      } else {
        await onAddRecord({
          vehicleId: targetVehicle.id,
          vehicleLabel: `${targetVehicle.year} ${targetVehicle.manufacturer} ${targetVehicle.model}`,
          category,
          title: title.trim(),
          notes: notes.trim(),
          dueDate,
          dueOdometerKm: Math.max(0, Number(dueOdometerKm) || 0),
          status: computedStatus,
          isDemoData: Boolean(targetVehicle.isDemoData),
        });
      }
      setFormOpen(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save reminder.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkComplete = async (rec: MaintenanceRecord) => {
    await onUpdateRecord(rec.id, {
      status: 'completed',
      completedAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="space-y-6">
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
            Maintenance &amp; Service
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Schedule oil, battery, tyre, brake, and custom reminders and preserve your service
            history.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          disabled={vehicles.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-semibold text-white transition-colors min-h-[44px] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'upcoming', 'overdue', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterStatus(tab)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filterStatus === tab
                ? 'bg-blue-600 text-white'
                : 'bg-[#0F172A] border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {tab === 'all' ? 'All Records' : tab}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#0F172A] border border-blue-500/40 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              {editingId ? 'Edit Maintenance Reminder' : 'New Maintenance Reminder'}
            </h2>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="p-2 text-slate-400 hover:text-white"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {!editingId && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Vehicle</label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.year} {v.manufacturer} {v.model}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Title *</label>
              <input
                type="text"
                required
                maxLength={FIELD_LIMITS.TITLE_MAX}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Engine Oil & Filter Change"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Odometer (km)
              </label>
              <input
                type="number"
                min={0}
                max={2000000}
                value={dueOdometerKm}
                onChange={(e) => setDueOdometerKm(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white font-mono tabular-nums"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">Notes</label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.NOTES_MAX}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Oil viscosity, service centre notes, or part checklist..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Reminder'}
            </button>
          </div>
        </form>
      )}

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-10 text-center space-y-2">
          <Wrench className="w-8 h-8 text-blue-400 mx-auto" />
          <p className="text-sm font-medium text-white">No maintenance records in this view</p>
          <p className="text-xs text-slate-400">
            Add an upcoming service reminder or change your status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((rec) => {
            const isCompleted = rec.status === 'completed';
            return (
              <div
                key={rec.id}
                className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-medium text-blue-400">{rec.category}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-300">{rec.vehicleLabel}</span>
                    {rec.isDemoData && (
                      <span className="text-[11px] font-mono text-amber-300">· DEMO DATA</span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-white">{rec.title}</h3>
                  {rec.notes && <p className="text-xs text-slate-400">{rec.notes}</p>}
                  <p className="text-xs text-slate-400 flex items-center gap-2 font-mono tabular-nums">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {isCompleted
                      ? `Completed ${rec.completedAt || rec.dueDate}`
                      : `Due ${rec.dueDate} · ${rec.dueOdometerKm.toLocaleString()} km`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded border capitalize ${
                      rec.status === 'completed'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : rec.status === 'overdue'
                        ? 'border-red-500/30 bg-red-500/10 text-red-300'
                        : 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                    }`}
                  >
                    {rec.status}
                  </span>

                  {!isCompleted && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleMarkComplete(rec)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white min-h-[36px]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Completed
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(rec)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 min-h-[36px]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteRecord(rec.id)}
                    aria-label={`Delete ${rec.title}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-red-500/50 hover:text-red-300 text-xs text-slate-400 min-h-[36px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
