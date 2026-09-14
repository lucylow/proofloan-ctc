export function currentEpoch(nowMs: number, genesisMs: number, epochSeconds: number): number {
  if (!Number.isFinite(nowMs) || !Number.isFinite(genesisMs) || !Number.isFinite(epochSeconds) || epochSeconds <= 0) {
    return 0;
  }
  if (nowMs < genesisMs) return 0;
  return Math.floor((nowMs - genesisMs) / (epochSeconds * 1000));
}

export function epochEnd(nowMs: number, genesisMs: number, epochSeconds: number): number {
  if (!Number.isFinite(nowMs) || !Number.isFinite(genesisMs) || !Number.isFinite(epochSeconds) || epochSeconds <= 0) {
    return Number.isFinite(nowMs) ? nowMs : 0;
  }
  const e = currentEpoch(nowMs, genesisMs, epochSeconds);
  return genesisMs + (e + 1) * epochSeconds * 1000;
}

export function secondsToEpochEnd(nowMs: number, genesisMs: number, epochSeconds: number): number {
  if (!Number.isFinite(nowMs) || !Number.isFinite(genesisMs) || !Number.isFinite(epochSeconds) || epochSeconds <= 0) {
    return 0;
  }
  return Math.max(0, Math.ceil((epochEnd(nowMs, genesisMs, epochSeconds) - nowMs) / 1000));
}
