/**
 * Pure utility functions for MikroTik network observability
 */

export function formatBps(bps: number): string {
  if (!bps || bps <= 0) return '0 bps';
  if (bps >= 1_000_000_000) return `${(bps / 1_000_000_000).toFixed(2)} Gbps`;
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(2)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(1)} Kbps`;
  return `${Math.round(bps)} bps`;
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export function maskIdentifier(str: string, keep = 3): string {
  if (!str) return '***';
  if (str.length <= keep * 2) return '***';
  return `${str.slice(0, keep)}***${str.slice(-keep)}`;
}

export function calculateBandwidthUtilization(currentMbps: number, capacityMbps: number): { percentage: number; isHigh: boolean } {
  if (!capacityMbps || capacityMbps <= 0) return { percentage: 0, isHigh: false };
  const percentage = Math.round((currentMbps / capacityMbps) * 100);
  return {
    percentage,
    isHigh: percentage >= 80,
  };
}

export function evaluateThreshold(value: number, warning: number, critical: number): 'normal' | 'warning' | 'critical' {
  if (value >= critical) return 'critical';
  if (value >= warning) return 'warning';
  return 'normal';
}
