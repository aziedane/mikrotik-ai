import React, { useState } from 'react';
import { MonitoringPoint } from '../types';

interface TrafficChartProps {
  data: MonitoringPoint[];
  type?: 'bandwidth' | 'cpu' | 'ram';
  title?: string;
  height?: number;
}

export function TrafficChart({
  data,
  type = 'bandwidth',
  title,
  height = 240,
}: TrafficChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 text-sm">
        Tidak ada data histori pemantauan.
      </div>
    );
  }

  // Determine series to draw based on type
  let series1Values: number[] = [];
  let series2Values: number[] = [];
  let series1Label = '';
  let series2Label = '';
  let series1Color = '#06B6D4'; // cyan
  let series2Color = '#3B82F6'; // blue
  let unit = 'Mbps';

  if (type === 'bandwidth') {
    series1Values = data.map((d) => d.totalDownloadMbps);
    series2Values = data.map((d) => d.totalUploadMbps);
    series1Label = 'Total Download (RX)';
    series2Label = 'Total Upload (TX)';
    series1Color = '#06B6D4'; // Cyan
    series2Color = '#10B981'; // Emerald
    unit = 'Mbps';
  } else if (type === 'cpu') {
    series1Values = data.map((d) => d.router1.cpu);
    series2Values = data.map((d) => d.router2.cpu);
    series1Label = 'CPU Router Utama (PPPoE)';
    series2Label = 'CPU Router Hotspot';
    series1Color = '#F59E0B'; // Amber
    series2Color = '#8B5CF6'; // Purple
    unit = '%';
  } else if (type === 'ram') {
    series1Values = data.map((d) => d.router1.ram);
    series2Values = data.map((d) => d.router2.ram);
    series1Label = 'RAM Router Utama';
    series2Label = 'RAM Router Hotspot';
    series1Color = '#3B82F6';
    series2Color = '#06B6D4';
    unit = '%';
  }

  const allValues = [...series1Values, ...series2Values];
  const maxVal = Math.max(10, Math.ceil(Math.max(...allValues) * 1.15));
  const minVal = 0;

  // Chart coordinates
  const paddingX = 45;
  const paddingY = 25;
  const width = 700;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const pointsCount = data.length;
  const stepX = chartW / Math.max(1, pointsCount - 1);

  const getCoordinates = (values: number[]) => {
    return values.map((val, idx) => {
      const x = paddingX + idx * stepX;
      const normalized = (val - minVal) / (maxVal - minVal || 1);
      const y = paddingY + chartH - normalized * chartH;
      return { x, y, val };
    });
  };

  const coords1 = getCoordinates(series1Values);
  const coords2 = getCoordinates(series2Values);

  const makePath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    return coords.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      // Smooth cubic bezier
      const prev = coords[idx - 1];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }, '');
  };

  const path1 = makePath(coords1);
  const path2 = makePath(coords2);

  // Area paths
  const area1 = coords1.length > 0
    ? `${path1} L ${coords1[coords1.length - 1].x} ${paddingY + chartH} L ${coords1[0].x} ${paddingY + chartH} Z`
    : '';

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="w-full">
      {/* Title & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        {title && <h3 className="text-sm font-semibold text-slate-200">{title}</h3>}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: series1Color }} />
            <span className="text-slate-300">{series1Label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: series2Color }} />
            <span className="text-slate-300">{series2Label}</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden rounded-xl bg-slate-900/60 dark:bg-slate-950/70 border border-slate-800 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={`grad1-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series1Color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={series1Color} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={`grad2-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series2Color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={series2Color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingY + chartH - pct * chartH;
            const gridVal = Math.round(minVal + pct * (maxVal - minVal));
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  opacity="0.4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 font-mono text-[10px]"
                >
                  {gridVal} {unit}
                </text>
              </g>
            );
          })}

          {/* Area under series 1 */}
          <path d={area1} fill={`url(#grad1-${type})`} />

          {/* Lines */}
          <path d={path1} fill="none" stroke={series1Color} strokeWidth="2.5" strokeLinecap="round" />
          <path d={path2} fill="none" stroke={series2Color} strokeWidth="2.5" strokeLinecap="round" />

          {/* Hover interactive vertical line and points */}
          {hoverIndex !== null && coords1[hoverIndex] && coords2[hoverIndex] && (
            <g>
              <line
                x1={coords1[hoverIndex].x}
                y1={paddingY}
                x2={coords1[hoverIndex].x}
                y2={paddingY + chartH}
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={coords1[hoverIndex].x}
                cy={coords1[hoverIndex].y}
                r="4.5"
                fill={series1Color}
                stroke="#0F172A"
                strokeWidth="2"
              />
              <circle
                cx={coords2[hoverIndex].x}
                cy={coords2[hoverIndex].y}
                r="4.5"
                fill={series2Color}
                stroke="#0F172A"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Transparent interactive bars for hover */}
          {data.map((_, idx) => {
            const x = paddingX + idx * stepX - stepX / 2;
            return (
              <rect
                key={idx}
                x={Math.max(paddingX, x)}
                y={paddingY}
                width={stepX}
                height={chartH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
              />
            );
          })}

          {/* X axis labels (first, middle, last) */}
          {coords1.length > 0 && (
            <>
              <text
                x={coords1[0].x}
                y={height - 5}
                className="fill-slate-500 font-mono text-[10px]"
              >
                {data[0].label}
              </text>
              <text
                x={coords1[Math.floor(coords1.length / 2)].x}
                y={height - 5}
                textAnchor="middle"
                className="fill-slate-500 font-mono text-[10px]"
              >
                {data[Math.floor(coords1.length / 2)].label}
              </text>
              <text
                x={coords1[coords1.length - 1].x}
                y={height - 5}
                textAnchor="end"
                className="fill-slate-500 font-mono text-[10px]"
              >
                {data[coords1.length - 1].label}
              </text>
            </>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && hoverIndex !== null && (
          <div className="absolute top-3 right-3 bg-slate-900/95 border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs backdrop-blur-md z-10 pointer-events-none">
            <div className="font-mono text-slate-400 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between gap-3">
              <span>Waktu:</span>
              <span className="text-slate-200">{hoveredPoint.label}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: series1Color }} />
                  {series1Label}:
                </span>
                <span className="font-mono font-bold text-slate-100">
                  {series1Values[hoverIndex]} {unit}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: series2Color }} />
                  {series2Label}:
                </span>
                <span className="font-mono font-bold text-slate-100">
                  {series2Values[hoverIndex]} {unit}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
