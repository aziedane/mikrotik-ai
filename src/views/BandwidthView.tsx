import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  Clock,
  Router,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Gauge,
} from 'lucide-react';
import { MonitoringPoint } from '../types';
import { api } from '../services/api';
import { TrafficChart } from '../components/TrafficChart';

export function BandwidthView() {
  const [range, setRange] = useState<'5m' | '15m' | '1h' | '24h'>('1h');
  const [selectedRouter, setSelectedRouter] = useState<'all' | 'router-1' | 'router-2'>('all');
  const [history, setHistory] = useState<MonitoringPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await api.getMonitoringHistory(range);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  const currentPoint = history.length > 0 ? history[history.length - 1] : null;

  let currentDownMbps = 0;
  let currentUpMbps = 0;
  let allDown: number[] = [];
  let allUp: number[] = [];

  if (selectedRouter === 'all') {
    currentDownMbps = currentPoint?.totalDownloadMbps || 0;
    currentUpMbps = currentPoint?.totalUploadMbps || 0;
    allDown = history.map((h) => h.totalDownloadMbps);
    allUp = history.map((h) => h.totalUploadMbps);
  } else if (selectedRouter === 'router-1') {
    currentDownMbps = currentPoint?.router1.downloadMbps || 0;
    currentUpMbps = currentPoint?.router1.uploadMbps || 0;
    allDown = history.map((h) => h.router1.downloadMbps);
    allUp = history.map((h) => h.router1.uploadMbps);
  } else {
    currentDownMbps = currentPoint?.router2.downloadMbps || 0;
    currentUpMbps = currentPoint?.router2.uploadMbps || 0;
    allDown = history.map((h) => h.router2.downloadMbps);
    allUp = history.map((h) => h.router2.uploadMbps);
  }

  const peakDown = allDown.length > 0 ? Math.max(...allDown) : 0;
  const peakUp = allUp.length > 0 ? Math.max(...allUp) : 0;
  const avgDown = allDown.length > 0 ? (allDown.reduce((a, b) => a + b, 0) / allDown.length).toFixed(1) : '0';
  const avgUp = allUp.length > 0 ? (allUp.reduce((a, b) => a + b, 0) / allUp.length).toFixed(1) : '0';

  return (
    <div className="space-y-4 pb-20 lg:pb-6 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Bandwidth Monitor
          </h1>
          <p className="text-xs text-slate-400">Throughput real-time kedua router</p>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Control Bar: Time Range & Router Selector */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
        {/* Router Selector */}
        <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedRouter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              selectedRouter === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setSelectedRouter('router-1')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              selectedRouter === 'router-1'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Utama
          </button>
          <button
            onClick={() => setSelectedRouter('router-2')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              selectedRouter === 'router-2'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hotspot
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
          {(['5m', '15m', '1h', '24h'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                range === r
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards: Current, Peak, Average */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Current */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Saat Ini</span>
          <div className="space-y-0.5">
            <p className="font-mono font-bold text-xs sm:text-sm text-cyan-400">
              ↓ {currentDownMbps} M
            </p>
            <p className="font-mono font-bold text-xs sm:text-sm text-emerald-400">
              ↑ {currentUpMbps} M
            </p>
          </div>
        </div>

        {/* Peak */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Puncak ({range})</span>
          <div className="space-y-0.5">
            <p className="font-mono font-bold text-xs sm:text-sm text-white">
              ↓ {peakDown} M
            </p>
            <p className="font-mono font-bold text-xs sm:text-sm text-white">
              ↑ {peakUp} M
            </p>
          </div>
        </div>

        {/* Average */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Rata-Rata</span>
          <div className="space-y-0.5">
            <p className="font-mono font-bold text-xs sm:text-sm text-cyan-300">
              ↓ {avgDown} M
            </p>
            <p className="font-mono font-bold text-xs sm:text-sm text-emerald-300">
              ↑ {avgUp} M
            </p>
          </div>
        </div>
      </div>

      {/* Main Throughput Graph */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
        <TrafficChart
          data={history}
          type="bandwidth"
          height={240}
        />
      </div>
    </div>
  );
}
