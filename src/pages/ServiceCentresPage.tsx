import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Clock, MapPin, Phone, Star, Wrench } from 'lucide-react';
import { SAMPLE_SERVICE_CENTRES } from '../data/demoData';
import {
  FIELD_LIMITS,
  type ServiceCentre,
  type ServiceEnquiry,
  type UserProfile,
  type Vehicle,
} from '../types/autosense';

interface ServiceCentresPageProps {
  customCentres: ServiceCentre[];
  userProfile: UserProfile;
  vehicles: Vehicle[];
  enquiries: ServiceEnquiry[];
  onSubmitEnquiry: (enquiry: {
    ownerName: string;
    ownerEmail: string;
    type: 'appointment' | 'enquiry' | 'feedback';
    serviceCentreName?: string;
    vehicleLabel?: string;
    preferredDate?: string;
    subject: string;
    message: string;
  }) => Promise<void>;
}

export function ServiceCentresPage({
  customCentres,
  userProfile,
  vehicles,
  enquiries,
  onSubmitEnquiry,
}: ServiceCentresPageProps) {
  const [citySearch, setCitySearch] = useState('');
  const [selectedCentre, setSelectedCentre] = useState<ServiceCentre | null>(null);
  const [reqType, setReqType] = useState<'appointment' | 'enquiry'>('appointment');
  const [vehicleLabel, setVehicleLabel] = useState(
    vehicles[0] ? `${vehicles[0].year} ${vehicles[0].manufacturer} ${vehicles[0].model}` : ''
  );
  const [preferredDate, setPreferredDate] = useState('2026-11-25');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedOk, setSubmittedOk] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const allCentres = useMemo(() => {
    return [...customCentres, ...SAMPLE_SERVICE_CENTRES];
  }, [customCentres]);

  const filteredCentres = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return allCentres;
    return allCentres.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.specialties.some((s) => s.toLowerCase().includes(q))
    );
  }, [allCentres, citySearch]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setErrorMsg('Please enter a subject and details for your service enquiry.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSubmittedOk(false);
    try {
      await onSubmitEnquiry({
        ownerName: userProfile.fullName,
        ownerEmail: userProfile.email,
        type: reqType,
        serviceCentreName: selectedCentre?.name || 'General Mechanic Support',
        vehicleLabel: vehicleLabel.trim(),
        preferredDate: reqType === 'appointment' ? preferredDate : '',
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubject('');
      setMessage('');
      setSubmittedOk(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not submit service request.');
    } finally {
      setSubmitting(false);
    }
  };

  const myServiceRequests = enquiries.filter((e) => e.type !== 'feedback');

  return (
    <div className="space-y-6">
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
            Service Centres &amp; Mechanic Support
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse verified partner workshops, inspect mechanic contact details, and request an
            appointment.
          </p>
        </div>

        <input
          type="text"
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          placeholder="Filter by city or specialty..."
          className="sm:w-72 px-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white focus:border-blue-500 focus:outline-none"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Listings */}
        <div className="lg:col-span-7 space-y-4">
          {filteredCentres.map((centre) => {
            const isSelected = selectedCentre?.id === centre.id;
            return (
              <article
                key={centre.id}
                className={`bg-[#0F172A] border rounded-2xl p-6 space-y-3 transition-colors ${
                  isSelected ? 'border-blue-500' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-white">{centre.name}</h2>
                      {centre.isSampleListing && (
                        <span className="text-[11px] font-mono text-amber-300">
                          · SAMPLE LISTING
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      {centre.address}, {centre.city}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-amber-300 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {centre.rating.toFixed(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {centre.phone}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {centre.hours}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Specialties: {centre.specialties.join(' · ')}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCentre(centre);
                      setReqType('appointment');
                      setSubject(`Inspection request at ${centre.name}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white min-h-[38px]"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Request Appointment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCentre(centre);
                      setReqType('enquiry');
                      setSubject(`Diagnostic enquiry for ${centre.name}`);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 min-h-[38px]"
                  >
                    Send Enquiry
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Appointment & Enquiry Form */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleRequestSubmit}
            className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              <h2 className="text-base font-semibold text-white">
                {reqType === 'appointment' ? 'Request Service Appointment' : 'Service Enquiry Form'}
              </h2>
            </div>

            {selectedCentre && (
              <p className="text-xs text-blue-300">
                Selected Workshop: <strong>{selectedCentre.name}</strong> ({selectedCentre.city})
              </p>
            )}

            {submittedOk && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Your request has been logged and can be tracked below.</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReqType('appointment')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                  reqType === 'appointment'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0B1120] border border-slate-800 text-slate-300'
                }`}
              >
                Appointment
              </button>
              <button
                type="button"
                onClick={() => setReqType('enquiry')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                  reqType === 'enquiry'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0B1120] border border-slate-800 text-slate-300'
                }`}
              >
                General Enquiry
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Vehicle</label>
              <input
                type="text"
                maxLength={120}
                value={vehicleLabel}
                onChange={(e) => setVehicleLabel(e.target.value)}
                placeholder="e.g. 2022 Honda Civic Touring"
                className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
              />
            </div>

            {reqType === 'appointment' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject *</label>
              <input
                type="text"
                required
                maxLength={FIELD_LIMITS.SUBJECT_MAX}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Inspect code P0171 & routine oil change"
                className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Symptoms or Questions *
              </label>
              <textarea
                required
                rows={4}
                maxLength={FIELD_LIMITS.MESSAGE_MAX}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share any warning lights, codes, or symptoms..."
                className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white disabled:opacity-60 min-h-[44px]"
            >
              {submitting ? 'Submitting...' : 'Submit Service Request'}
            </button>
          </form>

          {/* Submitted Requests History */}
          {myServiceRequests.length > 0 && (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">Your Recent Requests</h3>
              <div className="divide-y divide-slate-800">
                {myServiceRequests.slice(0, 5).map((item) => (
                  <div key={item.id} className="py-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white truncate">{item.subject}</span>
                      <span className="capitalize text-blue-300 shrink-0">{item.status}</span>
                    </div>
                    <p className="text-slate-400">
                      {item.serviceCentreName} {item.preferredDate ? `· ${item.preferredDate}` : ''}
                    </p>
                    {item.adminNote && (
                      <p className="text-slate-300 pt-1">Note: {item.adminNote}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
