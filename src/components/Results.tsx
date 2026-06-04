import { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import type { PortfolioResult, StockData } from '../types';
import {
  buildShareText,
  formatMoney,
  formatPct,
  getDecadeTheme,
  getTierStyle,
} from '../lib/portfolio';
import { getAllChartLines } from '../lib/performance';
import { ShareCard } from './ShareCard';
import { PerformanceChart } from './PerformanceChart';

interface ResultsProps {
  result: PortfolioResult;
  stockData: StockData;
  onPlayAgain: () => void;
}

export function Results({ result, stockData, onPlayAgain }: ResultsProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const style = getTierStyle(result.tier.tier);
  const diff = result.finalValue - result.benchmarkFinalValue;
  const sortedTiers = [...result.tiers].sort((a, b) => b.minValue - a.minValue);

  const chartData = useMemo(
    () => getAllChartLines(stockData, result.decadeAllocations),
    [stockData, result.decadeAllocations],
  );

  async function exportCard(): Promise<Blob | null> {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#151916',
      scale: 2,
      useCORS: true,
    });
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
  }

  async function share() {
    setSharing(true);
    try {
      const blob = await exportCard();
      const text = buildShareText(result);
      const url = window.location.origin + window.location.pathname;
      const file = blob ? new File([blob], 'decade-draft-portfolio.png', { type: 'image/png' }) : null;

      if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Decade Draft',
            text,
            url,
            files: [file],
          });
          return;
        } catch {
          /* fall through */
        }
      }

      if (blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'decade-draft-portfolio.png';
        link.click();
        URL.revokeObjectURL(link.href);
      }

      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert(blob ? 'Portfolio card downloaded and text copied!' : 'Results copied to clipboard!');
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full animate-fade-up">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-grey mb-2">
          Final Portfolio
        </p>
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl text-4xl font-bold mb-4 border ${style.bg} ${style.text} ${style.border}`}
        >
          {result.tier.tier}
        </div>
        <h2 className="font-semibold text-3xl mb-1">{result.tier.title}</h2>
        <p className="text-grey text-sm">{result.tier.blurb}</p>
      </div>

      <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-6 mb-6 text-center">
        <p className="text-sm text-grey mb-1">Your $50,000 became</p>
        <p className="text-4xl sm:text-5xl font-semibold text-accent mb-2">
          {formatMoney(result.finalValue)}
        </p>
        <p className="text-lg text-accent">{formatPct(result.totalReturnPct)}</p>
      </div>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-grey mb-3">
          Performance vs the market
        </p>
        <PerformanceChart dates={chartData.dates} lines={chartData.lines} />
      </div>

      <div className="rounded-2xl border border-dark-grey overflow-hidden mb-6">
        <div className="px-4 py-3 bg-dark-grey/30 border-b border-dark-grey">
          <p className="text-xs uppercase tracking-widest text-grey">Tier ladder</p>
        </div>
        <ul className="divide-y divide-dark-grey/50">
          {sortedTiers.map((t) => {
            const active = t.tier === result.tier.tier;
            const ts = getTierStyle(t.tier);
            return (
              <li
                key={t.tier}
                className={`px-4 py-3 flex items-center gap-3 ${active ? 'bg-dark-grey/30' : ''}`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border ${ts.bg} ${ts.text} ${ts.border}`}
                >
                  {t.tier}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${active ? 'text-off-white' : 'text-grey'}`}>
                    {t.title}
                  </p>
                  <p className="text-xs text-grey/80">{t.blurb}</p>
                </div>
                <p className="text-sm text-grey shrink-0">
                  {formatMoney(t.minValue)}+
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatBox
          label="S&P 500 benchmark"
          value={formatMoney(result.benchmarkFinalValue)}
          sub={formatPct(result.benchmarkReturnPct)}
        />
        <StatBox
          label="vs benchmark"
          value={formatMoney(Math.abs(diff))}
          sub={diff >= 0 ? 'ahead' : 'behind'}
          positive={diff >= 0}
        />
        <StatBox
          label="S-tier threshold"
          value={formatMoney(sortedTiers.find((t) => t.tier === 'S')?.minValue ?? 0)}
          sub="god-tier draft"
        />
        <StatBox
          label="Draft percentile"
          value={`${Math.round(result.percentileVsOptimal)}th`}
          sub="vs worst/best"
        />
      </div>

      <div className="rounded-2xl border border-dark-grey overflow-hidden mb-6">
        <div className="px-4 py-3 bg-dark-grey/30 border-b border-dark-grey">
          <p className="text-xs uppercase tracking-widest text-grey">Your allocations</p>
        </div>
        <ul className="divide-y divide-dark-grey/50">
          {result.decadeResults.map((dr) => {
            const theme = getDecadeTheme(dr.decade);
            return (
              <li key={dr.decade} className="px-4 py-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background: theme.accent }} />
                  <div className="flex-1">
                    <p className="text-xs text-grey">{dr.decade}</p>
                    <p className="text-sm">{formatMoney(dr.finalValue)}</p>
                  </div>
                  <p className="text-xs text-grey/80">from {formatMoney(dr.budget)}</p>
                </div>
                <div className="ml-5 space-y-1">
                  {dr.allocations.map((a) => (
                    <div key={a.stock.symbol} className="flex justify-between text-xs">
                      <span className="text-grey">
                        {a.stock.symbol}{' '}
                        <span className="text-grey/70">
                          ({formatMoney(a.amount)} / {formatPct(a.stock.totalReturnPct)})
                        </span>
                      </span>
                      <span className="text-accent/80">{formatMoney(a.finalValue)}</span>
                    </div>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden>
        <ShareCard ref={cardRef} result={result} />
      </div>

      <div className="rounded-2xl border border-dark-grey p-4 mb-6 bg-dark-grey/20">
        <p className="text-xs uppercase tracking-widest text-grey mb-3">Share preview</p>
        <div className="overflow-x-auto flex justify-center">
          <div className="scale-[0.65] origin-top sm:scale-75">
            <ShareCard result={result} />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={share}
          disabled={sharing}
          className="flex-1 rounded-full bg-accent py-3 font-semibold text-green-black hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-60"
        >
          {sharing ? 'Generating card...' : 'Share Portfolio Card'}
        </button>
        <button
          onClick={onPlayAgain}
          className="flex-1 rounded-full border border-grey/40 py-3 font-semibold hover:bg-dark-grey/40 transition-colors cursor-pointer"
        >
          Draft Again
        </button>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-dark-grey bg-dark-grey/30 p-3">
      <p className="text-[10px] uppercase tracking-wider text-grey/80 mb-1">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      <p
        className={`text-xs mt-0.5 ${
          positive === true
            ? 'text-accent'
            : positive === false
              ? 'text-red-400'
              : 'text-grey'
        }`}
      >
        {sub}
      </p>
    </div>
  );
}
