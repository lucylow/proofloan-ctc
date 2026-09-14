import { estimateReadabilityGas } from "./estimator";
import type { GasEstimate, GasEstimateInput } from "./models";

export const REGRESSION_VECTOR_COUNT = 50;

export function regressionVectorInput(index: number): GasEstimateInput {
  if (!Number.isInteger(index) || index < 1 || index > REGRESSION_VECTOR_COUNT) {
    throw new RangeError(`Regression vector index must be 1..${REGRESSION_VECTOR_COUNT}`);
  }
  return {
    continuityHashCount: 25 * index,
    merkleSiblingCount: index <= 4 ? 1 : 2 + Math.floor((index - 5) / 5),
    encodedTransactionBytes: 1024 + 4000 * index,
  };
}

export function generateRegressionVector(index: number): GasEstimate {
  return estimateReadabilityGas(regressionVectorInput(index));
}

export const REGRESSION_VECTORS: GasEstimate[] = Array.from(
  { length: REGRESSION_VECTOR_COUNT },
  (_, offset) => generateRegressionVector(offset + 1),
);
