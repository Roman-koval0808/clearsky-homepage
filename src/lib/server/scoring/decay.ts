const HALF_LIVES_DAYS: Record<string, number> = {
  emergency:  2,
  active:     14,
  comparison: 30,
  research:   60,
};

const GRACE_PERIODS_DAYS: Record<string, number> = {
  emergency:  1,
  active:     3,
  comparison: 7,
  research:   14,
};

export interface DecayResult {
  scoreLive: number;
  decayPct: number;
  inGrace: boolean;
}

export function calcScoreLive(
  scoreRaw: number,
  bucket: string,
  lastEventAt: Date
): DecayResult {
  const halfLife   = HALF_LIVES_DAYS[bucket]    ?? 60;
  const grace      = GRACE_PERIODS_DAYS[bucket] ?? 14;
  const daysSince  = (Date.now() - lastEventAt.getTime()) / 86_400_000;

  if (daysSince <= grace) {
    return { scoreLive: scoreRaw, decayPct: 0, inGrace: true };
  }

  const decayedDays = daysSince - grace;
  const live        = scoreRaw * Math.pow(0.5, decayedDays / halfLife);
  const scoreLive   = Math.max(0, Math.round(live));
  const decayPct    = scoreRaw > 0
    ? Math.round((1 - scoreLive / scoreRaw) * 100)
    : 0;

  return { scoreLive, decayPct, inGrace: false };
}
