import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Router,
  ShieldCheck,
  Terminal,
  Save,
  CheckCircle2,
  FileCode,
  Copy,
  Check,
  Cpu,
  Activity,
  Clock,
  HardDrive,
} from 'lucide-react';
import { api } from '../services/api';
import { DemoBadge, ReadOnlyBadge } from '../components/Badges';
import { SystemStatusResponse } from '../types';

interface SettingsViewProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isDemo: boolean;
  setIsDemo: (val: boolean) => void;
  onRefresh: () => void;
  status?: SystemStatusResponse | null;
}

export function SettingsView({
  isDemo,
  onRefresh,
  status,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'routers' | 'armbian' | 'mikrotikScript'>('general');
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const r1Summary = status?.routers?.find((r) => r.id === 'router-1');
  const r2Summary = status?.routers?.find((r) => r.id === 'router-2');

  const r1Online = r1Summary?.status === 'online';
  const r2Online = r2Summary?.status === 'online';
  const isAnyOnline = r1Online || r2Online;

  // Router config forms
  const [r1Ip, setR1Ip] = useState(r1Summary?.ip || '192.168.1.1');
  const [r1Port, setR1Port] = useState(r1Summary?.port || 443);
  const [r1UseTls, setR1UseTls] = useState(r1Summary?.useTls ?? true);
  const [r1User, setR1User] = useState('api-readonly');
  const [r1Pass, setR1Pass] = useState('');

  const [r2Ip, setR2Ip] = useState(r2Summary?.ip || '192.168.88.1');
  const [r2Port, setR2Port] = useState(r2Summary?.port || 443);
  const [r2UseTls, setR2UseTls] = useState(r2Summary?.useTls ?? true);
  const [r2User, setR2User] = useState('api-readonly');
  const [r2Pass, setR2Pass] = useState('');

  // Fetch saved configs from backend on mount
  useEffect(() => {
    api.getRouters().then((routers) => {
      const r1 = routers.find((r: any) => r.id === 'router-1');
      if (r1) {
        if (r1.ip) setR1Ip(r1.ip);
        if (r1.port) setR1Port(r1.port);
        if (r1.useTls !== undefined) setR1UseTls(r1.useTls);
        if (r1.username) setR1User(r1.username);
      }
      const r2 = routers.find((r: any) => r.id === 'router-2');
      if (r2) {
        if (r2.ip) setR2Ip(r2.ip);
        if (r2.port) setR2Port(r2.port);
        if (r2.useTls !== undefined) setR2UseTls(r2.useTls);
        if (r2.username) setR2User(r2.username);
      }
    }).catch(console.error);
  }, []);

  const [savingR1, setSavingR1] = useState(false);
  const [savingR2, setSavingR2] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveRouter1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingR1(true);
    try {
      const res = await api.updateRouterConfig({
        routerId: 'router-1',
        ip: r1Ip,
        port: r1Port,
        useTls: r1UseTls,
        username: r1User,
        password: r1Pass || undefined,
      });
      setSaveMessage(res.message);
      setR1Pass('');
      onRefresh();
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
      setSaveMessage(`Error: ${err.message || 'Gagal menyimpan'}`);
    } finally {
      setSavingR1(false);
    }
  };

  const handleSaveRouter2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingR2(true);
    try {
      const res = await api.updateRouterConfig({
        routerId: 'router-2',
        ip: r2Ip,
        port: r2Port,
        useTls: r2UseTls,
        username: r2User,
        password: r2Pass || undefined,
      });
      setSaveMessage(res.message);
      setR2Pass('');
      onRefresh();
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
      setSaveMessage(`Error: ${err.message || 'Gagal menyimpan'}`);
    } finally {
      setSavingR2(false);
    }
  };

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(key);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const mikrotikCliScript = `# ========================================================
# SKRIP KONFIGURASI MIKROTIK REST API (ROUTEROS v7)
# Copy & Paste di Winbox -> Terminal pada Router 1 & Router 2
# ========================================================

# 1. Buat User Group Read-Only khusus REST API
/user group
add name=read-only-api policy=read,api,rest comment="Hak akses monitoring STB"

# 2. Buat User Khusus Monitoring (Ganti password di bawah)
/user
add name=api-readonly group=read-only-api password="GANTI_DENGAN_PASSWORD_ANDA" comment="User MikroTik AI STB"

# 3. Aktifkan Service REST API (Pilih HTTP atau HTTPS)
# Untuk HTTP (Port 80):
/ip service set www disabled=no port=80

# Untuk HTTPS (Port 443 - Recommended):
/ip service set www-ssl disabled=no port=443 tls-version=only-1.2

# 4. Verifikasi Service REST API Aktif
/ip service print where name~"www"`;

  const armbianBashScript = `# 1. Masuk ke folder aplikasi
cd /opt/mikrotik-ai

# 2. Jika ada kendala npm install (corrupt lockfile):
rm -f package-lock.json
npm cache clean --force
npm install --legacy-peer-deps

# 3. Build & Jalankan ulang aplikasi
npm run build
pm2 restart mikrotik-ai || pm2 start server.ts --name "mikrotik-ai" --interpreter tsx
pm2 save`;

  return (
    <div className="space-y-6 pb-20 lg:pb-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              Pengaturan Sistem
            </h1>
            <DemoBadge isDemo={false} isOnline={isAnyOnline} />
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Koneksi MikroTik 1 &amp; 2, status host STB Armbian, dan skrip instalasi
          </p>
        </div>

        <ReadOnlyBadge />
      </div>

      {saveMessage && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
          saveMessage.includes('BERHASIL') || saveMessage.includes('disimpan') && !saveMessage.includes('gagal')
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
            : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex whitespace-nowrap overflow-x-auto border-b border-slate-800 text-xs font-medium no-scrollbar">
        <button
          onClick={() => setActiveTab('general')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Umum &amp; Host</span>
        </button>
        <button
          onClick={() => setActiveTab('routers')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'routers'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Router className="w-4 h-4" />
          <span>Koneksi Mikrotik</span>
        </button>
        <button
          onClick={() => setActiveTab('armbian')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'armbian'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Setup STB Armbian</span>
        </button>
        <button
          onClick={() => setActiveTab('mikrotikScript')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'mikrotikScript'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Skrip RouterOS v7</span>
        </button>
      </div>

      {/* Tab 1: General Settings */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Operational & Security Mode Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Mode Operasional &amp; REST API</h3>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                  isAnyOnline
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              >
                {isAnyOnline ? 'REST API Live' : 'REST API Terputus'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">
                    {isAnyOnline ? 'Terhubung ke REST API RouterOS' : 'Menunggu Koneksi REST API'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isAnyOnline
                      ? 'Aplikasi membaca data riil dari router MikroTik secara live.'
                      : 'REST API belum dapat menjangkau router. Buka tab "Koneksi Mikrotik" untuk menyesuaikan IP, Port, Username, & Password.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Per Router Summary Card */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      r1Online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <div>
                    <span className="font-bold text-white block">MikroTik 1 (Utama)</span>
                    <span className="text-[10px] text-slate-400 font-mono">{r1Summary?.ip || '192.168.1.1'} • PPPoE Gateway</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    r1Online ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}
                >
                  {r1Online ? 'Online' : 'Terputus'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      r2Online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <div>
                    <span className="font-bold text-white block">MikroTik 2 (Hotspot)</span>
                    <span className="text-[10px] text-slate-400 font-mono">{r2Summary?.ip || '192.168.88.1'} • Hotspot Gateway</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    r2Online ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}
                >
                  {r2Online ? 'Online' : 'Terputus'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-[11px] text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span><strong>Strict Read-Only Guarantee:</strong> Hanya mengirim query HTTP GET tanpa mengubah konfigurasi router.</span>
            </div>
          </div>

          {/* STB Host Telemetry */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Spesifikasi Host STB Armbian</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">
                Live Kernel
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Hostname Host:</span>
                <span className="font-mono text-slate-200 font-semibold">
                  {status?.stbHostInfo?.hostname || 'armbian-stb'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Sistem Operasi STB:</span>
                <span className="font-mono text-slate-200 truncate max-w-[200px]" title={status?.stbHostInfo?.os}>
                  {status?.stbHostInfo?.os || 'Armbian Linux'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">CPU Host / Cores:</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {status?.stbHostInfo?.cpuCores ? `${status.stbHostInfo.cpuCores}-Core` : '4-Core'} ({status?.stbHostInfo?.cpuModel || 'aarch64'})
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Total Memori STB:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {status?.stbHostInfo?.systemRamTotalMb
                    ? `${status.stbHostInfo.systemRamTotalMb} MB (${(status.stbHostInfo.systemRamTotalMb / 1024).toFixed(2)} GB)`
                    : '~1.8 GB RAM'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">RAM Bebas / Terpakai:</span>
                <span className="font-mono text-slate-300">
                  {status?.stbHostInfo?.systemRamFreeMb !== undefined
                    ? `${status.stbHostInfo.systemRamFreeMb} MB Free / ${status.stbHostInfo.systemRamUsedMb} MB Used`
                    : '1.2 GB Free'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Memory App (Node.js Heap):</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {status?.stbHostInfo?.appMemoryMb !== undefined
                    ? `${status.stbHostInfo.appMemoryMb} MB`
                    : '42 MB'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Uptime OS STB:</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {status?.stbHostInfo?.stbUptime || 'Active'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Port Application Server:</span>
                <span className="font-mono text-cyan-400">HTTP 3000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Routers Connection Config */}
      {activeTab === 'routers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Router 1 Form */}
          <form
            onSubmit={handleSaveRouter1}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Router className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">MikroTik 1 (Utama)</h3>
                  <p className="text-[11px] text-slate-400">{r1Summary?.model || 'RouterOS'} • Gateway PPPoE &amp; NAT</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  r1Online
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              >
                {r1Online ? 'Online' : 'Terputus'}
              </span>
            </div>

            {r1Summary?.error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-rose-200">
                  <Activity className="w-3.5 h-3.5" /> Error Koneksi MikroTik 1:
                </p>
                <p className="font-mono text-[10px] text-rose-300 break-words">{r1Summary.error}</p>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">IP Address Router</label>
                <input
                  type="text"
                  value={r1Ip}
                  onChange={(e) => setR1Ip(e.target.value)}
                  placeholder="Contoh: 192.168.1.1"
                  className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-mono focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Protokol</label>
                  <select
                    value={r1UseTls ? 'https' : 'http'}
                    onChange={(e) => {
                      const isTls = e.target.value === 'https';
                      setR1UseTls(isTls);
                      setR1Port(isTls ? 443 : 80);
                    }}
                    className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-mono focus:border-cyan-500"
                  >
                    <option value="https">HTTPS (SSL)</option>
                    <option value="http">HTTP (Non-SSL)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Port REST API</label>
                  <input
                    type="number"
                    value={r1Port}
                    onChange={(e) => setR1Port(Number(e.target.value))}
                    placeholder="443 atau 80"
                    className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-mono focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Username API (Read-Only)</label>
                <input
                  type="text"
                  value={r1User}
                  onChange={(e) => setR1User(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-mono focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Password API</label>
                <input
                  type="password"
                  value={r1Pass}
                  onChange={(e) => setR1Pass(e.target.value)}
                  placeholder="Ketik password baru jika ingin mengubah"
                  className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-mono focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingR1}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingR1 ? 'Menguji Koneksi...' : 'Simpan & Uji MikroTik 1'}</span>
              </button>
            </div>
          </form>

          {/* Router 2 Form */}
          <form
            onSubmit={handleSaveRouter2}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Router className="w-4 h-4 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">MikroTik 2 (Hotspot)</h3>
                  <p className="text-[11px] text-slate-400">{r2Summary?.model || 'RouterOS'} • Gateway Captive Portal</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  r2Online
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              >
                {r2Online ? 'Online' : 'Terputus'}
              </span>
            </div>

            {r2Summary?.error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-rose-200">
                  <Activity className="w-3.5 h-3.5" /> Error Koneksi MikroTik 2:
                </p>
                <p className="font-mono text-[10px] text-rose-300 break-words">{r2Summary.error}</p>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">IP Address Router</label>
                <input
                  type="text"
                  value={r2Ip}
                  onChange={(e) => setR2Ip(e.target.value)}
                  placeholder="Contoh: 192.168.88.1"
                  className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-mono focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Protokol</label>
                  <select
                    value={r2UseTls ? 'https' : 'http'}
                    onChange={(e) => {
                      const isTls = e.target.value === 'https';
                      setR2UseTls(isTls);
                      setR2Port(isTls ? 443 : 80);
                    }}
                    className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-mono focus:border-cyan-500"
                  >
                    <option value="https">HTTPS (SSL)</option>
                    <option value="http">HTTP (Non-SSL)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Port REST API</label>
                  <input
                    type="number"
                    value={r2Port}
                    onChange={(e) => setR2Port(Number(e.target.value))}
                    placeholder="443 atau 80"
                    className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-mono focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Username API (Read-Only)</label>
                <input
                  type="text"
                  value={r2User}
                  onChange={(e) => setR2User(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-mono focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Password API</label>
                <input
                  type="password"
                  value={r2Pass}
                  onChange={(e) => setR2Pass(e.target.value)}
                  placeholder="Ketik password baru jika ingin mengubah"
                  className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-mono focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingR2}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingR2 ? 'Menguji Koneksi...' : 'Simpan & Uji MikroTik 2'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Armbian Setup Guide */}
      {activeTab === 'armbian' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Panduan Instalasi STB Armbian Linux
              </h3>
              <p className="text-xs text-slate-400">
                Langkah memasang service backend &amp; frontend di STB Armbian (RAM ~1.8GB)
              </p>
            </div>
            <button
              onClick={() => copyToClipboard('armbian', armbianBashScript)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              {copiedScript === 'armbian' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Salin Perintah</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
            {armbianBashScript}
          </pre>
        </div>
      )}

      {/* Tab 4: MikroTik v7 CLI Script */}
      {activeTab === 'mikrotikScript' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                Skrip Terminal MikroTik v7 (Aktifkan REST API)
              </h3>
              <p className="text-xs text-slate-400">
                Jalankan skrip ini di Terminal Winbox pada kedua router MikroTik
              </p>
            </div>
            <button
              onClick={() => copyToClipboard('mikrotik', mikrotikCliScript)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              {copiedScript === 'mikrotik' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Salin Skrip</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
            {mikrotikCliScript}
          </pre>
        </div>
      )}
    </div>
  );
}
