import { describe, expect, it } from "vitest";
import { createDemoData } from "../../demo/createDemoData";
import { inspectDemoReferences } from "../../demo/validation/referenceIntegrity";

describe("demo reference integrity", () => {
  it("does not produce orphan records in hero scenario", () => {
    const data = createDemoData("hero");
    expect(inspectDemoReferences(data)).toEqual([]);
  });
});
