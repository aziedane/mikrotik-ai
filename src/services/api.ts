import {
  SystemStatusResponse,
  RouterResource,
  RouterInterface,
  PppoeClient,
  HotspotClient,
  MonitoringPoint,
  AuditFinding,
  DiagnosticTest,
  AlertItem,
  AlertThresholds,
  ChatMessage,
} from '../types';

export const api = {
  async getSystemStatus(): Promise<SystemStatusResponse> {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Gagal mengambil status sistem');
    return res.json();
  },

  async getRouters(): Promise<any[]> {
    const res = await fetch('/api/routers');
    if (!res.ok) throw new Error('Gagal mengambil daftar router');
    return res.json();
  },

  async getRouterDetail(id: string): Promise<any> {
    const res = await fetch(`/api/routers/${id}`);
    if (!res.ok) throw new Error('Gagal mengambil detail router');
    return res.json();
  },

  async getRouterResources(id: string): Promise<RouterResource> {
    const res = await fetch(`/api/routers/${id}/resources`);
    if (!res.ok) throw new Error('Gagal mengambil resource router');
    return res.json();
  },

  async getRouterInterfaces(id: string): Promise<{ interfaces: RouterInterface[] }> {
    const res = await fetch(`/api/routers/${id}/interfaces`);
    if (!res.ok) throw new Error('Gagal mengambil interface router');
    return res.json();
  },

  async getPppoeClients(routerId = 'router-1'): Promise<{ clients: PppoeClient[]; total: number }> {
    const res = await fetch(`/api/routers/${routerId}/pppoe`);
    if (!res.ok) throw new Error('Gagal mengambil daftar klien PPPoE');
    return res.json();
  },

  async getHotspotClients(routerId = 'router-2'): Promise<{ users: HotspotClient[]; total: number }> {
    const res = await fetch(`/api/routers/${routerId}/hotspot`);
    if (!res.ok) throw new Error('Gagal mengambil daftar pengguna Hotspot');
    return res.json();
  },

  async getMonitoringHistory(range = '1h'): Promise<{ data: MonitoringPoint[]; range: string }> {
    const res = await fetch(`/api/monitoring/history?range=${range}`);
    if (!res.ok) throw new Error('Gagal mengambil histori pemantauan');
    return res.json();
  },

  async getTopology(): Promise<{
    timestamp: string;
    nodes: Record<
      string,
      {
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
    >;
  }> {
    const res = await fetch('/api/topology');
    if (!res.ok) throw new Error('Gagal mengambil data topologi jaringan');
    return res.json();
  },

  async getAuditFindings(): Promise<{
    score: number;
    summary: { critical: number; warning: number; normal: number; info: number; totalChecks: number };
    findings: AuditFinding[];
  }> {
    const res = await fetch('/api/audit');
    if (!res.ok) throw new Error('Gagal mengambil hasil audit');
    return res.json();
  },

  async getDiagnostics(): Promise<{
    totalTests: number;
    passed: number;
    warnings: number;
    failed: number;
    tests: DiagnosticTest[];
  }> {
    const res = await fetch('/api/diagnostics');
    if (!res.ok) throw new Error('Gagal mengambil hasil diagnostik');
    return res.json();
  },

  async getAlerts(): Promise<{ alerts: AlertItem[]; thresholds: AlertThresholds }> {
    const res = await fetch('/api/alerts');
    if (!res.ok) throw new Error('Gagal mengambil data alert');
    return res.json();
  },

  async updateThresholds(thresholds: Partial<AlertThresholds>): Promise<{ success: boolean; thresholds: AlertThresholds }> {
    const res = await fetch('/api/alerts/thresholds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thresholds),
    });
    if (!res.ok) throw new Error('Gagal memperbarui ambang batas alert');
    return res.json();
  },

  async toggleMode(mode?: 'demo' | 'live'): Promise<{ isDemoMode: boolean; message: string }> {
    const res = await fetch('/api/settings/toggle-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    if (!res.ok) throw new Error('Gagal mengubah mode operasional');
    return res.json();
  },

  async updateRouterConfig(config: {
    routerId: string;
    ip?: string;
    port?: number;
    username?: string;
    password?: string;
    useTls?: boolean;
    osVersion?: 'v7' | 'v6';
  }): Promise<{ success: boolean; message: string; router: any }> {
    const res = await fetch('/api/settings/router-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Gagal memperbarui konfigurasi router');
    return res.json();
  },

  async chatWithAI(message: string, history?: any[]): Promise<{
    reply: string;
    confidence: string;
    modelUsed: string;
    dataReferences?: string[];
    isDemo?: boolean;
  }> {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal berkomunikasi dengan AI Assistant');
    }
    return res.json();
  },
};
