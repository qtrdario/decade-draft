export interface Prospectus {
  pitch: string;
  valuation: string;
  risk: string;
}

export interface Stock {
  symbol: string;
  name: string;
  fate?: string;
  prospectus: Prospectus;
  startDate: string;
  endDate: string;
  startPrice: number;
  endPrice: number;
  totalReturnPct: number;
  cagrPct: number;
  maxDrawdownPct: number;
}

export interface DecadeData {
  id: string;
  startYear: number;
  endYear: number;
  stocks: Stock[];
}

export interface BenchmarkMetrics {
  startDate: string;
  endDate: string;
  startPrice: number;
  endPrice: number;
  totalReturnPct: number;
  cagrPct: number;
  maxDrawdownPct: number;
}

export interface TierThreshold {
  tier: string;
  minValue: number;
  title: string;
  blurb: string;
}

export interface ComparisonSeries {
  id: string;
  label: string;
  symbol: string;
  color: string;
  values: number[];
}

export interface StockData {
  fetchedAt: string;
  endDate: string;
  source: string;
  startingCapital: number;
  decadeBudget: number;
  poolByDecade: Record<string, number>;
  decades: Record<string, DecadeData>;
  benchmark: {
    symbol: string;
    name: string;
    byDecade: Record<string, BenchmarkMetrics>;
    totalValue: number;
  };
  tiers: TierThreshold[];
  bounds: {
    bestPossibleValue: number;
    worstPossibleValue: number;
  };
  chart: {
    dates: string[];
    comparisons: ComparisonSeries[];
    monthlyPrices: Record<string, (number | null)[]>;
  };
}

export type DecadeId = '1980s' | '1990s' | '2000s' | '2010s' | '2020s';

export const DECADE_ORDER: DecadeId[] = [
  '1980s',
  '1990s',
  '2000s',
  '2010s',
  '2020s',
];

export interface StockAllocation {
  stock: Stock;
  amount: number;
  label: string;
}

export interface DecadeAllocation {
  decade: DecadeId;
  budget: number;
  allocations: StockAllocation[];
}

export interface PositionResult extends StockAllocation {
  decade: DecadeId;
  finalValue: number;
}

export interface PortfolioResult {
  startingCapital: number;
  finalValue: number;
  totalReturnPct: number;
  decadeResults: Array<{
    decade: DecadeId;
    budget: number;
    finalValue: number;
    allocations: Array<StockAllocation & { finalValue: number }>;
  }>;
  positions: PositionResult[];
  benchmarkFinalValue: number;
  benchmarkReturnPct: number;
  beatMarket: boolean;
  bestPossibleValue: number;
  worstPossibleValue: number;
  percentileVsOptimal: number;
  tier: TierThreshold;
  tiers: TierThreshold[];
  decadeAllocations: DecadeAllocation[];
}
