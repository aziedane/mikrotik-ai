export type NavPage =
  | 'dashboard'
  | 'assistant'
  | 'monitoring'
  | 'pppoe'
  | 'hotspot'
  | 'bandwidth'
  | 'topology'
  | 'audit'
  | 'diagnostics'
  | 'alerts'
  | 'reports'
  | 'settings';

export interface RouterSummary {
  id: string;
  name: string;
  role: string;
  model: string;
  version: string;
  ip?: string;
  port?: number;
  useTls?: boolean;
  status: 'online' | 'warning' | 'offline';
  error?: string;
  uptime: string;
  cpu: number;
  cpuCount?: number;
  cpuFrequency?: number;
  ramUsedPercent: number;
  freeMemoryMb?: number;
  totalMemoryMb?: number;
  hddUsedPercent?: number;
  freeHddMb?: number;
  totalHddMb?: number;
  activeSessions: number;
  sessionLabel: string;
  downloadMbps: number;
  uploadMbps: number;
  architectureName?: string;
}

export interface RouterResource {
  routerId: string;
  timestamp: string;
  source: string;
  isDemo: boolean;
  readOnlySafe: boolean;
  uptime: string;
  version: string;
  buildTime: string;
  freeMemory: number;
  totalMemory: number;
  usedMemory: number;
  ramPercentage: number;
  cpu: number;
  cpuCount: number;
  cpuFrequency: number;
  cpuModel: string;
  freeHddSpace: number;
  totalHddSpace: number;
  architectureName: string;
  boardName: string;
  voltage: number;
  temperature: number;
  writeSectTotal: number;
  badBlocks: string;
}

export interface RouterInterface {
  id: string;
  name: string;
  type: string;
  macAddress: string;
  running: boolean;
  disabled: boolean;
  comment?: string;
  rxBps: number;
  txBps: number;
  rxPackets: number;
  txPackets: number;
  rxErrors: number;
  txErrors: number;
  mtu: number;
  linkSpeed: string;
  ipAddress?: string;
}

export interface PppoeClient {
  id: string;
  name: string;
  maskedName: string;
  service: string;
  callerId: string;
  address: string;
  uptime: string;
  profile: string;
  encoding: string;
  status: 'connected' | 'warning';
  comment?: string;
  rxBytes: number;
  txBytes: number;
  rxRateBps: number;
  txRateBps: number;
  lastUpdated: string;
}

export interface HotspotClient {
  id: string;
  user: string;
  maskedUser: string;
  address: string;
  macAddress: string;
  uptime: string;
  timeLeft: string;
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  server: string;
  status: string;
  profile: string;
  authorized: boolean;
  lastUpdated: string;
}

export interface MonitoringPoint {
  timestamp: string;
  label: string;
  router1: {
    downloadMbps: number;
    uploadMbps: number;
    cpu: number;
    ram: number;
  };
  router2: {
    downloadMbps: number;
    uploadMbps: number;
    cpu: number;
    ram: number;
  };
  totalDownloadMbps: number;
  totalUploadMbps: number;
}

export interface AuditFinding {
  id: string;
  category: string;
  name: string;
  priority: 'critical' | 'warning' | 'normal' | 'info';
  confidence: string;
  status: string;
  evidence: string;
  impact: string;
  explanation: string;
  recommendation: string;
}

export interface DiagnosticTest {
  id: string;
  testName: string;
  target: string;
  status: 'success' | 'warning' | 'error';
  measuredData: Record<string, any>;
  probableCauses: string;
  nextChecks: string;
  recommendations: string;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  routerId: string;
  routerName: string;
  level: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  detail: string;
  resolved: boolean;
}

export interface AlertThresholds {
  cpuWarning: number;
  cpuCritical: number;
  ramWarning: number;
  ramCritical: number;
  bandwidthSpikeMbps: number;
}

export interface SystemStatusResponse {
  overallStatus: 'normal' | 'warning' | 'critical';
  operationalMode: 'DEMO' | 'LIVE_REST_API';
  isDemo: boolean;
  readOnlyGuaranteed: boolean;
  lastUpdate: string;
  stbHostInfo: {
    hostname: string;
    os: string;
    systemRamTotalMb: number;
    systemRamUsedMb: number;
    systemRamFreeMb: number;
    appMemoryMb: number;
    stbUptime: string;
    cpuCores?: number;
    cpuModel?: string;
  };
  routers: RouterSummary[];
  alertsSummary: {
    critical: number;
    warning: number;
    info: number;
    totalUnresolved: number;
  };
  bandwidthSummary: {
    totalDownloadMbps: number;
    totalUploadMbps: number;
    ispCapacityMbps: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  confidence?: string;
  modelUsed?: string;
  dataReferences?: string[];
  isDemo?: boolean;
}
