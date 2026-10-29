import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Search,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Radio,
  Users,
} from 'lucide-react';
import { HotspotClient, NavPage } from '../types';
import { api } from '../services/api';
import { formatBytes } from '../components/Badges';

interface HotspotViewProps {
  onNavigate?: (page: NavPage) => void;
}

export function HotspotView({ onNavigate }: HotspotViewProps) {
  const [users, setUsers] = useState<HotspotClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [unmaskAll, setUnmaskAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const res = await api.getHotspotClients('router-2');
      setUsers(res.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const profiles = Array.from(new Set(users.map((u) => u.profile)));

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.user.toLowerCase().includes(search.toLowerCase()) ||
      u.address.includes(search) ||
      u.macAddress.toLowerCase().includes(search.toLowerCase());

    const matchesProfile = profileFilter === 'all' || u.profile === profileFilter;
    return matchesSearch && matchesProfile;
  });

  return (
    <div className="space-y-3.5 max-w-5xl mx-auto pb-20 lg:pb-6 select-none">
      {/* Top Segmented Tab Switcher (PPPoE vs Hotspot) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-mono">
          {onNavigate && (
            <button
              onClick={() => onNavigate('pppoe')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>PPPoE</span>
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold">
            <Wifi className="w-3.5 h-3.5" />
            <span>Hotspot Aktif ({users.length})</span>
          </button>
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
            onClick={fetchUsers}
            disabled={refreshing}
            className="p-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
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
            placeholder="Cari voucher, IP, MAC Address..."
            className="w-full bg-slate-950 text-slate-200 pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono">
          <select
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none"
          >
            <option value="all">Semua Profil ({users.length})</option>
            {profiles.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hotspot Client Cards (MikroTik Android App Rows) */}
      <div className="space-y-2 font-mono">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2"
          >
            {/* Top Row: [R] [H] Flags + Voucher/User + Uptime */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-0.5 text-[10px] font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    R
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    H
                  </span>
                </div>

                <div className="truncate">
                  <span className="font-bold text-xs sm:text-sm text-white">
                    {unmaskAll ? user.user : user.maskedUser}
                  </span>
                  <span className="text-[10px] text-amber-400 ml-2 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {user.profile}
                  </span>
                </div>
              </div>

              {/* Uptime Badge */}
              <div className="flex items-center gap-1 text-slate-400 text-xs shrink-0">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{user.uptime}</span>
              </div>
            </div>

            {/* Bottom Meta Row: IP, MAC, Access Point, Bytes In/Out */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60">
              <div className="flex items-center gap-3">
                <span className="text-slate-300">
                  IP: <span className="text-amber-400 font-semibold">{user.address}</span>
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Radio className="w-3 h-3" />
                  {user.server || 'hotspot1'}
                </span>
                <span className="hidden sm:inline text-slate-500">
                  MAC: {user.macAddress}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-cyan-400">↓ {formatBytes(user.bytesIn)}</span>
                <span className="text-emerald-400">↑ {formatBytes(user.bytesOut)}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
            Tidak ada pengguna hotspot yang cocok dengan filter pencarian.
          </div>
        )}
      </div>
    </div>
  );
}
