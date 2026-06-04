import { useState } from 'react';
import type { DecadeAllocation } from '../types';
import { formatMoney, getDecadeTheme } from '../lib/portfolio';
import { ProspectusBullets } from './ProspectusBullets';
import { AllocationDonut } from './AllocationDonut';

interface DecadeRevealProps {
  allocation: DecadeAllocation;
  round: number;
  total: number;
  isLast: boolean;
  onContinue: () => void;
}

export function DecadeReveal({ allocation, round, total, isLast, onContinue }: DecadeRevealProps) {
  const theme = getDecadeTheme(allocation.decade);
  const [revealed, setRevealed] = useState(false);
  const picks = allocation.allocations.filter((a) => a.amount > 0);
  const allocatedTotal = picks.reduce((sum, p) => sum + p.amount, 0);

  const donutSlices = picks.map((pick) => ({
    label: pick.label,
    amount: pick.amount,
    displayName: pick.stock.symbol,
  }));

  return (
    <div className="flex-1 flex flex-col px-4 py-8 max-w-2xl mx-auto w-full animate-fade-up">
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-widest text-grey mb-2">
          Round {round} of {total} - Reveal
        </p>
        <div
          className={`inline-block rounded-2xl bg-gradient-to-br ${theme.gradient} px-6 py-3 border border-dark-grey mb-4`}
        >
          <p className="font-semibold text-3xl">{allocation.decade}</p>
        </div>
        <h2 className="font-semibold text-2xl mb-2">
          Your {allocation.decade} portfolio
        </h2>
        <p className="text-sm text-grey">
          {revealed
            ? `Here is where your ${formatMoney(allocation.budget)} went.`
            : `Allocation locked. Ready to see what you bought?`}
        </p>
      </div>

      <div className="rounded-xl border border-dark-grey bg-dark-grey/30 p-5 mb-6">
        <AllocationDonut slices={donutSlices} total={allocatedTotal} revealed={revealed} />
      </div>

      <div className="space-y-3 mb-8">
        {picks.map((pick) => (
          <div
            key={pick.stock.symbol}
            className={`rounded-xl border p-4 transition-all duration-500 ${
              revealed
                ? 'border-accent/40 bg-accent/10'
                : 'border-dark-grey bg-dark-grey/30'
            }`}
          >
            {!revealed ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-grey/80">
                  Prospectus {pick.label} - sealed
                </p>
                <p className="text-sm text-grey/60">{formatMoney(pick.amount)}</p>
              </div>
            ) : (
              <div className="animate-fade-up">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-grey/80 mb-1">
                      Prospectus {pick.label}
                    </p>
                    <p className="text-lg font-semibold text-accent">
                      {pick.stock.symbol}
                    </p>
                    <p className="text-off-white">{pick.stock.name}</p>
                    {pick.stock.fate && (
                      <p className="text-xs text-red-300/80 mt-1">{pick.stock.fate}</p>
                    )}
                    <div className="mt-2">
                      <ProspectusBullets prospectus={pick.stock.prospectus} compact />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">{formatMoney(pick.amount)}</p>
                    <p className="text-[10px] text-grey/80">invested</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={revealed ? onContinue : () => setRevealed(true)}
        className="rounded-full bg-accent py-3.5 font-semibold text-green-black hover:bg-accent-hover transition-colors cursor-pointer"
      >
        {revealed
          ? isLast
            ? 'See final results'
            : 'Continue to next decade'
          : 'Reveal portfolio'}
      </button>
    </div>
  );
}
