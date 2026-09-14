import { describe, expect, it } from "vitest";
import { createDemoData } from "@/demo/createDemoData";
import { selectPrimaryApplication, selectApplication } from "../demoSafeSelectors";

describe("demo selectors", () => {
  it("selects a stable primary application", () => {
    const data = createDemoData("hero");
    expect(selectPrimaryApplication(data)?.id).toBe("PL-7F42A91C");
  });
  it("returns undefined for missing records", () => {
    expect(selectApplication(createDemoData("hero"), "missing")).toBeUndefined();
  });
});
