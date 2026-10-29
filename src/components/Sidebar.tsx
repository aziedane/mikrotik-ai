import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Network,
  Users,
  Wifi,
  Activity,
  GitFork,
  ShieldCheck,
  Stethoscope,
  Bell,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NavPage } from '../types';

interface SidebarProps {
  currentPage: NavPage;
  setCurrentPage: (page: NavPage) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  unresolvedAlertsCount?: number;
  auditScore?: number;
  pppoeCount?: number;
  hotspotCount?: number;
}

interface MenuItem {
  id: NavPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export function Sidebar({
  currentPage,
  setCurrentPage,
  collapsed,
  setCollapsed,
  unresolvedAlertsCount = 0,
  auditScore = 88,
  pppoeCount = 0,
  hotspotCount = 0,
}: SidebarProps) {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Status & Gauges', icon: LayoutDashboard },
    { id: 'assistant', label: 'MikroTik AI', icon: Bot, badge: 'AI' },
    { id: 'monitoring', label: 'Interfaces', icon: Network },
    { id: 'pppoe', label: 'PPP (PPPoE)', icon: Users, badge: pppoeCount },
    { id: 'hotspot', label: 'Hotspot Users', icon: Wifi, badge: hotspotCount },
    { id: 'bandwidth', label: 'Queues & Traffic', icon: Activity },
    { id: 'topology', label: 'Topology', icon: GitFork },
    { id: 'audit', label: 'Security Audit', icon: ShieldCheck, badge: `${auditScore}` },
    { id: 'diagnostics', label: 'Diagnostics', icon: Stethoscope },
    { id: 'alerts', label: 'Logs & Alerts', icon: Bell, badge: unresolvedAlertsCount > 0 ? unresolvedAlertsCount : undefined },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden lg:flex sticky top-14 bottom-0 z-20 h-[calc(100vh-3.5rem)] flex-col justify-between border-r transition-all duration-200 bg-slate-950/95 border-slate-800/80 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-mono transition-all relative ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />

              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!collapsed && item.badge !== undefined && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isActive
                      ? 'bg-cyan-500/25 text-cyan-300'
                      : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Desktop Collapse Button */}
      <div className="p-2 border-t border-slate-800/80">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded-xl text-xs text-slate-500 hover:text-slate-200 hover:bg-slate-900 transition-colors"
          title={collapsed ? 'Perluas menu' : 'Ciutkan menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
