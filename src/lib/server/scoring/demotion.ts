import { calcScoreLive } from './decay';

const DEMOTION_RULES: Record<string, { threshold: number; demotesTo: string }> = {
  active:     { threshold: 35, demotesTo: 'comparison' },
  comparison: { threshold: 20, demotesTo: 'research'   },
  research:   { threshold: 8,  demotesTo: 'unclassified' },
};

export interface DemotionResult {
  demoted:    boolean;
  newBucket:  string;
  scoreLive:  number;
  decayPct:   number;
  inGrace:    boolean;
}

export function evalDemotion(
  scoreRaw:    number,
  bucket:      string,
  lastEventAt: Date
): DemotionResult {
  // Emergency never demotes — flags as inactive but stays emergency
  if (bucket === 'emergency') {
    const { scoreLive, decayPct, inGrace } = calcScoreLive(scoreRaw, bucket, lastEventAt);
    return { demoted: false, newBucket: 'emergency', scoreLive, decayPct, inGrace };
  }

  const { scoreLive, decayPct, inGrace } = calcScoreLive(scoreRaw, bucket, lastEventAt);

  // Both conditions required — not in grace AND score below threshold
  if (inGrace) {
    return { demoted: false, newBucket: bucket, scoreLive, decayPct, inGrace };
  }

  const rule = DEMOTION_RULES[bucket];
  if (!rule || scoreLive >= rule.threshold) {
    return { demoted: false, newBucket: bucket, scoreLive, decayPct, inGrace };
  }

  return { demoted: true, newBucket: rule.demotesTo, scoreLive, decayPct, inGrace };
}
