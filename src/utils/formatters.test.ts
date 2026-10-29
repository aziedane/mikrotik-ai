import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBps,
  formatBytes,
  maskIdentifier,
  calculateBandwidthUtilization,
  evaluateThreshold,
} from './formatters';

test('formatBps correctly formats bps, Kbps, Mbps, and Gbps', () => {
  assert.equal(formatBps(0), '0 bps');
  assert.equal(formatBps(500), '500 bps');
  assert.equal(formatBps(1500), '1.5 Kbps');
  assert.equal(formatBps(10_000_000), '10.00 Mbps');
  assert.equal(formatBps(1_250_000_000), '1.25 Gbps');
});

test('formatBytes correctly formats B, KB, MB, and GB', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1024 * 1024 * 5), '5.0 MB');
  assert.equal(formatBytes(1024 * 1024 * 1024 * 2.5), '2.50 GB');
});

test('maskIdentifier safely masks customer usernames and MACs', () => {
  assert.equal(maskIdentifier('pelanggan_001', 3), 'pel***001');
  assert.equal(maskIdentifier('short', 3), '***');
  assert.equal(maskIdentifier(''), '***');
});

test('calculateBandwidthUtilization flags high load above 80%', () => {
  const normal = calculateBandwidthUtilization(60, 100);
  assert.equal(normal.percentage, 60);
  assert.equal(normal.isHigh, false);

  const high = calculateBandwidthUtilization(85, 100);
  assert.equal(high.percentage, 85);
  assert.equal(high.isHigh, true);
});

test('evaluateThreshold returns proper severity', () => {
  assert.equal(evaluateThreshold(30, 75, 90), 'normal');
  assert.equal(evaluateThreshold(78, 75, 90), 'warning');
  assert.equal(evaluateThreshold(92, 75, 90), 'critical');
});
