import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Play,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { DiagnosticTest } from '../types';
import { api } from '../services/api';

export function DiagnosticsView() {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('diag-reachability');

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      const res = await api.getDiagnostics();
      setTests(res.tests);
      if (res.tests.length > 0 && !activeTab) {
        setActiveTab(res.tests[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleRunAll = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      fetchDiagnostics();
    }, 1000);
  };

  const selectedTest = tests.find((t) => t.id === activeTab) || tests[0];

  return (
    <div className="space-y-4 pb-20 lg:pb-6 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-cyan-400" />
            Diagnostik Jaringan
          </h1>
          <p className="text-xs text-slate-400">Pengujian konektivitas &amp; throughput</p>
        </div>

        <button
          onClick={handleRunAll}
          disabled={running}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Menguji...' : 'Uji Sekarang'}</span>
        </button>
      </div>

      {/* Tests Horizontal Strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tests.map((test) => {
          const isSelected = test.id === activeTab;
          const isSuccess = test.status === 'success';

          return (
            <button
              key={test.id}
              onClick={() => setActiveTab(test.id)}
              className={`p-2.5 rounded-xl border text-left shrink-0 min-w-[150px] sm:min-w-[180px] transition-colors ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 font-bold'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-white truncate">{test.testName}</span>
                {isSuccess ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate">{test.target}</p>
            </button>
          );
        })}
      </div>

      {/* Diagnostic 4-Section Breakdown */}
      {selectedTest && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white">{selectedTest.testName}</h3>
              <p className="text-[11px] text-slate-400 font-mono">Target: {selectedTest.target}</p>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                selectedTest.status === 'success'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-amber-500/15 text-amber-400'
              }`}
            >
              {selectedTest.status === 'success' ? 'Normal' : 'Peringatan'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* 1. DATA TERUKUR */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono block">
                1. DATA TERUKUR (FAKTA)
              </span>
              <div className="space-y-1 font-mono text-[11px]">
                {Object.entries(selectedTest.measuredData).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-0.5 border-b border-slate-900 last:border-0">
                    <span className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="text-slate-200 font-bold">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. DUGAAN PENYEBAB */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase font-mono block">
                2. DUGAAN PENYEBAB
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {selectedTest.probableCauses}
              </p>
            </div>

            {/* 3. PEMERIKSAAN BERIKUTNYA */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-blue-400 uppercase font-mono block">
                3. PEMERIKSAAN BERIKUTNYA
              </span>
              <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                {selectedTest.nextChecks}
              </p>
            </div>

            {/* 4. REKOMENDASI */}
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono block">
                4. REKOMENDASI
              </span>
              <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
                {selectedTest.recommendations}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
