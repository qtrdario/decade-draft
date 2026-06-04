import { formatMoney } from '../lib/portfolio';

const SLICE_COLORS = ['#c4ffb1', '#a7b2a7', '#f0f2ec', '#3d4a41', '#ffffff'];

export interface DonutSlice {
  label: string;
  amount: number;
  displayName?: string;
}

interface AllocationDonutProps {
  slices: DonutSlice[];
  total: number;
  revealed: boolean;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeDonutSlice(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
) {
  const outerStart = polarToCartesian(cx, cy, outerR, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

export function AllocationDonut({ slices, total, revealed }: AllocationDonutProps) {
  const cx = 80;
  const cy = 80;
  const outerR = 72;
  const innerR = 44;
  let cursor = 0;

  const arcs = slices.map((slice, i) => {
    const pct = slice.amount / total;
    const startAngle = cursor;
    const endAngle = cursor + pct * 360;
    cursor = endAngle;
    const color = SLICE_COLORS[i % SLICE_COLORS.length];

    return { slice, pct, startAngle, endAngle, color, i };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg width={160} height={160} viewBox="0 0 160 160" className="drop-shadow-lg">
          {arcs.map(({ slice, startAngle, endAngle, color, i }) => {
            if (slice.amount <= 0) return null;
            const sweep = endAngle - startAngle;
            if (sweep >= 359.99) {
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r={outerR} fill={color} opacity={0.9} />
                  <circle cx={cx} cy={cy} r={innerR} fill="#151916" />
                </g>
              );
            }
            return (
              <path
                key={i}
                d={describeDonutSlice(cx, cy, outerR, innerR, startAngle, endAngle)}
                fill={color}
                opacity={0.9}
              />
            );
          })}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            className="fill-grey text-[9px] uppercase"
          >
            Allocated
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            className="fill-accent text-[11px] font-semibold"
          >
            {formatMoney(total)}
          </text>
        </svg>
      </div>

      <ul className="flex-1 w-full space-y-2">
        {arcs.map(({ slice, pct, color, i }) => (
          <li key={i} className="flex items-center gap-2.5 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2">
              <span className="text-off-white truncate">
                {revealed && slice.displayName ? (
                  <>
                    <span className="text-accent">{slice.displayName}</span>
                    <span className="text-grey/80 text-xs ml-1.5">({slice.label})</span>
                  </>
                ) : (
                  <>Prospectus {slice.label}</>
                )}
              </span>
              <span className="text-grey shrink-0 text-xs">
                {formatMoney(slice.amount)} ({Math.round(pct * 100)}%)
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
