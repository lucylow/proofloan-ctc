export type AiCost = { promptTokens: number; completionTokens: number; usd: number };

function nonNegative(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function estimateCost(promptTokens: number, completionTokens: number, inputRate = .002, outputRate = .008): AiCost {
  const prompt = nonNegative(promptTokens);
  const completion = nonNegative(completionTokens);
  const inRate = nonNegative(inputRate);
  const outRate = nonNegative(outputRate);
  return { promptTokens: prompt, completionTokens: completion, usd: (prompt / 1000) * inRate + (completion / 1000) * outRate };
}
