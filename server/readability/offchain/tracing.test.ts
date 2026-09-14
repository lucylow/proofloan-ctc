import { describe, expect, it } from "vitest";
import { Tracer } from "./tracing";

describe("readability tracer", () => {
  it("records span end once and copies attributes safely", () => {
    const tracer = new Tracer();
    const span = tracer.start("preview", { queryId: "q1" });
    span.end({ ok: true });
    span.end({ ignored: true });
    const listed = tracer.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.end).toBeGreaterThanOrEqual(listed[0]?.start ?? 0);
    expect(listed[0]?.attributes).toEqual({ queryId: "q1", ok: true });
    listed[0]!.attributes.mutated = true;
    expect(tracer.list()[0]?.attributes.mutated).toBeUndefined();
  });
});
