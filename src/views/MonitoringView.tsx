import React, { useState, useEffect } from 'react';
import {
  Network,
  RefreshCw,
  Search,
  ArrowDown,
  ArrowUp,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';
import { RouterResource, RouterInterface } from '../types';
import { api } from '../services/api';
import { formatBps } from '../components/Badges';

export function MonitoringView() {
  const [selectedRouterId, setSelectedRouterId] = useState<'router-1' | 'router-2'>('router-1');
  const [interfaces, setInterfaces] = useState<RouterInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'running' | 'ethernet'>('all');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const ifaces = await api.getRouterInterfaces(selectedRouterId);
      setInterfaces(ifaces.interfaces);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRouterId]);

  const filteredInterfaces = interfaces.filter((iface) => {
    const matchesSearch =
      iface.name.toLowerCase().includes(search.toLowerCase()) ||
      (iface.comment && iface.comment.toLowerCase().includes(search.toLowerCase())) ||
      (iface.ipAddress && iface.ipAddress.includes(search));

    if (filterType === 'running') return matchesSearch && iface.running;
    if (filterType === 'ethernet') return matchesSearch && iface.type === 'ether';
    return matchesSearch;
  });

  const isR1 = selectedRouterId === 'router-1';

  return (
    <div className="space-y-3.5 max-w-5xl mx-auto pb-20 lg:pb-6 select-none">
      {/* Top Router & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setSelectedRouterId('router-1')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              isR1
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isR1 ? 'bg-slate-950' : 'bg-emerald-400'}`} />
            <span>Utama (PPPoE)</span>
          </button>
          <button
            onClick={() => setSelectedRouterId('router-2')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              !isR1
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${!isR1 ? 'bg-slate-950' : 'bg-emerald-400'}`} />
            <span>Hotspot</span>
          </button>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="p-1.5 px-3 rounded-xl text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{refreshing ? 'Sync...' : 'Segarkan'}</span>
        </button>
      </div>

      {/* Filter and Search Bar (Android Style) */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap sm:flex-nowrap gap-2 items-center justify-between">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari interface atau IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              filterType === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                : 'text-slate-400 border-transparent hover:bg-slate-800'
            }`}
          >
            Semua ({interfaces.length})
          </button>
          <button
            onClick={() => setFilterType('running')}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              filterType === 'running'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                : 'text-slate-400 border-transparent hover:bg-slate-800'
            }`}
          >
            Running [R]
          </button>
          <button
            onClick={() => setFilterType('ethernet')}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              filterType === 'ethernet'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold'
                : 'text-slate-400 border-transparent hover:bg-slate-800'
            }`}
          >
            Ethernet
          </button>
        </div>
      </div>

      {/* Interfaces List (MikroTik Android App Card List) */}
      <div className="space-y-2">
        {filteredInterfaces.map((iface) => (
          <div
            key={iface.id}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2"
          >
            {/* Top Row: Flags + Name + Live Throughput */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* RouterOS flags: [R] Running, [D] Dynamic, [X] Disabled */}
                <div className="flex items-center gap-0.5 font-mono text-[10px] font-bold">
                  {iface.running ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      R
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700">
                      X
                    </span>
                  )}
                  {iface.type === 'ether' && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      E
                    </span>
                  )}
                </div>

                <div className="truncate">
                  <span className="font-bold text-xs sm:text-sm text-white">
                    {iface.name}
                  </span>
                  {iface.comment && (
                    <span className="text-[10px] text-slate-400 ml-2 font-mono truncate">
                      ({iface.comment})
                    </span>
                  )}
                </div>
              </div>

              {/* Live RX/TX Badges */}
              <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                  <ArrowDown className="w-3 h-3" />
                  {formatBps(iface.rxBps)}
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3" />
                  {formatBps(iface.txBps)}
                </span>
              </div>
            </div>

            {/* Bottom Meta Row: IP, MTU, Link status, MAC */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/60">
              <div className="flex items-center gap-3">
                <span className="text-slate-300">
                  IP: <span className="text-cyan-400 font-semibold">{iface.ipAddress || 'None'}</span>
                </span>
                <span>MTU: {iface.mtu}</span>
                <span className="hidden sm:inline">MAC: {iface.macAddress}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={iface.running ? 'text-emerald-400' : 'text-slate-500'}>
                  {iface.running ? '1 Gbps Full Duplex' : 'Link Down'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredInterfaces.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-mono">
            Tidak ada interface yang sesuai dengan filter pencarian.
          </div>
        )}
      </div>
    </div>
  );
}
