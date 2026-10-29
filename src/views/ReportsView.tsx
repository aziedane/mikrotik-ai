import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
} from 'lucide-react';
import { SystemStatusResponse, AuditFinding } from '../types';
import { api } from '../services/api';

export function ReportsView() {
  const [status, setStatus] = useState<SystemStatusResponse | null>(null);
  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSystemStatus(), api.getAuditFindings()]).then(
      ([statusRes, auditRes]) => {
        setStatus(statusRes);
        setAuditFindings(auditRes.findings);
        setLoading(false);
      }
    );
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!status) return;

    const rows = [
      ['LAPORAN KESEHATAN JARINGAN MIKROTIK'],
      ['Waktu Export', new Date().toISOString()],
      ['Status Operasional', status.operationalMode],
      [],
      ['ROUTER SUMMARY'],
      ['ID', 'Nama', 'Peran', 'Model', 'RouterOS', 'Uptime', 'CPU (%)', 'RAM (%)', 'Sesi Aktif', 'Throughput Down (Mbps)'],
      ...status.routers.map((r) => [
        r.id,
        r.name,
        r.role,
        r.model,
        r.version,
        r.uptime,
        r.cpu,
        r.ramUsedPercent,
        r.activeSessions,
        r.downloadMbps,
      ]),
      [],
      ['AUDIT FINDINGS'],
      ['Kategori', 'Nama Temuan', 'Prioritas', 'Status', 'Bukti Data', 'Rekomendasi'],
      ...auditFindings.map((f) => [
        f.category,
        f.name,
        f.priority,
        f.status,
        `"${f.evidence.replace(/"/g, '""')}"`,
        `"${f.recommendation.replace(/"/g, '""')}"`,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MikroTik_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const r1 = status?.routers?.find((r) => r.id === 'router-1');
  const r2 = status?.routers?.find((r) => r.id === 'router-2');

  return (
    <div className="space-y-4 pb-20 lg:pb-6 select-none">
      {/* Header and Export Actions */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Laporan Jaringan
          </h1>
          <p className="text-xs text-slate-400">Ekspor CSV dan Cetak PDF</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-4 text-slate-200 text-xs print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        <div className="border-b border-slate-800 pb-3 flex justify-between items-start print:border-black">
          <div>
            <h2 className="text-base font-bold text-white print:text-black">
              MikroTik Observability Report
            </h2>
            <p className="text-slate-400 print:text-gray-600">
              {r1?.model || 'MikroTik'} &amp; {r2?.model || 'MikroTik'} ({r1?.version || 'RouterOS 7.x'})
            </p>
          </div>
          <div className="text-right font-mono text-[11px] text-slate-400">
            <p>{new Date().toLocaleDateString('id-ID')}</p>
            <p className="text-emerald-400 font-bold">
              Skor Audit: {(r1?.status === 'online' ? 50 : 0) + (r2?.status === 'online' ? 50 : 0)}/100
            </p>
          </div>
        </div>

        {/* Router Table */}
        <div className="space-y-1.5">
          <span className="font-bold text-cyan-400 print:text-black block text-[11px]">
            STATUS RESOURCE ROUTER:
          </span>
          <table className="w-full text-left font-mono border border-slate-800 text-[11px]">
            <thead className="bg-slate-950 text-slate-400 print:bg-gray-100 print:text-black">
              <tr>
                <th className="p-2">ROUTER</th>
                <th className="p-2">UPTIME</th>
                <th className="p-2">CPU</th>
                <th className="p-2">RAM</th>
                <th className="p-2">SESI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="p-2 font-bold text-white print:text-black">Utama ({r1?.model || 'PPPoE'})</td>
                <td className="p-2">{r1?.status === 'online' ? (r1?.uptime || '0s') : 'Terputus'}</td>
                <td className="p-2 text-cyan-400 font-bold">{r1?.status === 'online' ? `${r1?.cpu ?? 0}%` : '--'}</td>
                <td className="p-2">{r1?.status === 'online' ? `${r1?.ramUsedPercent ?? 0}%` : '--'}</td>
                <td className="p-2">{r1?.activeSessions ?? 0} PPPoE</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-white print:text-black">Hotspot ({r2?.model || 'Hotspot'})</td>
                <td className="p-2">{r2?.status === 'online' ? (r2?.uptime || '0s') : 'Terputus'}</td>
                <td className="p-2 text-cyan-400 font-bold">{r2?.status === 'online' ? `${r2?.cpu ?? 0}%` : '--'}</td>
                <td className="p-2">{r2?.status === 'online' ? `${r2?.ramUsedPercent ?? 0}%` : '--'}</td>
                <td className="p-2">{r2?.activeSessions ?? 0} Hotspot</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Priority Audit Findings */}
        <div className="space-y-1.5">
          <span className="font-bold text-cyan-400 print:text-black block text-[11px]">
            TEMUAN AUDIT PRIORITAS:
          </span>
          <div className="space-y-1.5 font-mono text-[11px]">
            {auditFindings
              .filter((f) => f.priority === 'warning')
              .map((item) => (
                <div key={item.id} className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="font-bold text-amber-400 block">{item.name}</span>
                  <span className="text-slate-400 block">{item.evidence}</span>
                  <span className="text-emerald-400 block mt-0.5">Solusi: {item.recommendation}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
