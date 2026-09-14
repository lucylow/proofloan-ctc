export type AiMode = "advisory" | "bounded-autonomous" | "shadow";
export type AiRiskSummary = { pd30: number; pd90: number; confidence: number; riskTier: "A"|"B"|"C"|"D"; abstained: boolean; abstainReason?: string; modelVersion: string; featureVersion: string; outputFingerprint: string };
export type AiReasonView = { code: string; weight: number; direction: "positive"|"negative"|"neutral"; text: string };
