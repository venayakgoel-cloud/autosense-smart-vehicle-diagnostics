import type { DiagnosticScan } from '../types/autosense';

interface HealthScoreGaugeProps {
  score: number;
  label?: string;
}

export function HealthScoreGauge({ score, label = 'Overall Health' }: HealthScoreGaugeProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const strokeColor =
    clamped >= 85 ? '#3B82F6' : clamped >= 65 ? '#F59E0B' : '#EF4444';
  const statusText =
    clamped >= 85 ? 'Good Condition' : clamped >= 65 ? 'Check Recommended' : 'Attention Needed';

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 132 132" aria-hidden="true">
          <circle
            cx="66"
            cy="66"
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth="10"
          />
          <circle
            cx="66"
            cy="66"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-display font-bold text-white tabular-nums">{clamped}</span>
          <span className="text-[11px] text-slate-400 tabular-nums">/ 100</span>
        </div>
      </div>
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-base font-semibold text-white">{statusText}</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Composite score across engine diagnostics, monitored sensors, and active codes.
        </p>
      </div>
    </div>
  );
}

interface TelemetryTrendChartProps {
  scans: DiagnosticScan[];
  metric: 'overallHealthScore' | 'coolantTempC' | 'batteryVoltage';
  title: string;
  unit: string;
}

export function TelemetryTrendChart({
  scans,
  metric,
  title,
  unit,
}: TelemetryTrendChartProps) {
  const validScans = [...scans]
    .filter((s) => {
      if (metric === 'batteryVoltage') return s.supportedSensors.battery && s.batteryVoltage > 0;
      if (metric === 'coolantTempC') return s.supportedSensors.coolantTemp;
      return true;
    })
    .slice(0, 8)
    .reverse();

  if (validScans.length === 0) {
    return (
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[210px]">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-400 mt-1">Historical trend chart</p>
        </div>
        <div className="py-8 text-center">
          <p className="text-sm text-slate-400">
            No supported historical readings available yet for this metric.
          </p>
        </div>
      </div>
    );
  }

  const values = validScans.map((s) => s[metric]);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const minVal = metric === 'overallHealthScore' ? 0 : Math.floor(rawMin - 5);
  const maxVal = metric === 'overallHealthScore' ? 100 : Math.ceil(rawMax + 5);
  const range = Math.max(1, maxVal - minVal);

  const width = 460;
  const height = 136;
  const padX = 24;
  const padY = 18;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = validScans.map((s, idx) => {
    const x =
      validScans.length === 1
        ? width / 2
        : padX + (idx / (validScans.length - 1)) * innerW;
    const y = padY + innerH - ((s[metric] - minVal) / range) * innerH;
    return { x, y, val: s[metric], scan: s };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - padY} L ${points[0].x.toFixed(1)} ${height - padY} Z`
      : '';

  const latest = validScans[validScans.length - 1];

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-400">
            {validScans.length} recorded {validScans.length === 1 ? 'scan' : 'scans'}
            {latest.isDemoData ? ' · DEMO DATA' : ''}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xl font-mono font-semibold text-white tabular-nums">
            {latest[metric]}
            {unit}
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-36 overflow-visible"
        role="img"
        aria-label={`${title} historical chart`}
      >
        <defs>
          <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <line x1={padX} y1={padY} x2={width - padX} y2={padY} stroke="#1E293B" strokeDasharray="3 3" />
        <line x1={padX} y1={height / 2} x2={width - padX} y2={height / 2} stroke="#1E293B" strokeDasharray="3 3" />
        <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="#1E293B" />

        {areaPath && <path d={areaPath} fill={`url(#grad-${metric})`} />}
        {points.length > 1 && (
          <path d={linePath} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {points.map((p) => (
          <g key={p.scan.id}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="#0F172A" stroke="#3B82F6" strokeWidth="2.5" />
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              className="fill-slate-300 text-[10px] font-mono tabular-nums"
            >
              {p.val}
            </text>
          </g>
        ))}
      </svg>

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
        <span>
          {validScans[0].scannedAtIso
            ? new Date(validScans[0].scannedAtIso).toLocaleDateString()
            : 'Start'}
        </span>
        <span>
          {latest.scannedAtIso ? new Date(latest.scannedAtIso).toLocaleDateString() : 'Latest'}
        </span>
      </div>
    </div>
  );
}
