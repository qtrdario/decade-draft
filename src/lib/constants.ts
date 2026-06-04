import type { DecadeId } from '../types';

export const OPTIONS_PER_DECADE = 5;

export const PROSPECTUS_LABELS = ['A', 'B', 'C', 'D', 'E'] as const;

/** Trap / bust bias symbols per decade - at least one lands in each draft of 5. */
export const RED_HERRING_SYMBOLS: Record<DecadeId, string[]> = {
  '1980s': ['F', 'GE', 'AIG'],
  '1990s': ['IBM', 'XRX', 'CIEN', 'AIG', 'SIRI', 'NOK', 'PLUG', 'SIG'],
  '2000s': [
    'ENRN', 'LEH', 'GE', 'NOK', 'XRX', 'CIEN', 'SOHU', 'M', 'KSS', 'SIRI', 'PLUG', 'AIG', 'INTC',
  ],
  '2010s': [
    'BA', 'M', 'INTC', 'NOK', 'BB', 'GPRO', 'LYFT', 'TRIP', 'W', 'AMC', 'GE', 'KSS', 'PLUG', 'SIG',
  ],
  '2020s': [
    'COIN', 'HOOD', 'CVNA', 'BYND', 'PTON', 'TLRY', 'SPCE', 'DKNG', 'RIVN', 'LCID', 'JOBY', 'AI',
    'UPST', 'AFRM', 'OPEN', 'SKLZ', 'QS', 'ENVX', 'DNA', 'AMC', 'MARA', 'RIOT', 'HUT', 'BITF',
    'BLNK', 'PLUG', 'FCEL', 'U', 'IONQ', 'RGTI', 'HIMS', 'TDOC', 'CLOV',
  ],
};
