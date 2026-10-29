import React from 'react';

interface CircularGaugeProps {
  value: number; // 0 to 100
  title: string;
  subtitle?: string;
  unit?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export function CircularGauge({
  value,
  title,
  subtitle,
  unit = '%',
  size = 110,
  strokeWidth = 9,
  color,
  warningThreshold = 75,
  criticalThreshold = 90,
}: CircularGaugeProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270-degree arc for RouterOS mobile gauge look
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clampedValue / 100) * arcLength;

  // Determine color based on threshold if not explicitly provided
  let gaugeColor = color;
  if (!gaugeColor) {
    if (clampedValue >= criticalThreshold) {
      gaugeColor = '#ef4444'; // Red
    } else if (clampedValue >= warningThreshold) {
      gaugeColor = '#f59e0b'; // Amber
    } else {
      gaugeColor = '#00a4e4'; // MikroTik Cyan
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/80 dark:bg-slate-900/90 border border-slate-800/80">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform rotate-[135deg]"
        >
          {/* Background track arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            className="text-slate-800/70"
          />

          {/* Active progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pt-1">
          <div className="flex items-baseline justify-center">
            <span className="text-xl font-bold font-mono tracking-tight text-white">
              {Math.round(clampedValue)}
            </span>
            <span className="text-xs font-mono font-medium text-slate-400 ml-0.5">{unit}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            {title}
          </span>
        </div>
      </div>

      {subtitle && (
        <span className="text-[10px] font-mono text-slate-400 mt-1 truncate max-w-full text-center px-1">
          {subtitle}
        </span>
      )}
    </div>
  );
}
