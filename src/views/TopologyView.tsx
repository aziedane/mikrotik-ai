import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Globe,
  Router,
  Wifi,
  Users,
  Server,
  RefreshCw,
  Info,
} from 'lucide-react';
import { api } from '../services/api';

interface TopologyNode {
  id: string;
  label: string;
  role: string;
  deviceType: string;
  ip: string;
  status: 'online' | 'warning' | 'offline';
  latency: string;
  traffic: string;
  details: Record<string, string>;
}

export function TopologyView() {
  const [nodes, setNodes] = useState<Record<string, TopologyNode> | null>(null);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTopology = async () => {
    try {
      setRefreshing(true);
      const res = await api.getTopology();
      setNodes(res.nodes);
      // Auto select Router 1 or ISP as default if nothing selected
      if (!selectedNode && res.nodes.r1) {
        setSelectedNode(res.nodes.r1);
      } else if (selectedNode && res.nodes[selectedNode.id]) {
        setSelectedNode(res.nodes[selectedNode.id]);
      }
    } catch (err) {
      console.error('Failed to fetch topology:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTopology();
  }, []);

  const getNodeBorder = (status?: 'online' | 'warning' | 'offline') => {
    if (status === 'online') return 'border-emerald-500/60 hover:border-emerald-400';
    if (status === 'warning') return 'border-amber-500/60 hover:border-amber-400';
    return 'border-rose-500/60 hover:border-rose-400';
  };

  const getNodeDot = (status?: 'online' | 'warning' | 'offline') => {
    if (status === 'online') return 'bg-emerald-400 animate-pulse';
    if (status === 'warning') return 'bg-amber-400';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-6 select-none max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            Topologi Jaringan Real-Time
          </h1>
          <p className="text-xs text-slate-400">
            Diagram arsitektur alur koneksi gateway terkonfirmasi via REST API MikroTik
          </p>
        </div>

        <button
          onClick={fetchTopology}
          disabled={refreshing}
          className="p-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 text-xs font-mono disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{refreshing ? 'Sync...' : 'Segarkan Topologi'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Diagram Canvas */}
        <div className="lg:col-span-2 p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs font-mono animate-pulse">
              Memuat data topologi riil dari router MikroTik &amp; host STB...
            </div>
          ) : nodes ? (
            <div className="flex flex-col items-center space-y-3 max-w-md mx-auto text-xs">
              {/* 1. ISP / UPLINK NODE */}
              <div
                onClick={() => setSelectedNode(nodes.isp)}
                className={`w-full p-3 rounded-2xl bg-slate-950 border ${getNodeBorder(nodes.isp.status)} cursor-pointer text-center transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-center gap-1.5 text-cyan-400 font-bold mb-0.5">
                  <Globe className="w-4 h-4" />
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${getNodeDot(nodes.isp.status)}`} />
                    {nodes.isp.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">{nodes.isp.ip} • {nodes.isp.traffic}</p>
              </div>

              <div className={`w-0.5 h-4 ${nodes.isp.status === 'online' ? 'bg-cyan-500' : 'bg-rose-500'}`} />

              {/* 2. ROUTER 1 (MIKROTIK UTAMA) */}
              <div
                onClick={() => setSelectedNode(nodes.r1)}
                className={`w-full p-3 rounded-2xl bg-slate-950 border ${getNodeBorder(nodes.r1.status)} cursor-pointer text-center transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-center gap-1.5 text-white font-bold mb-0.5">
                  <Router className="w-4 h-4 text-cyan-400" />
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${getNodeDot(nodes.r1.status)}`} />
                    {nodes.r1.label}
                  </span>
                </div>
                <p className="text-[11px] text-cyan-400 font-mono">
                  {nodes.r1.ip} • {nodes.r1.traffic}
                </p>
              </div>

              <div className="w-0.5 h-4 bg-slate-700" />

              {/* 3. BRANCHES ROW (PPPoE Clients, STB Armbian Host, Hotspot Gateway) */}
              <div className="w-full grid grid-cols-3 gap-2 text-center">
                {/* PPPoE Clients Branch */}
                <div
                  onClick={() => setSelectedNode(nodes.pppoeClients)}
                  className={`p-2.5 rounded-2xl bg-slate-950 border ${getNodeBorder(nodes.pppoeClients.status)} cursor-pointer transition-all hover:scale-[1.02]`}
                >
                  <Users className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <p className="font-bold text-white text-[11px] truncate">{nodes.pppoeClients.label}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{nodes.pppoeClients.ip}</p>
                </div>

                {/* STB Armbian Host Node */}
                <div
                  onClick={() => setSelectedNode(nodes.stb)}
                  className={`p-2.5 rounded-2xl bg-slate-950 border ${getNodeBorder(nodes.stb.status)} cursor-pointer transition-all hover:scale-[1.02]`}
                >
                  <Server className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <p className="font-bold text-white text-[11px] truncate">{nodes.stb.label}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{nodes.stb.traffic}</p>
                </div>

                {/* Router 2 (Hotspot Gateway) */}
                <div
                  onClick={() => setSelectedNode(nodes.r2)}
                  className={`p-2.5 rounded-2xl bg-slate-950 border ${getNodeBorder(nodes.r2.status)} cursor-pointer transition-all hover:scale-[1.02]`}
                >
                  <Wifi className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <p className="font-bold text-white text-[11px] truncate">{nodes.r2.label}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{nodes.r2.ip}</p>
                </div>
              </div>

              {/* 4. HOTSPOT USERS SUB-BRANCH */}
              <div className="w-full flex justify-end">
                <div
                  onClick={() => setSelectedNode(nodes.hotspotAps)}
                  className={`w-1/3 p-2 rounded-xl bg-slate-950 border ${getNodeBorder(nodes.hotspotAps.status)} cursor-pointer text-center transition-all hover:scale-[1.02]`}
                >
                  <p className="text-[10px] font-bold text-amber-300 truncate">{nodes.hotspotAps.label}</p>
                  <p className="text-[9px] text-slate-400 font-mono">{nodes.hotspotAps.ip}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-rose-400 text-xs font-mono">
              Gagal memuat data topologi dari server.
            </div>
          )}
        </div>

        {/* Node Detail Drawer */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Detail Perangkat Selected
              </span>
              {selectedNode && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                    selectedNode.status === 'online'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                      : selectedNode.status === 'warning'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                  }`}
                >
                  {selectedNode.status.toUpperCase()}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-bold text-white text-sm">{selectedNode.label}</p>
                  <p className="text-[11px] text-cyan-400 font-mono">{selectedNode.role}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tipe Perangkat:</span>
                    <span className="text-slate-200">{selectedNode.deviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IP Address:</span>
                    <span className="text-cyan-400 font-semibold">{selectedNode.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Latency:</span>
                    <span className="text-emerald-400">{selectedNode.latency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Telemetri/Trafik:</span>
                    <span className="text-amber-300">{selectedNode.traffic}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px]">
                  {Object.entries(selectedNode.details).map(([k, v]) => (
                    <div key={k} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">{k}</span>
                      <span className="font-mono text-slate-200">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Ketuk salah satu node pada diagram topologi untuk melihat rincian real-time.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
