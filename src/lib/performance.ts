import type { DecadeAllocation, StockData } from '../types';

export interface ChartLine {
  id: string;
  label: string;
  color: string;
  values: number[];
}

export function computeUserPerformanceSeries(
  data: StockData,
  decadeAllocations: DecadeAllocation[],
): ChartLine {
  const { dates, monthlyPrices } = data.chart;
  const monthKeys = dates.map((d) => d.slice(0, 7));

  const legs: Array<{ fromKey: string; symbol: string; shares: number }> = [];

  for (const da of decadeAllocations) {
    for (const { stock, amount } of da.allocations) {
      if (amount <= 0) continue;
      const prices = monthlyPrices[stock.symbol];
      if (!prices) continue;
      const startKey = stock.startDate.slice(0, 7);
      const startIdx = monthKeys.findIndex((k) => k >= startKey);
      const startPrice = startIdx >= 0 ? prices[startIdx] : null;
      if (startPrice == null || startPrice <= 0) continue;
      legs.push({ fromKey: startKey, symbol: stock.symbol, shares: amount / startPrice });
    }
  }

  const values = monthKeys.map((key, i) => {
    let total = 0;
    for (const leg of legs) {
      if (key >= leg.fromKey) {
        const px = monthlyPrices[leg.symbol]?.[i];
        if (px != null && px > 0) total += leg.shares * px;
      }
    }
    return Math.round(total * 100) / 100;
  });

  return {
    id: 'you',
    label: 'Your portfolio',
    color: '#c4ffb1',
    values,
  };
}

export function getAllChartLines(
  data: StockData,
  decadeAllocations: DecadeAllocation[],
): { dates: string[]; lines: ChartLine[] } {
  const user = computeUserPerformanceSeries(data, decadeAllocations);
  const comparisons: ChartLine[] = data.chart.comparisons.map((c) => ({
    id: c.id,
    label: c.label,
    color: c.color,
    values: c.values,
  }));

  return {
    dates: data.chart.dates,
    lines: [user, ...comparisons],
  };
}

export function formatChartDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatAxisValue(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1000)}K`;
  return `$${Math.round(v)}`;
}
