import type {
  DecadeAllocation,
  DecadeId,
  PortfolioResult,
  Stock,
  StockData,
  TierThreshold,
} from '../types';
import { RED_HERRING_SYMBOLS } from './constants';

export function createSeededRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickRandom<T>(items: T[], count: number, rng: () => number = Math.random): T[] {
  const pool = [...items];
  const picks: T[] = [];
  while (picks.length < count && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  return picks;
}

export function pickDecadeOptions(
  items: Stock[],
  count: number,
  decadeId: DecadeId,
  rng: () => number = Math.random,
): Stock[] {
  const herringSymbols = new Set(RED_HERRING_SYMBOLS[decadeId] ?? []);
  const herrings = items.filter((s) => herringSymbols.has(s.symbol));
  const rest = items.filter((s) => !herringSymbols.has(s.symbol));

  if (herrings.length === 0) return pickRandom(items, count, rng);

  const [herring] = pickRandom(herrings, 1, rng);
  const others = pickRandom(rest, count - 1, rng);
  const picked = [herring, ...others];

  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  return picked;
}

export function usedSymbolsFromAllocations(allocations: DecadeAllocation[]): Set<string> {
  return new Set(allocations.flatMap((d) => d.allocations.map((a) => a.stock.symbol)));
}

export function pickDecadeDraftOptions(
  stocks: Stock[],
  count: number,
  decadeId: DecadeId,
  excludedSymbols: Set<string>,
  rng: () => number,
): Stock[] {
  const pool = stocks.filter((s) => !excludedSymbols.has(s.symbol));
  const pickCount = Math.min(count, pool.length);
  if (pickCount === 0) return [];
  return pickDecadeOptions(pool, pickCount, decadeId, rng);
}

function valueFrom(allocation: number, stock: Stock): number {
  return (allocation / stock.startPrice) * stock.endPrice;
}

export function getTierForValue(finalValue: number, tiers: TierThreshold[]): TierThreshold {
  const sorted = [...tiers].sort((a, b) => b.minValue - a.minValue);
  return sorted.find((t) => finalValue >= t.minValue) ?? sorted[sorted.length - 1];
}

export function computePortfolio(
  data: StockData,
  decadeAllocations: DecadeAllocation[],
): PortfolioResult {
  const startingCapital = data.startingCapital;
  const decadeResults = decadeAllocations.map((decadeAlloc) => {
    const allocationResults = decadeAlloc.allocations
      .filter((a) => a.amount > 0)
      .map((a) => ({
        ...a,
        finalValue: valueFrom(a.amount, a.stock),
      }));

    const finalValue = allocationResults.reduce((sum, a) => sum + a.finalValue, 0);

    return {
      decade: decadeAlloc.decade,
      budget: decadeAlloc.budget,
      finalValue,
      allocations: allocationResults,
    };
  });

  const positions = decadeResults.flatMap((dr) =>
    dr.allocations.map((a) => ({
      decade: dr.decade,
      stock: a.stock,
      amount: a.amount,
      label: a.label,
      finalValue: a.finalValue,
    })),
  );

  const finalValue = decadeResults.reduce((sum, d) => sum + d.finalValue, 0);
  const totalReturnPct = ((finalValue - startingCapital) / startingCapital) * 100;
  const benchmarkFinalValue = data.benchmark.totalValue;
  const benchmarkReturnPct =
    ((benchmarkFinalValue - startingCapital) / startingCapital) * 100;

  const { bestPossibleValue, worstPossibleValue } = data.bounds;
  const range = bestPossibleValue - worstPossibleValue;
  const percentileVsOptimal =
    range > 0 ? ((finalValue - worstPossibleValue) / range) * 100 : 50;

  const tier = getTierForValue(finalValue, data.tiers);

  return {
    startingCapital,
    finalValue,
    totalReturnPct,
    decadeResults,
    positions,
    benchmarkFinalValue,
    benchmarkReturnPct,
    beatMarket: finalValue >= benchmarkFinalValue,
    bestPossibleValue,
    worstPossibleValue,
    percentileVsOptimal,
    tier,
    tiers: data.tiers,
    decadeAllocations,
  };
}

export function formatMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${Math.round(n).toLocaleString()}`;
  return `$${n.toFixed(2)}`;
}

export function formatPct(n: number): string {
  const sign = n >= 0 ? '+' : '';
  if (Math.abs(n) >= 1000) return `${sign}${(n / 1000).toFixed(1)}k%`;
  return `${sign}${n.toFixed(1)}%`;
}

export function buildShareText(result: PortfolioResult): string {
  const topPicks = result.positions
    .sort((a, b) => b.finalValue - a.finalValue)
    .slice(0, 6)
    .map((p) => p.stock.symbol)
    .join(' / ');
  return (
    `Decade Draft: I turned $50K into ${formatMoney(result.finalValue)} (${formatPct(result.totalReturnPct)})\n` +
    `Tier: ${result.tier.tier} - ${result.tier.title}\n` +
    `Top picks: ${topPicks}\n` +
    `Can you beat the market?`
  );
}

export function getDecadeTheme(decade: DecadeId) {
  const themes: Record<
    DecadeId,
    { gradient: string; accent: string; label: string; event: string }
  > = {
    '1980s': {
      gradient: 'from-[#3d4a41]/90 to-[#151916]',
      accent: '#c4ffb1',
      label: 'Wall Street Boom',
      event: 'Black Monday | Reaganomics | MTV',
    },
    '1990s': {
      gradient: 'from-[#3d4a41]/80 to-[#151916]',
      accent: '#c4ffb1',
      label: 'Dot-Com Dawn',
      event: 'Internet IPO mania | Y2K | Grunge',
    },
    '2000s': {
      gradient: 'from-[#3d4a41]/70 to-[#151916]',
      accent: '#a7b2a7',
      label: 'Bust & Recovery',
      event: 'Dot-com crash | GFC | iPhone',
    },
    '2010s': {
      gradient: 'from-[#3d4a41]/85 to-[#151916]',
      accent: '#c4ffb1',
      label: 'Bull Run',
      event: 'FAANG era | QE | Instagram',
    },
    '2020s': {
      gradient: 'from-[#3d4a41]/75 to-[#151916]',
      accent: '#f0f2ec',
      label: 'Meme to AI',
      event: 'COVID crash | Meme stocks | ChatGPT',
    },
  };
  return themes[decade];
}

export function getTierStyle(tier: string) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    S: { bg: 'bg-accent/25', text: 'text-accent', border: 'border-accent/50' },
    A: { bg: 'bg-off-white/10', text: 'text-off-white', border: 'border-off-white/30' },
    B: { bg: 'bg-grey/20', text: 'text-grey', border: 'border-grey/40' },
    C: { bg: 'bg-dark-grey/40', text: 'text-grey', border: 'border-dark-grey' },
    D: { bg: 'bg-dark-grey/60', text: 'text-grey/80', border: 'border-dark-grey' },
    F: { bg: 'bg-red-950/50', text: 'text-red-400', border: 'border-red-800/40' },
  };
  return styles[tier] ?? styles.F;
}
