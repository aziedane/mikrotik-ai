import React from 'react';
import {
  LayoutDashboard,
  Network,
  Users,
  Bot,
  Grid,
} from 'lucide-react';
import { NavPage } from '../types';

interface BottomNavProps {
  currentPage: NavPage;
  setCurrentPage: (page: NavPage) => void;
  openDrawer: () => void;
  pppoeCount?: number;
  hotspotCount?: number;
}

export function BottomNav({
  currentPage,
  setCurrentPage,
  openDrawer,
  pppoeCount = 42,
  hotspotCount = 68,
}: BottomNavProps) {
  const isClients = currentPage === 'pppoe' || currentPage === 'hotspot';

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg px-2 flex items-center justify-around select-none">
      {/* 1. Status / Home */}
      <button
        onClick={() => setCurrentPage('dashboard')}
        className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
          currentPage === 'dashboard'
            ? 'text-cyan-400 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Status</span>
        {currentPage === 'dashboard' && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-0.5 animate-pulse" />
        )}
      </button>

      {/* 2. Interfaces */}
      <button
        onClick={() => setCurrentPage('monitoring')}
        className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
          currentPage === 'monitoring'
            ? 'text-cyan-400 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Network className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Interface</span>
        {currentPage === 'monitoring' && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-0.5 animate-pulse" />
        )}
      </button>

      {/* 3. Clients (PPPoE / Hotspot) */}
      <button
        onClick={() => setCurrentPage(currentPage === 'hotspot' ? 'hotspot' : 'pppoe')}
        className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
          isClients
            ? 'text-cyan-400 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Users className="w-5 h-5 mb-0.5" />
          <span className="absolute -top-1 -right-2 px-1 text-[8px] font-mono font-bold bg-cyan-500 text-slate-950 rounded-full">
            {pppoeCount + hotspotCount}
          </span>
        </div>
        <span className="text-[10px] tracking-tight">Klien</span>
        {isClients && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-0.5 animate-pulse" />
        )}
      </button>

      {/* 4. AI Assistant */}
      <button
        onClick={() => setCurrentPage('assistant')}
        className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
          currentPage === 'assistant'
            ? 'text-cyan-400 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Bot className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">MikroTik AI</span>
        {currentPage === 'assistant' && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-0.5 animate-pulse" />
        )}
      </button>

      {/* 5. Menu Drawer */}
      <button
        onClick={openDrawer}
        className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all text-slate-400 hover:text-slate-200 active:scale-95"
      >
        <Grid className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Menu</span>
      </button>
    </nav>
  );
}
