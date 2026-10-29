import React from 'react';
import {
  Network,
  Users,
  Wifi,
  Activity,
  ShieldCheck,
  Stethoscope,
  Bell,
  Bot,
  ArrowDown,
  ArrowUp,
  Cpu,
  HardDrive,
  Clock,
  Thermometer,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { SystemStatusResponse, MonitoringPoint, AlertItem, NavPage } from '../types';
import { TrafficChart } from '../components/TrafficChart';
import { CircularGauge } from '../components/Gauges';

interface DashboardViewProps {
  status: SystemStatusResponse | null;
  history: MonitoringPoint[];
  alerts: AlertItem[];
  onNavigate: (page: NavPage) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  currentRouterId?: 'router-1' | 'router-2';
}

export function DashboardView({
  status,
  history,
  alerts,
  onNavigate,
  currentRouterId = 'router-1',
}: DashboardViewProps) {
  const activeRouter =
    status?.routers?.find((r) => r.id === currentRouterId) ||
    status?.routers?.[0];

  const isOnline = activeRouter?.status === 'online';
  const cpuVal = isOnline ? (activeRouter?.cpu ?? 0) : 0;
  const ramVal = isOnline ? (activeRouter?.ramUsedPercent ?? 0) : 0;
  const hddVal = isOnline ? (activeRouter?.hddUsedPercent ?? 0) : 0;

  const downloadSpeed = status?.bandwidthSummary?.totalDownloadMbps ?? 0;
  const uploadSpeed = status?.bandwidthSummary?.totalUploadMbps ?? 0;

  // Android RouterOS Module Grid Tiles
  const moduleTiles = [
    {
      id: 'monitoring' as NavPage,
      title: 'Interfaces',
      subtitle: isOnline ? 'Running [R]' : 'Terputus',
      badge: '[R]',
      badgeColor: isOnline ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700',
      icon: Network,
      iconColor: 'text-cyan-400 bg-cyan-500/10',
    },
    {
      id: 'pppoe' as NavPage,
      title: 'PPP Clients',
      subtitle: `${status?.routers?.find((r) => r.id === 'router-1')?.activeSessions ?? 0} Sesi Aktif`,
      badge: `${status?.routers?.find((r) => r.id === 'router-1')?.activeSessions ?? 0}`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: Users,
      iconColor: 'text-blue-400 bg-blue-500/10',
    },
    {
      id: 'hotspot' as NavPage,
      title: 'Hotspot Users',
      subtitle: `${status?.routers?.find((r) => r.id === 'router-2')?.activeSessions ?? 0} Pengguna Aktif`,
      badge: `${status?.routers?.find((r) => r.id === 'router-2')?.activeSessions ?? 0}`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Wifi,
      iconColor: 'text-amber-400 bg-amber-500/10',
    },
    {
      id: 'bandwidth' as NavPage,
      title: 'Queues & Bandwidth',
      subtitle: `${downloadSpeed} / ${uploadSpeed} Mbps`,
      badge: isOnline ? 'Live' : 'Off',
      badgeColor: isOnline ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700',
      icon: Activity,
      iconColor: 'text-purple-400 bg-purple-500/10',
    },
    {
      id: 'assistant' as NavPage,
      title: 'MikroTik AI',
      subtitle: 'Audit & Rekomendasi',
      badge: 'AI',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: Bot,
      iconColor: 'text-cyan-400 bg-cyan-500/10',
    },
    {
      id: 'audit' as NavPage,
      title: 'Network Audit',
      subtitle: isOnline ? 'Skor Keamanan 88/100' : 'Router Offline',
      badge: isOnline ? '88' : '0',
      badgeColor: isOnline ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      id: 'diagnostics' as NavPage,
      title: 'Diagnostics',
      subtitle: isOnline ? 'REST API OK' : 'Check IP Router',
      badge: isOnline ? 'Normal' : 'Offline',
      badgeColor: isOnline ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: Stethoscope,
      iconColor: 'text-sky-400 bg-sky-500/10',
    },
    {
      id: 'alerts' as NavPage,
      title: 'Logs & Alerts',
      subtitle: `${status?.alertsSummary?.totalUnresolved || 0} Perlu Review`,
      badge: `${status?.alertsSummary?.totalUnresolved || 0}`,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: Bell,
      iconColor: 'text-rose-400 bg-rose-500/10',
    },
  ];

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-20 lg:pb-6 select-none">
      {/* 1. Android Circular Hardware Gauges Section */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <CircularGauge
          value={cpuVal}
          title="CPU"
          subtitle={isOnline ? `${activeRouter?.cpuCount || 4}-Core @ ${activeRouter?.cpuFrequency || 716}MHz` : 'Router Terputus'}
          unit="%"
          warningThreshold={75}
          criticalThreshold={90}
        />
        <CircularGauge
          value={ramVal}
          title="RAM"
          subtitle={isOnline ? `${activeRouter?.freeMemoryMb ?? 0}MB Free` : 'Belum Terhubung'}
          unit="%"
          warningThreshold={80}
          criticalThreshold={95}
        />
        <CircularGauge
          value={hddVal}
          title="NAND Disk"
          subtitle={isOnline ? `${activeRouter?.freeHddMb ?? 0}MB Free` : 'Belum Terhubung'}
          unit="%"
          warningThreshold={85}
          criticalThreshold={95}
        />
      </div>

      {/* 2. System Hardware Specs Strip (Android Style) */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400 overflow-x-auto gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>UP: {isOnline ? (activeRouter?.uptime || '0s') : 'Offline'}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isOnline ? '42°C' : '--'}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{isOnline ? '24.2V' : '--'}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <span className="text-slate-400">Board:</span>
          <span className="text-slate-200 font-semibold">{isOnline ? (activeRouter?.model || 'MikroTik') : '--'}</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <span className="text-slate-400">Arch:</span>
          <span className="text-slate-200 font-semibold">{isOnline ? (activeRouter?.architectureName || 'arm') : '--'}</span>
        </div>
      </div>

      {/* 3. Live Interface Traffic Card */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="font-bold text-xs sm:text-sm text-white">
              {isOnline ? 'Trafik Live • ether1 (WAN)' : 'REST API Terputus • ether1 (WAN)'}
            </span>
          </div>

          {/* TX & RX Speed Chips */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
              <ArrowDown className="w-3 h-3" />
              <span className="font-bold">{downloadSpeed}</span>
              <span className="text-[10px] text-slate-400">Mbps</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              <ArrowUp className="w-3 h-3" />
              <span className="font-bold">{uploadSpeed}</span>
              <span className="text-[10px] text-slate-400">Mbps</span>
            </div>
          </div>
        </div>

        {/* Real-time traffic chart */}
        <TrafficChart data={history} type="bandwidth" height={190} />
      </div>

      {/* 4. RouterOS Mobile Modules Grid (Icon Tiles) */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Menu RouterOS
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {activeRouter?.name || 'MikroTik'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {moduleTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => onNavigate(tile.id)}
                className="flex flex-col justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 text-left transition-all active:scale-[0.98]"
              >
                <div className="flex items-start justify-between w-full mb-2">
                  <div className={`p-2 rounded-xl ${tile.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold ${tile.badgeColor}`}
                  >
                    {tile.badge}
                  </span>
                </div>

                <div>
                  <div className="font-bold text-xs text-white truncate">{tile.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {tile.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Recent RouterOS Log Feed (Winbox / Android Log format) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-xs text-white">Log Sistem Terakhir</span>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5"
          >
            Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1 font-mono text-xs">
          {alerts.slice(0, 4).map((log) => (
            <div
              key={log.id}
              className="py-1.5 px-2 rounded-lg hover:bg-slate-800/60 flex items-center justify-between gap-2 border-b border-slate-800/40 last:border-none"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                    log.level === 'critical'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : log.level === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-slate-300 text-[11px] truncate">{log.title}</span>
              </div>

              <span className="text-[10px] text-slate-400 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
