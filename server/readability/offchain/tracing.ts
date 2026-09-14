export type Span = {
  traceId: string;
  name: string;
  start: number;
  end?: number;
  attributes: Record<string, unknown>;
};

export type SpanHandle = {
  traceId: string;
  end: (more?: Record<string, unknown>) => void;
};

export class Tracer {
  private spans: Span[] = [];

  start(name: string, attributes: Record<string, unknown> = {}): SpanHandle {
    const span: Span = {
      traceId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      start: Date.now(),
      attributes: { ...attributes },
    };
    this.spans.push(span);
    return {
      traceId: span.traceId,
      end: (more: Record<string, unknown> = {}) => {
        if (span.end != null) return;
        span.end = Date.now();
        Object.assign(span.attributes, more);
      },
    };
  }

  list(): Span[] {
    return this.spans.map(span => ({ ...span, attributes: { ...span.attributes } }));
  }
}
