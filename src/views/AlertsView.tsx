import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Save,
  Filter,
} from 'lucide-react';
import { AlertItem, AlertThresholds } from '../types';
import { api } from '../services/api';

export function AlertsView() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    cpuWarning: 75,
    cpuCritical: 90,
    ramWarning: 80,
    ramCritical: 95,
    bandwidthSpikeMbps: 90,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [filterLevel, setFilterLevel] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const fetchAlerts = async () => {
    try {
      const res = await api.getAlerts();
      setAlerts(res.alerts);
      setThresholds(res.thresholds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateThresholds(thresholds);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredAlerts = alerts.filter(
    (a) => filterLevel === 'all' || a.level === filterLevel
  );

  return (
    <div className="space-y-4 pb-20 lg:pb-6 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Event &amp; Alerts
          </h1>
          <p className="text-xs text-slate-400">Log insiden dan ambang batas</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterLevel}
            onChange={(e: any) => setFilterLevel(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1 text-xs focus:outline-hidden"
          >
            <option value="all">Semua ({alerts.length})</option>
            <option value="critical">Kritis</option>
            <option value="warning">Peringatan</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alerts List (2 cols) */}
        <div className="lg:col-span-2 space-y-2">
          {filteredAlerts.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      item.level === 'critical'
                        ? 'bg-rose-400'
                        : item.level === 'warning'
                        ? 'bg-amber-400'
                        : 'bg-cyan-400'
                    }`}
                  />
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {new Date(item.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pl-4 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Threshold Form (1 col) */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="text-xs font-bold text-white">Ambang Batas Alert</h3>
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-0.5">
                <span className="text-slate-400">CPU Peringatan</span>
                <span className="font-mono text-cyan-400 font-bold">{thresholds.cpuWarning}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={thresholds.cpuWarning}
                onChange={(e) => setThresholds({ ...thresholds, cpuWarning: Number(e.target.value) })}
                className="w-full accent-cyan-500 bg-slate-950 rounded h-1"
              />
            </div>

            <div>
              <div className="flex justify-between mb-0.5">
                <span className="text-slate-400">CPU Kritis</span>
                <span className="font-mono text-rose-400 font-bold">{thresholds.cpuCritical}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="99"
                value={thresholds.cpuCritical}
                onChange={(e) => setThresholds({ ...thresholds, cpuCritical: Number(e.target.value) })}
                className="w-full accent-rose-500 bg-slate-950 rounded h-1"
              />
            </div>

            <div>
              <div className="flex justify-between mb-0.5">
                <span className="text-slate-400">RAM Peringatan</span>
                <span className="font-mono text-blue-400 font-bold">{thresholds.ramWarning}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                value={thresholds.ramWarning}
                onChange={(e) => setThresholds({ ...thresholds, ramWarning: Number(e.target.value) })}
                className="w-full accent-blue-500 bg-slate-950 rounded h-1"
              />
            </div>

            <div>
              <div className="flex justify-between mb-0.5">
                <span className="text-slate-400">Spike WAN (Mbps)</span>
                <span className="font-mono text-amber-400 font-bold">{thresholds.bandwidthSpikeMbps}M</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={thresholds.bandwidthSpikeMbps}
                onChange={(e) => setThresholds({ ...thresholds, bandwidthSpikeMbps: Number(e.target.value) })}
                className="w-full accent-amber-500 bg-slate-950 rounded h-1"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-3 h-3" />
              <span>{saving ? 'Simpan...' : 'Terapkan'}</span>
            </button>

            {saveSuccess && (
              <p className="text-[10px] text-emerald-400 text-center font-mono">
                Tersimpan di backend.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
