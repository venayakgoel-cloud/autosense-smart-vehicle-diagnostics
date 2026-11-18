import React, { useState } from 'react';
import {
  Activity,
  Bell,
  Bluetooth,
  BookOpen,
  Car,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { AutoSenseLogo } from './AutoSenseLogo';
import type { AppSection, UserProfile, Vehicle } from '../types/autosense';

interface AppShellProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  userProfile: UserProfile;
  vehicles: Vehicle[];
  activeVehicle: Vehicle | undefined;
  onSelectVehicle: (vehicleId: string) => void;
  unreadNotifications: number;
  isDemoSession: boolean;
  isAdmin: boolean;
  onLogout: () => void;
  onPromptSignIn: () => void;
  children: React.ReactNode;
}

interface NavItem {
  id: AppSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIMARY_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'connect', label: 'Connect Vehicle', icon: Bluetooth },
  { id: 'diagnostics', label: 'Diagnostics', icon: Search },
  { id: 'codes', label: 'Error Codes', icon: BookOpen },
  { id: 'health', label: 'Vehicle Health', icon: Activity },
  { id: 'garage', label: 'My Garage', icon: Car },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'history', label: 'Scan History', icon: History },
  { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
  { id: 'services', label: 'Service Centres', icon: MapPin },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AppShell({
  activeSection,
  onSelectSection,
  userProfile,
  vehicles,
  activeVehicle,
  onSelectVehicle,
  unreadNotifications,
  isDemoSession,
  isAdmin,
  onLogout,
  onPromptSignIn,
  children,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = isAdmin
    ? [...PRIMARY_NAV, { id: 'admin', label: 'Admin Console', icon: ShieldCheck }]
    : PRIMARY_NAV;

  const mobileTabs: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'connect', label: 'Connect', icon: Bluetooth },
    { id: 'diagnostics', label: 'Scan', icon: Search },
    { id: 'health', label: 'Health', icon: Activity },
  ];

  const handleNav = (id: AppSection) => {
    onSelectSection(id);
    setMobileMenuOpen(false);
  };

  const activeTitle = navItems.find((n) => n.id === activeSection)?.label ?? 'AutoSense';

  return (
    <div className="min-h-screen bg-[#060A13] text-slate-100 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#0B1120] border-r border-slate-800/90 z-30">
        <div className="h-16 px-5 flex items-center border-b border-slate-800/80">
          <AutoSenseLogo size="md" />
        </div>

        {/* Active Vehicle Selector */}
        <div className="p-4 border-b border-slate-800/80">
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
            Active Vehicle
          </label>
          {vehicles.length > 0 ? (
            <select
              value={activeVehicle?.id ?? ''}
              onChange={(e) => onSelectVehicle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-slate-700 text-xs font-medium text-white focus:border-blue-500 focus:outline-none truncate"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.manufacturer} {v.model} ({v.registrationNumber})
                </option>
              ))}
            </select>
          ) : (
            <button
              type="button"
              onClick={() => handleNav('garage')}
              className="w-full px-3 py-2 rounded-lg border border-dashed border-slate-700 text-xs text-slate-300 hover:border-blue-500 hover:text-white transition-colors text-left"
            >
              + Add a vehicle to My Garage
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id === 'notifications' && unreadNotifications > 0 && (
                  <span className="text-xs font-mono font-semibold text-blue-400 tabular-nums">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Account Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={userProfile.photoUrl || '/src/assets/images/avatar_driver_default_1795018622125.jpg'}
              alt={userProfile.fullName}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userProfile.fullName}</p>
              <p className="text-[11px] text-slate-400 truncate">
                {isDemoSession ? 'Demo Session' : userProfile.email}
              </p>
            </div>
          </div>

          {isDemoSession ? (
            <button
              type="button"
              onClick={onPromptSignIn}
              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
            >
              Sign In to Save Data
            </button>
          ) : (
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log Out
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Compact Header (<15% height combined with bottom bar) */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between gap-3">
        <AutoSenseLogo size="sm" />
        <span className="text-sm font-semibold text-white truncate">{activeTitle}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleNav('notifications')}
            aria-label="Notifications"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white relative"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-2 right-2 text-[10px] font-mono font-bold text-blue-400 tabular-nums">
                {unreadNotifications}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Full Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-80 max-w-full bg-[#0B1120] border-l border-slate-800 h-full flex flex-col p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <AutoSenseLogo size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {vehicles.length > 0 && (
              <div className="py-3 border-b border-slate-800">
                <label className="block text-[11px] text-slate-400 mb-1">Active Vehicle</label>
                <select
                  value={activeVehicle?.id ?? ''}
                  onChange={(e) => onSelectVehicle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-slate-700 text-xs text-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.year} {v.manufacturer} {v.model}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium min-h-[44px] ${
                      isActive ? 'bg-blue-600/15 text-blue-400' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </span>
                    {item.id === 'notifications' && unreadNotifications > 0 && (
                      <span className="text-xs font-mono text-blue-400">{unreadNotifications}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-800">
              {isDemoSession ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onPromptSignIn();
                  }}
                  className="w-full py-2.5 rounded-lg bg-blue-600 text-sm font-semibold text-white min-h-[44px]"
                >
                  Sign In / Register
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-2.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 min-h-[44px]"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Contextual Workspace Header */}
        <div className="bg-[#0B1120]/60 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-300 min-w-0">
            <span className="font-semibold text-white whitespace-nowrap">{activeTitle}</span>
            {activeVehicle && (
              <>
                <span className="text-slate-600">/</span>
                <span className="truncate">
                  {activeVehicle.year} {activeVehicle.manufacturer} {activeVehicle.model} ·{' '}
                  <span className="font-mono">{activeVehicle.registrationNumber}</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isDemoSession && (
              <span className="text-xs font-mono font-medium text-amber-300 border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 rounded">
                DEMO DATA SESSION
              </span>
            )}
            {!isDemoSession && activeVehicle?.connectionStatus === 'demo_connected' && (
              <span className="text-xs font-mono font-medium text-blue-300 border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 rounded">
                DEMO OBD-II MODE
              </span>
            )}
          </div>
        </div>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (56px height) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-[#0B1120]/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-5 items-center"
      >
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleNav(tab.id)}
              className={`flex flex-col items-center justify-center h-full text-[11px] font-medium ${
                isActive ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center h-full text-[11px] font-medium text-slate-400"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
