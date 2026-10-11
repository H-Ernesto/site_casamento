type Segment = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  title: string;
  subtitle?: string;
  segments: Segment[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
};

export default function CircularProgress({
  title,
  subtitle,
  segments,
  centerLabel,
  centerValue,
  size = 180,
}: Props) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="text-center w-full">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>

      {/* Gráfico SVG Donut */}
      <div className="relative my-6 flex items-center justify-center">
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Círculo de fundo cinza claro se total for 0 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {total > 0 &&
            segments.map((seg, idx) => {
              if (seg.value <= 0) return null;
              const strokeDasharray = `${(seg.value / total) * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedOffset;
              accumulatedOffset += (seg.value / total) * circumference;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              );
            })}
        </svg>

        {/* Texto central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerValue !== undefined && (
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-[0.65rem] font-medium uppercase tracking-wider text-slate-500">
              {centerLabel}
            </span>
          )}
        </div>
      </div>

      {/* Legenda dos segmentos */}
      <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-xs">
        {segments.map((seg, idx) => {
          const percent = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-slate-600">{seg.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{seg.value}</span>
                {total > 0 && <span className="text-[0.65rem] text-slate-400">({percent}%)</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
