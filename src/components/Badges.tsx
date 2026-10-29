import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function DemoBadge({ isDemo = false, isOnline = false }: { isDemo?: boolean; isOnline?: boolean }) {
  if (isOnline) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Terhubung ke REST API MikroTik v7">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        RouterOS v7 Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20" title="API MikroTik Terputus / Belum Terkonfigurasi">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
      REST API Terputus
    </span>
  );
}

export function ReadOnlyBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
      title="Mode Baca-Saja (Read-Only) aktif"
    >
      <ShieldCheck className="w-3 h-3 text-cyan-400" />
      Read-Only
    </span>
  );
}

export function formatBps(bps: number): string {
  if (!bps || bps <= 0) return '0 bps';
  if (bps >= 1_000_000_000) return `${(bps / 1_000_000_000).toFixed(1)} Gbps`;
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(0)} Kbps`;
  return `${Math.round(bps)} bps`;
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}
