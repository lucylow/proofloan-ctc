import { estimateContinuityCost } from "./cost";

export function chooseCheckpoint(hashCount: number, budget: number): "submit" | "wait" {
  return estimateContinuityCost(hashCount) <= budget ? "submit" : "wait";
}
