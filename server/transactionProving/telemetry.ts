export interface TraceContext {
  traceId: string;
  spanId: string;
}

export function nextSpan(traceId: string, spanId: string): TraceContext {
  return { traceId, spanId: `${spanId}-next` };
}
