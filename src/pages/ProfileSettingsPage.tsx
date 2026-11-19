import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { CheckCircle2, HelpCircle, Lock, LogOut, Shield, User } from 'lucide-react';
import { auth } from '../lib/firebase';
import { FIELD_LIMITS, type AppSection, type UserPreferences, type UserProfile, type Vehicle } from '../types/autosense';

interface ProfileSettingsPageProps {
  mode: 'profile' | 'settings';
  userProfile: UserProfile;
  vehicles: Vehicle[];
  isDemoSession: boolean;
  emailVerified?: boolean;
  onResendVerification?: () => Promise<void>;
  onRefreshVerification?: () => Promise<boolean>;
  onUpdateProfile: (
    updates: Partial<Pick<UserProfile, 'fullName' | 'phone' | 'city' | 'photoUrl' | 'preferences'>>
  ) => Promise<void>;
  onSubmitFeedback: (subject: string, message: string) => Promise<void>;
  onNavigate: (section: AppSection) => void;
  onLogout: () => void;
}

export function ProfileSettingsPage({
  mode,
  userProfile,
  vehicles,
  isDemoSession,
  emailVerified = false,
  onResendVerification,
  onRefreshVerification,
  onUpdateProfile,
  onSubmitFeedback,
  onNavigate,
  onLogout,
}: ProfileSettingsPageProps) {
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [phone, setPhone] = useState(userProfile.phone);
  const [city, setCity] = useState(userProfile.city);
  const [photoUrl, setPhotoUrl] = useState(userProfile.photoUrl);
  const [prefs, setPrefs] = useState<UserPreferences>(userProfile.preferences);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg('');
    try {
      await onUpdateProfile({
        fullName: fullName.trim() || userProfile.fullName,
        phone: phone.trim(),
        city: city.trim(),
        photoUrl: photoUrl.trim(),
        preferences: prefs,
      });
      setStatusMsg('Profile and preferences saved.');
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (isDemoSession) {
      setStatusMsg('Sign in with an email account to request a password reset link.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, userProfile.email);
      setStatusMsg(`Password reset email sent to ${userProfile.email}.`);
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Unable to send password reset email.');
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackSubject.trim() || !feedbackMessage.trim()) return;
    setSendingFeedback(true);
    try {
      await onSubmitFeedback(feedbackSubject.trim(), feedbackMessage.trim());
      setFeedbackSubject('');
      setFeedbackMessage('');
      setStatusMsg('Thank you — your support message / feedback has been submitted.');
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Could not send feedback.');
    } finally {
      setSendingFeedback(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={photoUrl || '/src/assets/images/avatar_driver_default_1795018622125.jpg'}
            alt={userProfile.fullName}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover border border-slate-700"
          />
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
              {mode === 'profile' ? 'Driver Profile' : 'Account & App Settings'}
            </h1>
            <p className="text-sm text-slate-400">
              {userProfile.email} · Role: <span className="capitalize text-slate-200">{userProfile.role}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-200 min-h-[44px]"
        >
          <LogOut className="w-4 h-4" />
          {isDemoSession ? 'Exit Demo Session' : 'Log Out'}
        </button>
      </section>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-sm text-blue-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Personal Information & Preferences */}
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5"
        >
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Personal Information &amp; Notification Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.FULL_NAME_MAX}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                maxLength={FIELD_LIMITS.PHONE_MAX}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">City</label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.CITY_MAX}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Profile Photo URL
              </label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.PHOTO_URL_MAX}
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="/src/assets/images/..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 text-sm text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400">
              Notification &amp; Privacy Preferences
            </h3>
            {[
              {
                key: 'emailAlerts' as keyof UserPreferences,
                label: 'Email diagnostic summaries & critical safety alerts',
              },
              {
                key: 'pushAlerts' as keyof UserPreferences,
                label: 'In-app scan completion & connection alerts',
              },
              {
                key: 'maintenanceReminders' as keyof UserPreferences,
                label: 'Upcoming & overdue maintenance schedule reminders',
              },
              {
                key: 'shareDiagnosticTelemetry' as keyof UserPreferences,
                label: 'Share anonymized trouble code statistics to improve library accuracy',
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#0B1120] border border-slate-800/80 cursor-pointer"
              >
                <span className="text-xs sm:text-sm text-slate-200">{item.label}</span>
                <input
                  type="checkbox"
                  checked={prefs[item.key]}
                  onChange={(e) =>
                    setPrefs((prev) => ({ ...prev, [item.key]: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-slate-600 bg-[#0F172A] text-blue-600 shrink-0"
                />
              </label>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white disabled:opacity-60 min-h-[44px]"
            >
              {saving ? 'Saving...' : 'Save Profile & Settings'}
            </button>
          </div>
        </form>

        {/* Right Column: Vehicles Summary, Security, Help & Support */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">My Vehicles ({vehicles.length})</h2>
              <button
                type="button"
                onClick={() => onNavigate('garage')}
                className="text-xs text-blue-400 hover:underline"
              >
                Open Garage
              </button>
            </div>
            {vehicles.length === 0 ? (
              <p className="text-xs text-slate-400">No vehicles registered yet.</p>
            ) : (
              <div className="divide-y divide-slate-800 text-xs">
                {vehicles.map((v) => (
                  <div key={v.id} className="py-2.5 flex items-center justify-between">
                    <span className="text-white font-medium">
                      {v.year} {v.manufacturer} {v.model}
                    </span>
                    <span className="font-mono text-slate-400">{v.registrationNumber}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              Password &amp; Privacy Management
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Send a secure Firebase password reset email to update your account credentials, or
              review how your vehicle telemetry is stored.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePasswordReset}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-white min-h-[40px]"
              >
                Send Password Reset Email
              </button>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 px-2">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Owner-scoped Firestore isolation
              </span>
            </div>

            {!isDemoSession && (
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">
                  Email verification:{' '}
                  <strong className={emailVerified ? 'text-emerald-400' : 'text-amber-300'}>
                    {emailVerified ? 'Verified' : 'Unverified (optional)'}
                  </strong>
                </span>
                {!emailVerified && onResendVerification && onRefreshVerification && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await onResendVerification();
                          setStatusMsg(`Verification link sent to ${userProfile.email}.`);
                        } catch (err) {
                          setStatusMsg(
                            err instanceof Error ? err.message : 'Unable to send verification email.'
                          );
                        }
                      }}
                      className="text-blue-400 hover:underline"
                    >
                      Resend verification email
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const verified = await onRefreshVerification();
                        setStatusMsg(
                          verified
                            ? 'Email verification confirmed.'
                            : 'Email is not verified yet. Check your inbox.'
                        );
                      }}
                      className="text-slate-300 hover:text-white"
                    >
                      Refresh
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSendFeedback}
            className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-3"
          >
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              Help, Support &amp; Feedback
            </h2>
            <input
              type="text"
              required
              maxLength={FIELD_LIMITS.SUBJECT_MAX}
              value={feedbackSubject}
              onChange={(e) => setFeedbackSubject(e.target.value)}
              placeholder="Topic or feedback title"
              className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
            />
            <textarea
              required
              rows={3}
              maxLength={FIELD_LIMITS.MESSAGE_MAX}
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Tell our support team how we can help..."
              className="w-full px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-700 text-xs text-white"
            />
            <button
              type="submit"
              disabled={sendingFeedback}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white min-h-[40px]"
            >
              {sendingFeedback ? 'Sending...' : 'Submit Feedback / Support Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
