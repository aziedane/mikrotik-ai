import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  Clock,
  Wifi,
} from 'lucide-react';
import { PppoeClient, NavPage } from '../types';
import { api } from '../services/api';
import { formatBytes, formatBps } from '../components/Badges';

interface PppoeViewProps {
  onNavigate?: (page: NavPage) => void;
}

export function PppoeView({ onNavigate }: PppoeViewProps) {
  const [clients, setClients] = useState<PppoeClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'warning'>('all');
  const [unmaskAll, setUnmaskAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClients = async () => {
    try {
      setRefreshing(true);
      const res = await api.getPppoeClients('router-1');
      setClients(res.clients);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.includes(search) ||
      c.callerId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-3.5 max-w-5xl mx-auto pb-20 lg:pb-6 select-none">
      {/* Top Segmented Tab Switcher (PPPoE vs Hotspot) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-mono">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold"
          >
            <Users className="w-3.5 h-3.5" />
            <span>PPPoE Aktif ({clients.length})</span>
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate('hotspot')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Hotspot</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setUnmaskAll(!unmaskAll)}
            className={`p-1.5 px-2.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
              unmaskAll
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Sensor / Buka Nama Klien"
          >
            {unmaskAll ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{unmaskAll ? 'Sensor' : 'Buka'}</span>
          </button>

          <button
            onClick={fetchClients}
            disabled={refreshing}
            className="p-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{refreshing ? 'Sync...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap sm:flex-nowrap gap-2 items-center justify-between">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari user, IP (10.10.20.x), Caller ID..."
            className="w-full bg-slate-950 text-slate-200 pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              statusFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                : 'text-slate-400 border-transparent hover:bg-slate-800'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter('connected')}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              statusFilter === 'connected'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                : 'text-slate-400 border-transparent hover:bg-slate-800'
            }`}
          >
            Online [R]
          </button>
          <button
            onClick={() => setStatusFilter('warning')}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              statusFilter === 'warning'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                : 'text-slate-400 border-transparent hover:bg-slate-800'
            }`}
          >
            Flapping
          </button>
        </div>
      </div>

      {/* Client List (MikroTik Android App Card Rows) */}
      <div className="space-y-2 font-mono">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2"
          >
            {/* Top Row: [R] [D] Flags + Client Username + Current RX Rate */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-0.5 text-[10px] font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    R
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    D
                  </span>
                </div>

                <div className="truncate">
                  <span className="font-bold text-xs sm:text-sm text-white">
                    {unmaskAll ? client.name : client.maskedName}
                  </span>
                  <span className="text-[10px] text-cyan-400 ml-2 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {client.profile}
                  </span>
                </div>
              </div>

              {/* Current Bandwidth */}
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-cyan-400">
                  {formatBps(client.rxRateBps)}
                </span>
              </div>
            </div>

            {/* Bottom Meta Row: IP, Uptime, Transfer Stats */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60">
              <div className="flex items-center gap-3">
                <span className="text-slate-300">
                  IP: <span className="text-cyan-400">{client.address}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {client.uptime}
                </span>
                <span className="hidden sm:inline text-slate-500">
                  MAC: {client.callerId}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-cyan-400">↓ {formatBytes(client.rxBytes)}</span>
                <span className="text-emerald-400">↑ {formatBytes(client.txBytes)}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
            Tidak ada klien PPPoE yang cocok dengan filter pencarian.
          </div>
        )}
      </div>
    </div>
  );
}
