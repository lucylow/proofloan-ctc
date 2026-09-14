export interface TimeWindow { startMs: number; endMs: number; }
export function rollingWindow(nowMs: number, days: number): TimeWindow {
  return { startMs: nowMs - days * 86_400_000, endMs: nowMs };
}
export function withinWindow(timestampMs: number, window: TimeWindow): boolean {
  return timestampMs >= window.startMs && timestampMs <= window.endMs;
}
