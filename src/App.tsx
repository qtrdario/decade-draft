import { useCallback, useMemo, useState } from 'react';
import stockData from './data/stock-data.json';
import type { DecadeAllocation, StockData } from './types';
import { DECADE_ORDER } from './types';
import {
  computePortfolio,
  createSeededRng,
  pickDecadeDraftOptions,
  usedSymbolsFromAllocations,
} from './lib/portfolio';
import { OPTIONS_PER_DECADE } from './lib/constants';
import { Layout } from './components/Layout';
import { Welcome } from './components/Welcome';
import { DraftRound } from './components/DraftRound';
import { DecadeReveal } from './components/DecadeReveal';
import { Results } from './components/Results';

type Phase = 'welcome' | 'draft' | 'reveal' | 'results';

const data = stockData as StockData;

function newGameSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}

function draftSeed(gameSeed: number, roundIndex: number): number {
  return (gameSeed + roundIndex * 9973) >>> 0;
}

function App() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [roundIndex, setRoundIndex] = useState(0);
  const [decadeAllocations, setDecadeAllocations] = useState<DecadeAllocation[]>([]);
  const [pendingReveal, setPendingReveal] = useState<DecadeAllocation | null>(null);
  const [gameSeed, setGameSeed] = useState<number | null>(null);

  const usedSymbols = useMemo(
    () => usedSymbolsFromAllocations(decadeAllocations),
    [decadeAllocations],
  );

  const currentDecade = DECADE_ORDER[roundIndex];

  const currentOptions = useMemo(() => {
    if (gameSeed == null || !currentDecade) return null;

    const rng = createSeededRng(draftSeed(gameSeed, roundIndex));
    return pickDecadeDraftOptions(
      data.decades[currentDecade].stocks,
      OPTIONS_PER_DECADE,
      currentDecade,
      usedSymbols,
      rng,
    );
  }, [gameSeed, roundIndex, currentDecade, usedSymbols]);

  const startDraft = useCallback(() => {
    setGameSeed(newGameSeed());
    setPhase('draft');
    setRoundIndex(0);
    setDecadeAllocations([]);
    setPendingReveal(null);
  }, []);

  const handleConfirm = useCallback((allocation: DecadeAllocation) => {
    setPendingReveal(allocation);
    setPhase('reveal');
  }, []);

  const handleRevealContinue = useCallback(() => {
    if (!pendingReveal) return;

    const next = [...decadeAllocations, pendingReveal];
    setDecadeAllocations(next);
    setPendingReveal(null);

    if (roundIndex >= DECADE_ORDER.length - 1) {
      setPhase('results');
    } else {
      setRoundIndex((i) => i + 1);
      setPhase('draft');
    }
  }, [pendingReveal, decadeAllocations, roundIndex]);

  const result = useMemo(
    () =>
      decadeAllocations.length === DECADE_ORDER.length
        ? computePortfolio(data, decadeAllocations)
        : null,
    [decadeAllocations],
  );

  const playAgain = useCallback(() => {
    setGameSeed(null);
    setPhase('welcome');
    setRoundIndex(0);
    setDecadeAllocations([]);
    setPendingReveal(null);
  }, []);

  return (
    <Layout>
      {phase === 'welcome' && (
        <Welcome
          onStart={startDraft}
          decadeBudget={data.decadeBudget}
          poolByDecade={data.poolByDecade}
        />
      )}
      {phase === 'draft' && currentDecade && currentOptions && currentOptions.length > 0 && (
        <DraftRound
          key={`${gameSeed}-${roundIndex}-${[...usedSymbols].join(',')}`}
          decade={currentDecade}
          options={currentOptions}
          budget={data.decadeBudget}
          onConfirm={handleConfirm}
          round={roundIndex + 1}
          total={DECADE_ORDER.length}
        />
      )}
      {phase === 'reveal' && pendingReveal && (
        <DecadeReveal
          allocation={pendingReveal}
          round={roundIndex + 1}
          total={DECADE_ORDER.length}
          isLast={roundIndex >= DECADE_ORDER.length - 1}
          onContinue={handleRevealContinue}
        />
      )}
      {phase === 'results' && result && (
        <Results result={result} stockData={data} onPlayAgain={playAgain} />
      )}
    </Layout>
  );
}

export default App;
