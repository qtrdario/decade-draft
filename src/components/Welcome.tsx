import { formatMoney } from '../lib/portfolio';
import { OPTIONS_PER_DECADE } from '../lib/constants';

interface WelcomeProps {
  onStart: () => void;
  decadeBudget: number;
  poolByDecade: Record<string, number>;
}

function formatPoolRange(poolByDecade: Record<string, number>): string {
  const counts = Object.values(poolByDecade);
  if (counts.length === 0) return '?';
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  return min === max ? String(min) : `${min}-${max}`;
}

export function Welcome({ onStart, decadeBudget, poolByDecade }: WelcomeProps) {
  const poolRange = formatPoolRange(poolByDecade);
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full animate-fade-up text-center">
        <p className="text-accent text-sm tracking-widest uppercase mb-4">
          The Stock Draft
        </p>
        <h1 className="font-semibold text-5xl sm:text-6xl leading-[1.05] mb-5">
          Can you beat<br />the market?
        </h1>
        <p className="text-grey text-lg leading-relaxed mb-8 max-w-md mx-auto">
          Each decade, read five anonymous IPO prospectuses and allocate{' '}
          <span className="text-accent">{formatMoney(decadeBudget)}</span>.
          Names stay hidden until you lock in - then see what you actually bought.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 text-left max-w-md mx-auto">
          {[
            { n: '5', label: 'Decades' },
            { n: String(OPTIONS_PER_DECADE), label: 'Picks shown' },
            { n: poolRange, label: 'In the pool' },
            { n: '$50K', label: 'Total capital' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-dark-grey bg-dark-grey/30 px-3 py-3 text-center"
            >
              <p className="text-xl text-accent">{item.n}</p>
              <p className="text-xs text-grey mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="inline-flex items-center rounded-full bg-accent px-8 py-3.5 font-semibold text-green-black hover:bg-accent-hover transition-colors cursor-pointer text-lg"
        >
          Start Draft
        </button>

        <p className="mt-6 text-xs text-grey/70 max-w-sm mx-auto">
          Like{' '}
          <a
            href="https://www.82-0.com/"
            className="underline hover:text-off-white"
            target="_blank"
            rel="noreferrer"
          >
            82-0.com
          </a>{' '}
          - blind picks, big reveals, decades of compounding.
        </p>
      </div>
    </div>
  );
}
