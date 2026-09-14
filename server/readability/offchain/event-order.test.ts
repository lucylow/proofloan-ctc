import { describe, it, expect } from "vitest";
import { sortEvents } from "./event-order";

const e = (b: number, t: number, l: number): any => ({ blockNumber: b, transactionIndex: t, logIndex: l });

describe("event order", () => {
  it("sorts canonically", () => {
    expect(sortEvents([e(2, 0, 0), e(1, 2, 1), e(1, 1, 0)]).map(x => x.blockNumber)).toEqual([1, 1, 2]);
  });
});
