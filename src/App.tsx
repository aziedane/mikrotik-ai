import React, { useState, useEffect } from 'react';
import { NavPage, SystemStatusResponse, MonitoringPoint, AlertItem } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { RouterOSMenuDrawer } from './components/RouterOSMenuDrawer';
import { DashboardView } from './views/DashboardView';
import { AssistantView } from './views/AssistantView';
import { MonitoringView } from './views/MonitoringView';
import { PppoeView } from './views/PppoeView';
import { HotspotView } from './views/HotspotView';
import { BandwidthView } from './views/BandwidthView';
import { TopologyView } from './views/TopologyView';
import { AuditView } from './views/AuditView';
import { DiagnosticsView } from './views/DiagnosticsView';
import { AlertsView } from './views/AlertsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [currentRouterId, setCurrentRouterId] = useState<'router-1' | 'router-2'>('router-1');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState<boolean>(false);

  const [status, setStatus] = useState<SystemStatusResponse | null>(null);
  const [history, setHistory] = useState<MonitoringPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      const [statusRes, historyRes, alertsRes] = await Promise.all([
        api.getSystemStatus(),
        api.getMonitoringHistory('1h'),
        api.getAlerts(),
      ]);
      setStatus(statusRes);
      setHistory(historyRes.data);
      setAlerts(alertsRes.alerts);
      setIsDemo(statusRes.isDemo);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const activeRouterInfo = {
    'router-1': { name: 'MikroTik Utama', ip: '192.168.1.1' },
    'router-2': { name: 'MikroTik Hotspot', ip: '192.168.88.1' },
  }[currentRouterId];

  const isCurrentRouterOnline = status?.routers?.find((r) => r.id === currentRouterId)?.status === 'online';
  const pppoeCount = status?.routers?.find((r) => r.id === 'router-1')?.activeSessions ?? 0;
  const hotspotCount = status?.routers?.find((r) => r.id === 'router-2')?.activeSessions ?? 0;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* MikroTik Android App Bar */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isDemo={isDemo}
        isOnline={isCurrentRouterOnline}
        routers={status?.routers}
        onRefresh={refreshAllData}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        currentRouterId={currentRouterId}
        setCurrentRouterId={setCurrentRouterId}
        openMenuDrawer={() => setMenuDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          unresolvedAlertsCount={status?.alertsSummary?.totalUnresolved ?? 0}
          auditScore={isCurrentRouterOnline ? 88 : 0}
          pppoeCount={pppoeCount}
          hotspotCount={hotspotCount}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto max-w-full">
          {currentPage === 'dashboard' && (
            <DashboardView
              status={status}
              history={history}
              alerts={alerts}
              onNavigate={(page) => setCurrentPage(page)}
              onRefresh={refreshAllData}
              isRefreshing={isRefreshing}
              currentRouterId={currentRouterId}
            />
          )}

          {currentPage === 'assistant' && (
            <AssistantView
              isDemo={isDemo}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'monitoring' && <MonitoringView />}

          {currentPage === 'pppoe' && (
            <PppoeView onNavigate={(page) => setCurrentPage(page)} />
          )}

          {currentPage === 'hotspot' && (
            <HotspotView onNavigate={(page) => setCurrentPage(page)} />
          )}

          {currentPage === 'bandwidth' && <BandwidthView />}

          {currentPage === 'topology' && <TopologyView />}

          {currentPage === 'audit' && <AuditView />}

          {currentPage === 'diagnostics' && <DiagnosticsView />}

          {currentPage === 'alerts' && <AlertsView />}

          {currentPage === 'reports' && <ReportsView />}

          {currentPage === 'settings' && (
            <SettingsView
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              isDemo={isDemo}
              setIsDemo={setIsDemo}
              onRefresh={refreshAllData}
              status={status}
            />
          )}
        </main>
      </div>

      {/* Android Bottom Navigation Bar (Mobile) */}
      <BottomNav
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        openDrawer={() => setMenuDrawerOpen(true)}
        pppoeCount={pppoeCount}
        hotspotCount={hotspotCount}
      />

      {/* Full RouterOS Modules Menu Drawer */}
      <RouterOSMenuDrawer
        isOpen={menuDrawerOpen}
        onClose={() => setMenuDrawerOpen(false)}
        currentPage={currentPage}
        onSelectPage={(page) => setCurrentPage(page)}
        currentRouterName={activeRouterInfo.name}
        currentRouterIp={activeRouterInfo.ip}
        isOnline={isCurrentRouterOnline}
        routers={status?.routers}
      />
    </div>
  );
}
