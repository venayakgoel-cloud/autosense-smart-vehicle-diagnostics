import {
  Activity,
  ArrowRight,
  Bluetooth,
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { AutoSenseLogo } from '../components/AutoSenseLogo';
import { STANDARD_OBD_CODES, SEVERITY_GUIDANCE } from '../data/obdCodes';

export type PublicRoute = 'landing' | 'signin' | 'signup' | 'forgot' | 'reset' | 'terms' | 'privacy';

interface LandingPageProps {
  onNavigate: (route: PublicRoute) => void;
  onEnterDemo: () => void;
}

export function LandingPage({ onNavigate, onEnterDemo }: LandingPageProps) {
  const previewCodes = STANDARD_OBD_CODES.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#060A13] text-slate-100 flex flex-col">
      {/* Top Bar Contract: Brand — 4 nav links — 1 primary CTA */}
      <header className="sticky top-0 z-40 bg-[#060A13]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
          >
            <AutoSenseLogo size="md" />
          </button>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#capabilities" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Capabilities
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#obd-library" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Error Codes
            </a>
            <a href="#safety" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Safety First
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('signin')}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-sm font-medium text-blue-400">
                Smart OBD-II Diagnostics · Bluetooth &amp; Wi-Fi Ready
              </p>
              <h1 className="font-display font-bold tracking-tight text-white text-balance text-4xl sm:text-5xl leading-[1.1]">
                Understand Your Car. Drive With Confidence.
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                AutoSense turns cryptic dashboard warning lights and OBD-II fault codes into clear,
                honest guidance—helping everyday drivers, families, and first-time car owners make
                informed maintenance decisions.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors min-h-[44px] whitespace-nowrap shrink-0"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onEnterDemo}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-800/80 text-sm font-semibold text-slate-100 transition-colors min-h-[44px] whitespace-nowrap shrink-0"
                >
                  Launch Interactive Demo
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
                <div>
                  <p className="text-xl font-display font-bold text-white tabular-nums">5-Step</p>
                  <p className="text-xs text-slate-400 mt-0.5">Plug &amp; Pair Setup</p>
                </div>
                <div>
                  <p className="text-xl font-display font-bold text-white tabular-nums">4 Tiers</p>
                  <p className="text-xs text-slate-400 mt-0.5">Clear Severity Triage</p>
                </div>
                <div>
                  <p className="text-xl font-display font-bold text-white tabular-nums">100%</p>
                  <p className="text-xs text-slate-400 mt-0.5">Plain-English Reports</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[280px] lg:min-h-[420px] rounded-2xl overflow-hidden border border-slate-800 bg-[#0B1120]">
                <img
                  src="/src/assets/images/hero_autosense_car_1795018619818.jpg"
                  alt="Modern sport sedan inside dark studio garage with electric blue diagnostic highlights"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060A13]/90 via-[#060A13]/20 to-transparent flex items-end p-6">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-blue-300">
                      Interactive Demonstration Included
                    </p>
                    <p className="text-sm text-slate-200">
                      Test full OBD-II scanning, trouble code explanations, and PDF reports even
                      before pairing physical hardware.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities Bento Grid */}
        <section id="capabilities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
          <div className="max-w-2xl space-y-3 mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white text-balance">
              Built for Everyday Drivers, Not Just Technicians
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Every diagnostic readout pairs vehicle sensor availability with cautious, plain-English
              next steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Marquee Hardware Card */}
            <div className="md:col-span-2 bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2">
              <div className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/15 text-blue-400">
                    <Bluetooth className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    01. Plug-and-Play OBD-II Hardware Link
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Connect compatible Bluetooth LE or Wi-Fi adapters directly to your vehicle&apos;s
                    under-dash port, or evaluate every workflow in clearly labeled Demo Mode.
                  </p>
                </div>
                <p className="text-xs text-slate-400">
                  Supports ISO 15765-4 CAN &amp; standard OBD-II PIDs
                </p>
              </div>
              <div className="min-h-[220px] bg-[#0B1120]">
                <img
                  src="/src/assets/images/obd_dongle_device_1795018619924.jpg"
                  alt="Compact matte black and brushed aluminum AutoSense OBD-II diagnostic device"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/15 text-blue-400">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  02. Honest Sensor Transparency
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Clearly distinguishes supported readings, unsupported ECUs, and simulated demo
                  telemetry—never disguising sample figures as real car data.
                </p>
              </div>
              <p className="text-xs text-slate-400">Health score · Coolant · 12V Battery · Fuel Trim</p>
            </div>

            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/15 text-blue-400">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                03. Maintenance &amp; Multi-Car Garage
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Track oil changes, tyre rotations, brake checks, and battery inspections across all
                family vehicles in one organized logbook.
              </p>
            </div>

            <div className="md:col-span-2 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/15 text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  04. AutoSense AI Warning Light Guidance
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Ask questions about dashboard warning symbols, trouble codes, or service schedules
                  and receive cautious, safety-first explanations tailored to your active car.
                </p>
              </div>
              <button
                type="button"
                onClick={onEnterDemo}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-white transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
              >
                Ask AutoSense AI in Demo
              </button>
            </div>
          </div>
        </section>

        {/* 5-Step Connection Guide */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-800 bg-[#0B1120]">
              <img
                src="/src/assets/images/obd_port_guide_1795018619781.jpg"
                alt="Technical diagram highlighting the 16-pin OBD-II port beneath the steering column"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                  From Port to Clarity in Five Steps
                </h2>
                <p className="text-sm sm:text-base text-slate-400">
                  Every car built since 1996 (and most modern vehicles globally) includes a standard
                  16-pin OBD-II diagnostic socket near the driver&apos;s footwell.
                </p>
              </div>

              <ol className="space-y-3">
                {[
                  'Locate the vehicle’s 16-pin OBD-II port beneath the steering column.',
                  'Firmly insert the compatible AutoSense Bluetooth or Wi-Fi adapter.',
                  'Turn the ignition on as instructed by your vehicle manufacturer.',
                  'Pair the adapter inside the AutoSense Connect Vehicle screen.',
                  'Start your scan and review plain-English diagnostics and PDF reports.',
                ].map((stepText, idx) => (
                  <li
                    key={stepText}
                    className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0F172A] border border-slate-800/80"
                  >
                    <span className="font-mono text-xs font-semibold text-blue-400 tabular-nums pt-0.5">
                      0{idx + 1}
                    </span>
                    <span className="text-sm text-slate-200">{stepText}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Sample Error Codes Library Preview */}
        <section id="obd-library" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                Understand Trouble Codes Without Guesswork
              </h2>
              <p className="text-sm text-slate-400">
                Sample entries from our plain-English OBD-II diagnostic library.
              </p>
            </div>
            <button
              type="button"
              onClick={onEnterDemo}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 whitespace-nowrap shrink-0"
            >
              Browse Full Code Library →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewCodes.map((item) => {
              const sev = SEVERITY_GUIDANCE[item.severity];
              return (
                <div
                  key={item.code}
                  className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-base font-bold text-white">{item.code}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${sev.badgeClass}`}>
                      {sev.label}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white">{item.name}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {item.meaning}
                  </p>
                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    {item.category} · {sev.actionSummary}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Safety Commitment */}
        <section id="safety" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-medium">
                <ShieldAlert className="w-5 h-5" />
                Diagnostic Safety &amp; Transparency Standard
              </div>
              <h2 className="font-display font-bold text-2xl text-white">
                Guidance You Can Trust Before Visiting a Workshop
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                AutoSense never claims an OBD-II error code alone proves a specific component has
                failed, and never suggests unsafe DIY mechanical repairs. Critical alerts prioritize
                pulling over safely and consulting a certified technician.
              </p>
              <div className="flex flex-wrap gap-6 pt-2 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Clear DEMO DATA labeling
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  PDF reports to share with your mechanic
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors min-h-[44px] whitespace-nowrap"
              >
                Get Started Free
              </button>
              <button
                type="button"
                onClick={onEnterDemo}
                className="px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-sm font-medium text-slate-200 transition-colors min-h-[44px] whitespace-nowrap"
              >
                Explore Demo Workspace
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/80 bg-[#060A13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <AutoSenseLogo size="sm" />
            <span>· Understand Your Car. Drive With Confidence.</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onNavigate('terms')}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => onNavigate('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <span>© {new Date().getFullYear()} AutoSense Mobility</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
