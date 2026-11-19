import React, { useState } from 'react';
import { Car, CheckCircle2, Edit3, Plus, Star, Trash2, X } from 'lucide-react';
import {
  CATALOG_MANUFACTURERS,
  decodeVinViaApi,
  getModelsForManufacturer,
  inferDefaultFuelForModel,
} from '../services/automotiveCatalog';
import { FIELD_LIMITS, type FuelType, type Vehicle } from '../types/autosense';

interface MyGaragePageProps {
  vehicles: Vehicle[];
  activeVehicleId: string;
  onSelectActive: (vehicleId: string) => void;
  onAddVehicle: (
    data: Omit<Vehicle, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  onUpdateVehicle: (
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
  ) => Promise<void>;
  onDeleteVehicle: (vehicleId: string) => Promise<void>;
}

export function MyGaragePage({
  vehicles,
  activeVehicleId,
  onSelectActive,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
}: MyGaragePageProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Add/Edit form fields
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2022');
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [odometerKm, setOdometerKm] = useState('0');
  const [vin, setVin] = useState('');
  const [isPrimary, setIsPrimary] = useState(vehicles.length === 0);
  const [vinDecoding, setVinDecoding] = useState(false);
  const [vinFeedback, setVinFeedback] = useState('');

  const resetForm = () => {
    setRegistrationNumber('');
    setManufacturer('');
    setModel('');
    setYear('2022');
    setFuelType('Petrol');
    setOdometerKm('0');
    setVin('');
    setIsPrimary(vehicles.length === 0);
    setEditingId(null);
    setErrorMsg('');
    setVinFeedback('');
  };

  const openAdd = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setRegistrationNumber(v.registrationNumber);
    setManufacturer(v.manufacturer);
    setModel(v.model);
    setYear(String(v.year));
    setFuelType(v.fuelType);
    setOdometerKm(String(v.odometerKm));
    setVin(v.vin ?? '');
    setIsPrimary(v.isPrimary);
    setErrorMsg('');
    setVinFeedback('');
    setFormOpen(true);
  };

  const handleFormVinDecode = async () => {
    setVinFeedback('');
    setErrorMsg('');
    setVinDecoding(true);
    try {
      const decoded = await decodeVinViaApi(vin);
      setVin(decoded.vin);
      if (decoded.manufacturer) setManufacturer(decoded.manufacturer);
      if (decoded.model) setModel(decoded.model);
      if (decoded.year) setYear(String(decoded.year));
      if (decoded.fuelType) setFuelType(decoded.fuelType);
      setVinFeedback(decoded.note);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to decode VIN.');
    } finally {
      setVinDecoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manufacturer.trim() || !model.trim() || !registrationNumber.trim()) {
      setErrorMsg('Please enter registration number, manufacturer, and model.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const parsedYear = Math.min(2030, Math.max(1980, Number(year) || 2022));
      const parsedOdo = Math.min(2000000, Math.max(0, Number(odometerKm) || 0));

      const cleanPlate = registrationNumber.trim().toUpperCase();

      if (editingId) {
        await onUpdateVehicle(editingId, {
          manufacturer: manufacturer.trim(),
          model: model.trim(),
          year: parsedYear,
          fuelType,
          registrationNumber: cleanPlate,
          odometerKm: parsedOdo,
          vin: vin.trim().toUpperCase(),
          isPrimary,
        });
      } else {
        await onAddVehicle({
          manufacturer: manufacturer.trim(),
          model: model.trim(),
          year: parsedYear,
          fuelType,
          registrationNumber: cleanPlate,
          odometerKm: parsedOdo,
          vin: vin.trim().toUpperCase(),
          isPrimary,
          connectionStatus: 'disconnected',
          lastHealthScore: 95,
        });
      }
      setFormOpen(false);
      resetForm();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save vehicle.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (v: Vehicle) => {
    for (const item of vehicles) {
      if (item.id === v.id && !item.isPrimary) {
        await onUpdateVehicle(item.id, { isPrimary: true });
      } else if (item.id !== v.id && item.isPrimary) {
        await onUpdateVehicle(item.id, { isPrimary: false });
      }
    }
    onSelectActive(v.id);
  };

  return (
    <div className="space-y-6">
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white">My Garage</h1>
          <p className="text-sm text-slate-400 mt-1">
            Register and manage your vehicles using manufacturer, model, registration number, and
            optional VIN.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors min-h-[44px] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </section>

      {/* Add / Edit Vehicle Panel */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#0F172A] border border-blue-500/40 rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              {editingId ? 'Edit Vehicle Details' : 'Register New Vehicle'}
            </h2>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="p-2 text-slate-400 hover:text-white"
              aria-label="Close form"
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
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                required
                maxLength={FIELD_LIMITS.REG_NUMBER_MAX}
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. CA-8492-AS"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Manufacturer *</label>
              <input
                type="text"
                required
                list="garage-makes-list"
                maxLength={FIELD_LIMITS.MANUFACTURER_MAX}
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Honda, Toyota, Hyundai"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
              />
              <datalist id="garage-makes-list">
                {CATALOG_MANUFACTURERS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Model *</label>
              <input
                type="text"
                required
                list="garage-models-list"
                maxLength={FIELD_LIMITS.MODEL_MAX}
                value={model}
                onChange={(e) => {
                  const nextModel = e.target.value;
                  setModel(nextModel);
                  const inferred = inferDefaultFuelForModel(manufacturer, nextModel);
                  if (inferred) setFuelType(inferred);
                }}
                placeholder="e.g. Civic Touring"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
              />
              <datalist id="garage-models-list">
                {getModelsForManufacturer(manufacturer).map((entry) => (
                  <option key={entry.model} value={entry.model} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Manufacturing Year *
              </label>
              <input
                type="number"
                required
                min={1980}
                max={2030}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Fuel Type *</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Odometer Reading (km)
              </label>
              <input
                type="number"
                min={0}
                max={2000000}
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Vehicle Identification Number / VIN (17-char auto-decode)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={FIELD_LIMITS.VIN_MAX}
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="17-character VIN"
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white font-mono uppercase"
                />
                <button
                  type="button"
                  disabled={vinDecoding || vin.trim().length < 17}
                  onClick={() => void handleFormVinDecode()}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white whitespace-nowrap disabled:opacity-50"
                >
                  {vinDecoding ? '...' : 'Decode VIN'}
                </button>
              </div>
              {vinFeedback && <p className="text-[11px] text-emerald-300 mt-1">{vinFeedback}</p>}
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex items-center pt-1">
              <label className="flex items-center gap-2.5 text-sm text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-[#0B1120] text-blue-600"
                />
                <span>Set as primary vehicle</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add to Garage'}
            </button>
          </div>
        </form>
      )}

      {/* Garage List */}
      {vehicles.length === 0 ? (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <Car className="w-9 h-9 text-blue-400 mx-auto" />
          <h2 className="text-base font-semibold text-white">Your Garage is Empty</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Add your vehicle details to run OBD-II diagnostics and monitor health scores.
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white"
          >
            <Plus className="w-4 h-4" />
            Add First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {vehicles.map((v) => {
            const isActive = v.id === activeVehicleId;
            return (
              <article
                key={v.id}
                className={`bg-[#0F172A] border rounded-2xl p-6 space-y-4 ${
                  isActive ? 'border-blue-500/70' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded border border-slate-700 bg-[#0B1120] text-blue-300">
                        {v.registrationNumber}
                      </span>
                      <h2 className="text-lg font-display font-bold text-white">
                        {v.year} {v.manufacturer} {v.model}
                      </h2>
                      {v.isPrimary && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-300">
                          <Star className="w-3.5 h-3.5 fill-blue-400 text-blue-400" />
                          Primary
                        </span>
                      )}
                      {v.isDemoData && (
                        <span className="text-[11px] font-mono text-amber-300">· DEMO DATA</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">Fuel: {v.fuelType}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">Health</p>
                    <p className="text-lg font-mono font-bold text-white tabular-nums">
                      {v.lastHealthScore}/100
                    </p>
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
                  <div>
                    <dt className="text-slate-400">Odometer</dt>
                    <dd className="text-white font-mono tabular-nums mt-0.5">
                      {v.odometerKm.toLocaleString()} km
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">VIN</dt>
                    <dd className="text-white font-mono truncate mt-0.5">
                      {v.vin || 'Not provided'}
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectActive(v.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium min-h-[36px] ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isActive ? 'Selected' : 'Select Active'}
                    </button>

                    {!v.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(v)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 min-h-[36px]"
                      >
                        Set Primary
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(v)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 min-h-[36px]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    {confirmDeleteId === v.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeleteVehicle(v.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white min-h-[36px]"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 min-h-[36px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(v.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-red-500/50 hover:text-red-300 text-xs text-slate-400 min-h-[36px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
