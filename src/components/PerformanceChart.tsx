import { useMemo, useState } from 'react';
import type { ChartLine } from '../lib/performance';
import { formatAxisValue, formatChartDate } from '../lib/performance';

interface PerformanceChartProps {
  dates: string[];
  lines: ChartLine[];
}

const WIDTH = 640;
const HEIGHT = 280;
const PAD = { top: 16, right: 16, bottom: 36, left: 72 };

export function PerformanceChart({ dates, lines }: PerformanceChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { paths, yTicks, xLabels, minY, maxY } = useMemo(() => {
    const allValues = lines.flatMap((l) => l.values.filter((v) => v > 0));
    const minY = 0;
    const maxY = Math.max(...allValues, 10000) * 1.08;

    const innerW = WIDTH - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;

    const paths = lines.map((line) => {
      const pts = line.values
        .map((v, i) => {
          if (v <= 0) return null;
          const x = PAD.left + (i / Math.max(dates.length - 1, 1)) * innerW;
          const y = PAD.top + innerH - (v - minY) / (maxY - minY) * innerH;
          return `${x},${y}`;
        })
        .filter(Boolean);
      return { ...line, d: pts.length > 1 ? `M ${pts.join(' L ')}` : '' };
    });

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      y: PAD.top + innerH - t * innerH,
      label: formatAxisValue(minY + t * (maxY - minY)),
    }));

    const xLabels = [0, Math.floor(dates.length / 2), dates.length - 1].map((i) => ({
      x: PAD.left + (i / Math.max(dates.length - 1, 1)) * innerW,
      label: formatChartDate(dates[i] ?? dates[0]),
    }));

    return { paths, yTicks, xLabels, minY, maxY };
  }, [dates, lines]);

  const innerW = WIDTH - PAD.left - PAD.right;
  const hoverX =
    hoverIdx == null
      ? null
      : PAD.left + (hoverIdx / Math.max(dates.length - 1, 1)) * innerW;

  return (
    <div className="rounded-2xl border border-dark-grey bg-dark-grey/20 p-4">
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
        {lines.map((line) => (
          <div key={line.id} className="flex items-center gap-2 text-xs">
            <span
              className="w-3 h-0.5 rounded-full shrink-0"
              style={{ background: line.color }}
            />
            <span className="text-grey">{line.label}</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full min-w-[320px]"
          onMouseLeave={() => setHoverIdx(null)}
        >
          {yTicks.map((t) => (
            <g key={t.label}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={t.y}
                y2={t.y}
                stroke="#a7b2a7"
                strokeOpacity={0.15}
              />
              <text
                x={PAD.left - 8}
                y={t.y + 4}
                textAnchor="end"
                fill="#a7b2a7"
                fillOpacity={0.7}
                fontSize={10}
                fontFamily="Funnel Sans, system-ui, sans-serif"
              >
                {t.label}
              </text>
            </g>
          ))}

          {paths.map(
            (p) =>
              p.d && (
                <path
                  key={p.id}
                  d={p.d}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={p.id === 'you' ? 2.5 : 1.5}
                  strokeOpacity={p.id === 'you' ? 1 : 0.75}
                />
              ),
          )}

          {xLabels.map((l) => (
            <text
              key={l.label}
              x={l.x}
              y={HEIGHT - 10}
              textAnchor="middle"
              fill="#a7b2a7"
              fillOpacity={0.7}
              fontSize={10}
              fontFamily="Funnel Sans, system-ui, sans-serif"
            >
              {l.label}
            </text>
          ))}

          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={HEIGHT - PAD.top - PAD.bottom}
            fill="transparent"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              setHoverIdx(Math.round(ratio * (dates.length - 1)));
            }}
          />

          {hoverIdx != null && hoverX != null && (
            <>
              <line
                x1={hoverX}
                x2={hoverX}
                y1={PAD.top}
                y2={HEIGHT - PAD.bottom}
                stroke="#a7b2a7"
                strokeOpacity={0.25}
              />
              {lines.map((line) => {
                const v = line.values[hoverIdx];
                if (!v || v <= 0) return null;
                const innerH = HEIGHT - PAD.top - PAD.bottom;
                const y = PAD.top + innerH - (v - minY) / (maxY - minY) * innerH;
                return (
                  <circle
                    key={line.id}
                    cx={hoverX}
                    cy={y}
                    r={4}
                    fill={line.color}
                  />
                );
              })}
            </>
          )}
        </svg>
      </div>

      {hoverIdx != null && (
        <div className="mt-3 rounded-lg bg-pure-black/40 border border-dark-grey px-3 py-2">
          <p className="text-xs text-grey mb-2">{formatChartDate(dates[hoverIdx])}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {lines.map((line) => {
              const v = line.values[hoverIdx];
              if (!v || v <= 0) return null;
              return (
                <div key={line.id} className="text-xs">
                  <span style={{ color: line.color }}>{line.label}: </span>
                  <span className="text-off-white/80">{formatAxisValue(v)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[10px] text-grey/70 mt-3">
        $10K deployed at the start of each decade. Dividend-adjusted monthly prices via Yahoo Finance.
      </p>
    </div>
  );
}
