import { formatMoney } from '../lib/portfolio';
import type { Prospectus } from '../types';
import { ProspectusBullets } from './ProspectusBullets';

interface AllocationRowProps {
  label: string;
  prospectus: Prospectus;
  amount: number;
  maxAmount: number;
  budget: number;
  onChange: (amount: number) => void;
}

function clampAmount(value: number, maxAmount: number): number {
  return Math.max(0, Math.min(maxAmount, Math.round(value)));
}

export function AllocationRow({
  label,
  prospectus,
  amount,
  maxAmount,
  budget,
  onChange,
}: AllocationRowProps) {
  return (
    <div className="rounded-xl border border-dark-grey bg-dark-grey/30 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-widest text-accent/80 mb-2">
            Prospectus {label}
          </p>
          <ProspectusBullets prospectus={prospectus} />
        </div>
        <div className="text-right shrink-0 pt-1">
          <input
            type="number"
            min={0}
            max={maxAmount}
            step={100}
            value={Math.round(amount)}
            onChange={(e) => onChange(clampAmount(Number(e.target.value) || 0, maxAmount))}
            className="w-24 rounded-lg bg-pure-black/40 border border-grey/30 px-2 py-1.5 text-right text-sm text-off-white focus:outline-none focus:border-accent/60"
          />
          <p className="text-[10px] text-grey/80 mt-1">max {formatMoney(maxAmount)}</p>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={budget}
        step={100}
        value={amount}
        onChange={(e) => onChange(clampAmount(Number(e.target.value), maxAmount))}
        className="w-full accent-accent h-1.5 cursor-pointer"
      />
    </div>
  );
}

export function BudgetSummary({
  budget,
  allocated,
}: {
  budget: number;
  allocated: number;
}) {
  const remaining = budget - allocated;
  const ok = Math.abs(remaining) < 1;

  return (
    <div
      className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
        ok ? 'border-accent/30 bg-accent/10' : 'border-grey/40 bg-dark-grey/40'
      }`}
    >
      <div>
        <p className="text-xs uppercase tracking-wider text-grey">Decade budget</p>
        <p className="text-lg font-semibold">{formatMoney(budget)}</p>
      </div>
      <div className="text-right">
        <p className="text-xs uppercase tracking-wider text-grey">
          {ok ? 'Fully allocated' : 'Remaining'}
        </p>
        <p className={`text-lg font-semibold ${ok ? 'text-accent' : 'text-off-white'}`}>
          {ok ? formatMoney(allocated) : formatMoney(Math.max(0, remaining))}
        </p>
      </div>
    </div>
  );
}
