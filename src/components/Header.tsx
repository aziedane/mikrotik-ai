import React, { useState } from 'react';
import {
  RefreshCw,
  Sun,
  Moon,
  ChevronDown,
  Grid,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { DemoBadge } from './Badges';
import { RouterSummary } from '../types';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isDemo: boolean;
  isOnline?: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
  currentRouterId: 'router-1' | 'router-2';
  setCurrentRouterId: (id: 'router-1' | 'router-2') => void;
  openMenuDrawer: () => void;
  routers?: RouterSummary[];
}

export function Header({
  darkMode,
  setDarkMode,
  isDemo,
  isOnline = false,
  onRefresh,
  isRefreshing,
  lastUpdated,
  currentRouterId,
  setCurrentRouterId,
  openMenuDrawer,
  routers,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--';

  const r1Summary = routers?.find((r) => r.id === 'router-1');
  const r2Summary = routers?.find((r) => r.id === 'router-2');

  const r1Online = r1Summary?.status === 'online';
  const r2Online = r2Summary?.status === 'online';

  const routerDetails = {
    'router-1': {
      name: r1Summary?.name || 'MikroTik Utama',
      role: r1Summary?.role || 'PPPoE Gateway',
      ip: r1Summary?.ip || '192.168.1.1',
      model: r1Summary?.model || 'MikroTik',
      version: r1Summary?.version || 'RouterOS v7',
      status: r1Summary?.status || 'offline',
      isOnline: r1Online,
    },
    'router-2': {
      name: r2Summary?.name || 'MikroTik Hotspot',
      role: r2Summary?.role || 'Hotspot Gateway',
      ip: r2Summary?.ip || '192.168.88.1',
      model: r2Summary?.model || 'MikroTik',
      version: r2Summary?.version || 'RouterOS v7',
      status: r2Summary?.status || 'offline',
      isOnline: r2Online,
    },
  };

  const active = routerDetails[currentRouterId];

  return (
    <header className="sticky top-0 z-30 h-14 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between select-none">
      {/* Left side: Router Identity with Android Switcher */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-left"
        >
          {/* Router running flag [R] badge */}
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold font-mono text-xs shrink-0 transition-colors ${
              active.isOnline
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
            }`}
          >
            [R]
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-white tracking-tight truncate">
                {active.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className={active.isOnline ? 'text-cyan-400 font-medium' : 'text-rose-400 font-medium'}>
                {active.ip}
              </span>
              <span>•</span>
              <span className="text-slate-400">{active.model}</span>
              <span className="hidden sm:inline text-slate-500">
                • {active.isOnline ? active.version : 'Terputus'}
              </span>
            </div>
          </div>
        </button>

        {/* Router Switcher Dropdown (Android style) */}
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute left-0 top-full mt-1.5 z-50 w-72 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Pilih Router Aktif
              </div>

              {/* Option 1: Router Utama */}
              <button
                onClick={() => {
                  setCurrentRouterId('router-1');
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                  currentRouterId === 'router-1'
                    ? 'bg-cyan-500/15 border border-cyan-500/30 text-white'
                    : 'hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      r1Online ? 'bg-emerald-400' : 'bg-rose-500'
                    }`}
                  />
                  <div>
                    <p className="text-xs font-bold text-white">MikroTik Utama</p>
                    <p className="text-[10px] font-mono text-slate-400">
                      <span className={r1Online ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {r1Online ? 'Online' : 'Terputus'}
                      </span>{' '}
                      • {r1Summary?.ip || '192.168.1.1'}
                    </p>
                  </div>
                </div>
                {currentRouterId === 'router-1' && <Check className="w-4 h-4 text-cyan-400" />}
              </button>

              {/* Option 2: Router Hotspot */}
              <button
                onClick={() => {
                  setCurrentRouterId('router-2');
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                  currentRouterId === 'router-2'
                    ? 'bg-cyan-500/15 border border-cyan-500/30 text-white'
                    : 'hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      r2Online ? 'bg-emerald-400' : 'bg-rose-500'
                    }`}
                  />
                  <div>
                    <p className="text-xs font-bold text-white">MikroTik Hotspot</p>
                    <p className="text-[10px] font-mono text-slate-400">
                      <span className={r2Online ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {r2Online ? 'Online' : 'Terputus'}
                      </span>{' '}
                      • {r2Summary?.ip || '192.168.88.1'}
                    </p>
                  </div>
                </div>
                {currentRouterId === 'router-2' && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right side: Quick status, Refresh, Drawer & Theme */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <DemoBadge isDemo={isDemo} isOnline={isOnline} />

        {/* Read Only Badge (Compact) */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 font-mono">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          <span>RO</span>
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          title="Segarkan data router"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span className="hidden md:inline font-mono text-[11px]">{isRefreshing ? 'Sync...' : formattedTime}</span>
        </button>

        {/* Menu Grid Button (Desktop & Mobile quick access) */}
        <button
          onClick={openMenuDrawer}
          className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          title="RouterOS Menu"
        >
          <Grid className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>
      </div>
    </header>
  );
}
