import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AuditFinding } from '../types';
import { api } from '../services/api';

export function AuditView() {
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [score, setScore] = useState(88);
  const [summary, setSummary] = useState({
    totalChecks: 12,
    critical: 0,
    warning: 3,
    normal: 8,
    info: 1,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'warning' | 'normal' | 'info'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('aud-02');

  const fetchAudit = async () => {
    try {
      setRefreshing(true);
      const res = await api.getAuditFindings();
      setFindings(res.findings);
      setScore(res.score);
      setSummary(res.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const filteredFindings = findings.filter(
    (f) => priorityFilter === 'all' || f.priority === priorityFilter
  );

  return (
    <div className="space-y-4 pb-20 lg:pb-6 select-none">
      {/* Header Bar with Score Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Audit Jaringan &amp; Keamanan
          </h1>
          <p className="text-xs text-slate-400">Pemeriksaan 12 domain RouterOS 7.20.4</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Score */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <span>Skor: {score}/100</span>
          </div>

          <button
            onClick={fetchAudit}
            disabled={refreshing}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Audit Ulang</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setPriorityFilter('all')}
          className={`px-3 py-1 rounded-md transition-colors shrink-0 ${
            priorityFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Semua ({findings.length})
        </button>
        <button
          onClick={() => setPriorityFilter('warning')}
          className={`px-3 py-1 rounded-md transition-colors shrink-0 ${
            priorityFilter === 'warning' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Peringatan ({summary.warning})
        </button>
        <button
          onClick={() => setPriorityFilter('normal')}
          className={`px-3 py-1 rounded-md transition-colors shrink-0 ${
            priorityFilter === 'normal' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Normal ({summary.normal})
        </button>
      </div>

      {/* Findings List */}
      <div className="space-y-2">
        {filteredFindings.map((finding) => {
          const isExpanded = expandedId === finding.id;
          const isWarn = finding.priority === 'warning';

          return (
            <div
              key={finding.id}
              className={`rounded-xl border transition-colors ${
                isWarn ? 'bg-slate-900 border-amber-500/30' : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isWarn ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{finding.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800 hidden sm:inline">
                        {finding.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                      isWarn ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'
                    }`}
                  >
                    {finding.status}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
                    <span className="text-cyan-400 font-bold block mb-0.5 text-[10px]">BUKTI DATA:</span>
                    {finding.evidence}
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-slate-200 font-mono">
                    <span className="text-emerald-400 font-bold block mb-0.5 text-[10px]">REKOMENDASI:</span>
                    {finding.recommendation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
