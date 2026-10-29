import React from 'react';
import {
  X,
  LayoutDashboard,
  Network,
  Users,
  Wifi,
  Bot,
  Activity,
  GitFork,
  ShieldCheck,
  Stethoscope,
  Bell,
  FileText,
  Settings,
  Server,
} from 'lucide-react';
import { NavPage, RouterSummary } from '../types';

interface RouterOSMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  currentRouterName?: string;
  currentRouterIp?: string;
  isOnline?: boolean;
  routers?: RouterSummary[];
}

interface MenuModule {
  id: NavPage;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
}

export function RouterOSMenuDrawer({
  isOpen,
  onClose,
  currentPage,
  onSelectPage,
  currentRouterName = 'MikroTik Utama',
  currentRouterIp = '192.168.1.1',
  isOnline = false,
  routers,
}: RouterOSMenuDrawerProps) {
  if (!isOpen) return null;

  const r1 = routers?.find((r) => r.id === 'router-1');
  const r2 = routers?.find((r) => r.id === 'router-2');

  const pppoeActive = r1?.activeSessions ?? 0;
  const hotspotActive = r2?.activeSessions ?? 0;

  const modules: { category: string; items: MenuModule[] }[] = [
    {
      category: 'Utama & AI',
      items: [
        {
          id: 'dashboard',
          label: 'Status & Gauges',
          sublabel: 'CPU, RAM, Live Traffic',
          icon: LayoutDashboard,
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        },
        {
          id: 'assistant',
          label: 'MikroTik AI Assistant',
          sublabel: 'Audit, Diagnostik & Solusi',
          icon: Bot,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          badge: 'AI Engine',
        },
      ],
    },
    {
      category: 'Interfaces & Akses Klien',
      items: [
        {
          id: 'monitoring',
          label: 'Interfaces',
          sublabel: isOnline ? 'ether1-5, SFP, Bridge [R]' : 'Router API Terputus',
          icon: Network,
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        },
        {
          id: 'pppoe',
          label: 'PPP (PPPoE Clients)',
          sublabel: isOnline ? `${pppoeActive} Sesi Aktif` : 'API Terputus',
          icon: Users,
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          badge: `${pppoeActive}`,
        },
        {
          id: 'hotspot',
          label: 'Hotspot Users',
          sublabel: isOnline ? `${hotspotActive} Pengguna Voucher` : 'API Terputus',
          icon: Wifi,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          badge: `${hotspotActive}`,
        },
        {
          id: 'bandwidth',
          label: 'Queues & Bandwidth',
          sublabel: isOnline ? 'Throughput Live RX/TX' : 'Offline',
          icon: Activity,
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        },
      ],
    },
    {
      category: 'Network & Security',
      items: [
        {
          id: 'topology',
          label: 'Network Topology',
          sublabel: 'Dual Gateway + STB Host',
          icon: GitFork,
          color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        },
        {
          id: 'audit',
          label: 'Security & Audit',
          sublabel: isOnline ? 'Skor Keamanan 88/100' : 'Router Offline',
          icon: ShieldCheck,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          badge: isOnline ? '88' : '0',
        },
        {
          id: 'diagnostics',
          label: 'Tools & Diagnostics',
          sublabel: 'Ping, DNS, Latency',
          icon: Stethoscope,
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
        },
        {
          id: 'alerts',
          label: 'Log & Event Alerts',
          sublabel: 'Peringatan Sistem',
          icon: Bell,
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        },
      ],
    },
    {
      category: 'System',
      items: [
        {
          id: 'reports',
          label: 'Laporan Jaringan',
          sublabel: 'Ekspor PDF, SLA, CSV',
          icon: FileText,
          color: 'text-slate-400 bg-slate-800 border-slate-700',
        },
        {
          id: 'settings',
          label: 'RouterOS & API Settings',
          sublabel: 'Kredensial, Mode REST, Host',
          icon: Settings,
          color: 'text-slate-400 bg-slate-800 border-slate-700',
        },
      ],
    },
  ];

  const handleSelect = (id: NavPage) => {
    onSelectPage(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:justify-center lg:items-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative z-10 w-full lg:max-w-xl max-h-[88vh] bg-slate-950 border border-slate-800 rounded-t-3xl lg:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{currentRouterName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border ${
                    isOnline
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                  }`}
                >
                  [R] {isOnline ? 'v7.20.4' : 'Offline'}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">{currentRouterIp} • RouterOS Menu</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {modules.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                {group.category}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200 shadow-sm'
                          : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg border shrink-0 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-xs truncate text-white">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {item.sublabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info strip */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            STB Armbian • {isOnline ? 'RouterOS REST Online' : 'REST API Terputus'}
          </span>
          <span className="font-mono text-slate-400">RouterOS v7.20.4</span>
        </div>
      </div>
    </div>
  );
}
