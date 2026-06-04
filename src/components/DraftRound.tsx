import { useMemo, useState } from 'react';
import type { DecadeAllocation, DecadeId, Stock } from '../types';
import { PROSPECTUS_LABELS } from '../lib/constants';
import { getDecadeTheme } from '../lib/portfolio';
import { AllocationRow, BudgetSummary } from './AllocationRow';

interface DraftRoundProps {
  decade: DecadeId;
  options: Stock[];
  budget: number;
  onConfirm: (allocation: DecadeAllocation) => void;
  round: number;
  total: number;
}

function initAmounts(options: Stock[]): Record<string, number> {
  return Object.fromEntries(options.map((s) => [s.symbol, 0]));
}

function splitEvenlyAmounts(options: Stock[], budget: number): Record<string, number> {
  const each = Math.floor(budget / options.length / 100) * 100;
  const amounts: Record<string, number> = {};
  options.forEach((s, i) => {
    amounts[s.symbol] = i === 0 ? budget - each * (options.length - 1) : each;
  });
  return amounts;
}

export function DraftRound({
  decade,
  options,
  budget,
  onConfirm,
  round,
  total,
}: DraftRoundProps) {
  const theme = getDecadeTheme(decade);
  const [amounts, setAmounts] = useState<Record<string, number>>(() => initAmounts(options));

  const allocated = useMemo(
    () => Object.values(amounts).reduce((sum, n) => sum + n, 0),
    [amounts],
  );

  const canContinue =
    Math.abs(allocated - budget) < 1 && Object.values(amounts).some((n) => n > 0);

  function setAmount(symbol: string, value: number) {
    const others = Object.entries(amounts)
      .filter(([s]) => s !== symbol)
      .reduce((sum, [, n]) => sum + n, 0);
    const maxForStock = Math.max(0, budget - others);
    setAmounts((prev) => ({
      ...prev,
      [symbol]: Math.max(0, Math.min(maxForStock, Math.round(value))),
    }));
  }

  function confirm() {
    onConfirm({
      decade,
      budget,
      allocations: options
        .map((stock, i) => ({
          stock,
          amount: amounts[stock.symbol] ?? 0,
          label: PROSPECTUS_LABELS[i] ?? String(i + 1),
        }))
        .filter((a) => a.amount > 0),
    });
  }

  return (
    <div className="flex-1 flex flex-col px-4 py-6 max-w-2xl mx-auto w-full animate-fade-up">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-grey uppercase tracking-widest">
            Round {round} of {total}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full ${
                  i < round ? 'bg-accent' : i === round - 1 ? 'bg-accent/60' : 'bg-dark-grey'
                }`}
              />
            ))}
          </div>
        </div>

        <div
          className={`rounded-2xl bg-gradient-to-br ${theme.gradient} p-5 border border-dark-grey mb-4`}
        >
          <p className="font-semibold text-4xl mb-1">{decade}</p>
          <p className="text-sm font-medium" style={{ color: theme.accent }}>
            {theme.label}
          </p>
          <p className="text-xs text-grey mt-2">{theme.event}</p>
        </div>

        <h2 className="font-semibold text-2xl mb-1">
          Read the prospectuses
        </h2>
        <p className="text-sm text-grey mb-4">
          Five anonymous offerings from this era. Allocate your {decade} budget - names
          stay hidden until you lock in.
        </p>

        <BudgetSummary budget={budget} allocated={allocated} />
      </div>

      <div className="grid gap-3 mb-4 flex-1 overflow-y-auto max-h-[50vh] pr-1">
        {options.map((stock, i) => {
          const others = Object.entries(amounts)
            .filter(([s]) => s !== stock.symbol)
            .reduce((sum, [, n]) => sum + n, 0);
          const maxAmount = Math.max(0, budget - others);
          return (
            <AllocationRow
              key={stock.symbol}
              label={PROSPECTUS_LABELS[i] ?? String(i + 1)}
              prospectus={stock.prospectus}
              amount={amounts[stock.symbol] ?? 0}
              maxAmount={maxAmount}
              budget={budget}
              onChange={(v) => setAmount(stock.symbol, v)}
            />
          );
        })}
      </div>

      <div className="flex gap-3 pt-2 sticky bottom-0 bg-green-black pb-2">
        <button
          type="button"
          onClick={() => setAmounts(splitEvenlyAmounts(options, budget))}
          className="rounded-full border border-grey/40 px-5 py-3 text-sm font-medium hover:bg-dark-grey/40 transition-colors cursor-pointer"
        >
          Split evenly
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={!canContinue}
          className="flex-1 rounded-full bg-accent py-3 font-semibold text-green-black hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Lock in allocation
        </button>
      </div>
    </div>
  );
}
