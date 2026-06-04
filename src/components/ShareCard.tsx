import { forwardRef } from 'react';
import type { PortfolioResult } from '../types';
import { formatMoney, formatPct, getDecadeTheme, getTierStyle } from '../lib/portfolio';

interface ShareCardProps {
  result: PortfolioResult;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { result },
  ref,
) {
  const style = getTierStyle(result.tier.tier);
  const topPositions = [...result.positions]
    .sort((a, b) => b.finalValue - a.finalValue)
    .slice(0, 8);

  return (
    <div
      ref={ref}
      className="w-[540px] bg-green-black text-off-white overflow-hidden"
      style={{ fontFamily: '"Funnel Sans", system-ui, sans-serif' }}
    >
      <div className="px-8 pt-8 pb-6 border-b border-dark-grey bg-gradient-to-br from-accent/15 to-transparent">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center font-bold text-green-black text-sm">
              DD
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">Decade Draft</p>
              <p className="text-[10px] uppercase tracking-widest text-grey">
                Historical Portfolio
              </p>
            </div>
          </div>
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold border ${style.bg} ${style.text} ${style.border}`}
          >
            {result.tier.tier}
          </div>
        </div>

        <p className="text-sm text-grey mb-1">$50,000 became</p>
        <p className="text-5xl font-bold text-accent mb-1 tabular-nums">
          {formatMoney(result.finalValue)}
        </p>
        <p className="text-xl text-accent font-semibold tabular-nums">
          {formatPct(result.totalReturnPct)}
        </p>
        <p className={`mt-3 text-sm font-medium ${style.text}`}>
          {result.tier.title} - {result.tier.blurb}
        </p>
      </div>

      <div className="px-8 py-6">
        <p className="text-[10px] uppercase tracking-widest text-grey/80 mb-4">Portfolio breakdown</p>
        <div className="space-y-3">
          {result.decadeResults.map((dr) => {
            const theme = getDecadeTheme(dr.decade);
            const symbols = dr.allocations
              .map((a) => {
                const pct = dr.budget > 0 ? Math.round((a.amount / dr.budget) * 100) : 0;
                return pct >= 15 ? `${a.stock.symbol} ${pct}%` : a.stock.symbol;
              })
              .join('  ');
            return (
              <div key={dr.decade} className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full shrink-0" style={{ background: theme.accent }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-grey">{dr.decade}</p>
                  <p className="text-sm truncate">{symbols}</p>
                </div>
                <p className="text-sm text-accent shrink-0 tabular-nums">
                  {formatMoney(dr.finalValue)}
                </p>
              </div>
            );
          })}
        </div>

        {topPositions.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-grey/80 mt-6 mb-3">
              Top holdings today
            </p>
            <div className="flex flex-wrap gap-2">
              {topPositions.map((p) => (
                <span
                  key={`${p.decade}-${p.stock.symbol}`}
                  className="rounded-full bg-dark-grey/50 border border-dark-grey px-3 py-1 text-xs"
                >
                  {p.stock.symbol}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-8 py-4 bg-pure-black/30 border-t border-dark-grey flex items-center justify-between">
        <p className="text-xs text-grey/70">Can you beat the market?</p>
        <p className="text-xs text-grey">
          S&P 500: {formatMoney(result.benchmarkFinalValue)}
        </p>
      </div>
    </div>
  );
});
