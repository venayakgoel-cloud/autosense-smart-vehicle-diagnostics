import React, { useState } from 'react';
import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { ArrowLeft, Car, CheckCircle2, KeyRound, Lock, Mail, MapPin, Phone, User } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { createUserProfile, createVehicle, getUserProfile } from '../services/firestoreService';
import { AutoSenseLogo } from '../components/AutoSenseLogo';
import type { PublicRoute } from './LandingPage';
import type { FuelType } from '../types/autosense';

interface AuthPagesProps {
  route: Exclude<PublicRoute, 'landing'>;
  onNavigate: (route: PublicRoute) => void;
  onBackToLanding: () => void;
  onEnterDemo: () => void;
  oobCode?: string;
}

export function AuthPages({
  route,
  onNavigate,
  onBackToLanding,
  onEnterDemo,
  oobCode,
}: AuthPagesProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [includeVehicle, setIncludeVehicle] = useState(false);
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2022');
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [regNumber, setRegNumber] = useState('');
  const [resetCode, setResetCode] = useState(oobCode ?? '');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const formatAuthError = (err: unknown): string => {
    const raw = err instanceof Error ? err.message : String(err);
    if (raw.includes('auth/operation-not-allowed')) {
      return 'Email/Password sign-in is not yet enabled in the Firebase Console (Authentication → Sign-in method → Enable Email/Password). You can sign in immediately with Google below or launch Interactive Demo Mode.';
    }
    if (raw.includes('auth/invalid-credential') || raw.includes('auth/wrong-password')) {
      return 'Incorrect email or password. Please double-check your credentials or reset your password.';
    }
    if (raw.includes('auth/email-already-in-use')) {
      return 'An account with this email already exists. Try signing in instead.';
    }
    if (raw.includes('auth/weak-password')) {
      return 'Please choose a stronger password (at least 6 characters).';
    }
    if (raw.includes('auth/popup-closed-by-user')) {
      return 'Google sign-in popup was closed before completing.';
    }
    return raw;
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const existing = await getUserProfile(cred.user.uid);
      if (!existing) {
        await createUserProfile({
          uid: cred.user.uid,
          fullName: cred.user.displayName || 'AutoSense Driver',
          email: cred.user.email || '',
          photoUrl: cred.user.photoURL || '',
        });
      }
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !city.trim() || password.length < 6) {
      setErrorMsg('Please fill in your full name, email, phone number, city, and a password of at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: fullName.trim() });
      try {
        await sendEmailVerification(cred.user);
      } catch {
        // Non-blocking verification email attempt
      }
      if (cred.user.emailVerified) {
        await createUserProfile({
          uid: cred.user.uid,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim(),
        });
        if (includeVehicle && manufacturer.trim() && model.trim() && regNumber.trim()) {
          await createVehicle(cred.user.uid, {
            manufacturer: manufacturer.trim(),
            model: model.trim(),
            year: Number(year) || 2022,
            fuelType,
            registrationNumber: regNumber.trim().toUpperCase(),
            odometerKm: 0,
            isPrimary: true,
            connectionStatus: 'disconnected',
            lastHealthScore: 95,
          });
        }
      } else {
        setInfoMsg(
          'Account created! Please check your inbox and verify your email address before saving records to the cloud.'
        );
      }
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    if (!email.trim()) {
      setErrorMsg('Enter the email address associated with your account.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMsg(
        `Password reset instructions have been sent to ${email.trim()}. Once you receive your reset code, you can also complete the reset on the Reset Password screen.`
      );
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    if (!resetCode.trim() || newPassword.length < 6) {
      setErrorMsg('Provide the reset code from your email link and a new password of at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(auth, resetCode.trim(), newPassword);
      setInfoMsg('Your password has been updated. You can now sign in with your new password.');
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (route === 'terms' || route === 'privacy') {
    const isTerms = route === 'terms';
    return (
      <div className="min-h-screen bg-[#060A13] text-slate-100 py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AutoSense
          </button>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
            <AutoSenseLogo />
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              {isTerms ? 'AutoSense Terms of Service' : 'AutoSense Privacy Policy'}
            </h1>
            <p className="text-xs text-slate-400">Last updated: November 2026</p>

            {isTerms ? (
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <p>
                  AutoSense provides educational vehicle diagnostic summaries, OBD-II trouble code
                  explanations, maintenance tracking, and AI-assisted general guidance. AutoSense is
                  not a substitute for hands-on mechanical inspection by a certified automotive
                  technician.
                </p>
                <p>
                  <strong className="text-white">Diagnostic Limitations:</strong> OBD-II diagnostic
                  trouble codes indicate a monitored system or sensor anomaly and do not independently
                  confirm a specific faulty component. Never ignore dashboard critical warnings or
                  attempt unsafe repairs on hot, pressurized, braking, airbag, or high-voltage
                  systems.
                </p>
                <p>
                  <strong className="text-white">Demonstration Mode:</strong> Simulated vehicle data
                  and sample service centre listings are clearly marked as DEMO DATA and must not be
                  relied upon as live vehicle measurements.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <p>
                  AutoSense stores only the account, vehicle garage, diagnostic scan, maintenance,
                  and notification records you choose to save under your authenticated account.
                </p>
                <p>
                  <strong className="text-white">Data Isolation:</strong> Your personal details
                  (name, email, phone number, city) and vehicle records are strictly scoped to your
                  user ID through Firebase Authentication and Firestore security rules. Passwords are
                  never stored in plain text.
                </p>
                <p>
                  <strong className="text-white">AI Assistant Context:</strong> Questions sent to
                  AutoSense AI include only the current conversation and active vehicle summary so
                  responses remain relevant, without selling or sharing personal contact records.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060A13] text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="max-w-lg w-full mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
          <AutoSenseLogo />
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="font-display font-bold text-2xl text-white">
              {route === 'signin' && 'Sign in to AutoSense'}
              {route === 'signup' && 'Create your AutoSense account'}
              {route === 'forgot' && 'Forgot your password?'}
              {route === 'reset' && 'Set a new password'}
            </h1>
            <p className="text-sm text-slate-400">
              {route === 'signin' && 'Access your garage, diagnostic history, and vehicle health.'}
              {route === 'signup' && 'Monitor your vehicle health and decode trouble codes in plain English.'}
              {route === 'forgot' && 'Enter your account email and we will send a password reset link.'}
              {route === 'reset' && 'Enter the verification code from your reset email and a new password.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs sm:text-sm text-red-200 leading-relaxed">
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs sm:text-sm text-blue-200 flex items-start gap-2.5 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Google Sign In on Sign In / Sign Up */}
          {(route === 'signin' || route === 'signup') && (
            <>
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-colors disabled:opacity-60 min-h-[44px]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-800" />
                <span className="shrink mx-3 text-xs text-slate-500">or continue with email</span>
                <div className="flex-grow border-t border-slate-800" />
              </div>
            </>
          )}

          {/* SIGN IN FORM */}
          {route === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors disabled:opacity-60 min-h-[44px]"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {route === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      maxLength={30}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 408 555 0199"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      maxLength={150}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="San Jose"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white"
                  />
                </div>
              </div>

              {/* Optional Vehicle Details */}
              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2.5 text-sm text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeVehicle}
                    onChange={(e) => setIncludeVehicle(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-[#0B1120] text-blue-600 focus:ring-blue-500"
                  />
                  <Car className="w-4 h-4 text-blue-400" />
                  <span>Add my vehicle registration details now (optional)</span>
                </label>

                {includeVehicle && (
                  <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0B1120] border border-slate-800">
                    <input
                      type="text"
                      maxLength={30}
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="Registration number (e.g. CA-8492-AS)"
                      className="sm:col-span-2 px-3 py-2 rounded-lg bg-[#0F172A] border border-slate-700 text-sm text-white uppercase font-mono"
                    />
                    <input
                      type="text"
                      maxLength={60}
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      placeholder="Manufacturer (e.g. Honda)"
                      className="px-3 py-2 rounded-lg bg-[#0F172A] border border-slate-700 text-sm text-white"
                    />
                    <input
                      type="text"
                      maxLength={60}
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Model (e.g. Civic)"
                      className="px-3 py-2 rounded-lg bg-[#0F172A] border border-slate-700 text-sm text-white"
                    />
                    <input
                      type="number"
                      min={1980}
                      max={2030}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="Year"
                      className="px-3 py-2 rounded-lg bg-[#0F172A] border border-slate-700 text-sm text-white tabular-nums"
                    />
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value as FuelType)}
                      className="px-3 py-2 rounded-lg bg-[#0F172A] border border-slate-700 text-sm text-white"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors disabled:opacity-60 min-h-[44px]"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="text-xs text-slate-400 text-center">
                By creating an account, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('terms')}
                  className="text-blue-400 hover:underline"
                >
                  Terms
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('privacy')}
                  className="text-blue-400 hover:underline"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {route === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Account email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors disabled:opacity-60 min-h-[44px]"
              >
                {loading ? 'Sending reset link...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('reset')}
                className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
              >
                I already have a reset code
              </button>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {route === 'reset' && (
            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Reset verification code (oobCode)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Paste code from reset link"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">New password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors disabled:opacity-60 min-h-[44px]"
              >
                {loading ? 'Updating password...' : 'Update Password'}
              </button>
            </form>
          )}

          {/* Footer Switches */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              {route === 'signin' ? (
                <>
                  New to AutoSense?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setInfoMsg('');
                      onNavigate('signup');
                    }}
                    className="text-blue-400 font-medium hover:underline"
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setInfoMsg('');
                      onNavigate('signin');
                    }}
                    className="text-blue-400 font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onEnterDemo}
              className="text-slate-300 hover:text-white font-medium underline-offset-4 hover:underline text-left sm:text-right"
            >
              Try Demo Mode instead →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
