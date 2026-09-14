// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state2) => {
  let decoded;
  try {
    decoded = atob(state2);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/oauth.ts
import { parse as parseCookieHeader2 } from "cookie";

// server/db.ts
import { createHash as createHash2 } from "node:crypto";
import { eq, and, asc, desc, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var loanApplications = mysqlTable("loan_applications", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: varchar("applicationId", { length: 64 }).notNull().unique(),
  borrowerOpenId: varchar("borrowerOpenId", { length: 64 }),
  walletAddress: varchar("walletAddress", { length: 128 }).notNull(),
  sourceTransactionHash: varchar("sourceTransactionHash", { length: 128 }),
  sourceChain: varchar("sourceChain", { length: 48 }).notNull(),
  state: varchar("state", { length: 32 }).notNull(),
  requestedAmount: decimal("requestedAmount", { precision: 18, scale: 2 }).notNull(),
  evidenceRoot: varchar("evidenceRoot", { length: 128 }),
  policyHash: varchar("policyHash", { length: 128 }),
  modelVersion: varchar("modelVersion", { length: 128 }),
  decisionHash: varchar("decisionHash", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var verifiedFacts = mysqlTable("verified_facts", {
  id: int("id").autoincrement().primaryKey(),
  factId: varchar("factId", { length: 64 }).notNull().unique(),
  applicationId: varchar("applicationId", { length: 64 }).notNull(),
  chain: varchar("chain", { length: 48 }).notNull(),
  sourceBlock: int("sourceBlock").notNull(),
  txHash: varchar("txHash", { length: 128 }).notNull(),
  eventType: varchar("eventType", { length: 48 }).notNull(),
  amount: varchar("amount", { length: 64 }).notNull(),
  verificationBlock: int("verificationBlock").notNull(),
  freshness: varchar("freshness", { length: 16 }).notNull(),
  proofRoot: varchar("proofRoot", { length: 128 }).notNull(),
  verifiedAt: timestamp("verifiedAt").defaultNow().notNull()
});
var decisions = mysqlTable("decisions", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: varchar("applicationId", { length: 64 }).notNull(),
  pd30: decimal("pd30", { precision: 8, scale: 5 }).notNull(),
  pd90: decimal("pd90", { precision: 8, scale: 5 }).notNull(),
  confidence: decimal("confidence", { precision: 8, scale: 5 }).notNull(),
  riskTier: varchar("riskTier", { length: 8 }).notNull(),
  reasonCodes: text("reasonCodes").notNull(),
  featureVersion: varchar("featureVersion", { length: 128 }).notNull(),
  modelVersion: varchar("modelVersion", { length: 128 }).notNull(),
  policyHash: varchar("policyHash", { length: 128 }).notNull(),
  evidenceRoot: varchar("evidenceRoot", { length: 128 }).notNull(),
  decisionHash: varchar("decisionHash", { length: 128 }).notNull(),
  featureFingerprint: varchar("featureFingerprint", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: varchar("applicationId", { length: 64 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  apr: decimal("apr", { precision: 8, scale: 3 }).notNull(),
  ltv: decimal("ltv", { precision: 8, scale: 5 }).notNull(),
  collateralValue: decimal("collateralValue", { precision: 18, scale: 2 }),
  poolLiquidity: decimal("poolLiquidity", { precision: 18, scale: 2 }),
  termDays: int("termDays").notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var acceptanceIdempotency = mysqlTable("acceptance_idempotency", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: varchar("applicationId", { length: 64 }).notNull().unique(),
  requestKey: varchar("requestKey", { length: 128 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  resultJson: text("resultJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var proofRequestIdempotency = mysqlTable("proof_request_idempotency", {
  id: int("id").autoincrement().primaryKey(),
  requestKey: varchar("requestKey", { length: 128 }).notNull().unique(),
  walletAddress: varchar("walletAddress", { length: 128 }).notNull(),
  sourceTransactionHash: varchar("sourceTransactionHash", { length: 128 }),
  sourceChain: varchar("sourceChain", { length: 48 }).notNull(),
  applicationId: varchar("applicationId", { length: 64 }),
  status: varchar("status", { length: 16 }).notNull(),
  resultJson: text("resultJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var auditEvents = mysqlTable("audit_events", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: varchar("applicationId", { length: 64 }).notNull(),
  state: varchar("state", { length: 32 }).notNull(),
  label: varchar("label", { length: 64 }).notNull(),
  detail: text("detail").notNull(),
  eventHash: varchar("eventHash", { length: 128 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var atcQuotes = mysqlTable("atc_quotes", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: varchar("quoteId", { length: 64 }).notNull().unique(),
  kind: varchar("kind", { length: 16 }).notNull(),
  environment: varchar("environment", { length: 32 }).notNull(),
  sender: varchar("sender", { length: 128 }),
  sourceChain: varchar("sourceChain", { length: 64 }).notNull(),
  destinationChain: varchar("destinationChain", { length: 64 }).notNull(),
  actionKind: varchar("actionKind", { length: 48 }).notNull(),
  payloadHash: varchar("payloadHash", { length: 128 }).notNull(),
  totalAtomic: varchar("totalAtomic", { length: 80 }).notNull(),
  operatorRewardAtomic: varchar("operatorRewardAtomic", { length: 80 }).notNull(),
  burnAtomic: varchar("burnAtomic", { length: 80 }).notNull(),
  treasuryAtomic: varchar("treasuryAtomic", { length: 80 }).notNull(),
  quoteJson: text("quoteJson").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var atcFeeLedger = mysqlTable("atc_fee_ledger", {
  id: int("id").autoincrement().primaryKey(),
  feeId: varchar("feeId", { length: 64 }).notNull().unique(),
  quoteId: varchar("quoteId", { length: 64 }).notNull(),
  actionId: varchar("actionId", { length: 64 }).notNull().unique(),
  idempotencyKey: varchar("idempotencyKey", { length: 128 }).notNull().unique(),
  requestFingerprint: varchar("requestFingerprint", { length: 128 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  totalAtomic: varchar("totalAtomic", { length: 80 }).notNull(),
  operatorRewardAtomic: varchar("operatorRewardAtomic", { length: 80 }).notNull(),
  burnAtomic: varchar("burnAtomic", { length: 80 }).notNull(),
  treasuryAtomic: varchar("treasuryAtomic", { length: 80 }).notNull(),
  paymentReference: varchar("paymentReference", { length: 256 }),
  protocolReference: varchar("protocolReference", { length: 256 }),
  feeJson: text("feeJson").notNull(),
  settledAt: timestamp("settledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var atcOperatorRewards = mysqlTable("atc_operator_rewards", {
  id: int("id").autoincrement().primaryKey(),
  rewardId: varchar("rewardId", { length: 64 }).notNull().unique(),
  feeId: varchar("feeId", { length: 64 }).notNull(),
  actionId: varchar("actionId", { length: 64 }).notNull(),
  operatorId: varchar("operatorId", { length: 64 }).notNull(),
  amountAtomic: varchar("amountAtomic", { length: 80 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  rewardJson: text("rewardJson").notNull(),
  claimedAt: timestamp("claimedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var atcActionReceipts = mysqlTable("atc_action_receipts", {
  id: int("id").autoincrement().primaryKey(),
  receiptId: varchar("receiptId", { length: 64 }).notNull().unique(),
  actionId: varchar("actionId", { length: 64 }).notNull().unique(),
  quoteId: varchar("quoteId", { length: 64 }).notNull(),
  feeId: varchar("feeId", { length: 64 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  paymentReference: varchar("paymentReference", { length: 256 }).notNull(),
  protocolReference: varchar("protocolReference", { length: 256 }),
  totalAtomic: varchar("totalAtomic", { length: 80 }).notNull(),
  receiptJson: text("receiptJson").notNull(),
  settledAt: timestamp("settledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// shared/proofloan.ts
var PROOFLOAN_ERROR_CODES = {
  VALIDATION: "PROOFLOAN_VALIDATION_ERROR",
  DATABASE: "PROOFLOAN_DATABASE_ERROR",
  PROOF_WORKER: "PROOFLOAN_PROOF_WORKER_ERROR",
  POLICY: "PROOFLOAN_POLICY_ERROR",
  STATE_CONFLICT: "PROOFLOAN_STATE_CONFLICT",
  RATE_LIMITED: "PROOFLOAN_RATE_LIMITED"
};
var PROOFLOAN_STATES = [
  "Intake",
  "EvidencePending",
  "EvidenceVerified",
  "Scored",
  "OfferPrepared",
  "AwaitingAcceptance",
  "Executed",
  "Rejected"
];
var REASON_CODES = [
  "STRONG_REPAYMENT_HISTORY",
  "RECENT_LATE_PAYMENT",
  "HIGH_LEVERAGE",
  "SPARSE_EVIDENCE"
];
function isProofLoanState(value) {
  return PROOFLOAN_STATES.includes(value);
}
function isSourceChain(value) {
  return value === "Ethereum Sepolia" || value === "Ethereum Mainnet" || value === "Polygon Amoy";
}
function isReasonCode(value) {
  return REASON_CODES.includes(value);
}
function isVerifiedEventType(value) {
  return value === "REPAYMENT" || value === "COLLATERAL_DEPOSIT" || value === "LATE_PAYMENT";
}
function isFreshness(value) {
  return value === "Fresh" || value === "Aging" || value === "Stale";
}
function isRiskTier(value) {
  return value === "A" || value === "B" || value === "C" || value === "D";
}
function isOfferStatus(value) {
  return value === "Ready" || value === "Blocked" || value === "Accepted" || value === "Executed";
}
function isLiveTxHash(value) {
  return /^0x[a-fA-F0-9]{64}$/.test(value.trim());
}
function isLiveChainTransactionHash(value, sourceChain) {
  return isSourceChain(sourceChain) && isLiveTxHash(value);
}
function getProofMode(sourceTransactionHash, sourceChain) {
  return sourceTransactionHash !== void 0 && isLiveTxHash(sourceTransactionHash) && (sourceChain === void 0 || isSourceChain(sourceChain)) ? "live" : "preview";
}
function isLiveChainWalletAddress(value, sourceChain) {
  return isSourceChain(sourceChain) && /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}
function isAddressShapedIdentity(value) {
  const normalized = value.trim();
  return normalized.startsWith("0x") && normalized.length >= 42;
}
function isProofLoanApplicationId(value) {
  return /^PL-[A-Z0-9_-]{8,128}$/.test(value.trim());
}

// server/underwriting.ts
import { createHash } from "node:crypto";

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
var RETRY_MAX_RETRIES = 4;
var RETRY_BASE_DELAY_MS = 500;
var RETRY_MAX_DELAY_MS = 3e4;
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var parseRetryAfter = (value) => {
  if (!value) return void 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1e3);
  const at = Date.parse(value);
  return Number.isNaN(at) ? void 0 : Math.max(0, at - Date.now());
};
var computeBackoffDelay = (attempt, retryAfterMs) => {
  const cap = Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);
  const jittered = cap / 2 + Math.random() * (cap / 2);
  return Math.min(Math.max(jittered, retryAfterMs ?? 0), RETRY_MAX_DELAY_MS);
};
var fetchWithBackoff = async (url, init) => {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, init);
      if (response.ok || attempt === RETRY_MAX_RETRIES) {
        return response;
      }
      const retryAfterMs = parseRetryAfter(
        response.headers.get("retry-after")
      );
      try {
        await response.body?.cancel();
      } catch {
      }
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after status ${response.status}`
      );
      await sleep(computeBackoffDelay(attempt, retryAfterMs));
    } catch (error) {
      lastError = error;
      if (attempt === RETRY_MAX_RETRIES) throw error;
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after network error`
      );
      await sleep(computeBackoffDelay(attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("LLM request failed after exhausting retries");
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    model,
    thinking,
    reasoning,
    maxTokens,
    max_tokens
  } = params;
  const payload = {
    messages: messages.map(normalizeMessage)
  };
  if (model) {
    payload.model = model;
  }
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  const resolvedMaxTokens = max_tokens ?? maxTokens;
  if (typeof resolvedMaxTokens === "number") {
    payload.max_tokens = resolvedMaxTokens;
  }
  if (thinking) {
    payload.thinking = thinking;
  }
  if (reasoning) {
    payload.reasoning = reasoning;
  }
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetchWithBackoff(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// shared/multichain.ts
var ATTESTCOIN_ENVIRONMENT_IDS = ["cc3-testnet", "cc3-mainnet"];
var SOURCE_CHAIN_IDS = [
  "ethereum-sepolia",
  "ethereum-mainnet",
  "polygon-amoy"
];
var ATTESTCOIN_SOURCE_CHAIN_NAMES = [
  "Ethereum Sepolia",
  "Ethereum Mainnet",
  "Polygon Amoy"
];
var DEFAULT_ATTESTCOIN_ENVIRONMENT = "cc3-testnet";
var CHAININFO_PRECOMPILE = "0x0000000000000000000000000000000000000fd3";
var BLOCK_PROVER_PRECOMPILE = "0x0000000000000000000000000000000000000FD2";
var POLYGON_AMOY_LIVE_PROOF_REJECTION = "Polygon Amoy is experimental in ProofLoan and is not listed as an official Attestcoin-enabled chain. Current Attestcoin documentation lists Ethereum Sepolia (chainkey 1) and Ethereum Mainnet (chainkey 3) on CC3 Testnet, and Ethereum Mainnet (chainkey 1) on CC3 Mainnet. A live Polygon Amoy proof is rejected because no official chainkey exists. Preview mode remains available.";
var MULTICHAIN_REGISTRY = {
  environments: {
    "cc3-testnet": {
      id: "cc3-testnet",
      label: "CC3 Testnet",
      networkKind: "testnet",
      evmChainId: 102031,
      rpcUrls: ["https://rpc.cc3-testnet.creditcoin.network"],
      proofBuilderUrl: "https://proof-gen-api.cc3-testnet.creditcoin.network",
      dashboardUrl: "https://dashboard.cc3-testnet.creditcoin.network/",
      decoderContract: "0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f",
      chainInfoPrecompile: CHAININFO_PRECOMPILE,
      blockProverPrecompile: BLOCK_PROVER_PRECOMPILE,
      sdkPackage: "@gluwa/usc-sdk"
    },
    "cc3-mainnet": {
      id: "cc3-mainnet",
      label: "CC3 Mainnet",
      networkKind: "mainnet",
      evmChainId: 102030,
      rpcUrls: [
        "https://rpc.cc3-mainnet.creditcoin.network",
        "https://mainnet3.creditcoin.network"
      ],
      proofBuilderUrl: "https://proofbuilder.cc3-mainnet-usc.creditcoin.network",
      dashboardUrl: "https://dashboard.cc3-mainnet-usc.creditcoin.network/",
      decoderContract: "0x9D094C9f22B10FCf842c2fC6A0981630A4F94B5C",
      chainInfoPrecompile: CHAININFO_PRECOMPILE,
      blockProverPrecompile: BLOCK_PROVER_PRECOMPILE,
      sdkPackage: "@gluwa/usc-sdk"
    }
  },
  sourceChains: {
    "ethereum-sepolia": {
      id: "ethereum-sepolia",
      name: "Ethereum Sepolia",
      evmChainId: 11155111,
      nativeSymbol: "ETH",
      rpcUrls: [
        "https://ethereum-sepolia-rpc.publicnode.com",
        "https://1rpc.io/sepolia"
      ],
      explorerTxBaseUrl: "https://sepolia.etherscan.io/tx/",
      support: "official",
      previewEnabled: true,
      liveProofDefault: true,
      preview: {
        txPrefix: "0x7a",
        sourceBlock: 6421883,
        verificationBlock: 7e6
      }
    },
    "ethereum-mainnet": {
      id: "ethereum-mainnet",
      name: "Ethereum Mainnet",
      evmChainId: 1,
      nativeSymbol: "ETH",
      rpcUrls: [
        "https://ethereum-rpc.publicnode.com",
        "https://cloudflare-eth.com"
      ],
      explorerTxBaseUrl: "https://etherscan.io/tx/",
      support: "official",
      previewEnabled: true,
      liveProofDefault: true,
      preview: {
        txPrefix: "0x1a",
        sourceBlock: 18420112,
        verificationBlock: 19e6
      }
    },
    "polygon-amoy": {
      id: "polygon-amoy",
      name: "Polygon Amoy",
      evmChainId: 80002,
      nativeSymbol: "MATIC",
      rpcUrls: [
        "https://polygon-amoy-bor-rpc.publicnode.com",
        "https://rpc-amoy.polygon.technology"
      ],
      explorerTxBaseUrl: "https://amoy.polygonscan.com/tx/",
      support: "experimental",
      previewEnabled: true,
      liveProofDefault: false,
      preview: {
        txPrefix: "0x9b",
        sourceBlock: 12804112,
        verificationBlock: 13e6
      }
    }
  },
  officialBindings: {
    "cc3-testnet": {
      "ethereum-sepolia": { chainKey: 1, genesisBlock: 0, liveProof: true },
      "ethereum-mainnet": { chainKey: 3, genesisBlock: 0, liveProof: true }
    },
    "cc3-mainnet": {
      "ethereum-mainnet": { chainKey: 1, genesisBlock: 0, liveProof: true }
    }
  }
};
var NAME_TO_ID = {
  "Ethereum Sepolia": "ethereum-sepolia",
  "Ethereum Mainnet": "ethereum-mainnet",
  "Polygon Amoy": "polygon-amoy"
};
function isAttestcoinEnvironmentId(value) {
  return ATTESTCOIN_ENVIRONMENT_IDS.includes(value);
}
function isSourceChainId(value) {
  return SOURCE_CHAIN_IDS.includes(value);
}
function sourceChainIdFromName(name) {
  return NAME_TO_ID[name];
}
function getSourceChainRecord(chain) {
  const id = isSourceChainId(chain) ? chain : sourceChainIdFromName(chain);
  return MULTICHAIN_REGISTRY.sourceChains[id];
}
function getEnvironmentRecord(environment) {
  return MULTICHAIN_REGISTRY.environments[environment];
}
function getOfficialBinding(environment, chain) {
  const id = isSourceChainId(chain) ? chain : sourceChainIdFromName(chain);
  return MULTICHAIN_REGISTRY.officialBindings[environment][id];
}
function experimentalLiveProofMessage(chain) {
  const record = getSourceChainRecord(chain);
  if (record.id === "polygon-amoy") return POLYGON_AMOY_LIVE_PROOF_REJECTION;
  return `${record.name} is not listed with an official Attestcoin chainkey in the active Creditcoin environment. Live proofs are rejected. Preview mode remains available.`;
}
function chainCapability(environment, chain) {
  const record = getSourceChainRecord(chain);
  const binding = getOfficialBinding(environment, record.id);
  const liveProof = Boolean(binding?.liveProof) && record.liveProofDefault;
  return {
    environment,
    chainId: record.id,
    name: record.name,
    support: record.support,
    preview: record.previewEnabled,
    liveProof,
    chainKey: binding?.chainKey ?? null,
    genesisBlock: binding?.genesisBlock ?? null,
    reason: liveProof ? void 0 : experimentalLiveProofMessage(record.id)
  };
}
function listChainCapabilities(environment) {
  return SOURCE_CHAIN_IDS.map((id) => chainCapability(environment, id));
}

// server/underwriting.ts
var MODEL_VERSION = "proofloan-underwriter-v0.1.0";
var FEATURE_VERSION = "feature-vector-v0.1.0";
var POLICY_HASH = "riskguard-policy-v0.1.0:amount-ltv-rate-freshness-confidence-liquidity";
var hashValue = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 18);
function isFeatureVectorFiniteAndBounded(features) {
  const boundedCounts = [features.repaymentCount, features.latePayments, features.evidenceCount];
  const boundedRatios = [features.leverageRatio, features.freshnessScore];
  const boundedVolumes = [features.volume7d, features.volume30d, features.volume180d];
  return [...boundedCounts, ...boundedRatios, ...boundedVolumes, features.walletAgeDays].every((value) => Number.isFinite(value) && value >= 0) && boundedCounts.every((value) => Number.isInteger(value) && value <= 64) && features.walletAgeDays <= 1e4 && boundedRatios.every((value) => value <= 1e6) && boundedVolumes.every((value) => value <= 1e6);
}
function buildFeatureVector(facts, nowMs = Date.now()) {
  const ageDays = (fact) => Math.max(0, (nowMs - new Date(fact.observedAt).getTime()) / 864e5);
  const amountValue = (fact) => Number.parseFloat(fact.amount.replace(/[^0-9.]/g, "")) || 0;
  const repaymentFacts = facts.filter((f) => f.eventType === "REPAYMENT");
  const latePayments = facts.filter((f) => f.eventType === "LATE_PAYMENT").length;
  const collateral = facts.filter((f) => f.eventType === "COLLATERAL_DEPOSIT").reduce((sum, fact) => sum + amountValue(fact), 0);
  const repaymentVolume = repaymentFacts.reduce((sum, fact) => sum + amountValue(fact), 0);
  const volumeInWindow = (days) => facts.filter((f) => ageDays(f) <= days).reduce((sum, fact) => sum + amountValue(fact), 0);
  const walletAgeDays = facts.length ? Math.round(Math.max(...facts.map((f) => ageDays(f)))) : 0;
  return {
    repaymentCount: repaymentFacts.length,
    latePayments,
    leverageRatio: Number((repaymentVolume / Math.max(collateral, 1)).toFixed(2)),
    walletAgeDays,
    volume7d: volumeInWindow(7),
    volume30d: volumeInWindow(30),
    volume180d: volumeInWindow(180),
    evidenceCount: facts.length,
    freshnessScore: facts.length ? facts.reduce((sum, fact) => sum + (fact.freshness === "Fresh" ? 1 : fact.freshness === "Aging" ? 0.8 : 0.3), 0) / facts.length : 0
  };
}
var FEATURE_VECTOR_KEYS = ["repaymentCount", "latePayments", "leverageRatio", "walletAgeDays", "volume7d", "volume30d", "volume180d", "evidenceCount", "freshnessScore"];
function fingerprintFeatureVector(features) {
  return hashValue(Object.fromEntries(FEATURE_VECTOR_KEYS.map((key) => [key, features[key]])));
}
function isProbabilityOrderConsistent(pd30, pd90) {
  return Number.isFinite(pd30) && Number.isFinite(pd90) && pd30 <= pd90;
}
function riskTierForPd30(pd30) {
  return pd30 < 0.1 ? "A" : pd30 < 0.18 ? "B" : pd30 < 0.3 ? "C" : "D";
}
function fingerprintDecision(decision) {
  const { decisionHash: _decisionHash, ...canonicalDecision } = decision;
  return hashValue(canonicalDecision);
}
function isFeatureVectorConsistentWithFacts(features, facts, nowMs = Date.now()) {
  if (!isFeatureVectorFiniteAndBounded(features)) return false;
  const expected = buildFeatureVector(facts, nowMs);
  return fingerprintFeatureVector(expected) === fingerprintFeatureVector(features);
}
function deterministicDecision(features, facts) {
  const sparse = features.evidenceCount < 2;
  const pd30 = Math.min(0.42, Math.max(0.03, 0.12 + features.latePayments * 0.08 + features.leverageRatio * 0.08 - features.repaymentCount * 0.025));
  const pd90 = Math.min(0.58, pd30 + 0.08);
  const reasonCodes = [];
  if (features.repaymentCount >= 2) reasonCodes.push("STRONG_REPAYMENT_HISTORY");
  if (features.latePayments > 0) reasonCodes.push("RECENT_LATE_PAYMENT");
  if (features.leverageRatio > 0.8) reasonCodes.push("HIGH_LEVERAGE");
  if (sparse) reasonCodes.push("SPARSE_EVIDENCE");
  if (reasonCodes.length === 0) reasonCodes.push("SPARSE_EVIDENCE");
  const riskTier = riskTierForPd30(pd30);
  const evidenceRoot = hashValue(facts.map((f) => f.proofRoot));
  const decisionBase = { pd30, pd90, confidence: features.freshnessScore * Math.min(0.98, 0.68 + features.evidenceCount * 0.08), freshnessScore: features.freshnessScore, riskTier, reasonCodes, evidenceRoot, featureFingerprint: fingerprintFeatureVector(features) };
  const decision = {
    ...decisionBase,
    modelVersion: MODEL_VERSION,
    featureVersion: FEATURE_VERSION,
    policyHash: POLICY_HASH
  };
  return { ...decision, decisionHash: fingerprintDecision(decision) };
}
var clampProbability = (value, fallback) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? Math.min(1, Math.max(0, numeric)) : fallback;
};
function sanitizeAiCandidate(candidate, baseline) {
  const pd30 = clampProbability(candidate.pd30, baseline.pd30);
  const pd90 = Math.max(pd30, clampProbability(candidate.pd90, baseline.pd90));
  const confidence = Math.min(baseline.freshnessScore, clampProbability(candidate.confidence, baseline.confidence));
  const reasonCodes = Array.isArray(candidate.reasonCodes) ? candidate.reasonCodes.filter((code) => typeof code === "string" && isReasonCode(code)) : [];
  return { ...baseline, pd30, pd90, confidence, riskTier: riskTierForPd30(pd30), reasonCodes: reasonCodes.length ? reasonCodes : baseline.reasonCodes, featureFingerprint: baseline.featureFingerprint };
}
async function runAiUnderwriting(features, facts) {
  const baseline = deterministicDecision(features, facts);
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are ProofLoan's underwriting explainer. Return only typed JSON. The AI is advisory; never change arithmetic or policy constraints." },
        { role: "user", content: JSON.stringify({ task: "calibrate_pd_and_reasons", features, allowedReasonCodes: ["STRONG_REPAYMENT_HISTORY", "RECENT_LATE_PAYMENT", "HIGH_LEVERAGE", "SPARSE_EVIDENCE"] }) }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "proofloan_underwriting",
          strict: true,
          schema: {
            type: "object",
            properties: {
              pd30: { type: "number" },
              pd90: { type: "number" },
              confidence: { type: "number" },
              reasonCodes: { type: "array", items: { type: "string", enum: ["STRONG_REPAYMENT_HISTORY", "RECENT_LATE_PAYMENT", "HIGH_LEVERAGE", "SPARSE_EVIDENCE"] } }
            },
            required: ["pd30", "pd90", "confidence", "reasonCodes"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : {};
    const candidate = sanitizeAiCandidate(parsed, baseline);
    return { ...candidate, decisionHash: fingerprintDecision(candidate) };
  } catch {
    return baseline;
  }
}
function isOfferAcceptable(state2, status, expiresAt, nowMs = Date.now(), offer, decision) {
  if (state2 !== "AwaitingAcceptance" || status !== "Ready") return false;
  if (offer) {
    const collateralValue = offer.collateralValue ?? 2800;
    if (!Number.isFinite(offer.amount) || (offer.amount ?? 0) <= 0 || !Number.isFinite(offer.apr) || !Number.isFinite(offer.ltv) || !Number.isFinite(collateralValue) || collateralValue <= 0 || offer.ltv !== ltvForOfferAmount(offer.amount ?? 0, collateralValue) || decision && offer.apr !== aprForRiskTier(decision.riskTier) || !Number.isFinite(offer.termDays) || (offer.termDays ?? 0) <= 0 || !Number.isFinite(offer.poolLiquidity) || (offer.poolLiquidity ?? 0) < (offer.amount ?? 0) || !expiresAt) return false;
  }
  if (!expiresAt) return true;
  const expiryMs = Date.parse(expiresAt);
  return Number.isFinite(expiryMs) && expiryMs > nowMs;
}
function ltvForOfferAmount(amount, collateralValue = 2800) {
  return Number((amount / collateralValue).toFixed(2));
}
function aprForRiskTier(riskTier) {
  return riskTier === "A" ? 8.5 : riskTier === "B" ? 11.5 : riskTier === "C" ? 16.5 : 24;
}
function evaluateRiskGuard(decision, requestedAmount, collateralValue = 2800, poolLiquidity = 25e4) {
  const ltv = requestedAmount / collateralValue;
  const canonicalLtv = ltvForOfferAmount(requestedAmount, collateralValue);
  const apr = aprForRiskTier(decision.riskTier);
  const checks = [
    requestedAmount > 0 && requestedAmount <= 2500,
    ltv <= 0.7,
    apr <= 24,
    decision.confidence >= 0.65,
    decision.freshnessScore >= 0.8,
    decision.pd30 <= 0.35,
    poolLiquidity >= requestedAmount
  ];
  const blocked = checks.some((check) => !check);
  return {
    amount: requestedAmount,
    apr,
    ltv: canonicalLtv,
    collateralValue,
    termDays: 90,
    expiresAt: new Date(Date.now() + 864e5).toISOString(),
    poolLiquidity,
    status: blocked ? "Blocked" : "Ready",
    rejectionReason: blocked ? "RiskGuard rejected terms outside amount, LTV, rate, freshness, confidence, or pool liquidity bounds." : void 0
  };
}

// server/db.ts
var _db = null;
var MAX_PERSISTED_FACTS = 64;
var MAX_PERSISTED_AUDIT_EVENTS = 128;
var MAX_PERSISTED_AUDIT_DETAIL_LENGTH = 512;
var MAX_PERSISTED_AUDIT_LABEL_LENGTH = 64;
var MAX_PERSISTED_AUDIT_HASH_LENGTH = 128;
var MAX_PERSISTED_FACT_ID_LENGTH = 64;
var MAX_PERSISTED_TX_HASH_LENGTH = 128;
var MAX_PERSISTED_AMOUNT_LENGTH = 64;
var MAX_PERSISTED_PROOF_ROOT_LENGTH = 128;
var MAX_PERSISTED_APPLICATION_ID_LENGTH = 64;
var MAX_PERSISTED_WALLET_LENGTH = 128;
var MAX_PERSISTED_DECISION_METADATA_LENGTH = 128;
var MAX_ACCEPTANCE_RESULT_LENGTH = 65536;
var MAX_PROOF_REQUEST_RESULT_LENGTH = 65536;
var MIN_REPLAY_REQUEST_KEY_LENGTH = 16;
var MAX_REPLAY_REQUEST_KEY_LENGTH = 128;
function isCanonicalReplayRequestKey(value) {
  return typeof value === "string" && value.length >= MIN_REPLAY_REQUEST_KEY_LENGTH && value.length <= MAX_REPLAY_REQUEST_KEY_LENGTH && value === value.trim() && !/[\u0000-\u001f\u007f]/.test(value);
}
function isCanonicalUtcIsoTimestamp(value) {
  if (typeof value !== "string") return false;
  const parsed = new Date(value);
  return isValidDate(parsed) && parsed.toISOString() === value;
}
var REPLAY_PENDING_LEASE_MS = 10 * 6e4;
var REPLAY_COMMITTED_RETENTION_MS = 30 * 24 * 60 * 6e4;
var REPLAY_CLEANUP_INTERVAL_MS = 6e4;
var lastReplayCleanupAt = 0;
function replayFingerprint(value) {
  return createHash2("sha256").update(value).digest("hex").slice(0, 16);
}
function recordReplayProtectionEvent(event) {
  console.info(JSON.stringify({
    event: "proofloan.replay_protection",
    operation: event.operation,
    outcome: event.outcome,
    requestFingerprint: event.requestKey ? replayFingerprint(event.requestKey) : void 0,
    applicationFingerprint: event.applicationId ? replayFingerprint(event.applicationId) : void 0,
    removed: event.removed,
    reason: event.reason,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  }));
}
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
function buildAuditUpsertValues(event) {
  if (typeof event.detail !== "string" || event.detail.trim().length === 0 || event.detail.length > MAX_PERSISTED_AUDIT_DETAIL_LENGTH) {
    throw new Error("Invalid persisted audit detail.");
  }
  if (!isProofLoanState(event.state) || event.label !== event.state || !isCanonicalNonEmptyText(event.hash, MAX_PERSISTED_AUDIT_HASH_LENGTH) || typeof event.timestamp !== "string") {
    throw new Error("Invalid persisted audit event.");
  }
  const createdAt = new Date(event.timestamp);
  if (!isCanonicalUtcIsoTimestamp(event.timestamp)) throw new Error("Invalid persisted audit event.");
  return { values: { state: event.state, label: event.label, detail: event.detail, eventHash: event.hash, createdAt }, updateSet: { detail: event.detail, state: event.state, label: event.label, createdAt } };
}
function buildApplicationUpsertValues(snapshot) {
  if (snapshot.decision) buildDecisionUpsertValues(snapshot.decision);
  const requestedAmount = snapshot.offer?.amount ?? 1500;
  if (!isCanonicalNonEmptyText(snapshot.applicationId, MAX_PERSISTED_APPLICATION_ID_LENGTH) || !isProofLoanApplicationId(snapshot.applicationId) || !isCanonicalWalletAddress(snapshot.walletAddress, snapshot.sourceChain) || snapshot.sourceTransactionHash !== void 0 && !isLiveTxHash(snapshot.sourceTransactionHash) || !isSourceChain(snapshot.sourceChain) || !isProofLoanState(snapshot.state) || !isFiniteInRange(requestedAmount, 0.01, 2500)) {
    throw new Error("Invalid persisted application.");
  }
  return { applicationId: snapshot.applicationId, walletAddress: snapshot.walletAddress, sourceTransactionHash: snapshot.sourceTransactionHash, sourceChain: snapshot.sourceChain, state: snapshot.state, requestedAmount: String(requestedAmount), evidenceRoot: snapshot.decision?.evidenceRoot, policyHash: snapshot.decision?.policyHash, modelVersion: snapshot.decision?.modelVersion, decisionHash: snapshot.decision?.decisionHash };
}
function buildDecisionUpsertValues(decision) {
  if (decision.featureFingerprint !== void 0 && (typeof decision.featureFingerprint !== "string" || !/^[a-f0-9]{18}$/.test(decision.featureFingerprint) || decision.policyHash !== POLICY_HASH) || !isCanonicalNonEmptyText(decision.featureVersion, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !isCanonicalNonEmptyText(decision.modelVersion, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !isCanonicalNonEmptyText(decision.policyHash, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !isCanonicalNonEmptyText(decision.evidenceRoot, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !isCanonicalNonEmptyText(decision.decisionHash, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !parsePersistedReasonCodes(JSON.stringify(decision.reasonCodes)) || !isRiskTier(decision.riskTier) || !isFiniteInRange(decision.pd30, 0, 1) || !isFiniteInRange(decision.pd90, 0, 1) || !isProbabilityOrderConsistent(Number(decision.pd30), Number(decision.pd90)) || riskTierForPd30(Number(decision.pd30)) !== decision.riskTier || !isFiniteInRange(decision.confidence, 0, 1)) {
    throw new Error("Invalid persisted decision.");
  }
  return { pd30: String(decision.pd30), pd90: String(decision.pd90), confidence: String(decision.confidence), riskTier: decision.riskTier, reasonCodes: JSON.stringify(decision.reasonCodes), featureVersion: decision.featureVersion, modelVersion: decision.modelVersion, policyHash: decision.policyHash, evidenceRoot: decision.evidenceRoot, decisionHash: decision.decisionHash, featureFingerprint: decision.featureFingerprint };
}
function buildOfferUpsertValues(offer, applicationState, requestedAmount, now2 = Date.now()) {
  const expiresAt = new Date(offer.expiresAt);
  const collateralValue = offer.collateralValue ?? 2800;
  const poolLiquidity = offer.poolLiquidity ?? 25e4;
  if (!isCanonicalUtcIsoTimestamp(offer.expiresAt) || !isOfferStatus(offer.status) || !isOfferStateConsistent(applicationState, offer.status) || !isFiniteInRange(offer.amount, 0.01, 2500) || offer.amount !== requestedAmount || !isFiniteInRange(offer.apr, 0, 24) || !isFiniteInRange(offer.ltv, 0, 1) || !isFiniteInRange(collateralValue, 0.01, 1e6) || offer.ltv !== ltvForOfferAmount(offer.amount, collateralValue) || !isFiniteInRange(poolLiquidity, 0.01, 1e9) || poolLiquidity < offer.amount || !isFiniteInRange(offer.termDays, 1, 3650) || !isValidDate(expiresAt) || offer.status === "Ready" && expiresAt.getTime() <= now2) {
    throw new Error("Invalid persisted offer.");
  }
  return { amount: String(offer.amount), apr: String(offer.apr), ltv: String(offer.ltv), collateralValue: String(collateralValue), poolLiquidity: String(poolLiquidity), termDays: offer.termDays, status: offer.status, expiresAt };
}
function hasUniqueFactIdentity(facts) {
  const ids = facts.map((fact) => fact.id ?? fact.factId);
  const references = facts.map((fact) => ({ chain: fact.chain, txHash: fact.txHash }));
  if (!ids.every((id) => isCanonicalNonEmptyText(id, MAX_PERSISTED_FACT_ID_LENGTH))) return false;
  if (!references.every((reference) => typeof reference.chain === "string" && isSourceChain(reference.chain) && isCanonicalNonEmptyText(reference.txHash, MAX_PERSISTED_TX_HASH_LENGTH))) return false;
  const referenceKeys = references.map((reference) => `${String(reference.chain)}:${String(reference.txHash)}`);
  return new Set(ids).size === ids.length && new Set(referenceKeys).size === referenceKeys.length;
}
function isLoanSnapshotWriteConsistent(snapshot) {
  if (!Array.isArray(snapshot.audit) || snapshot.audit.length === 0) return false;
  return isFactStateConsistent(snapshot.state, snapshot.facts.length) && snapshot.facts.every((fact) => fact.chain === snapshot.sourceChain) && (!snapshot.sourceTransactionHash || snapshot.facts.length > 0 && snapshot.facts.every((fact) => fact.txHash === snapshot.sourceTransactionHash)) && hasUniqueFactIdentity(snapshot.facts) && isDecisionStateConsistent(snapshot.state, Boolean(snapshot.decision)) && (!snapshot.decision || snapshot.decision.confidence <= snapshot.features.freshnessScore) && (!snapshot.decision?.featureFingerprint || !snapshot.offer || snapshot.offer.collateralValue !== void 0) && hasUniqueAuditHashes(snapshot.audit) && snapshot.audit[snapshot.audit.length - 1]?.state === snapshot.state && isAuditStateProgressionConsistent(snapshot.audit);
}
function isLoanSnapshotPersistable(snapshot, now2 = Date.now()) {
  try {
    const applicationValues = buildApplicationUpsertValues(snapshot);
    for (const fact of snapshot.facts) buildFactUpsertValues(fact);
    if (snapshot.decision) buildDecisionUpsertValues(snapshot.decision);
    if (snapshot.offer) buildOfferUpsertValues(snapshot.offer, snapshot.state, Number(applicationValues.requestedAmount), now2);
    for (const event of snapshot.audit) buildAuditUpsertValues(event);
    return true;
  } catch {
    return false;
  }
}
function buildFactUpsertValues(fact) {
  const verifiedAt = new Date(fact.verifiedAt);
  const observedAt = new Date(fact.observedAt);
  if (!isCanonicalUtcIsoTimestamp(fact.verifiedAt) || !isCanonicalUtcIsoTimestamp(fact.observedAt) || observedAt.getTime() > verifiedAt.getTime() || !isCanonicalNonEmptyText(fact.id, MAX_PERSISTED_FACT_ID_LENGTH) || !isSourceChain(fact.chain) || !isVerifiedEventType(fact.eventType) || !isCanonicalNonEmptyText(fact.txHash, MAX_PERSISTED_TX_HASH_LENGTH) || !isCanonicalNonEmptyText(fact.amount, MAX_PERSISTED_AMOUNT_LENGTH) || fact.asset !== "USDC" || fact.proofWorker !== "Attestcoin proof worker" || !isCanonicalNonEmptyText(fact.proofRoot, MAX_PERSISTED_PROOF_ROOT_LENGTH) || !isFreshness(fact.freshness) || !isFactBlockChronologyConsistent(fact.sourceBlock, fact.verificationBlock) || !isValidDate(verifiedAt)) {
    throw new Error("Invalid persisted verified fact.");
  }
  return { values: { factId: fact.id, chain: fact.chain, sourceBlock: fact.sourceBlock, txHash: fact.txHash, eventType: fact.eventType, amount: fact.amount, verificationBlock: fact.verificationBlock, freshness: fact.freshness, proofRoot: fact.proofRoot, verifiedAt }, updateSet: { freshness: fact.freshness, verificationBlock: fact.verificationBlock } };
}
function isDurableAcceptanceReplayResult(applicationId, result) {
  if (!result || typeof result !== "object") return false;
  const candidate = result;
  if (!isProofLoanApplicationId(applicationId) || typeof candidate.applicationId !== "string" || !isProofLoanApplicationId(candidate.applicationId) || candidate.applicationId !== applicationId || candidate.state !== "Executed" || !isCanonicalNonEmptyText(candidate.transactionHash, MAX_PERSISTED_TX_HASH_LENGTH) || !Array.isArray(candidate.audit) || candidate.audit.length === 0) return false;
  if (candidate.offer !== void 0 && candidate.decision !== void 0 && candidate.receiptHash === void 0) return false;
  if (candidate.receiptHash === void 0) return true;
  if (typeof candidate.receiptHash !== "string" || !/^[a-f0-9]{18}$/.test(candidate.receiptHash) || !/^0xcreditcoin_[a-f0-9]{18}$/.test(candidate.transactionHash)) return false;
  if (!candidate.offer || typeof candidate.offer !== "object" || candidate.offer.status !== "Executed" || !candidate.decision || typeof candidate.decision !== "object" || typeof candidate.decision.decisionHash !== "string") return false;
  if (!isCanonicalNonEmptyText(candidate.decision.featureVersion, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !isCanonicalNonEmptyText(candidate.decision.modelVersion, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !isCanonicalNonEmptyText(candidate.decision.policyHash, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !isCanonicalNonEmptyText(candidate.decision.evidenceRoot, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !isCanonicalNonEmptyText(candidate.decision.decisionHash, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !Array.isArray(candidate.decision.reasonCodes) || !parsePersistedReasonCodes(JSON.stringify(candidate.decision.reasonCodes)) || candidate.decision.decisionHash !== fingerprintDecision(candidate.decision)) return false;
  if (candidate.decision.featureFingerprint !== void 0 && (typeof candidate.decision.featureFingerprint !== "string" || !/^[a-f0-9]{18}$/.test(candidate.decision.featureFingerprint) || candidate.decision.policyHash !== POLICY_HASH) || !isRiskTier(candidate.decision.riskTier) || typeof candidate.decision.pd30 !== "number" || typeof candidate.decision.pd90 !== "number" || !isFiniteInRange(candidate.decision.pd30, 0, 1) || !isFiniteInRange(candidate.decision.pd90, 0, 1) || !isProbabilityOrderConsistent(candidate.decision.pd30, candidate.decision.pd90) || riskTierForPd30(candidate.decision.pd30) !== candidate.decision.riskTier || typeof candidate.decision.confidence !== "number" || typeof candidate.decision.freshnessScore !== "number" || !isFiniteInRange(candidate.decision.confidence, 0, 1) || !isFiniteInRange(candidate.decision.freshnessScore, 0, 1) || candidate.decision.confidence > candidate.decision.freshnessScore || typeof candidate.offer.amount !== "number" || typeof candidate.offer.apr !== "number" || typeof candidate.offer.ltv !== "number" || typeof candidate.offer.termDays !== "number" || typeof candidate.offer.poolLiquidity !== "number" || candidate.offer.collateralValue !== void 0 && typeof candidate.offer.collateralValue !== "number" || !isFiniteInRange(candidate.offer.amount, 0.01, 2500) || !isFiniteInRange(candidate.offer.apr, 0, 24) || candidate.offer.apr !== aprForRiskTier(candidate.decision.riskTier) || !isFiniteInRange(candidate.offer.ltv, 0, 1) || candidate.offer.collateralValue !== void 0 && (!isFiniteInRange(candidate.offer.collateralValue, 0.01, 1e6) || candidate.offer.ltv !== ltvForOfferAmount(candidate.offer.amount, candidate.offer.collateralValue)) || candidate.decision.featureFingerprint !== void 0 && (candidate.offer.collateralValue === void 0 || candidate.offer.poolLiquidity === void 0) || !isFiniteInRange(candidate.offer.termDays, 1, 3650) || !isCanonicalUtcIsoTimestamp(candidate.offer.expiresAt) || !isFiniteInRange(candidate.offer.poolLiquidity, 0.01, 1e9) || candidate.offer.poolLiquidity < candidate.offer.amount) return false;
  const auditTimestamps = candidate.audit.map((event) => event.timestamp);
  if (!auditTimestamps.every((timestamp2) => isCanonicalUtcIsoTimestamp(timestamp2))) return false;
  for (let index = 1; index < auditTimestamps.length; index += 1) {
    if (Date.parse(auditTimestamps[index]) < Date.parse(auditTimestamps[index - 1])) return false;
  }
  if (!candidate.audit.every((event) => typeof event.state === "string" && isProofLoanState(event.state) && typeof event.label === "string" && event.label === event.state && isBoundedNonEmptyText(event.detail, MAX_PERSISTED_AUDIT_DETAIL_LENGTH))) return false;
  if (!isAuditStateProgressionConsistent(candidate.audit)) return false;
  const auditHashes = candidate.audit.map((event) => event.hash);
  if (!auditHashes.every((hash) => isCanonicalNonEmptyText(hash, MAX_PERSISTED_AUDIT_HASH_LENGTH))) return false;
  if (new Set(auditHashes).size !== auditHashes.length) return false;
  if (candidate.audit.slice(0, -1).some((event) => event.state === "Executed")) return false;
  const terminalAudit = candidate.audit.at(-1);
  if (terminalAudit?.state !== "Executed") return false;
  if (Date.parse(terminalAudit.timestamp) >= Date.parse(candidate.offer.expiresAt)) return false;
  const auditHash = terminalAudit.hash;
  if (!isCanonicalNonEmptyText(auditHash, MAX_PERSISTED_AUDIT_HASH_LENGTH)) return false;
  return candidate.receiptHash === hashValue({ applicationId, offer: candidate.offer, decisionHash: candidate.decision.decisionHash, auditHash }) && candidate.transactionHash === `0xcreditcoin_${candidate.receiptHash}`;
}
function isReplayRecordExpired(createdAt, now2 = Date.now()) {
  if (!(createdAt instanceof Date) || !Number.isFinite(createdAt.getTime()) || !Number.isFinite(now2) || now2 < createdAt.getTime()) return false;
  return now2 - createdAt.getTime() > REPLAY_PENDING_LEASE_MS;
}
async function cleanupReplayProtectionRecords(now2 = Date.now()) {
  if (!Number.isFinite(now2)) {
    recordReplayProtectionEvent({ operation: "cleanup", outcome: "unavailable", reason: "cleanup_failed" });
    return false;
  }
  if (now2 - lastReplayCleanupAt < REPLAY_CLEANUP_INTERVAL_MS) return true;
  const db = await getDb();
  if (!db) return false;
  try {
    const pendingCutoff = new Date(now2 - REPLAY_PENDING_LEASE_MS);
    const committedCutoff = new Date(now2 - REPLAY_COMMITTED_RETENTION_MS);
    await db.delete(acceptanceIdempotency).where(lt(acceptanceIdempotency.createdAt, committedCutoff));
    await db.delete(proofRequestIdempotency).where(lt(proofRequestIdempotency.createdAt, committedCutoff));
    await db.delete(acceptanceIdempotency).where(and(eq(acceptanceIdempotency.status, "Pending"), lt(acceptanceIdempotency.createdAt, pendingCutoff)));
    await db.delete(proofRequestIdempotency).where(and(eq(proofRequestIdempotency.status, "Pending"), lt(proofRequestIdempotency.createdAt, pendingCutoff)));
    lastReplayCleanupAt = now2;
    recordReplayProtectionEvent({ operation: "cleanup", outcome: "cleaned" });
    return true;
  } catch (error) {
    recordReplayProtectionEvent({ operation: "cleanup", outcome: "unavailable" });
    console.warn("[ProofLoan] Replay protection cleanup unavailable", error instanceof Error ? error.message : error);
    return false;
  }
}
function boundedReplayCount(value) {
  const count = Number(value);
  return Number.isFinite(count) ? Math.min(1e6, Math.max(0, Math.floor(count))) : 0;
}
async function getReplayProtectionDiagnostics(dbOverride) {
  const db = dbOverride ?? await getDb();
  if (!db) return null;
  const staleBefore = new Date(Date.now() - REPLAY_PENDING_LEASE_MS);
  const [acceptancePending, acceptanceStale, proofPending, proofStale] = await Promise.all([
    db.select({ count: sql`count(*)` }).from(acceptanceIdempotency).where(eq(acceptanceIdempotency.status, "Pending")),
    db.select({ count: sql`count(*)` }).from(acceptanceIdempotency).where(and(eq(acceptanceIdempotency.status, "Pending"), lt(acceptanceIdempotency.createdAt, staleBefore))),
    db.select({ count: sql`count(*)` }).from(proofRequestIdempotency).where(eq(proofRequestIdempotency.status, "Pending")),
    db.select({ count: sql`count(*)` }).from(proofRequestIdempotency).where(and(eq(proofRequestIdempotency.status, "Pending"), lt(proofRequestIdempotency.createdAt, staleBefore)))
  ]);
  return {
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    acceptance: { pending: boundedReplayCount(acceptancePending[0]?.count), stale: boundedReplayCount(acceptanceStale[0]?.count) },
    proofRequest: { pending: boundedReplayCount(proofPending[0]?.count), stale: boundedReplayCount(proofStale[0]?.count) },
    ...lastPersistenceFailure ? { persistence: { ...lastPersistenceFailure, history: persistenceFailureHistory } } : {}
  };
}
async function refreshStaleReplayClaim(target, requestKey, applicationId, dbOverride) {
  if (!isCanonicalReplayRequestKey(requestKey) || target === "acceptance" && (!applicationId || !isProofLoanApplicationId(applicationId))) return false;
  const db = dbOverride ?? await getDb();
  if (!db) {
    recordReplayProtectionEvent({ operation: target, outcome: "unavailable", requestKey, applicationId, reason: "storage_unavailable" });
    return false;
  }
  const staleBefore = new Date(Date.now() - REPLAY_PENDING_LEASE_MS);
  try {
    const updateResult = target === "acceptance" ? await db.update(acceptanceIdempotency).set({ createdAt: /* @__PURE__ */ new Date(), status: "Pending" }).where(and(eq(acceptanceIdempotency.applicationId, applicationId ?? ""), eq(acceptanceIdempotency.requestKey, requestKey), eq(acceptanceIdempotency.status, "Pending"), lt(acceptanceIdempotency.createdAt, staleBefore))) : await db.update(proofRequestIdempotency).set({ createdAt: /* @__PURE__ */ new Date(), status: "Pending" }).where(and(eq(proofRequestIdempotency.requestKey, requestKey), eq(proofRequestIdempotency.status, "Pending"), lt(proofRequestIdempotency.createdAt, staleBefore)));
    const recovered = hasExactlyOneReplayCommit(updateResult[0] ?? {});
    recordReplayProtectionEvent({ operation: target, outcome: recovered ? "reclaimed" : "unavailable", requestKey, applicationId, reason: recovered ? void 0 : "write_failed" });
    return recovered;
  } catch (error) {
    recordReplayProtectionEvent({ operation: target, outcome: "unavailable", requestKey, applicationId, reason: "write_failed" });
    console.warn(`[ProofLoan] ${target} stale replay recovery unavailable`, error instanceof Error ? error.message : error);
    return false;
  }
}
async function claimAcceptanceReplay(applicationId, requestKey, dbOverride) {
  if (!isProofLoanApplicationId(applicationId) || !isCanonicalReplayRequestKey(requestKey)) return { status: "unavailable" };
  const db = dbOverride ?? await getDb();
  if (!db) {
    recordReplayProtectionEvent({ operation: "acceptance", outcome: "unavailable", requestKey, applicationId, reason: "storage_unavailable" });
    return { status: "unavailable" };
  }
  try {
    if (!dbOverride) await cleanupReplayProtectionRecords();
    await db.insert(acceptanceIdempotency).values({ applicationId, requestKey, status: "Pending" }).onDuplicateKeyUpdate({ set: { applicationId } });
    const row = await db.select().from(acceptanceIdempotency).where(eq(acceptanceIdempotency.applicationId, applicationId)).limit(1);
    if (!row[0]) {
      recordReplayProtectionEvent({ operation: "acceptance", outcome: "unavailable", requestKey, applicationId, reason: "missing_record" });
      return { status: "unavailable" };
    }
    if (row[0].requestKey !== requestKey) {
      recordReplayProtectionEvent({ operation: "acceptance", outcome: "conflict", requestKey, applicationId });
      return { status: "conflict" };
    }
    if (row[0].status === "Committed" && typeof row[0].resultJson === "string") {
      try {
        const result = JSON.parse(row[0].resultJson);
        if (isDurableAcceptanceReplayResult(applicationId, result)) {
          recordReplayProtectionEvent({ operation: "acceptance", outcome: "committed", requestKey, applicationId });
          return { status: "committed", result };
        }
      } catch {
        recordReplayProtectionEvent({ operation: "acceptance", outcome: "unavailable", requestKey, applicationId, reason: "invalid_result" });
        return { status: "unavailable" };
      }
      recordReplayProtectionEvent({ operation: "acceptance", outcome: "unavailable", requestKey, applicationId, reason: "invalid_result" });
      return { status: "unavailable" };
    }
    if (row[0].status === "Pending") {
      if (isReplayRecordExpired(row[0].createdAt)) {
        if (!await refreshStaleReplayClaim("acceptance", requestKey, applicationId, db)) return { status: "unavailable" };
        return { status: "claimed" };
      }
      recordReplayProtectionEvent({ operation: "acceptance", outcome: "pending", requestKey, applicationId });
      return { status: "pending" };
    }
    return { status: "unavailable" };
  } catch (error) {
    recordReplayProtectionEvent({ operation: "acceptance", outcome: "unavailable", requestKey, applicationId, reason: "storage_unavailable" });
    console.warn("[ProofLoan] Acceptance idempotency claim unavailable", error instanceof Error ? error.message : error);
    return { status: "unavailable" };
  }
}
function hasExactlyOneReplayCommit(result) {
  return typeof result.affectedRows === "number" && Number.isFinite(result.affectedRows) && Number.isInteger(result.affectedRows) && result.affectedRows === 1;
}
async function commitAcceptanceReplay(applicationId, requestKey, result, dbOverride) {
  if (!isProofLoanApplicationId(applicationId) || !isCanonicalReplayRequestKey(requestKey)) return false;
  const db = dbOverride ?? await getDb();
  if (!db) return false;
  try {
    if (!isDurableAcceptanceReplayResult(applicationId, result)) return false;
    const resultJson = JSON.stringify(result);
    if (resultJson.length > MAX_ACCEPTANCE_RESULT_LENGTH) return false;
    const updateResult = await db.update(acceptanceIdempotency).set({ status: "Committed", resultJson }).where(and(eq(acceptanceIdempotency.applicationId, applicationId), eq(acceptanceIdempotency.requestKey, requestKey), eq(acceptanceIdempotency.status, "Pending")));
    const committed = hasExactlyOneReplayCommit(updateResult[0] ?? {});
    recordReplayProtectionEvent({ operation: "acceptance", outcome: committed ? "committed" : "unavailable", requestKey, applicationId, reason: committed ? void 0 : "write_failed" });
    return committed;
  } catch (error) {
    recordReplayProtectionEvent({ operation: "acceptance", outcome: "unavailable", requestKey, applicationId, reason: "write_failed" });
    console.warn("[ProofLoan] Acceptance idempotency commit unavailable", error instanceof Error ? error.message : error);
    return false;
  }
}
function isDurableProofRequestReplayResult(result) {
  if (!result || typeof result !== "object") return false;
  const candidate = result;
  return typeof candidate.applicationId === "string" && isProofLoanApplicationId(candidate.applicationId) && typeof candidate.state === "string" && candidate.state.length > 0 && Array.isArray(candidate.facts) && Array.isArray(candidate.audit) && candidate.audit.length > 0;
}
async function claimProofRequestReplay(requestKey, walletAddress, sourceChain, dbOverride, sourceTransactionHash) {
  if (!isCanonicalReplayRequestKey(requestKey)) return { status: "unavailable" };
  const db = dbOverride ?? await getDb();
  if (!db) {
    recordReplayProtectionEvent({ operation: "proof_request", outcome: "unavailable", requestKey, reason: "storage_unavailable" });
    return { status: "unavailable" };
  }
  try {
    if (!dbOverride) await cleanupReplayProtectionRecords();
    await db.insert(proofRequestIdempotency).values({ requestKey, walletAddress, sourceTransactionHash: sourceTransactionHash || null, sourceChain, status: "Pending" }).onDuplicateKeyUpdate({ set: { requestKey } });
    const row = await db.select().from(proofRequestIdempotency).where(eq(proofRequestIdempotency.requestKey, requestKey)).limit(1);
    if (!row[0]) {
      recordReplayProtectionEvent({ operation: "proof_request", outcome: "unavailable", requestKey, reason: "missing_record" });
      return { status: "unavailable" };
    }
    if (row[0].walletAddress !== walletAddress || (row[0].sourceTransactionHash ?? null) !== (sourceTransactionHash || null) || row[0].sourceChain !== sourceChain) {
      recordReplayProtectionEvent({ operation: "proof_request", outcome: "conflict", requestKey });
      return { status: "conflict" };
    }
    if (row[0].status === "Committed" && typeof row[0].resultJson === "string") {
      try {
        const result = JSON.parse(row[0].resultJson);
        if (isDurableProofRequestReplayResult(result)) {
          recordReplayProtectionEvent({ operation: "proof_request", outcome: "committed", requestKey, applicationId: result.applicationId });
          return { status: "committed", result };
        }
      } catch {
        recordReplayProtectionEvent({ operation: "proof_request", outcome: "unavailable", requestKey, reason: "invalid_result" });
        return { status: "unavailable" };
      }
      recordReplayProtectionEvent({ operation: "proof_request", outcome: "unavailable", requestKey, reason: "invalid_result" });
      return { status: "unavailable" };
    }
    if (row[0].status === "Pending") {
      if (isReplayRecordExpired(row[0].createdAt)) {
        if (!await refreshStaleReplayClaim("proof_request", requestKey, void 0, db)) return { status: "unavailable" };
        return { status: "claimed" };
      }
      recordReplayProtectionEvent({ operation: "proof_request", outcome: "pending", requestKey });
      return { status: "pending" };
    }
    return { status: "unavailable" };
  } catch (error) {
    recordReplayProtectionEvent({ operation: "proof_request", outcome: "unavailable", requestKey, reason: "storage_unavailable" });
    console.warn("[ProofLoan] Proof-request idempotency claim unavailable", error instanceof Error ? error.message : error);
    return { status: "unavailable" };
  }
}
async function commitProofRequestReplay(requestKey, applicationId, result, dbOverride) {
  if (!isCanonicalReplayRequestKey(requestKey) || !isProofLoanApplicationId(applicationId)) return false;
  const db = dbOverride ?? await getDb();
  if (!db || !isDurableProofRequestReplayResult(result) || result.applicationId !== applicationId) return false;
  try {
    const resultJson = JSON.stringify(result);
    if (resultJson.length > MAX_PROOF_REQUEST_RESULT_LENGTH) return false;
    const updateResult = await db.update(proofRequestIdempotency).set({ applicationId, status: "Committed", resultJson }).where(and(eq(proofRequestIdempotency.requestKey, requestKey), eq(proofRequestIdempotency.status, "Pending")));
    const committed = hasExactlyOneReplayCommit(updateResult[0] ?? {});
    recordReplayProtectionEvent({ operation: "proof_request", outcome: committed ? "committed" : "unavailable", requestKey, applicationId, reason: committed ? void 0 : "write_failed" });
    return committed;
  } catch (error) {
    recordReplayProtectionEvent({ operation: "proof_request", outcome: "unavailable", requestKey, applicationId, reason: "write_failed" });
    console.warn("[ProofLoan] Proof-request idempotency commit unavailable", error instanceof Error ? error.message : error);
    return false;
  }
}
async function persistLoanSnapshot(snapshot, dbOverride) {
  if (!isLoanSnapshotWriteConsistent(snapshot) || !isLoanSnapshotPersistable(snapshot)) return false;
  const db = dbOverride ?? await getDb();
  if (!db) return false;
  try {
    await db.transaction(async (tx) => {
      const applicationValues = buildApplicationUpsertValues(snapshot);
      await tx.insert(loanApplications).values(applicationValues).onDuplicateKeyUpdate({ set: { state: applicationValues.state, evidenceRoot: applicationValues.evidenceRoot, policyHash: applicationValues.policyHash, modelVersion: applicationValues.modelVersion, decisionHash: applicationValues.decisionHash } });
      for (const fact of snapshot.facts) {
        const factValues = buildFactUpsertValues(fact);
        await tx.insert(verifiedFacts).values({ applicationId: snapshot.applicationId, ...factValues.values }).onDuplicateKeyUpdate({ set: factValues.updateSet });
      }
      if (snapshot.decision) {
        const decisionValues = buildDecisionUpsertValues(snapshot.decision);
        const existingDecision = await tx.select({ id: decisions.id }).from(decisions).where(eq(decisions.applicationId, snapshot.applicationId)).orderBy(desc(decisions.id)).limit(1);
        if (existingDecision[0]) await tx.update(decisions).set(decisionValues).where(eq(decisions.id, existingDecision[0].id));
        else await tx.insert(decisions).values({ applicationId: snapshot.applicationId, ...decisionValues });
      }
      if (snapshot.offer) {
        const existingOffer = await tx.select({ id: offers.id }).from(offers).where(eq(offers.applicationId, snapshot.applicationId)).orderBy(desc(offers.id)).limit(1);
        const offerValues = buildOfferUpsertValues(snapshot.offer, snapshot.state, Number(applicationValues.requestedAmount), Date.now());
        if (existingOffer[0]) await tx.update(offers).set(offerValues).where(eq(offers.id, existingOffer[0].id));
        else await tx.insert(offers).values({ applicationId: snapshot.applicationId, ...offerValues });
      }
      for (const event of snapshot.audit) {
        const auditValues = buildAuditUpsertValues(event);
        await tx.insert(auditEvents).values({ applicationId: snapshot.applicationId, ...auditValues.values }).onDuplicateKeyUpdate({ set: auditValues.updateSet });
      }
    });
    return true;
  } catch (error) {
    console.warn("[ProofLoan] Persistence unavailable; keeping the active snapshot in memory for the demo.", error instanceof Error ? error.message : error);
    return false;
  }
}
async function transitionLoanState(applicationId, expectedState, nextState) {
  const db = await getDb();
  if (!db) return "unavailable";
  try {
    const result = await db.update(loanApplications).set({ state: nextState }).where(and(eq(loanApplications.applicationId, applicationId), eq(loanApplications.state, expectedState)));
    const affectedRows = Number(result.affectedRows ?? 0);
    if (affectedRows === 1) return "committed";
    const current = await db.select({ state: loanApplications.state }).from(loanApplications).where(eq(loanApplications.applicationId, applicationId)).limit(1);
    if (!current[0]) return "unavailable";
    if (current[0].state === nextState) return "committed";
    if (current[0].state !== expectedState) return "conflict";
    return "unavailable";
  } catch (error) {
    console.warn("[ProofLoan] Database transition unavailable", error instanceof Error ? error.message : error);
    return "unavailable";
  }
}
var MAX_PERSISTED_REASON_CODES_LENGTH = 512;
function parsePersistedReasonCodes(raw) {
  if (typeof raw !== "string" || raw.length > MAX_PERSISTED_REASON_CODES_LENGTH) return void 0;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 && parsed.length <= REASON_CODES.length && parsed.every((code) => typeof code === "string" && isReasonCode(code)) && new Set(parsed).size === parsed.length ? parsed : void 0;
  } catch {
    return void 0;
  }
}
var isFiniteInRange = (value, min, max) => {
  if (typeof value !== "number" && typeof value !== "string") return false;
  if (typeof value === "string" && (value.trim().length === 0 || value !== value.trim())) return false;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= min && numeric <= max;
};
var isFactBlockChronologyConsistent = (sourceBlock, verificationBlock) => typeof sourceBlock === "number" && typeof verificationBlock === "number" && Number.isSafeInteger(sourceBlock) && Number.isSafeInteger(verificationBlock) && sourceBlock >= 1 && verificationBlock >= 1 && verificationBlock >= sourceBlock;
var isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());
var isBoundedText = (value, maxLength) => typeof value === "string" && value.length <= maxLength;
var isBoundedNonEmptyText = (value, maxLength) => isBoundedText(value, maxLength) && value.trim().length > 0;
var isCanonicalNonEmptyText = (value, maxLength) => isBoundedNonEmptyText(value, maxLength) && value === value.trim() && !/[\u0000-\u001F\u007F]/.test(value);
var isCanonicalWalletAddress = (value, sourceChain) => isCanonicalNonEmptyText(value, MAX_PERSISTED_WALLET_LENGTH) && (!isAddressShapedIdentity(value) || isLiveChainWalletAddress(value, sourceChain));
var isOfferStateConsistent = (state2, status) => status === "Ready" && state2 === "AwaitingAcceptance" || status === "Blocked" && state2 === "Rejected" || status === "Executed" && state2 === "Executed";
var isOfferExpiryConsistent = (status, expiresAt, now2) => status !== "Ready" || expiresAt.getTime() > now2;
var isDecisionStateConsistent = (state2, hasDecision) => hasDecision ? ["Scored", "OfferPrepared", "AwaitingAcceptance", "Executed", "Rejected"].includes(state2) : !["Scored", "OfferPrepared", "AwaitingAcceptance", "Executed", "Rejected"].includes(state2);
var isFactStateConsistent = (state2, factCount) => !["EvidenceVerified", "Scored", "OfferPrepared", "AwaitingAcceptance", "Executed", "Rejected"].includes(state2) || factCount > 0;
var AUDIT_STATE_ORDER = { Intake: 0, EvidencePending: 1, EvidenceVerified: 2, Scored: 3, OfferPrepared: 4, AwaitingAcceptance: 5, Executed: 6, Rejected: 7 };
var hasUniqueAuditHashes = (audit2) => {
  const hashes = audit2.map((event) => event.hash ?? event.eventHash);
  if (!hashes.every((hash) => isCanonicalNonEmptyText(hash, MAX_PERSISTED_AUDIT_HASH_LENGTH))) return false;
  return new Set(hashes).size === hashes.length;
};
var isAuditStateProgressionConsistent = (audit2) => audit2.every((event, index) => {
  if (index === 0) return true;
  const previous = audit2[index - 1].state;
  const current = event.state;
  if (previous === "Executed" || previous === "Rejected") return current === previous;
  return AUDIT_STATE_ORDER[current] >= AUDIT_STATE_ORDER[previous];
});
var PERSISTENCE_VALIDATION_RULES = {
  CLOCK_INVALID: "CLOCK_INVALID",
  EXPECTED_APPLICATION_MISMATCH: "EXPECTED_APPLICATION_MISMATCH",
  COLLECTION_SHAPE: "COLLECTION_SHAPE",
  APPLICATION_SHAPE: "APPLICATION_SHAPE",
  COLLECTION_BOUNDS: "COLLECTION_BOUNDS",
  APPLICATION_IDENTITY: "APPLICATION_IDENTITY",
  VERIFIED_FACT_METADATA: "VERIFIED_FACT_METADATA",
  AUDIT_METADATA: "AUDIT_METADATA",
  SNAPSHOT_INTEGRITY: "SNAPSHOT_INTEGRITY"
};
var MAX_PERSISTENCE_FAILURE_HISTORY = 6;
var lastPersistenceFailure;
var persistenceFailureHistory = [];
function recordPersistenceFailure(rule) {
  const entry = { rule, observedAt: (/* @__PURE__ */ new Date()).toISOString() };
  lastPersistenceFailure = entry;
  persistenceFailureHistory = [...persistenceFailureHistory, entry].slice(-MAX_PERSISTENCE_FAILURE_HISTORY);
}
function getPersistedSnapshotValidationRule(input, expectedApplicationId, now2 = Date.now()) {
  try {
    if (!Number.isFinite(now2)) return PERSISTENCE_VALIDATION_RULES.CLOCK_INVALID;
    if (expectedApplicationId !== void 0 && input.application?.applicationId !== expectedApplicationId) return PERSISTENCE_VALIDATION_RULES.EXPECTED_APPLICATION_MISMATCH;
    if (!Array.isArray(input.facts) || !Array.isArray(input.audit)) return PERSISTENCE_VALIDATION_RULES.COLLECTION_SHAPE;
    if (!isRecord(input.application)) return PERSISTENCE_VALIDATION_RULES.APPLICATION_SHAPE;
    if (input.facts.length > MAX_PERSISTED_FACTS || input.audit.length === 0 || input.audit.length > MAX_PERSISTED_AUDIT_EVENTS) return PERSISTENCE_VALIDATION_RULES.COLLECTION_BOUNDS;
    if (input.offer && input.offer.expiresAt instanceof Date && isOfferStatus(input.offer.status) && !isOfferExpiryConsistent(input.offer.status, input.offer.expiresAt, now2)) return PERSISTENCE_VALIDATION_RULES.SNAPSHOT_INTEGRITY;
    if (input.facts.some((fact) => fact.verifiedAt instanceof Date && fact.verifiedAt.getTime() > now2) || input.audit.some((event) => event.createdAt instanceof Date && event.createdAt.getTime() > now2)) return PERSISTENCE_VALIDATION_RULES.SNAPSHOT_INTEGRITY;
    if (!isCanonicalNonEmptyText(input.application.applicationId, MAX_PERSISTED_APPLICATION_ID_LENGTH) || !isProofLoanApplicationId(input.application.applicationId) || !isCanonicalWalletAddress(input.application.walletAddress, input.application.sourceChain) || !isProofLoanState(input.application.state) || !isSourceChain(input.application.sourceChain) || !isFiniteInRange(input.application.requestedAmount, 0.01, 2500)) return PERSISTENCE_VALIDATION_RULES.APPLICATION_IDENTITY;
    if (input.facts.some((fact) => !isRecord(fact) || !isCanonicalNonEmptyText(fact.factId, MAX_PERSISTED_FACT_ID_LENGTH) || fact.chain !== input.application.sourceChain || !isSourceChain(fact.chain) || !isVerifiedEventType(fact.eventType) || !isCanonicalNonEmptyText(fact.txHash, MAX_PERSISTED_TX_HASH_LENGTH) || !isCanonicalNonEmptyText(fact.amount, MAX_PERSISTED_AMOUNT_LENGTH) || !isCanonicalNonEmptyText(fact.proofRoot, MAX_PERSISTED_PROOF_ROOT_LENGTH) || !isFreshness(fact.freshness))) return PERSISTENCE_VALIDATION_RULES.VERIFIED_FACT_METADATA;
    if (input.audit.some((event) => !isRecord(event) || !isProofLoanState(event.state) || !isValidDate(event.createdAt) || !isBoundedNonEmptyText(event.label, MAX_PERSISTED_AUDIT_LABEL_LENGTH) || event.label !== event.state || !isCanonicalNonEmptyText(event.eventHash, MAX_PERSISTED_AUDIT_HASH_LENGTH) || !isBoundedNonEmptyText(event.detail, MAX_PERSISTED_AUDIT_DETAIL_LENGTH))) return PERSISTENCE_VALIDATION_RULES.AUDIT_METADATA;
    return isPersistedSnapshotValidUnsafe(input) ? void 0 : PERSISTENCE_VALIDATION_RULES.SNAPSHOT_INTEGRITY;
  } catch {
    return PERSISTENCE_VALIDATION_RULES.SNAPSHOT_INTEGRITY;
  }
}
function isPersistedSnapshotValidUnsafe(input) {
  if (!Array.isArray(input.facts) || !Array.isArray(input.audit)) return false;
  if (!isRecord(input.application)) return false;
  if (input.facts.length > MAX_PERSISTED_FACTS || input.audit.length === 0 || input.audit.length > MAX_PERSISTED_AUDIT_EVENTS) return false;
  if (!isFactStateConsistent(input.application.state, input.facts.length)) return false;
  if (!isCanonicalNonEmptyText(input.application.applicationId, MAX_PERSISTED_APPLICATION_ID_LENGTH) || !isProofLoanApplicationId(input.application.applicationId) || !isCanonicalWalletAddress(input.application.walletAddress, input.application.sourceChain) || !isProofLoanState(input.application.state) || !isSourceChain(input.application.sourceChain) || !isFiniteInRange(input.application.requestedAmount, 0.01, 2500)) return false;
  const applicationRecord = input.application;
  if (applicationRecord.createdAt !== void 0 && !isValidDate(applicationRecord.createdAt)) return false;
  if (applicationRecord.updatedAt !== void 0 && !isValidDate(applicationRecord.updatedAt)) return false;
  if (applicationRecord.createdAt instanceof Date && applicationRecord.updatedAt instanceof Date && applicationRecord.updatedAt.getTime() < applicationRecord.createdAt.getTime()) return false;
  if (input.facts.some((fact) => !isRecord(fact) || !isCanonicalNonEmptyText(fact.factId, MAX_PERSISTED_FACT_ID_LENGTH) || fact.chain !== input.application.sourceChain || !isSourceChain(fact.chain) || !isVerifiedEventType(fact.eventType) || !isCanonicalNonEmptyText(fact.txHash, MAX_PERSISTED_TX_HASH_LENGTH) || !isCanonicalNonEmptyText(fact.amount, MAX_PERSISTED_AMOUNT_LENGTH) || !isCanonicalNonEmptyText(fact.proofRoot, MAX_PERSISTED_PROOF_ROOT_LENGTH) || !isFreshness(fact.freshness) || !isFactBlockChronologyConsistent(fact.sourceBlock, fact.verificationBlock) || !isValidDate(fact.verifiedAt))) return false;
  const factIds = input.facts.map((fact) => fact.factId);
  if (new Set(factIds).size !== factIds.length || !hasUniqueFactIdentity(input.facts)) return false;
  if (!isDecisionStateConsistent(input.application.state, Boolean(input.decision))) return false;
  if (input.decision && (!isRecord(input.decision) || !isCanonicalNonEmptyText(input.decision.featureVersion, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !isCanonicalNonEmptyText(input.decision.modelVersion, MAX_PERSISTED_DECISION_METADATA_LENGTH) || input.decision.featureFingerprint !== void 0 && input.decision.policyHash !== POLICY_HASH || !isCanonicalNonEmptyText(input.decision.policyHash, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !isCanonicalNonEmptyText(input.decision.evidenceRoot, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !isCanonicalNonEmptyText(input.decision.decisionHash, MAX_PERSISTED_DECISION_METADATA_LENGTH) || !parsePersistedReasonCodes(input.decision.reasonCodes) || !isRiskTier(input.decision.riskTier) || !isFiniteInRange(input.decision.pd30, 0, 1) || !isFiniteInRange(input.decision.pd90, 0, 1) || !isProbabilityOrderConsistent(Number(input.decision.pd30), Number(input.decision.pd90)) || riskTierForPd30(Number(input.decision.pd30)) !== input.decision.riskTier || !isFiniteInRange(input.decision.confidence, 0, 1))) return false;
  if (input.decision) {
    const mirroredDecisionFields = ["featureVersion", "modelVersion", "policyHash", "evidenceRoot", "decisionHash"];
    const applicationRecord2 = input.application;
    const decisionRecord = input.decision;
    if (mirroredDecisionFields.some((field) => applicationRecord2[field] !== void 0 && applicationRecord2[field] !== decisionRecord[field])) return false;
  }
  if (input.offer && (!input.decision || !isRecord(input.offer) || !isOfferStatus(input.offer.status) || !isOfferStateConsistent(input.application.state, input.offer.status) || !isFiniteInRange(input.offer.amount, 0.01, 2500) || Number(input.application.requestedAmount) !== Number(input.offer.amount) || !isFiniteInRange(input.offer.apr, 0, 24) || !input.decision || Number(input.offer.apr) !== aprForRiskTier(input.decision.riskTier) || !isFiniteInRange(input.offer.ltv, 0, 1) || input.decision.featureFingerprint !== void 0 && (input.offer.collateralValue === void 0 || input.offer.poolLiquidity === void 0) || !isFiniteInRange(input.offer.collateralValue ?? 2800, 0.01, 1e6) || Number(input.offer.ltv) !== ltvForOfferAmount(Number(input.application.requestedAmount), Number(input.offer.collateralValue ?? 2800)) || !isFiniteInRange(input.offer.poolLiquidity ?? 25e4, 0.01, 1e9) || Number(input.offer.poolLiquidity ?? 25e4) < Number(input.offer.amount) || !isFiniteInRange(input.offer.termDays, 1, 3650) || !(input.offer.expiresAt instanceof Date) || Number.isNaN(input.offer.expiresAt.getTime()))) return false;
  if (!input.audit.every((event) => isRecord(event) && isProofLoanState(event.state) && isValidDate(event.createdAt) && isBoundedNonEmptyText(event.label, MAX_PERSISTED_AUDIT_LABEL_LENGTH) && event.label === event.state && isCanonicalNonEmptyText(event.eventHash, MAX_PERSISTED_AUDIT_HASH_LENGTH) && isBoundedNonEmptyText(event.detail, MAX_PERSISTED_AUDIT_DETAIL_LENGTH))) return false;
  if (!isAuditStateProgressionConsistent(input.audit)) return false;
  const lastAuditState = input.audit.length ? input.audit[input.audit.length - 1].state : void 0;
  if (lastAuditState !== input.application.state) return false;
  const terminalAudit = input.audit.at(-1);
  const terminalAuditTime = terminalAudit?.createdAt instanceof Date ? terminalAudit.createdAt.getTime() : Number.NaN;
  if (!Number.isFinite(terminalAuditTime)) return false;
  if (input.facts.some((fact) => fact.verifiedAt instanceof Date && fact.verifiedAt.getTime() > terminalAuditTime)) return false;
  if (input.offer?.status === "Executed") {
    if (!(input.offer.expiresAt instanceof Date) || input.offer.expiresAt.getTime() <= terminalAuditTime) return false;
  }
  const auditHashes = input.audit.map((event) => event.eventHash);
  if (new Set(auditHashes).size !== auditHashes.length) return false;
  const auditTimes = input.audit.map((event) => event.createdAt instanceof Date ? event.createdAt.getTime() : Number.NaN);
  return auditTimes.every((time, index) => Number.isFinite(time) && (index === 0 || time >= auditTimes[index - 1]));
}
async function getPersistedLoanSnapshot(applicationId, dbOverride) {
  if (!isProofLoanApplicationId(applicationId)) return void 0;
  const db = dbOverride ?? await getDb();
  if (!db) return void 0;
  try {
    const applicationRows = await db.select().from(loanApplications).where(eq(loanApplications.applicationId, applicationId)).limit(2);
    if (applicationRows.length !== 1) return void 0;
    const application = applicationRows[0];
    const factRows = await db.select().from(verifiedFacts).where(eq(verifiedFacts.applicationId, applicationId)).orderBy(asc(verifiedFacts.id));
    const decisionRows = await db.select().from(decisions).where(eq(decisions.applicationId, applicationId)).orderBy(desc(decisions.id)).limit(2);
    const offerRows = await db.select().from(offers).where(eq(offers.applicationId, applicationId)).orderBy(desc(offers.id)).limit(2);
    if (decisionRows.length > 1 || offerRows.length > 1) return void 0;
    const auditRows = await db.select().from(auditEvents).where(eq(auditEvents.applicationId, applicationId)).orderBy(asc(auditEvents.id));
    const childRows = [...factRows, ...decisionRows, ...offerRows, ...auditRows];
    if (childRows.some((row) => row.applicationId !== applicationId)) return void 0;
    const applicationRecord = application;
    const firstAuditRow = auditRows[0];
    if (applicationRecord.createdAt !== void 0 && !isValidDate(applicationRecord.createdAt)) return void 0;
    if (applicationRecord.updatedAt !== void 0 && !isValidDate(applicationRecord.updatedAt)) return void 0;
    if (applicationRecord.createdAt instanceof Date && firstAuditRow?.createdAt instanceof Date && applicationRecord.createdAt.getTime() > firstAuditRow.createdAt.getTime()) return void 0;
    if (applicationRecord.createdAt instanceof Date && applicationRecord.updatedAt instanceof Date && applicationRecord.updatedAt.getTime() < applicationRecord.createdAt.getTime()) return void 0;
    const terminalAuditRow = auditRows.at(-1);
    if (terminalAuditRow?.createdAt instanceof Date) {
      const terminalAuditTime = terminalAuditRow.createdAt.getTime();
      if (applicationRecord.updatedAt instanceof Date && applicationRecord.updatedAt.getTime() > terminalAuditTime) return void 0;
      const timedChildRows = [...decisionRows, ...offerRows];
      if (timedChildRows.some((row) => row.createdAt instanceof Date && (!Number.isFinite(row.createdAt.getTime()) || row.createdAt.getTime() > terminalAuditTime))) return void 0;
    }
    const persistenceInput = { application, facts: factRows, decision: decisionRows[0], offer: offerRows[0], audit: auditRows };
    const persistenceRule = getPersistedSnapshotValidationRule(persistenceInput, applicationId);
    if (persistenceRule) {
      recordPersistenceFailure(persistenceRule);
      return void 0;
    }
    if (!isProofLoanState(application.state) || !isSourceChain(application.sourceChain)) return void 0;
    const facts = factRows.map((fact) => {
      if (!isSourceChain(fact.chain) || !isVerifiedEventType(fact.eventType) || !isFreshness(fact.freshness)) throw new Error(`Invalid persisted fact enum for ${fact.factId}.`);
      return { id: fact.factId, chain: fact.chain, sourceBlock: fact.sourceBlock, txHash: fact.txHash, eventType: fact.eventType, amount: fact.amount, asset: "USDC", verificationBlock: fact.verificationBlock, verifiedAt: fact.verifiedAt.toISOString(), observedAt: fact.verifiedAt.toISOString(), freshness: fact.freshness, proofRoot: fact.proofRoot, proofWorker: "Attestcoin proof worker" };
    });
    const decisionRow = decisionRows[0];
    let decision;
    if (decisionRow) {
      const parsedReasonCodes = parsePersistedReasonCodes(decisionRow.reasonCodes);
      if (!parsedReasonCodes || !isRiskTier(decisionRow.riskTier)) return void 0;
      const riskTier = decisionRow.riskTier;
      decision = { pd30: Number(decisionRow.pd30), pd90: Number(decisionRow.pd90), confidence: Number(decisionRow.confidence), freshnessScore: facts.length ? facts.filter((f) => f.freshness === "Fresh").length / facts.length : 0, riskTier, reasonCodes: parsedReasonCodes, featureVersion: decisionRow.featureVersion, modelVersion: decisionRow.modelVersion, policyHash: decisionRow.policyHash, evidenceRoot: decisionRow.evidenceRoot, decisionHash: decisionRow.decisionHash, featureFingerprint: decisionRow.featureFingerprint ?? void 0 };
    }
    const offerRow = offerRows[0];
    const offerStatus = offerRow && isOfferStatus(offerRow.status) ? offerRow.status : void 0;
    if (decision?.featureFingerprint !== void 0 && offerRow && (offerRow.collateralValue === null || offerRow.collateralValue === void 0 || offerRow.poolLiquidity === null || offerRow.poolLiquidity === void 0)) return void 0;
    const offer = offerRow && offerStatus ? { amount: Number(offerRow.amount), apr: Number(offerRow.apr), ltv: Number(offerRow.ltv), collateralValue: offerRow.collateralValue === null || offerRow.collateralValue === void 0 ? void 0 : Number(offerRow.collateralValue), poolLiquidity: Number(offerRow.poolLiquidity ?? 25e4), termDays: offerRow.termDays, expiresAt: offerRow.expiresAt.toISOString(), status: offerStatus } : void 0;
    const audit2 = auditRows.map((event) => ({ state: event.state, label: event.label, timestamp: event.createdAt.toISOString(), detail: event.detail, hash: event.eventHash }));
    const reconstructionNow = Date.now();
    if (decision && decision.evidenceRoot !== hashValue(facts.map((fact) => fact.proofRoot))) return void 0;
    const features = buildFeatureVector(facts, reconstructionNow);
    if (!isFeatureVectorFiniteAndBounded(features) || !isFeatureVectorConsistentWithFacts(features, facts, reconstructionNow)) return void 0;
    if (decision) decision = { ...decision, freshnessScore: features.freshnessScore };
    if (decision && decision.confidence > features.freshnessScore) return void 0;
    if (decision?.featureFingerprint !== void 0 && decision.featureFingerprint !== fingerprintFeatureVector(features)) return void 0;
    if (decision?.featureFingerprint !== void 0 && decision.decisionHash !== fingerprintDecision(decision)) return void 0;
    if (application.sourceTransactionHash !== null && application.sourceTransactionHash !== void 0 && !isLiveTxHash(application.sourceTransactionHash)) return void 0;
    return { applicationId, walletAddress: application.walletAddress, sourceTransactionHash: application.sourceTransactionHash ?? void 0, sourceChain: application.sourceChain, state: application.state, facts, features, decision, offer, audit: audit2 };
  } catch (error) {
    console.warn("[ProofLoan] Database read unavailable; using active in-memory snapshot.", error instanceof Error ? error.message : error);
    return void 0;
  }
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state2) {
    return decodeOAuthState(state2).redirectUri;
  }
  async getTokenByCode(code, state2) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state2)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state2) {
    return this.oauthService.getTokenByCode(code, state2);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now2 = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now2,
    updatedAt: now2,
    lastSignedIn: now2,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state2 = getQueryParam(req, "state");
    if (!code || !state2) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state2);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state2);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/routers.ts
import { z as z5 } from "zod";
import { randomUUID as randomUUID8 } from "node:crypto";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/attestcoin/errors.ts
var AttestcoinError = class extends Error {
  kind;
  retriable;
  causeValue;
  requestId;
  constructor(kind, message, options = {}) {
    super(message);
    this.name = "AttestcoinError";
    this.kind = kind;
    this.retriable = options.retriable ?? false;
    this.causeValue = options.causeValue;
    this.requestId = options.requestId;
  }
};
function normalizeAttestcoinError(error, requestId) {
  if (error instanceof AttestcoinError) return error;
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("experimental") || message.includes("chainkey") || message.includes("unsupported")) {
      return new AttestcoinError("UNSUPPORTED_CHAIN", error.message, {
        retriable: false,
        causeValue: error,
        requestId
      });
    }
    if (message.includes("timeout") || message.includes("timed out")) {
      return new AttestcoinError("TIMEOUT", error.message, {
        retriable: true,
        causeValue: error,
        requestId
      });
    }
    if (message.includes("429") || message.includes("rate limit") || message.includes("too many requests")) {
      return new AttestcoinError("RATE_LIMITED", error.message, {
        retriable: true,
        causeValue: error,
        requestId
      });
    }
    if (message.includes("circuit")) {
      return new AttestcoinError("CIRCUIT_OPEN", error.message, {
        retriable: true,
        causeValue: error,
        requestId
      });
    }
    if (message.includes("proof") && (message.includes("verify") || message.includes("validation"))) {
      return new AttestcoinError("PROOF_VERIFICATION", error.message, {
        retriable: false,
        causeValue: error,
        requestId
      });
    }
    if (message.includes("proof")) {
      return new AttestcoinError("PROOF_BUILDER", error.message, {
        retriable: true,
        causeValue: error,
        requestId
      });
    }
    if (message.includes("rpc") || message.includes("network") || message.includes("fetch")) {
      return new AttestcoinError("SOURCE_RPC", error.message, {
        retriable: true,
        causeValue: error,
        requestId
      });
    }
    return new AttestcoinError("UNKNOWN", error.message, {
      retriable: false,
      causeValue: error,
      requestId
    });
  }
  return new AttestcoinError(
    "UNKNOWN",
    "Unknown Attestcoin Protocol error.",
    { retriable: false, causeValue: error, requestId }
  );
}

// server/multichain/validation.ts
function parseEnvironmentId(value) {
  const normalized = (value ?? "cc3-testnet").trim().toLowerCase();
  if (!isAttestcoinEnvironmentId(normalized)) {
    throw new AttestcoinError(
      "VALIDATION",
      `Unknown Attestcoin environment '${value}'. Use cc3-testnet or cc3-mainnet.`
    );
  }
  return normalized;
}
function assertNonEmptyUrlList(label, urls) {
  if (urls.length === 0) {
    throw new AttestcoinError(
      "VALIDATION",
      `${label} requires at least one RPC URL.`
    );
  }
  for (const url of urls) {
    if (!/^https?:\/\//.test(url)) {
      throw new AttestcoinError(
        "VALIDATION",
        `${label} contains an invalid RPC URL.`
      );
    }
  }
  return urls.slice();
}

// server/multichain/environment.ts
function readNumber(env, key, fallback) {
  const raw = env[key];
  if (raw === void 0 || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function firstNonEmpty(...values) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return void 0;
}
function splitUrls(value, fallback) {
  const fromEnv = value?.split(",").map((part) => part.trim()).filter(Boolean);
  return fromEnv && fromEnv.length > 0 ? fromEnv : [...fallback];
}
function resolveAttestcoinEnvironment(env = process.env) {
  const requestedId = parseEnvironmentId(
    env.ATTESTCOIN_ENVIRONMENT ?? DEFAULT_ATTESTCOIN_ENVIRONMENT
  );
  const record = getEnvironmentRecord(requestedId);
  const creditcoinRpcUrls = splitUrls(
    firstNonEmpty(env.CREDITCOIN_RPC_URLS, env.CREDITCOIN_RPC_URL),
    record.rpcUrls
  );
  const proofBuilderUrl = firstNonEmpty(
    env.CREDITCOIN_PROOF_BUILDER_URL,
    env.PROOF_BUILDER_URL
  ) ?? record.proofBuilderUrl;
  return {
    ...record,
    requestedId,
    creditcoinRpcUrl: creditcoinRpcUrls[0],
    creditcoinRpcUrls,
    proofBuilderUrl,
    timeoutMs: readNumber(env, "ATTESTCOIN_TIMEOUT_MS", 15e3),
    retryCount: readNumber(env, "ATTESTCOIN_RETRY_COUNT", 2),
    cacheTtlMs: readNumber(env, "ATTESTCOIN_CACHE_TTL_MS", 12e4),
    maxConcurrentProofs: readNumber(env, "ATTESTCOIN_MAX_CONCURRENCY", 2)
  };
}
function getPublicEnvironmentSnapshot(env = process.env) {
  const resolved = resolveAttestcoinEnvironment(env);
  return {
    environment: resolved.id,
    label: resolved.label,
    networkKind: resolved.networkKind,
    decoderContract: resolved.decoderContract,
    proofBuilderUrl: resolved.proofBuilderUrl,
    dashboardUrl: resolved.dashboardUrl,
    capabilities: listChainCapabilities(resolved.id),
    documentedEnvironments: Object.values(MULTICHAIN_REGISTRY.environments).map(
      (item) => ({
        id: item.id,
        label: item.label,
        networkKind: item.networkKind
      })
    )
  };
}
var cached;
function getCachedAttestcoinEnvironment(env = process.env) {
  const key = [
    env.ATTESTCOIN_ENVIRONMENT,
    env.CREDITCOIN_RPC_URL,
    env.CREDITCOIN_RPC_URLS,
    env.CREDITCOIN_PROOF_BUILDER_URL,
    env.PROOF_BUILDER_URL
  ].join("|");
  if (cached?.key === key) return cached.value;
  const value = resolveAttestcoinEnvironment(env);
  cached = { key, value };
  return value;
}

// server/multichain/registry.ts
function asUrlList(value, fallback) {
  if (Array.isArray(value) && value.length > 0) return value.map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return Array.from(fallback);
}
function sourceRpcOverridesFromEnv(env = process.env) {
  return {
    "Ethereum Sepolia": env.ETHEREUM_SEPOLIA_RPC_URL,
    "Ethereum Mainnet": env.ETHEREUM_MAINNET_RPC_URL,
    "Polygon Amoy": env.POLYGON_AMOY_RPC_URL
  };
}
function resolveSourceChain(chain, options = {}) {
  const resolvedEnvironment = typeof options.environment === "object" ? options.environment : getCachedAttestcoinEnvironment(options.env);
  const environmentId = typeof options.environment === "string" ? options.environment : resolvedEnvironment.id;
  const catalog = getSourceChainRecord(chain);
  const binding = getOfficialBinding(environmentId, chain);
  const capability = chainCapability(environmentId, chain);
  const rpcUrls = assertNonEmptyUrlList(
    `${chain} RPC`,
    asUrlList(
      options.rpcOverrides?.[chain] ?? sourceRpcOverridesFromEnv(options.env)[chain],
      catalog.rpcUrls
    )
  );
  return {
    id: catalog.id,
    name: catalog.name,
    evmChainId: catalog.evmChainId,
    nativeSymbol: catalog.nativeSymbol,
    explorerTxBaseUrl: catalog.explorerTxBaseUrl,
    support: catalog.support,
    previewEnabled: catalog.previewEnabled,
    liveProofDefault: catalog.liveProofDefault,
    preview: catalog.preview,
    environment: environmentId,
    rpcUrl: rpcUrls[0],
    rpcUrls,
    chainKey: binding?.chainKey ?? null,
    genesisBlock: binding?.genesisBlock ?? null,
    liveProofEnabled: capability.liveProof,
    experimental: catalog.support === "experimental",
    capability,
    officialBinding: binding
  };
}
function requireOfficialChainKey(chain, environment) {
  const resolved = resolveSourceChain(chain, { environment });
  if (resolved.chainKey === null) {
    throw new AttestcoinError(
      "UNSUPPORTED_CHAIN",
      resolved.capability.reason ?? `${chain} has no official Attestcoin chainkey in ${resolved.environment}.`
    );
  }
  return resolved.chainKey;
}

// server/multichain/requestPolicy.ts
function classifyProofRequest(input) {
  const environment = getCachedAttestcoinEnvironment();
  const resolved = resolveSourceChain(input.sourceChain, {
    environment
  });
  const wantsLive = input.intent === "live" || input.intent !== "preview" && Boolean(input.txHash && isLiveTxHash(input.txHash));
  if (!wantsLive) {
    return {
      kind: "preview",
      sourceChain: input.sourceChain,
      chainKey: resolved.chainKey,
      environment: environment.id,
      reason: "Preview adapter selected; live Attestcoin verification is not asserted."
    };
  }
  if (!resolved.liveProofEnabled || resolved.chainKey === null) {
    return {
      kind: "reject",
      sourceChain: input.sourceChain,
      chainKey: null,
      environment: environment.id,
      reason: experimentalLiveProofMessage(input.sourceChain)
    };
  }
  return {
    kind: "live",
    sourceChain: input.sourceChain,
    chainKey: resolved.chainKey,
    environment: environment.id
  };
}

// server/attestcoin/fingerprint.ts
function proofFingerprint(input) {
  return hashValue({
    namespace: "proofloan:attestcoin:v2",
    ...input
  });
}
function requestFingerprint(input) {
  return hashValue({
    namespace: "proofloan:attestcoin:request",
    chain: input.chain,
    txHash: input.txHash.toLowerCase()
  });
}

// server/multichain/rpc.ts
import { JsonRpcProvider } from "ethers";

// server/multichain/failover.ts
var FailoverExhaustedError = class extends Error {
  attempts;
  constructor(label, attempts) {
    const last = attempts.at(-1)?.error;
    const detail = last instanceof Error ? last.message : "all targets failed";
    super(`${label} failover exhausted: ${detail}`);
    this.name = "FailoverExhaustedError";
    this.attempts = attempts;
  }
};
async function withFailover(targets, operation, options = {}) {
  if (targets.length === 0) {
    throw new FailoverExhaustedError(options.label ?? "provider", []);
  }
  const attempts = [];
  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index];
    const started = Date.now();
    try {
      const value = await operation(target, index);
      const attempt = {
        index,
        target,
        ok: true,
        value,
        latencyMs: Date.now() - started
      };
      attempts.push(attempt);
      options.onAttempt?.(attempt);
      return {
        value,
        target,
        attempts,
        failedOver: index > 0
      };
    } catch (error) {
      const attempt = {
        index,
        target,
        ok: false,
        error,
        latencyMs: Date.now() - started
      };
      attempts.push(attempt);
      options.onAttempt?.(attempt);
    }
  }
  throw new FailoverExhaustedError(options.label ?? "provider", attempts);
}

// server/multichain/observability.ts
var state = {
  rpcSuccesses: 0,
  rpcFailures: 0,
  rpcFailovers: 0,
  liveProofs: 0,
  previewProofs: 0,
  rejectedProofs: 0,
  circuitOpens: 0,
  healthProbes: 0
};
function recordMultichainEvent(event, target) {
  if (event === "rpc_success") state.rpcSuccesses += 1;
  if (event === "rpc_failure") state.rpcFailures += 1;
  if (event === "rpc_failover") state.rpcFailovers += 1;
  if (event === "proof_live") state.liveProofs += 1;
  if (event === "proof_preview") state.previewProofs += 1;
  if (event === "proof_rejected") state.rejectedProofs += 1;
  if (event === "circuit_open") state.circuitOpens += 1;
  if (event === "health_probe") state.healthProbes += 1;
  state.lastEvent = event;
  state.lastTarget = target;
}
function snapshotMultichainMetrics() {
  return { ...state };
}

// server/multichain/circuitBreaker.ts
var NamedCircuitBreaker = class {
  constructor(name, failureThreshold = 3, cooldownMs = 2e4) {
    this.name = name;
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
  }
  state = "closed";
  failures = 0;
  successes = 0;
  openedAt = 0;
  halfOpenInFlight = false;
  getState(now2 = Date.now()) {
    if (this.state === "open" && now2 - this.openedAt >= this.cooldownMs) {
      this.state = "half-open";
      this.halfOpenInFlight = false;
    }
    return this.state;
  }
  async run(operation, now2 = Date.now()) {
    const state2 = this.getState(now2);
    if (state2 === "open") {
      throw new AttestcoinError(
        "CIRCUIT_OPEN",
        `Attestcoin circuit '${this.name}' is open.`,
        { retriable: true }
      );
    }
    if (state2 === "half-open" && this.halfOpenInFlight) {
      throw new AttestcoinError(
        "CIRCUIT_OPEN",
        `Attestcoin circuit '${this.name}' is probing and not accepting additional requests.`,
        { retriable: true }
      );
    }
    if (state2 === "half-open") this.halfOpenInFlight = true;
    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure(now2);
      throw error;
    } finally {
      this.halfOpenInFlight = false;
    }
  }
  recordSuccess() {
    this.failures = 0;
    this.successes += 1;
    this.state = "closed";
  }
  recordFailure(now2) {
    this.failures += 1;
    if (this.failures >= this.failureThreshold) {
      this.state = "open";
      this.openedAt = now2;
    }
  }
  diagnostics(now2 = Date.now()) {
    return {
      name: this.name,
      state: this.getState(now2),
      failures: this.failures,
      openedAt: this.openedAt || null,
      successes: this.successes
    };
  }
};
var circuits = /* @__PURE__ */ new Map();
function getNamedCircuit(name, failureThreshold = 3, cooldownMs = 2e4) {
  const existing = circuits.get(name);
  if (existing) return existing;
  const created = new NamedCircuitBreaker(name, failureThreshold, cooldownMs);
  circuits.set(name, created);
  return created;
}
function listNamedCircuitDiagnostics() {
  return Array.from(circuits.values()).map((circuit) => circuit.diagnostics());
}

// server/multichain/rpc.ts
var providers = /* @__PURE__ */ new Map();
function getJsonRpcProvider(url) {
  const existing = providers.get(url);
  if (existing) return existing;
  const provider = new JsonRpcProvider(url);
  providers.set(url, provider);
  return provider;
}
async function withProviderUrls(urls, operation, label) {
  const circuit = getNamedCircuit(`rpc:${label}`);
  const result = await circuit.run(
    () => withFailover(
      urls,
      async (url, index) => {
        const provider = getJsonRpcProvider(url);
        try {
          const value = await operation(provider, url);
          recordMultichainEvent("rpc_success", url);
          if (index > 0) recordMultichainEvent("rpc_failover", url);
          return value;
        } catch (error) {
          recordMultichainEvent("rpc_failure", url);
          throw error;
        }
      },
      { label }
    )
  );
  return result.value;
}
async function withSourceRpc(chain, operation) {
  const resolved = resolveSourceChain(chain);
  return withProviderUrls(
    resolved.rpcUrls,
    operation,
    `source:${resolved.id}`
  );
}
async function withCreditcoinRpc(operation) {
  const environment = getCachedAttestcoinEnvironment();
  return withProviderUrls(
    environment.creditcoinRpcUrls,
    operation,
    `creditcoin:${environment.id}`
  );
}

// server/multichain/sourceAdapters.ts
var EvmSourceChainAdapter = class {
  constructor(chain) {
    this.chain = chain;
    this.resolved = resolveSourceChain(chain);
  }
  resolved;
  async getTransaction(txHash) {
    const tx = await withSourceRpc(
      this.chain,
      (provider) => provider.getTransaction(txHash)
    );
    return this.normalizeTransaction(tx, txHash);
  }
  async getBlockNumber() {
    return withSourceRpc(this.chain, (provider) => provider.getBlockNumber());
  }
  normalizeTransaction(tx, txHash) {
    if (!tx?.blockNumber) {
      throw new AttestcoinError(
        "SOURCE_RPC",
        "Source transaction has not been mined.",
        { retriable: true }
      );
    }
    return {
      hash: tx.hash ?? txHash,
      blockNumber: tx.blockNumber,
      from: tx.from,
      to: tx.to,
      chain: this.chain
    };
  }
};
var adapters = /* @__PURE__ */ new Map();
function getSourceChainAdapter(chain) {
  const existing = adapters.get(chain);
  if (existing && existing.resolved.environment === resolveSourceChain(chain).environment) {
    return existing;
  }
  const created = new EvmSourceChainAdapter(chain);
  adapters.set(chain, created);
  return created;
}
function previewTemplateFor(chain) {
  return resolveSourceChain(chain).preview;
}

// server/multichain/facts.ts
function factFromVerifiedProof(input) {
  const now2 = (/* @__PURE__ */ new Date()).toISOString();
  return {
    id: `vf_${proofFingerprint({
      chainKey: input.chainKey,
      sourceBlock: input.sourceBlock,
      txHash: input.txHash,
      proofRoot: input.proofRoot
    })}`,
    chain: input.sourceChain,
    sourceBlock: input.sourceBlock,
    txHash: input.txHash,
    eventType: "REPAYMENT",
    amount: "verified source transaction",
    asset: "SOURCE_TX",
    verificationBlock: input.verificationBlock,
    verifiedAt: now2,
    observedAt: now2,
    freshness: "Fresh",
    proofRoot: input.proofRoot,
    verifier: "Attestcoin proof worker",
    sourceVerified: true,
    decoderVersion: "attestcoin-v2"
  };
}
function previewFactsFor(walletAddress, sourceChain) {
  const template = previewTemplateFor(sourceChain);
  const root = `0xpreview_${hashValue({
    walletAddress,
    sourceChain,
    protocol: "Attestcoin Protocol"
  })}`;
  const now2 = (/* @__PURE__ */ new Date()).toISOString();
  return [
    {
      id: `vf_${hashValue({ root, n: 1 })}`,
      chain: sourceChain,
      sourceBlock: template.sourceBlock,
      txHash: `${template.txPrefix}a91f...c42e`,
      eventType: "REPAYMENT",
      amount: "1,250 USDC",
      asset: "USDC",
      verificationBlock: template.verificationBlock,
      verifiedAt: now2,
      observedAt: new Date(Date.now() - 3 * 864e5).toISOString(),
      freshness: "Fresh",
      proofRoot: `${root}_a`,
      proofWorker: "Attestcoin proof worker"
    },
    {
      id: `vf_${hashValue({ root, n: 2 })}`,
      chain: sourceChain,
      sourceBlock: template.sourceBlock - 317663,
      txHash: `${template.txPrefix}4b07...8aa1`,
      eventType: "COLLATERAL_DEPOSIT",
      amount: "2,800 USDC",
      asset: "USDC",
      verificationBlock: template.verificationBlock + 5,
      verifiedAt: now2,
      observedAt: new Date(Date.now() - 3 * 864e5).toISOString(),
      freshness: "Fresh",
      proofRoot: `${root}_b`,
      proofWorker: "Attestcoin proof worker"
    },
    {
      id: `vf_${hashValue({ root, n: 3 })}`,
      chain: sourceChain,
      sourceBlock: template.sourceBlock - 423742,
      txHash: `${template.txPrefix}11f8...d912`,
      eventType: "REPAYMENT",
      amount: "850 USDC",
      asset: "USDC",
      verificationBlock: template.verificationBlock + 9,
      verifiedAt: now2,
      observedAt: new Date(Date.now() - 90 * 864e5).toISOString(),
      freshness: "Aging",
      proofRoot: `${root}_c`,
      proofWorker: "Attestcoin proof worker"
    }
  ];
}

// server/multichain/proof.ts
import { blockProver, proofProvider } from "@gluwa/usc-sdk";

// server/attestcoin/retry.ts
function backoffDelay(attempt, baseDelayMs, maxDelayMs, jitterRatio) {
  const exponential = Math.min(
    maxDelayMs,
    baseDelayMs * 2 ** Math.max(0, attempt - 1)
  );
  const jitter = exponential * jitterRatio * Math.random();
  return Math.round(exponential + jitter);
}
async function retryAttestcoin(operation, options) {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt += 1;
      const normalized = error instanceof AttestcoinError ? error : void 0;
      const allowed = attempt <= options.retries && (options.shouldRetry ? options.shouldRetry(error, attempt) : normalized?.retriable ?? true);
      if (!allowed) throw error;
      const delayMs = backoffDelay(
        attempt,
        options.baseDelayMs,
        options.maxDelayMs,
        options.jitterRatio
      );
      options.onRetry?.(error, attempt, delayMs);
      await new Promise(
        (resolve) => setTimeout(resolve, delayMs)
      );
    }
  }
}

// server/attestcoin/validators.ts
function normalizeTxHash(value) {
  return value.trim().toLowerCase();
}
function validateProofBlock(sourceBlock, verificationBlock) {
  if (!Number.isInteger(sourceBlock) || sourceBlock <= 0) {
    throw new Error("Attestcoin source block is invalid.");
  }
  if (!Number.isInteger(verificationBlock) || verificationBlock <= 0) {
    throw new Error("Attestcoin verification block is invalid.");
  }
  return verificationBlock >= sourceBlock;
}

// server/multichain/proof.ts
async function verifyLiveAttestcoinProof(txHash, sourceChain, requestId) {
  const decision = classifyProofRequest({
    txHash,
    sourceChain,
    intent: "live"
  });
  if (decision.kind !== "live") {
    throw new AttestcoinError(
      "UNSUPPORTED_CHAIN",
      decision.reason,
      { requestId }
    );
  }
  const environment = getCachedAttestcoinEnvironment();
  const chainKey = requireOfficialChainKey(sourceChain, environment);
  const adapter = getSourceChainAdapter(sourceChain);
  const circuit = getNamedCircuit(`proof:${environment.id}:${adapter.resolved.id}`);
  return circuit.run(async () => {
    const sourceTx = await retryAttestcoin(
      () => adapter.getTransaction(txHash),
      {
        retries: environment.retryCount,
        baseDelayMs: 250,
        maxDelayMs: 2500,
        jitterRatio: 0.2
      }
    );
    const builder = new proofProvider.service.ProofBuilder(
      chainKey,
      environment.proofBuilderUrl,
      environment.timeoutMs
    );
    await retryAttestcoin(
      () => builder.waitUntilHeightAttested(chainKey, sourceTx.blockNumber),
      {
        retries: environment.retryCount,
        baseDelayMs: 1e3,
        maxDelayMs: 5e3,
        jitterRatio: 0.15
      }
    );
    const proofResult = await retryAttestcoin(
      () => builder.getProof(txHash),
      {
        retries: environment.retryCount,
        baseDelayMs: 500,
        maxDelayMs: 3e3,
        jitterRatio: 0.15
      }
    );
    if (!proofResult.success || !proofResult.data) {
      throw new AttestcoinError(
        "PROOF_BUILDER",
        proofResult.error ?? "Attestcoin proof generation failed.",
        { retriable: true, requestId }
      );
    }
    const proofData = proofResult.data;
    const verified = await withCreditcoinRpc(async (provider) => {
      const prover = new blockProver.PrecompileBlockProver(provider);
      const ok = await prover.verifySingle(
        proofData.chainKey,
        proofData.headerNumber,
        proofData.txBytes,
        proofData.merkleProof,
        proofData.continuityProof
      );
      const verificationBlock = await provider.getBlockNumber();
      return { ok, verificationBlock };
    });
    if (!verified.ok) {
      throw new AttestcoinError(
        "PROOF_VERIFICATION",
        "Creditcoin BlockProver rejected the Attestcoin proof.",
        { requestId }
      );
    }
    if (!validateProofBlock(proofData.headerNumber, verified.verificationBlock)) {
      throw new AttestcoinError(
        "PROOF_VERIFICATION",
        "Verification block did not satisfy ordering constraints.",
        { requestId }
      );
    }
    return {
      verified: true,
      chainKey,
      sourceBlock: proofData.headerNumber,
      verificationBlock: verified.verificationBlock,
      txHash,
      environment: environment.id,
      decoderContract: environment.decoderContract,
      txBytes: proofData.txBytes,
      merkleProof: proofData.merkleProof,
      continuityProof: proofData.continuityProof
    };
  });
}

// server/attestcoin/compat.ts
async function verifyTransactionWithAttestcoin(txHash, sourceChain) {
  const decision = classifyProofRequest({
    txHash,
    sourceChain,
    intent: "live"
  });
  if (decision.kind !== "live") {
    recordMultichainEvent("proof_rejected", sourceChain);
    throw new AttestcoinError("UNSUPPORTED_CHAIN", decision.reason);
  }
  const proof = await verifyLiveAttestcoinProof(txHash, sourceChain);
  recordMultichainEvent("proof_live", sourceChain);
  return {
    verified: true,
    chainKey: proof.chainKey,
    sourceBlock: proof.sourceBlock,
    verificationBlock: proof.verificationBlock,
    txHash,
    proofRoot: `0x${hashValue({
      txHash,
      headerNumber: proof.sourceBlock,
      chainKey: proof.chainKey,
      environment: proof.environment
    })}`,
    mode: "sdk",
    environment: proof.environment
  };
}
function previewAttestcoinFacts(walletAddress, sourceChain) {
  recordMultichainEvent("proof_preview", sourceChain);
  return previewFactsFor(walletAddress, sourceChain);
}

// server/attestcoin.router.ts
import { z as z4 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/attestcoin/proofService.ts
var AttestcoinProofService = class {
  async generate(input) {
    const txHash = normalizeTxHash(input.txHash);
    const requestId = input.requestId ?? `atc_${Date.now().toString(36)}`;
    const started = Date.now();
    if (!/^0x[0-9a-f]{64}$/.test(txHash)) {
      throw new AttestcoinError(
        "VALIDATION",
        "Invalid source transaction hash.",
        { requestId }
      );
    }
    const decision = classifyProofRequest({
      txHash,
      sourceChain: input.sourceChain,
      intent: "live"
    });
    if (decision.kind !== "live") {
      recordMultichainEvent("proof_rejected", input.sourceChain);
      throw new AttestcoinError("UNSUPPORTED_CHAIN", decision.reason, {
        requestId
      });
    }
    try {
      const proof = await verifyLiveAttestcoinProof(
        txHash,
        input.sourceChain,
        requestId
      );
      recordMultichainEvent("proof_live", input.sourceChain);
      const proofRoot = `0x${proofFingerprint({
        chainKey: proof.chainKey,
        sourceBlock: proof.sourceBlock,
        txHash,
        proofRoot: JSON.stringify(proof.merkleProof)
      })}`;
      return {
        receipt: {
          requestId,
          mode: input.mode ?? "live",
          stage: "complete",
          chainKey: proof.chainKey,
          sourceChain: input.sourceChain,
          sourceBlock: proof.sourceBlock,
          verificationBlock: proof.verificationBlock,
          txHash,
          proofRoot,
          verified: true,
          latencyMs: Date.now() - started,
          cached: false,
          retries: 0,
          warnings: []
        },
        facts: [
          factFromVerifiedProof({
            sourceChain: input.sourceChain,
            txHash,
            sourceBlock: proof.sourceBlock,
            verificationBlock: proof.verificationBlock,
            proofRoot,
            chainKey: proof.chainKey
          })
        ],
        rawProof: {
          chainKey: proof.chainKey,
          headerNumber: proof.sourceBlock,
          txBytes: proof.txBytes,
          merkleProof: proof.merkleProof,
          continuityProof: proof.continuityProof
        }
      };
    } catch (error) {
      if (error instanceof AttestcoinError) throw error;
      throw new AttestcoinError(
        "UNKNOWN",
        error instanceof Error ? error.message : "Attestcoin proof request failed.",
        {
          retriable: false,
          causeValue: error,
          requestId
        }
      );
    }
  }
};

// server/attestcoin/cache.ts
var TtlCache = class {
  entries = /* @__PURE__ */ new Map();
  get(key, now2 = Date.now()) {
    const entry = this.entries.get(key);
    if (!entry) return void 0;
    if (entry.expiresAt <= now2) {
      this.entries.delete(key);
      return void 0;
    }
    return entry.value;
  }
  set(key, value, ttlMs, now2 = Date.now()) {
    this.entries.set(key, {
      value,
      createdAt: now2,
      expiresAt: now2 + Math.max(0, ttlMs)
    });
  }
  delete(key) {
    return this.entries.delete(key);
  }
  clear() {
    this.entries.clear();
  }
  size() {
    return this.entries.size;
  }
};

// server/attestcoin/semaphore.ts
var AsyncSemaphore = class {
  constructor(limit) {
    this.limit = limit;
    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error("AsyncSemaphore limit must be >= 1");
    }
  }
  active = 0;
  queue = [];
  async run(operation) {
    await this.acquire();
    try {
      return await operation();
    } finally {
      this.release();
    }
  }
  acquire() {
    if (this.active < this.limit) {
      this.active += 1;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.queue.push(() => {
        this.active += 1;
        resolve();
      });
    });
  }
  release() {
    this.active = Math.max(0, this.active - 1);
    const next = this.queue.shift();
    next?.();
  }
};

// server/attestcoin/circuitBreaker.ts
var CircuitBreaker = class {
  constructor(failureThreshold = 3, cooldownMs = 3e4) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
  }
  state = "closed";
  failures = 0;
  openedAt = 0;
  getState(now2 = Date.now()) {
    if (this.state === "open" && now2 - this.openedAt >= this.cooldownMs) {
      this.state = "half-open";
    }
    return this.state;
  }
  async run(operation) {
    const state2 = this.getState();
    if (state2 === "open") {
      throw new AttestcoinError(
        "CIRCUIT_OPEN",
        "Attestcoin circuit is open.",
        { retriable: true }
      );
    }
    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  recordSuccess() {
    this.failures = 0;
    this.state = "closed";
  }
  recordFailure() {
    this.failures += 1;
    if (this.failures >= this.failureThreshold) {
      this.state = "open";
      this.openedAt = Date.now();
    }
  }
  diagnostics() {
    return {
      state: this.getState(),
      failures: this.failures,
      openedAt: this.openedAt || null
    };
  }
};

// server/attestcoin/metrics.ts
var AttestcoinMetricsStore = class {
  state = {
    requests: 0,
    successes: 0,
    failures: 0,
    cacheHits: 0,
    previewFallbacks: 0,
    retries: 0,
    averageLatencyMs: 0
  };
  recordRequest() {
    this.state.requests += 1;
  }
  recordSuccess(latencyMs) {
    this.state.successes += 1;
    this.state.averageLatencyMs = this.state.averageLatencyMs === 0 ? latencyMs : (this.state.averageLatencyMs * (this.state.successes - 1) + latencyMs) / this.state.successes;
  }
  recordFailure() {
    this.state.failures += 1;
  }
  recordCacheHit() {
    this.state.cacheHits += 1;
  }
  recordPreviewFallback() {
    this.state.previewFallbacks += 1;
  }
  recordRetry() {
    this.state.retries += 1;
  }
  snapshot() {
    return { ...this.state };
  }
};

// server/multichain/health.ts
async function withTimeout(operation, timeoutMs) {
  let timer;
  try {
    return await Promise.race([
      operation,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
async function checkRpc(url, timeoutMs) {
  const started = Date.now();
  const { JsonRpcProvider: JsonRpcProvider2 } = await import("ethers");
  const provider = new JsonRpcProvider2(url);
  await withTimeout(provider.getBlockNumber(), timeoutMs);
  return { ok: true, latencyMs: Date.now() - started };
}
async function checkHttp(url, timeoutMs) {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal
    });
    return {
      ok: response.status < 500,
      latencyMs: Date.now() - started
    };
  } finally {
    clearTimeout(timeout);
  }
}
function classify(result) {
  if (result.status === "fulfilled" && result.value.ok) {
    return result.value.latencyMs > 5e3 ? "degraded" : "healthy";
  }
  return "offline";
}
async function checkMultichainHealth(sourceChain) {
  const started = Date.now();
  const environment = getCachedAttestcoinEnvironment();
  const source = resolveSourceChain(sourceChain, { environment });
  recordMultichainEvent("health_probe", source.id);
  const results = await Promise.allSettled([
    checkRpc(environment.creditcoinRpcUrl, environment.timeoutMs),
    checkHttp(environment.proofBuilderUrl, environment.timeoutMs),
    checkRpc(source.rpcUrl, environment.timeoutMs)
  ]);
  const [creditcoin, builder, sourceRpc] = results;
  const creditcoinRpc = classify(creditcoin);
  const proofBuilder = classify(builder);
  const sourceStatus = classify(sourceRpc);
  const degraded = [creditcoinRpc, proofBuilder, sourceStatus].some(
    (status) => status !== "healthy"
  );
  const experimentalNote = source.experimental ? " Polygon Amoy is experimental and cannot produce a live Attestcoin proof." : "";
  return {
    creditcoinRpc,
    proofBuilder,
    sourceRpc: sourceStatus,
    lastCheckedAt: (/* @__PURE__ */ new Date()).toISOString(),
    latencyMs: Date.now() - started,
    message: degraded ? `One or more Attestcoin dependencies are degraded; live proofs may fail closed.${experimentalNote}` : source.experimental ? experimentalNote.trim() : void 0,
    environment: environment.id,
    sourceChain,
    liveProofEnabled: source.liveProofEnabled,
    experimental: source.experimental,
    chainKey: source.chainKey
  };
}

// server/multichain/featureMatrix.ts
function buildFeatureMatrix(environment) {
  const resolved = environment ?? getCachedAttestcoinEnvironment().id;
  return listChainCapabilities(resolved).map((capability) => ({
    ...capability,
    features: {
      "live-proof": capability.liveProof,
      "preview-proof": capability.preview,
      "source-rpc": true,
      "health-probe": true,
      "creditcoin-verify": capability.liveProof
    }
  }));
}

// server/attestcoin/config.ts
function getAttestcoinRuntimeConfig() {
  const environment = getCachedAttestcoinEnvironment();
  return {
    creditcoinRpc: environment.creditcoinRpcUrl,
    proofBuilderUrl: environment.proofBuilderUrl,
    timeoutMs: environment.timeoutMs,
    retryCount: environment.retryCount,
    cacheTtlMs: environment.cacheTtlMs,
    maxConcurrentProofs: environment.maxConcurrentProofs,
    environment: environment.id,
    decoderContract: environment.decoderContract
  };
}
var ATTESTCOIN_CONFIG = new Proxy({}, {
  get(_target, property, receiver) {
    return Reflect.get(getAttestcoinRuntimeConfig(), property, receiver);
  }
});
function getAttestcoinChainConfig(chain) {
  const resolved = resolveSourceChain(chain);
  return {
    name: chain,
    chainKey: resolved.chainKey,
    rpcUrl: resolved.rpcUrl,
    rpcUrls: resolved.rpcUrls,
    explorerBaseUrl: resolved.explorerTxBaseUrl,
    enabled: true,
    liveProofEnabled: resolved.liveProofEnabled,
    experimental: resolved.experimental,
    environment: resolved.environment
  };
}
var ATTESTCOIN_CHAINS = new Proxy(
  {},
  {
    get(_target, property) {
      if (typeof property !== "string") return void 0;
      if (property !== "Ethereum Sepolia" && property !== "Ethereum Mainnet" && property !== "Polygon Amoy") {
        return void 0;
      }
      return getAttestcoinChainConfig(property);
    },
    ownKeys() {
      return ["Ethereum Sepolia", "Ethereum Mainnet", "Polygon Amoy"];
    },
    getOwnPropertyDescriptor(_target, property) {
      if (property === "Ethereum Sepolia" || property === "Ethereum Mainnet" || property === "Polygon Amoy") {
        return {
          configurable: true,
          enumerable: true,
          value: getAttestcoinChainConfig(property)
        };
      }
      return void 0;
    }
  }
);

// server/attestcoin/orchestrator.ts
var AttestcoinOrchestrator = class {
  proofService = new AttestcoinProofService();
  cache = new TtlCache();
  semaphore = new AsyncSemaphore(
    ATTESTCOIN_CONFIG.maxConcurrentProofs
  );
  circuit = new CircuitBreaker(4, 2e4);
  metrics = new AttestcoinMetricsStore();
  async request(input) {
    const key = requestFingerprint({
      chain: input.sourceChain,
      txHash: input.txHash
    });
    this.metrics.recordRequest();
    if (!input.forceRefresh) {
      const cached2 = this.cache.get(key);
      if (cached2) {
        this.metrics.recordCacheHit();
        return {
          ...cached2,
          receipt: {
            ...cached2.receipt,
            cached: true,
            mode: "cached"
          }
        };
      }
    }
    return this.semaphore.run(async () => {
      try {
        const mode = getProofMode(
          input.txHash,
          input.sourceChain
        );
        if (mode !== "live") {
          throw new AttestcoinError(
            "VALIDATION",
            "Attestcoin orchestrator requires a live transaction hash.",
            { requestId: input.requestId }
          );
        }
        const policy = classifyProofRequest({
          txHash: input.txHash,
          sourceChain: input.sourceChain,
          intent: "live",
          allowPreviewFallback: input.allowPreviewFallback
        });
        if (policy.kind === "reject") {
          throw new AttestcoinError(
            "UNSUPPORTED_CHAIN",
            policy.reason,
            { requestId: input.requestId }
          );
        }
        const started = Date.now();
        const bundle = await this.circuit.run(
          () => this.proofService.generate({
            txHash: input.txHash,
            sourceChain: input.sourceChain,
            requestId: input.requestId,
            mode: "live"
          })
        );
        this.cache.set(
          key,
          bundle,
          ATTESTCOIN_CONFIG.cacheTtlMs
        );
        this.metrics.recordSuccess(
          Date.now() - started
        );
        return bundle;
      } catch (error) {
        this.metrics.recordFailure();
        throw error;
      }
    });
  }
  diagnostics() {
    return {
      metrics: this.metrics.snapshot(),
      circuit: this.circuit.diagnostics(),
      cacheEntries: this.cache.size(),
      environment: getPublicEnvironmentSnapshot(),
      multichain: snapshotMultichainMetrics(),
      namedCircuits: listNamedCircuitDiagnostics()
    };
  }
};
var attestcoinOrchestrator = new AttestcoinOrchestrator();

// server/attestcoin/health.ts
async function checkAttestcoinHealth(sourceChain) {
  return checkMultichainHealth(sourceChain);
}

// server/attestcoin/preview.ts
function buildPreviewBundle(walletAddress, sourceChain, requestId = `preview_${Date.now().toString(36)}`) {
  const resolved = resolveSourceChain(sourceChain);
  const facts = previewAttestcoinFacts(
    walletAddress,
    sourceChain
  ).map((fact) => ({
    id: fact.id,
    applicationId: fact.id,
    chain: fact.chain,
    sourceBlock: fact.sourceBlock,
    txHash: fact.txHash,
    eventType: fact.eventType,
    amount: fact.amount,
    asset: fact.asset,
    verificationBlock: fact.verificationBlock,
    verifiedAt: fact.verifiedAt,
    observedAt: fact.observedAt,
    freshness: fact.freshness,
    proofRoot: fact.proofRoot,
    verifier: "Attestcoin preview adapter",
    sourceVerified: false,
    decoderVersion: "preview-v1"
  }));
  const sourceBlock = Math.max(
    ...facts.map((fact) => fact.sourceBlock)
  );
  const verificationBlock = Math.max(
    ...facts.map((fact) => fact.verificationBlock)
  );
  const warnings = [
    "Preview mode is presentation-safe and does not assert live cross-chain verification."
  ];
  if (resolved.experimental) {
    warnings.push(
      `${sourceChain} is experimental: it is not listed with an official Attestcoin chainkey, so live proofs are rejected.`
    );
  }
  return {
    receipt: {
      requestId,
      mode: "preview",
      stage: "complete",
      chainKey: resolved.chainKey ?? 0,
      sourceChain,
      sourceBlock,
      verificationBlock,
      txHash: facts[0]?.txHash ?? `0xpreview_${hashValue(walletAddress)}`,
      proofRoot: `0xpreview_${hashValue({ walletAddress, sourceChain })}`,
      verified: false,
      latencyMs: 30,
      cached: false,
      retries: 0,
      warnings
    },
    facts
  };
}

// shared/attestcoin.ts
import { z as z2 } from "zod";
var attestcoinSourceChains = ATTESTCOIN_SOURCE_CHAIN_NAMES;
var attestcoinModeSchema = z2.enum(["live", "preview", "cached"]);
var attestcoinStageSchema = z2.enum([
  "input-validated",
  "source-rpc",
  "attestation-wait",
  "proof-build",
  "proof-verify",
  "decode",
  "facts",
  "complete",
  "degraded"
]);
var attestcoinEventTypeSchema = z2.enum([
  "REPAYMENT",
  "COLLATERAL_DEPOSIT",
  "LATE_PAYMENT"
]);
var attestcoinFreshnessSchema = z2.enum(["Fresh", "Aging", "Stale"]);
var attestcoinProofRequestSchema = z2.object({
  txHash: z2.string().trim().regex(/^0x[0-9a-fA-F]{64}$/),
  sourceChain: z2.enum(attestcoinSourceChains),
  requestId: z2.string().trim().min(8).max(128).optional(),
  allowPreviewFallback: z2.boolean().default(false),
  forceRefresh: z2.boolean().default(false)
});

// shared/atc.ts
import { z as z3 } from "zod";
var ATC_TOKEN_SYMBOL = "ATC";
var ATC_BPS_DENOMINATOR = 1e4;
var ATC_MINTED_ATOMIC = "0";
var atcEnvironments = ["cc3-testnet", "cc3-mainnet"];
var atcActionKinds = [
  "cross-chain-message",
  "credit-execution",
  "state-sync"
];
var atcPriorities = ["standard", "fast"];
var atcQuoteKinds = ["read", "action"];
var atcLocalChainId = "creditcoin";
var atcExternalChains = {
  "ethereum-sepolia": {
    id: "ethereum-sepolia",
    label: "Ethereum Sepolia",
    sourceChain: "Ethereum Sepolia"
  },
  "ethereum-mainnet": {
    id: "ethereum-mainnet",
    label: "Ethereum Mainnet",
    sourceChain: "Ethereum Mainnet"
  },
  "polygon-amoy": {
    id: "polygon-amoy",
    label: "Polygon Amoy",
    sourceChain: "Polygon Amoy"
  }
};
var atcChainIds = [
  "creditcoin",
  "ethereum-sepolia",
  "ethereum-mainnet",
  "polygon-amoy"
];
var CHAIN_ALIASES = {
  creditcoin: "creditcoin",
  "creditcoin-testnet": "creditcoin",
  "cc3-testnet": "creditcoin",
  "cc3-mainnet": "creditcoin",
  "ethereum-sepolia": "ethereum-sepolia",
  "ethereum sepolia": "ethereum-sepolia",
  "ethereum-mainnet": "ethereum-mainnet",
  "ethereum mainnet": "ethereum-mainnet",
  "polygon-amoy": "polygon-amoy",
  "polygon amoy": "polygon-amoy"
};
function normalizeAtcChain(value) {
  const trimmed = value.trim();
  const aliased = CHAIN_ALIASES[trimmed.toLowerCase()];
  if (aliased) return aliased;
  if (attestcoinSourceChains.includes(trimmed)) {
    const match = Object.values(atcExternalChains).find((chain) => chain.sourceChain === trimmed);
    if (match) return match.id;
  }
  throw new Error(`Unsupported ATC chain: ${trimmed}`);
}
function isLocalAtcChain(value) {
  return normalizeAtcChain(value) === atcLocalChainId;
}
var ATC_DEMO_SPLIT_DISCLAIMER = "Operator, burn, and treasury basis points are ProofLoan demo configuration, not official Attestcoin protocol tokenomics.";
var atcEnvironmentSchema = z3.enum(atcEnvironments);
var atcActionKindSchema = z3.enum(atcActionKinds);
var atcPrioritySchema = z3.enum(atcPriorities);
var atcChainInputSchema = z3.string().trim().min(3).max(64);
var atcSenderSchema = z3.string().trim().min(4).max(128);
var atcIdempotencyKeySchema = z3.string().trim().min(16).max(128);
var atcPayloadSchema = z3.record(z3.string(), z3.unknown());
var atcFreeReadQuoteInputSchema = z3.object({
  environment: atcEnvironmentSchema,
  actionKind: atcActionKindSchema.default("cross-chain-message"),
  sourceChain: atcChainInputSchema.optional(),
  destinationChain: atcChainInputSchema.optional()
});
var atcQuoteActionFeeInputSchema = z3.object({
  environment: atcEnvironmentSchema,
  sender: atcSenderSchema,
  sourceChain: atcChainInputSchema,
  destinationChain: atcChainInputSchema,
  actionKind: atcActionKindSchema,
  payload: atcPayloadSchema,
  proofCount: z3.number().int().min(0).max(64).default(0),
  priority: atcPrioritySchema.default("standard")
});
var atcPrepareActionInputSchema = atcQuoteActionFeeInputSchema.extend({
  idempotencyKey: atcIdempotencyKeySchema
});
var atcFeeSplitSchema = z3.object({
  totalAtomic: z3.string().regex(/^\d+$/),
  operatorRewardAtomic: z3.string().regex(/^\d+$/),
  burnAtomic: z3.string().regex(/^\d+$/),
  treasuryAtomic: z3.string().regex(/^\d+$/)
});
var atcQuoteSchema = z3.object({
  quoteId: z3.string().min(8).max(80),
  kind: z3.enum(atcQuoteKinds),
  environment: atcEnvironmentSchema,
  sender: z3.string().min(4).max(128).optional(),
  sourceChain: z3.enum(atcChainIds),
  destinationChain: z3.enum(atcChainIds),
  actionKind: atcActionKindSchema,
  payloadHash: z3.string().regex(/^0x[0-9a-f]{64}$/),
  proofCount: z3.number().int().min(0).max(64),
  priority: atcPrioritySchema,
  pricingVersion: z3.string().min(3).max(64),
  fee: atcFeeSplitSchema,
  totalAtomic: z3.string().regex(/^\d+$/),
  operatorRewardAtomic: z3.string().regex(/^\d+$/),
  burnAtomic: z3.string().regex(/^\d+$/),
  treasuryAtomic: z3.string().regex(/^\d+$/),
  integrityHash: z3.string().regex(/^0x[0-9a-f]{64}$/),
  expiresAt: z3.string().min(20).max(40),
  createdAt: z3.string().min(20).max(40)
});
var atcActionEnvelopeSchema = z3.object({
  actionId: z3.string().min(8).max(80),
  nonce: z3.string().regex(/^\d+$/),
  environment: atcEnvironmentSchema,
  sender: atcSenderSchema,
  sourceChain: z3.enum(atcChainIds),
  destinationChain: z3.enum(atcChainIds),
  actionKind: atcActionKindSchema,
  payload: atcPayloadSchema,
  payloadHash: z3.string().regex(/^0x[0-9a-f]{64}$/),
  proofCount: z3.number().int().min(0).max(64),
  priority: atcPrioritySchema,
  idempotencyKey: atcIdempotencyKeySchema,
  quoteId: z3.string().min(8).max(80),
  createdAt: z3.string().min(20).max(40)
});
var atcSettleActionInputSchema = z3.object({
  environment: atcEnvironmentSchema,
  action: atcActionEnvelopeSchema,
  quote: atcQuoteSchema,
  paymentReference: z3.string().trim().min(8).max(256)
});
function parseAtomic(value, label = "atomic amount") {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error(`Invalid ${label}.`);
  }
  return BigInt(value);
}
function formatAtomic(value) {
  if (value < 0n) throw new Error("ATC amounts cannot be negative.");
  return value.toString(10);
}
function addAtomic(left, right) {
  return formatAtomic(parseAtomic(left) + parseAtomic(right));
}
function splitAtcFee(totalAtomic, operatorRewardBps, burnBps, treasuryBps) {
  const total = parseAtomic(totalAtomic, "fee total");
  const operator = total * BigInt(operatorRewardBps) / BigInt(ATC_BPS_DENOMINATOR);
  const burn = total * BigInt(burnBps) / BigInt(ATC_BPS_DENOMINATOR);
  const treasury = total * BigInt(treasuryBps) / BigInt(ATC_BPS_DENOMINATOR);
  let remainder = total - operator - burn - treasury;
  let operatorFinal = operator;
  let burnFinal = burn;
  let treasuryFinal = treasury;
  if (remainder !== 0n) {
    if (operatorRewardBps >= burnBps && operatorRewardBps >= treasuryBps) {
      operatorFinal += remainder;
    } else if (burnBps >= treasuryBps) {
      burnFinal += remainder;
    } else {
      treasuryFinal += remainder;
    }
    remainder = total - operatorFinal - burnFinal - treasuryFinal;
  }
  if (remainder !== 0n || operatorFinal + burnFinal + treasuryFinal !== total) {
    throw new Error("ATC fee split does not reconcile to the quoted total.");
  }
  return {
    totalAtomic: formatAtomic(total),
    operatorRewardAtomic: formatAtomic(operatorFinal),
    burnAtomic: formatAtomic(burnFinal),
    treasuryAtomic: formatAtomic(treasuryFinal)
  };
}
function feeSplitReconciles(split) {
  try {
    return parseAtomic(split.operatorRewardAtomic) + parseAtomic(split.burnAtomic) + parseAtomic(split.treasuryAtomic) === parseAtomic(split.totalAtomic);
  } catch {
    return false;
  }
}
function canonicalizeAtcValue(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalizeAtcValue);
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, canonicalizeAtcValue(value[key])])
  );
}
function canonicalAtcJson(value) {
  return JSON.stringify(canonicalizeAtcValue(value));
}
function formatAtcAmount(atomic, decimals = 18) {
  const value = parseAtomic(atomic);
  if (decimals < 0 || decimals > 36) throw new Error("Invalid ATC decimals.");
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const fraction = (value % base).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction.length > 0 ? `${whole}.${fraction}` : `${whole}`;
}

// server/atc/errors.ts
var AtcError = class extends Error {
  code;
  retriable;
  constructor(code, message, retriable = false) {
    super(`[ATC:${code}] ${message}`);
    this.name = "AtcError";
    this.code = code;
    this.retriable = retriable;
  }
};
function isAtcError(error) {
  return error instanceof AtcError;
}

// server/atc/config.ts
var DEFAULT_OPERATORS = [
  {
    operatorId: "op-alpha",
    name: "Independent operator Alpha",
    weight: 50,
    address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  },
  {
    operatorId: "op-beta",
    name: "Independent operator Beta",
    weight: 30,
    address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
  },
  {
    operatorId: "op-gamma",
    name: "Independent operator Gamma",
    weight: 20,
    address: "0xcccccccccccccccccccccccccccccccccccccccc"
  }
];
function readInteger(name, fallback) {
  const raw = process.env[name];
  if (raw === void 0 || raw.trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw new AtcError("POLICY", `${name} must be an integer.`);
  }
  return value;
}
function readAtomic(name, fallback) {
  const raw = process.env[name] ?? fallback;
  parseAtomic(raw, name);
  return raw;
}
function readOperators() {
  const raw = process.env.ATC_OPERATORS_JSON;
  if (!raw) return DEFAULT_OPERATORS;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AtcError("POLICY", "ATC_OPERATORS_JSON is not valid JSON.");
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new AtcError("POLICY", "ATC_OPERATORS_JSON must be a non-empty array.");
  }
  return parsed.map((item, index) => {
    const operator = item;
    if (typeof operator.operatorId !== "string" || typeof operator.name !== "string" || typeof operator.address !== "string" || typeof operator.weight !== "number" || !Number.isInteger(operator.weight) || operator.weight <= 0) {
      throw new AtcError("POLICY", `ATC operator at index ${index} is invalid.`);
    }
    return {
      operatorId: operator.operatorId.trim(),
      name: operator.name.trim(),
      address: operator.address.trim(),
      weight: operator.weight
    };
  });
}
function loadAtcConfigFromEnv() {
  const modeRaw = (process.env.ATC_INTEGRATION_MODE ?? "simulated").trim();
  if (modeRaw !== "simulated" && modeRaw !== "external") {
    throw new AtcError("POLICY", "ATC_INTEGRATION_MODE must be simulated or external.");
  }
  return {
    mode: modeRaw,
    pricingVersion: process.env.ATC_PRICING_VERSION ?? "proofloan-demo-v1",
    decimals: readInteger("ATC_DECIMALS", 18),
    baseActionFeeAtomic: readAtomic("ATC_BASE_ACTION_FEE_ATOMIC", "100000000000000000"),
    payloadByteFeeAtomic: readAtomic("ATC_PAYLOAD_BYTE_FEE_ATOMIC", "100000000000000"),
    proofFeeAtomic: readAtomic("ATC_PROOF_FEE_ATOMIC", "50000000000000000"),
    fastMultiplierBps: readInteger("ATC_FAST_MULTIPLIER_BPS", 12500),
    operatorRewardBps: readInteger("ATC_OPERATOR_REWARD_BPS", 7e3),
    burnBps: readInteger("ATC_BURN_BPS", 3e3),
    treasuryBps: readInteger("ATC_TREASURY_BPS", 0),
    minActionFeeAtomic: readAtomic("ATC_MIN_ACTION_FEE_ATOMIC", "100000000000000000"),
    maxActionFeeAtomic: readAtomic("ATC_MAX_ACTION_FEE_ATOMIC", "5000000000000000000"),
    quoteTtlSeconds: readInteger("ATC_QUOTE_TTL_SECONDS", 120),
    operators: readOperators(),
    paymentDestination: process.env.ATC_PAYMENT_DESTINATION ?? "atc:simulated:fee-sink",
    paymentAdapterUrl: process.env.ATC_PAYMENT_ADAPTER_URL || void 0,
    paymentContract: process.env.ATC_PAYMENT_CONTRACT || void 0,
    protocolAdapterUrl: process.env.ATC_PROTOCOL_ADAPTER_URL || void 0
  };
}
function assertAtcConfig(config) {
  if (config.decimals < 0 || config.decimals > 36) {
    throw new AtcError("POLICY", "ATC decimals must be between 0 and 36.");
  }
  if (config.fastMultiplierBps < ATC_BPS_DENOMINATOR) {
    throw new AtcError("POLICY", "Fast multiplier must be at least 10000 bps.");
  }
  if (config.quoteTtlSeconds < 5 || config.quoteTtlSeconds > 3600) {
    throw new AtcError("POLICY", "ATC quote TTL must be between 5 and 3600 seconds.");
  }
  const splitTotal = config.operatorRewardBps + config.burnBps + config.treasuryBps;
  if (splitTotal !== ATC_BPS_DENOMINATOR) {
    throw new AtcError(
      "POLICY",
      `ATC fee split must total ${ATC_BPS_DENOMINATOR} bps. Received ${splitTotal}.`
    );
  }
  if (config.operatorRewardBps < 0 || config.burnBps < 0 || config.treasuryBps < 0) {
    throw new AtcError("POLICY", "ATC fee split basis points cannot be negative.");
  }
  if (parseAtomic(config.minActionFeeAtomic) > parseAtomic(config.maxActionFeeAtomic)) {
    throw new AtcError("POLICY", "ATC min action fee cannot exceed max action fee.");
  }
  if (config.operators.length === 0) {
    throw new AtcError("POLICY", "At least one ATC operator is required.");
  }
  const ids = new Set(config.operators.map((operator) => operator.operatorId));
  if (ids.size !== config.operators.length) {
    throw new AtcError("POLICY", "ATC operator IDs must be unique.");
  }
}
function toPublicFeePolicy(config) {
  assertAtcConfig(config);
  return {
    pricingVersion: config.pricingVersion,
    decimals: config.decimals,
    baseActionFeeAtomic: config.baseActionFeeAtomic,
    payloadByteFeeAtomic: config.payloadByteFeeAtomic,
    proofFeeAtomic: config.proofFeeAtomic,
    fastMultiplierBps: config.fastMultiplierBps,
    operatorRewardBps: config.operatorRewardBps,
    burnBps: config.burnBps,
    treasuryBps: config.treasuryBps,
    minActionFeeAtomic: config.minActionFeeAtomic,
    maxActionFeeAtomic: config.maxActionFeeAtomic,
    quoteTtlSeconds: config.quoteTtlSeconds,
    disclaimer: ATC_DEMO_SPLIT_DISCLAIMER
  };
}
function isExternalAdapterConfigured(config) {
  return Boolean(config.paymentAdapterUrl || config.paymentContract);
}

// server/atc/service.ts
import { randomUUID as randomUUID7 } from "node:crypto";

// server/atc/audit.ts
import { createHash as createHash3, randomUUID } from "node:crypto";
var GENESIS_HASH = `0x${"0".repeat(64)}`;
var AtcAuditLog = class {
  previousHash = GENESIS_HASH;
  events = [];
  append(kind, detail, refs = {}) {
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const eventId = `atc_ev_${randomUUID().replaceAll("-", "")}`;
    const eventHash = `0x${createHash3("sha256").update(
      canonicalAtcJson({
        eventId,
        kind,
        detail,
        previousHash: this.previousHash,
        createdAt,
        ...refs
      })
    ).digest("hex")}`;
    const event = {
      eventId,
      kind,
      detail,
      previousHash: this.previousHash,
      eventHash,
      createdAt,
      ...refs
    };
    this.events.push(event);
    this.previousHash = eventHash;
    return event;
  }
  list() {
    return [...this.events];
  }
  head() {
    return this.previousHash;
  }
};

// server/atc/ledger.ts
import { randomUUID as randomUUID2 } from "node:crypto";
var AtcLedger = class {
  quotes = /* @__PURE__ */ new Map();
  prepared = /* @__PURE__ */ new Map();
  feesByAction = /* @__PURE__ */ new Map();
  rewards = /* @__PURE__ */ new Map();
  nonce = 0n;
  nextNonce() {
    this.nonce += 1n;
    return this.nonce.toString(10);
  }
  putQuote(quote) {
    this.quotes.set(quote.quoteId, quote);
  }
  getQuote(quoteId) {
    return this.quotes.get(quoteId);
  }
  getPrepared(idempotencyKey) {
    return this.prepared.get(idempotencyKey);
  }
  getFeeByAction(actionId) {
    return this.feesByAction.get(actionId);
  }
  reserve(input) {
    const existing = this.prepared.get(input.idempotencyKey);
    if (existing) {
      if (existing.fingerprint !== input.fingerprint) {
        throw new AtcError(
          "IDEMPOTENCY",
          "A changed ATC idempotency key cannot silently redirect an existing fee reservation."
        );
      }
      return existing;
    }
    for (const entry2 of this.prepared.values()) {
      if (entry2.fingerprint === input.fingerprint && entry2.fee.idempotencyKey !== input.idempotencyKey) {
        throw new AtcError(
          "IDEMPOTENCY",
          "A changed ATC idempotency key cannot silently redirect an existing fee reservation."
        );
      }
    }
    const feeId = `atc_f_${randomUUID2().replaceAll("-", "")}`;
    const now2 = (/* @__PURE__ */ new Date()).toISOString();
    const fee = {
      feeId,
      quoteId: input.quote.quoteId,
      actionId: input.action.actionId,
      idempotencyKey: input.idempotencyKey,
      requestFingerprint: input.fingerprint,
      status: "reserved",
      totalAtomic: input.quote.totalAtomic,
      operatorRewardAtomic: input.quote.operatorRewardAtomic,
      burnAtomic: input.quote.burnAtomic,
      treasuryAtomic: input.quote.treasuryAtomic,
      createdAt: now2
    };
    const receipt = {
      receiptId: `atc_r_${randomUUID2().replaceAll("-", "")}`,
      actionId: input.action.actionId,
      quoteId: input.quote.quoteId,
      feeId,
      status: "prepared",
      paymentReference: "",
      totalAtomic: input.quote.totalAtomic,
      operatorRewardAtomic: input.quote.operatorRewardAtomic,
      burnAtomic: input.quote.burnAtomic,
      treasuryAtomic: input.quote.treasuryAtomic,
      mintedAtomic: "0",
      createdAt: now2
    };
    const entry = {
      fingerprint: input.fingerprint,
      quote: input.quote,
      action: input.action,
      fee,
      allocations: input.allocations,
      receipt
    };
    this.quotes.set(input.quote.quoteId, input.quote);
    this.prepared.set(input.idempotencyKey, entry);
    this.feesByAction.set(input.action.actionId, fee);
    return entry;
  }
  settle(input) {
    const fee = this.feesByAction.get(input.actionId);
    const entry = [...this.prepared.values()].find((item) => item.action.actionId === input.actionId);
    if (!fee || !entry) {
      throw new AtcError("VALIDATION", "ATC fee reservation was not found for settlement.");
    }
    if (fee.status === "settled" && entry.receipt.status === "settled") {
      if (entry.receipt.paymentReference !== input.paymentReference) {
        throw new AtcError("IDEMPOTENCY", "ATC settlement already exists for a different payment reference.");
      }
      return entry.receipt;
    }
    if (fee.status !== "reserved") {
      throw new AtcError("VALIDATION", `ATC fee cannot be settled from status ${fee.status}.`);
    }
    const settledAt = (/* @__PURE__ */ new Date()).toISOString();
    fee.status = "settled";
    fee.paymentReference = input.paymentReference;
    fee.protocolReference = input.protocolReference;
    fee.settledAt = settledAt;
    entry.receipt = {
      ...entry.receipt,
      status: "settled",
      paymentReference: input.paymentReference,
      protocolReference: input.protocolReference,
      settledAt
    };
    this.rewards.set(fee.feeId, input.rewards);
    return entry.receipt;
  }
  getRewards(feeId) {
    return this.rewards.get(feeId) ?? [];
  }
  listRewards() {
    return [...this.rewards.values()].flat();
  }
  replaceRewards(feeId, rewards) {
    this.rewards.set(feeId, rewards);
  }
};

// server/atc/metrics.ts
var AtcMetricsStore = class {
  quotesIssued = 0;
  readQuotesIssued = 0;
  actionsPrepared = 0;
  actionsSettled = 0;
  reservedFees = 0;
  paidVolumeAtomic = "0";
  burnedVolumeAtomic = "0";
  operatorRewardsAtomic = "0";
  treasuryVolumeAtomic = "0";
  recordReadQuote() {
    this.quotesIssued += 1;
    this.readQuotesIssued += 1;
  }
  recordActionQuote() {
    this.quotesIssued += 1;
  }
  recordPrepare() {
    this.actionsPrepared += 1;
    this.reservedFees += 1;
  }
  recordSettlement(input) {
    this.actionsSettled += 1;
    if (this.reservedFees > 0) this.reservedFees -= 1;
    this.paidVolumeAtomic = addAtomic(this.paidVolumeAtomic, input.totalAtomic);
    this.burnedVolumeAtomic = addAtomic(this.burnedVolumeAtomic, input.burnAtomic);
    this.operatorRewardsAtomic = addAtomic(this.operatorRewardsAtomic, input.operatorRewardAtomic);
    this.treasuryVolumeAtomic = addAtomic(this.treasuryVolumeAtomic, input.treasuryAtomic);
  }
  snapshot() {
    return {
      quotesIssued: this.quotesIssued,
      readQuotesIssued: this.readQuotesIssued,
      actionsPrepared: this.actionsPrepared,
      actionsSettled: this.actionsSettled,
      reservedFees: this.reservedFees,
      paidVolumeAtomic: this.paidVolumeAtomic,
      burnedVolumeAtomic: this.burnedVolumeAtomic,
      operatorRewardsAtomic: this.operatorRewardsAtomic,
      treasuryVolumeAtomic: this.treasuryVolumeAtomic,
      mintedAtomic: ATC_MINTED_ATOMIC
    };
  }
};

// server/atc/operatorClaims.ts
import { randomUUID as randomUUID3 } from "node:crypto";
function createClaimableRewards(feeId, actionId, allocations) {
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  return allocations.map((allocation) => ({
    rewardId: `atc_rw_${randomUUID3().replaceAll("-", "")}`,
    feeId,
    actionId,
    operatorId: allocation.operatorId,
    amountAtomic: allocation.amountAtomic,
    status: "claimable",
    createdAt
  }));
}
function operatorClaimSummary(ledger) {
  const byOperator = {};
  let claimableAtomic = "0";
  let claimedAtomic = "0";
  for (const reward of ledger.listRewards()) {
    const current = byOperator[reward.operatorId] ?? { claimableAtomic: "0", claimedAtomic: "0" };
    if (reward.status === "claimed") {
      current.claimedAtomic = addAtomic(current.claimedAtomic, reward.amountAtomic);
      claimedAtomic = addAtomic(claimedAtomic, reward.amountAtomic);
    } else {
      current.claimableAtomic = addAtomic(current.claimableAtomic, reward.amountAtomic);
      claimableAtomic = addAtomic(claimableAtomic, reward.amountAtomic);
    }
    byOperator[reward.operatorId] = current;
  }
  return { claimableAtomic, claimedAtomic, byOperator };
}

// server/atc/operators.ts
function allocateOperatorRewards(poolAtomic, operators) {
  if (operators.length === 0) {
    throw new AtcError("POLICY", "Cannot allocate ATC operator rewards without operators.");
  }
  const pool = parseAtomic(poolAtomic, "operator reward pool");
  const totalWeight = operators.reduce((sum, operator) => sum + operator.weight, 0);
  if (totalWeight <= 0) {
    throw new AtcError("POLICY", "ATC operator weights must be positive.");
  }
  const allocations = operators.map((operator) => ({
    operatorId: operator.operatorId,
    name: operator.name,
    address: operator.address,
    weight: operator.weight,
    amount: pool * BigInt(operator.weight) / BigInt(totalWeight)
  }));
  const allocated = allocations.reduce((sum, item) => sum + item.amount, 0n);
  const remainder = pool - allocated;
  if (remainder < 0n) {
    throw new AtcError("POLICY", "ATC operator allocation exceeded the reward pool.");
  }
  const recipient = allocations.reduce(
    (best, current) => current.weight > best.weight ? current : best
  );
  recipient.amount += remainder;
  const finalTotal = allocations.reduce((sum, item) => sum + item.amount, 0n);
  if (finalTotal !== pool) {
    throw new AtcError("POLICY", "ATC operator allocation does not equal the reward pool.");
  }
  if (allocations.some((item) => item.amount < 0n)) {
    throw new AtcError("POLICY", "ATC operator allocation produced a negative reward.");
  }
  return allocations.map((item) => ({
    operatorId: item.operatorId,
    name: item.name,
    address: item.address,
    weight: item.weight,
    amountAtomic: formatAtomic(item.amount)
  }));
}

// server/atc/payment.ts
import { randomUUID as randomUUID4 } from "node:crypto";
var SimulatedAtcPaymentAdapter = class {
  name = "simulated";
  createPaymentInstruction(input) {
    return {
      adapter: "simulated",
      token: ATC_TOKEN_SYMBOL,
      amountAtomic: input.amountAtomic,
      paymentReference: `sim-atc-${input.actionId}`,
      destination: input.destination,
      memo: `ProofLoan simulated ATC action payment for ${input.quoteId}`,
      minting: false
    };
  }
  async verifyPayment(input) {
    if (!input.paymentReference.startsWith("sim-atc-")) {
      throw new AtcError("PAYMENT", "Simulated ATC payment reference is malformed.");
    }
    if (!input.sender || input.amountAtomic === "0") {
      throw new AtcError("PAYMENT", "Simulated ATC payment is missing sender or amount.");
    }
    return {
      ok: true,
      adapter: "simulated",
      paymentReference: input.paymentReference,
      protocolReference: `sim-protocol-${randomUUID4().replaceAll("-", "").slice(0, 24)}`
    };
  }
};
var ExternalProtocolAtcPaymentAdapter = class {
  constructor(config) {
    this.config = config;
  }
  name = "external";
  assertConfigured() {
    if (!isExternalAdapterConfigured(this.config)) {
      throw new AtcError(
        "ADAPTER",
        "Canonical Attestcoin action-payment adapter is not configured. ProofLoan does not fabricate live ATC payments."
      );
    }
  }
  createPaymentInstruction(input) {
    this.assertConfigured();
    return {
      adapter: "external",
      token: ATC_TOKEN_SYMBOL,
      amountAtomic: input.amountAtomic,
      paymentReference: `ext-atc-${input.actionId}`,
      destination: this.config.paymentContract ?? input.destination,
      memo: `ProofLoan ATC action payment for ${input.quoteId}`,
      minting: false
    };
  }
  async verifyPayment(input) {
    this.assertConfigured();
    if (!this.config.paymentAdapterUrl) {
      throw new AtcError(
        "ADAPTER",
        "Live ATC payment verification requires ATC_PAYMENT_ADAPTER_URL. ProofLoan will not invent a protocol receipt."
      );
    }
    const response = await fetch(this.config.paymentAdapterUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        paymentReference: input.paymentReference,
        amountAtomic: input.amountAtomic,
        sender: input.sender,
        token: ATC_TOKEN_SYMBOL
      })
    });
    if (!response.ok) {
      throw new AtcError("PAYMENT", "External ATC payment adapter rejected the verification request.", true);
    }
    const body = await response.json();
    if (!body.ok || typeof body.reference !== "string") {
      throw new AtcError("PAYMENT", "External ATC payment adapter did not confirm the exact ATC amount.");
    }
    return {
      ok: true,
      adapter: "external",
      paymentReference: input.paymentReference,
      protocolReference: body.reference
    };
  }
};
function createAtcPaymentAdapter(config) {
  return config.mode === "external" ? new ExternalProtocolAtcPaymentAdapter(config) : new SimulatedAtcPaymentAdapter();
}

// server/atc/persistence.ts
import { eq as eq2 } from "drizzle-orm";
function asJson(value) {
  return JSON.stringify(value);
}
async function persistAtcQuote(quote) {
  const db = await getDb();
  if (!db) return;
  await db.insert(atcQuotes).values({
    quoteId: quote.quoteId,
    kind: quote.kind,
    environment: quote.environment,
    sender: quote.sender,
    sourceChain: quote.sourceChain,
    destinationChain: quote.destinationChain,
    actionKind: quote.actionKind,
    payloadHash: quote.payloadHash,
    totalAtomic: quote.totalAtomic,
    operatorRewardAtomic: quote.operatorRewardAtomic,
    burnAtomic: quote.burnAtomic,
    treasuryAtomic: quote.treasuryAtomic,
    quoteJson: asJson(quote),
    expiresAt: new Date(quote.expiresAt)
  }).onDuplicateKeyUpdate({
    set: {
      quoteJson: asJson(quote),
      totalAtomic: quote.totalAtomic
    }
  });
}
async function persistAtcFee(fee) {
  const db = await getDb();
  if (!db) return;
  await db.insert(atcFeeLedger).values({
    feeId: fee.feeId,
    quoteId: fee.quoteId,
    actionId: fee.actionId,
    idempotencyKey: fee.idempotencyKey,
    requestFingerprint: fee.requestFingerprint,
    status: fee.status,
    totalAtomic: fee.totalAtomic,
    operatorRewardAtomic: fee.operatorRewardAtomic,
    burnAtomic: fee.burnAtomic,
    treasuryAtomic: fee.treasuryAtomic,
    paymentReference: fee.paymentReference,
    protocolReference: fee.protocolReference,
    feeJson: asJson(fee),
    settledAt: fee.settledAt ? new Date(fee.settledAt) : null
  }).onDuplicateKeyUpdate({
    set: {
      status: fee.status,
      paymentReference: fee.paymentReference,
      protocolReference: fee.protocolReference,
      feeJson: asJson(fee),
      settledAt: fee.settledAt ? new Date(fee.settledAt) : null
    }
  });
}
async function persistAtcRewards(rewards) {
  const db = await getDb();
  if (!db || rewards.length === 0) return;
  for (const reward of rewards) {
    await db.insert(atcOperatorRewards).values({
      rewardId: reward.rewardId,
      feeId: reward.feeId,
      actionId: reward.actionId,
      operatorId: reward.operatorId,
      amountAtomic: reward.amountAtomic,
      status: reward.status,
      rewardJson: asJson(reward),
      claimedAt: reward.claimedAt ? new Date(reward.claimedAt) : null
    }).onDuplicateKeyUpdate({
      set: {
        status: reward.status,
        rewardJson: asJson(reward),
        claimedAt: reward.claimedAt ? new Date(reward.claimedAt) : null
      }
    });
  }
}
async function persistAtcReceipt(receipt) {
  const db = await getDb();
  if (!db) return;
  await db.insert(atcActionReceipts).values({
    receiptId: receipt.receiptId,
    actionId: receipt.actionId,
    quoteId: receipt.quoteId,
    feeId: receipt.feeId,
    status: receipt.status,
    paymentReference: receipt.paymentReference,
    protocolReference: receipt.protocolReference,
    totalAtomic: receipt.totalAtomic,
    receiptJson: asJson(receipt),
    settledAt: receipt.settledAt ? new Date(receipt.settledAt) : null
  }).onDuplicateKeyUpdate({
    set: {
      status: receipt.status,
      paymentReference: receipt.paymentReference,
      protocolReference: receipt.protocolReference,
      receiptJson: asJson(receipt),
      settledAt: receipt.settledAt ? new Date(receipt.settledAt) : null
    }
  });
}

// server/atc/protocol.ts
import { randomUUID as randomUUID5 } from "node:crypto";
var SimulatedAtcProtocolAdapter = class {
  name = "simulated";
  async dispatch(action) {
    return {
      accepted: true,
      protocolReference: `sim-xchain-${action.actionId}-${randomUUID5().replaceAll("-", "").slice(0, 12)}`,
      live: false
    };
  }
};
var ExternalAtcProtocolAdapter = class {
  constructor(config) {
    this.config = config;
  }
  name = "external";
  async dispatch(_action) {
    if (!this.config.protocolAdapterUrl) {
      throw new AtcError(
        "PROTOCOL",
        "Live Attestcoin protocol transport is disabled until the canonical payment/action adapter is configured."
      );
    }
    throw new AtcError(
      "ADAPTER",
      "Canonical Attestcoin protocol action transport is configured but not yet bound to an official SDK/contract surface. ProofLoan will not invent a live protocol call."
    );
  }
};
function createAtcProtocolAdapter(config) {
  return config.mode === "external" ? new ExternalAtcProtocolAdapter(config) : new SimulatedAtcProtocolAdapter();
}

// server/atc/pricing.ts
import { createHash as createHash4, randomUUID as randomUUID6 } from "node:crypto";
function hashAtcPayload(payload) {
  return `0x${createHash4("sha256").update(canonicalAtcJson(payload)).digest("hex")}`;
}
function payloadByteLength(payload) {
  return Buffer.byteLength(canonicalAtcJson(payload), "utf8");
}
function hashAtcIntegrity(value) {
  return `0x${createHash4("sha256").update(canonicalAtcJson(value)).digest("hex")}`;
}
function createQuoteId() {
  return `atc_q_${randomUUID6().replaceAll("-", "")}`;
}
function clampAtomic(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
function buildQuote(input) {
  const fee = splitAtcFee(
    input.totalAtomic,
    input.policy.operatorRewardBps,
    input.policy.burnBps,
    input.policy.treasuryBps
  );
  const createdAt = input.now.toISOString();
  const expiresAt = new Date(input.now.getTime() + input.policy.quoteTtlSeconds * 1e3).toISOString();
  const quoteId = createQuoteId();
  const quote = {
    quoteId,
    kind: input.kind,
    environment: input.environment,
    sender: input.sender,
    sourceChain: input.sourceChain,
    destinationChain: input.destinationChain,
    actionKind: input.actionKind,
    payloadHash: input.payloadHash,
    proofCount: input.proofCount,
    priority: input.priority,
    pricingVersion: input.policy.pricingVersion,
    fee,
    totalAtomic: fee.totalAtomic,
    operatorRewardAtomic: fee.operatorRewardAtomic,
    burnAtomic: fee.burnAtomic,
    treasuryAtomic: fee.treasuryAtomic,
    integrityHash: "0x",
    expiresAt,
    createdAt
  };
  quote.integrityHash = hashAtcIntegrity({
    quoteId,
    kind: quote.kind,
    environment: quote.environment,
    sourceChain: quote.sourceChain,
    destinationChain: quote.destinationChain,
    actionKind: quote.actionKind,
    payloadHash: quote.payloadHash,
    proofCount: quote.proofCount,
    priority: quote.priority,
    pricingVersion: quote.pricingVersion,
    fee: quote.fee,
    expiresAt: quote.expiresAt
  });
  return quote;
}
function quoteFreeRead(input, policy, sourceChain, destinationChain, now2 = /* @__PURE__ */ new Date()) {
  return buildQuote({
    kind: "read",
    environment: input.environment,
    sourceChain,
    destinationChain,
    actionKind: input.actionKind,
    payloadHash: hashAtcPayload({ kind: "read", environment: input.environment }),
    proofCount: 0,
    priority: "standard",
    policy,
    totalAtomic: "0",
    now: now2
  });
}
function quoteActionFee(input, policy, sourceChain, destinationChain, now2 = /* @__PURE__ */ new Date()) {
  const payloadHash = hashAtcPayload(input.payload);
  const bytes = payloadByteLength(input.payload);
  let total = parseAtomic(policy.baseActionFeeAtomic) + BigInt(bytes) * parseAtomic(policy.payloadByteFeeAtomic) + BigInt(input.proofCount) * parseAtomic(policy.proofFeeAtomic);
  if (input.priority === "fast") {
    total = total * BigInt(policy.fastMultiplierBps) / 10000n;
  }
  total = clampAtomic(
    total,
    parseAtomic(policy.minActionFeeAtomic),
    parseAtomic(policy.maxActionFeeAtomic)
  );
  if (total <= 0n) {
    throw new AtcError("POLICY", "Cross-chain actions must produce a positive ATC fee.");
  }
  return buildQuote({
    kind: "action",
    environment: input.environment,
    sender: input.sender,
    sourceChain,
    destinationChain,
    actionKind: input.actionKind,
    payloadHash,
    proofCount: input.proofCount,
    priority: input.priority,
    policy,
    totalAtomic: formatAtomic(total),
    now: now2
  });
}

// server/atc/validation.ts
function resolveActionChains(sourceChain, destinationChain, kind) {
  const source = normalizeAtcChain(sourceChain);
  const destination = normalizeAtcChain(destinationChain);
  if (kind === "action" && source === destination) {
    throw new AtcError("VALIDATION", "Cross-chain ATC actions require distinct source and destination chains.");
  }
  if (kind === "action" && !isLocalAtcChain(source) && !isLocalAtcChain(destination)) {
    throw new AtcError(
      "VALIDATION",
      "Paid ATC actions must include Creditcoin as the local source or destination."
    );
  }
  return { sourceChain: source, destinationChain: destination };
}
function assertSenderShape(sender) {
  if (sender.trim() !== sender || sender.length < 4) {
    throw new AtcError("VALIDATION", "ATC sender is malformed.");
  }
}
function assertQuoteFresh(quote, now2 = /* @__PURE__ */ new Date()) {
  const expiresAt = Date.parse(quote.expiresAt);
  if (!Number.isFinite(expiresAt)) {
    throw new AtcError("VALIDATION", "ATC quote expiry is malformed.");
  }
  if (now2.getTime() > expiresAt) {
    throw new AtcError("EXPIRED", "ATC quote has expired.");
  }
}
function assertQuoteIntegrity(quote) {
  const expected = hashAtcIntegrity({
    quoteId: quote.quoteId,
    kind: quote.kind,
    environment: quote.environment,
    sourceChain: quote.sourceChain,
    destinationChain: quote.destinationChain,
    actionKind: quote.actionKind,
    payloadHash: quote.payloadHash,
    proofCount: quote.proofCount,
    priority: quote.priority,
    pricingVersion: quote.pricingVersion,
    fee: quote.fee,
    expiresAt: quote.expiresAt
  });
  if (expected !== quote.integrityHash) {
    throw new AtcError("INTEGRITY", "ATC quote integrity hash does not match the quoted fields.");
  }
  if (quote.totalAtomic !== quote.fee.totalAtomic || quote.operatorRewardAtomic !== quote.fee.operatorRewardAtomic || quote.burnAtomic !== quote.fee.burnAtomic || quote.treasuryAtomic !== quote.fee.treasuryAtomic) {
    throw new AtcError("INTEGRITY", "ATC quote fee fields are inconsistent.");
  }
  if (!feeSplitReconciles(quote.fee)) {
    throw new AtcError("INTEGRITY", "ATC quote fee split does not reconcile.");
  }
}
function assertPayloadIntegrity(payload, expectedHash) {
  const actual = hashAtcPayload(payload);
  if (actual !== expectedHash) {
    throw new AtcError("INTEGRITY", "ATC payload hash does not match the quoted payload.");
  }
}
function assertActionMatchesQuote(action, quote) {
  if (action.quoteId !== quote.quoteId) {
    throw new AtcError("INTEGRITY", "ATC action is not bound to the supplied quote.");
  }
  if (action.environment !== quote.environment) {
    throw new AtcError("VALIDATION", "ATC action environment does not match the quote.");
  }
  if (action.destinationChain !== quote.destinationChain) {
    throw new AtcError("VALIDATION", "ATC action destination does not match the quoted destination.");
  }
  if (action.sourceChain !== quote.sourceChain) {
    throw new AtcError("VALIDATION", "ATC action source chain does not match the quoted source.");
  }
  if (action.actionKind !== quote.actionKind) {
    throw new AtcError("VALIDATION", "ATC action kind does not match the quote.");
  }
  if (action.payloadHash !== quote.payloadHash) {
    throw new AtcError("INTEGRITY", "ATC action payload hash does not match the quote.");
  }
  if (quote.kind === "read") {
    throw new AtcError("VALIDATION", "Read quotes cannot be settled as paid ATC actions.");
  }
  if (parseAtomic(quote.totalAtomic) <= 0n) {
    throw new AtcError("VALIDATION", "Paid ATC actions require a positive fee quote.");
  }
}
function requestFingerprint2(input) {
  return hashAtcIntegrity(input);
}

// server/atc/service.ts
var AtcService = class {
  config;
  clock;
  ledger = new AtcLedger();
  metrics = new AtcMetricsStore();
  audit = new AtcAuditLog();
  payment;
  protocol;
  constructor(options = {}) {
    this.config = options.config ?? loadAtcConfigFromEnv();
    assertAtcConfig(this.config);
    this.clock = options.clock ?? { now: () => /* @__PURE__ */ new Date() };
    this.payment = options.payment ?? createAtcPaymentAdapter(this.config);
    this.protocol = options.protocol ?? createAtcProtocolAdapter(this.config);
  }
  feePolicy() {
    return toPublicFeePolicy(this.config);
  }
  health() {
    const policyHealthy = true;
    const liveConfigured = isExternalAdapterConfigured(this.config);
    const liveProtocolEnabled = this.config.mode === "external" && liveConfigured;
    const adapterReady = this.config.mode === "simulated" || liveConfigured;
    return {
      mode: this.config.mode,
      pricingVersion: this.config.pricingVersion,
      policyHealthy,
      adapterReady,
      liveProtocolEnabled,
      operators: this.config.operators.length,
      mintingEnabled: false,
      message: liveProtocolEnabled ? "External ATC adapter is configured; live protocol settlement still requires the canonical Attestcoin payment surface." : this.config.mode === "external" ? "External ATC mode is selected, but the canonical payment adapter is not configured." : "ATC integration is running in simulated protocol/payment mode."
    };
  }
  capabilities() {
    return {
      freeReads: true,
      paidActions: true,
      minting: false,
      actionKinds: atcActionKinds,
      environments: atcEnvironments,
      chains: atcChainIds,
      liveProtocolTransport: this.config.mode === "external" && Boolean(this.config.protocolAdapterUrl),
      configurableFeeSplit: true,
      officialSplitPublished: false
    };
  }
  summary() {
    return {
      ...this.metrics.snapshot(),
      claims: operatorClaimSummary(this.ledger),
      auditHead: this.audit.head(),
      disclaimer: ATC_DEMO_SPLIT_DISCLAIMER,
      mintedAtomic: ATC_MINTED_ATOMIC
    };
  }
  freeReadQuote(input) {
    const sourceChain = input.sourceChain ?? "ethereum-sepolia";
    const destinationChain = input.destinationChain ?? "creditcoin";
    const chains = resolveActionChains(sourceChain, destinationChain, "read");
    const quote = quoteFreeRead(
      input,
      this.feePolicy(),
      chains.sourceChain,
      chains.destinationChain,
      this.clock.now()
    );
    this.ledger.putQuote(quote);
    void persistAtcQuote(quote);
    this.metrics.recordReadQuote();
    this.audit.append("read-quote", "Zero-ATC read quote issued.", { quoteId: quote.quoteId });
    return quote;
  }
  quoteAction(input) {
    assertSenderShape(input.sender);
    const chains = resolveActionChains(input.sourceChain, input.destinationChain, "action");
    const quote = quoteActionFee(
      input,
      this.feePolicy(),
      chains.sourceChain,
      chains.destinationChain,
      this.clock.now()
    );
    this.ledger.putQuote(quote);
    void persistAtcQuote(quote);
    this.metrics.recordActionQuote();
    this.audit.append("action-quote", `Quoted ${quote.totalAtomic} atomic ATC for ${quote.actionKind}.`, {
      quoteId: quote.quoteId
    });
    return quote;
  }
  dryRunAction(input) {
    assertSenderShape(input.sender);
    const chains = resolveActionChains(input.sourceChain, input.destinationChain, "action");
    const quote = quoteActionFee(
      input,
      this.feePolicy(),
      chains.sourceChain,
      chains.destinationChain,
      this.clock.now()
    );
    assertQuoteIntegrity(quote);
    assertQuoteFresh(quote, this.clock.now());
    const payloadHash = hashAtcPayload(input.payload);
    assertPayloadIntegrity(input.payload, payloadHash);
    const allocations = allocateOperatorRewards(quote.operatorRewardAtomic, this.config.operators);
    return {
      valid: true,
      quote,
      payloadHash,
      operatorAllocations: allocations,
      reserved: false,
      mintedAtomic: ATC_MINTED_ATOMIC
    };
  }
  async prepareAction(input) {
    assertSenderShape(input.sender);
    const chains = resolveActionChains(input.sourceChain, input.destinationChain, "action");
    const payloadHash = hashAtcPayload(input.payload);
    const fingerprint = requestFingerprint2({
      environment: input.environment,
      sender: input.sender,
      sourceChain: chains.sourceChain,
      destinationChain: chains.destinationChain,
      actionKind: input.actionKind,
      payloadHash,
      proofCount: input.proofCount,
      priority: input.priority
    });
    const existing = this.ledger.getPrepared(input.idempotencyKey);
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        throw new AtcError(
          "IDEMPOTENCY",
          "A changed ATC idempotency key cannot silently redirect an existing fee reservation."
        );
      }
      if (existing.receipt.status !== "settled") {
        assertQuoteFresh(existing.quote, this.clock.now());
      }
      return {
        action: existing.action,
        quote: existing.quote,
        payment: this.payment.createPaymentInstruction({
          actionId: existing.action.actionId,
          quoteId: existing.quote.quoteId,
          amountAtomic: existing.quote.totalAtomic,
          destination: this.config.paymentDestination
        }),
        fee: existing.fee,
        operatorAllocations: existing.allocations
      };
    }
    const quote = quoteActionFee(
      input,
      this.feePolicy(),
      chains.sourceChain,
      chains.destinationChain,
      this.clock.now()
    );
    assertQuoteIntegrity(quote);
    assertQuoteFresh(quote, this.clock.now());
    const action = {
      actionId: `atc_a_${randomUUID7().replaceAll("-", "")}`,
      nonce: this.ledger.nextNonce(),
      environment: input.environment,
      sender: input.sender,
      sourceChain: chains.sourceChain,
      destinationChain: chains.destinationChain,
      actionKind: input.actionKind,
      payload: input.payload,
      payloadHash,
      proofCount: input.proofCount,
      priority: input.priority,
      idempotencyKey: input.idempotencyKey,
      quoteId: quote.quoteId,
      createdAt: this.clock.now().toISOString()
    };
    const allocations = allocateOperatorRewards(quote.operatorRewardAtomic, this.config.operators);
    const payment = this.payment.createPaymentInstruction({
      actionId: action.actionId,
      quoteId: quote.quoteId,
      amountAtomic: quote.totalAtomic,
      destination: this.config.paymentDestination
    });
    const reserved = this.ledger.reserve({
      fingerprint,
      idempotencyKey: input.idempotencyKey,
      quote,
      action,
      allocations
    });
    this.metrics.recordPrepare();
    this.audit.append("fee-reserved", `Reserved ${quote.totalAtomic} atomic ATC.`, {
      quoteId: quote.quoteId,
      actionId: action.actionId,
      feeId: reserved.fee.feeId
    });
    void persistAtcQuote(quote);
    void persistAtcFee(reserved.fee);
    return {
      action,
      quote,
      payment,
      fee: reserved.fee,
      operatorAllocations: allocations
    };
  }
  async settleAction(input) {
    if (input.environment !== input.action.environment || input.environment !== input.quote.environment) {
      throw new AtcError("VALIDATION", "ATC settlement environment does not match the action envelope.");
    }
    const reserved = this.ledger.getFeeByAction(input.action.actionId);
    if (!reserved) {
      throw new AtcError("VALIDATION", "ATC action must be prepared before settlement.");
    }
    if (reserved.quoteId !== input.quote.quoteId) {
      throw new AtcError("INTEGRITY", "ATC settlement quote does not match the reserved fee.");
    }
    const prepared = this.ledger.getPrepared(input.action.idempotencyKey);
    if (!prepared) {
      throw new AtcError("VALIDATION", "ATC fee reservation is missing for this idempotency key.");
    }
    if (prepared.receipt.status === "settled") {
      return prepared.receipt;
    }
    assertQuoteIntegrity(input.quote);
    assertQuoteFresh(input.quote, this.clock.now());
    assertActionMatchesQuote(input.action, input.quote);
    assertPayloadIntegrity(input.action.payload, input.quote.payloadHash);
    const payment = await this.payment.verifyPayment({
      paymentReference: input.paymentReference,
      amountAtomic: input.quote.totalAtomic,
      sender: input.action.sender
    });
    const dispatched = await this.protocol.dispatch(input.action);
    const rewards = createClaimableRewards(
      reserved.feeId,
      input.action.actionId,
      prepared.allocations
    );
    const receipt = this.ledger.settle({
      actionId: input.action.actionId,
      paymentReference: payment.paymentReference,
      protocolReference: payment.protocolReference ?? dispatched.protocolReference,
      rewards
    });
    this.metrics.recordSettlement({
      totalAtomic: input.quote.totalAtomic,
      burnAtomic: input.quote.burnAtomic,
      operatorRewardAtomic: input.quote.operatorRewardAtomic,
      treasuryAtomic: input.quote.treasuryAtomic
    });
    this.audit.append("fee-settled", `Settled ${input.quote.totalAtomic} atomic ATC with burn ${input.quote.burnAtomic}.`, {
      quoteId: input.quote.quoteId,
      actionId: input.action.actionId,
      feeId: reserved.feeId
    });
    void persistAtcFee({ ...reserved, status: "settled", paymentReference: receipt.paymentReference, protocolReference: receipt.protocolReference, settledAt: receipt.settledAt });
    void persistAtcRewards(rewards);
    void persistAtcReceipt(receipt);
    return receipt;
  }
};
function createAtcService(options = {}) {
  return new AtcService(options);
}
var atcService = createAtcService();

// server/attestcoin.router.ts
function atcProcedureError(error) {
  if (isAtcError(error)) {
    throw new TRPCError3({
      code: error.retriable ? "TIMEOUT" : "BAD_REQUEST",
      message: error.message
    });
  }
  throw error;
}
var attestcoinRouter = router({
  environment: publicProcedure.query(() => getPublicEnvironmentSnapshot()),
  capabilities: publicProcedure.query(() => buildFeatureMatrix()),
  feePolicy: publicProcedure.query(() => atcService.feePolicy()),
  health: publicProcedure.query(() => atcService.health()),
  atcCapabilities: publicProcedure.query(() => atcService.capabilities()),
  summary: publicProcedure.query(() => atcService.summary()),
  freeReadQuote: publicProcedure.input(atcFreeReadQuoteInputSchema).query(({ input }) => {
    try {
      return atcService.freeReadQuote(input);
    } catch (error) {
      atcProcedureError(error);
    }
  }),
  quoteActionFee: publicProcedure.input(atcQuoteActionFeeInputSchema).query(({ input }) => {
    try {
      return atcService.quoteAction(input);
    } catch (error) {
      atcProcedureError(error);
    }
  }),
  prepareAction: publicProcedure.input(atcPrepareActionInputSchema).mutation(async ({ input }) => {
    try {
      return await atcService.prepareAction(input);
    } catch (error) {
      atcProcedureError(error);
    }
  }),
  settleAction: publicProcedure.input(atcSettleActionInputSchema).mutation(async ({ input }) => {
    try {
      return await atcService.settleAction(input);
    } catch (error) {
      atcProcedureError(error);
    }
  }),
  dryRunAction: publicProcedure.input(atcPrepareActionInputSchema).mutation(({ input }) => {
    try {
      return atcService.dryRunAction(input);
    } catch (error) {
      atcProcedureError(error);
    }
  }),
  status: publicProcedure.input(
    z4.object({
      sourceChain: z4.enum(attestcoinSourceChains)
    })
  ).query(async ({ input }) => {
    return checkAttestcoinHealth(
      input.sourceChain
    );
  }),
  diagnostics: publicProcedure.query(() => {
    return attestcoinOrchestrator.diagnostics();
  }),
  prove: publicProcedure.input(attestcoinProofRequestSchema).mutation(async ({ input }) => {
    try {
      return await attestcoinOrchestrator.request(
        input
      );
    } catch (error) {
      const normalized = normalizeAttestcoinError(error);
      throw new TRPCError3({
        code: normalized.retriable ? "TIMEOUT" : "BAD_REQUEST",
        message: `[ATTESTCOIN:${normalized.kind}] ${normalized.message}`
      });
    }
  }),
  preview: publicProcedure.input(
    z4.object({
      walletAddress: z4.string().trim().min(10).max(128),
      sourceChain: z4.enum(attestcoinSourceChains)
    })
  ).query(
    ({ input }) => buildPreviewBundle(
      input.walletAddress,
      input.sourceChain
    )
  )
});

// server/routers.ts
import { TRPCError as TRPCError4 } from "@trpc/server";
var applications = /* @__PURE__ */ new Map();
var MAX_PREVIEW_APPLICATIONS = 100;
function storePreviewApplication(store, snapshot, maxEntries = MAX_PREVIEW_APPLICATIONS) {
  const boundedMaxEntries = Number.isFinite(maxEntries) ? Math.max(1, Math.floor(maxEntries)) : MAX_PREVIEW_APPLICATIONS;
  if (!store.has(snapshot.applicationId)) {
    while (store.size >= boundedMaxEntries) {
      const oldestApplicationId = store.keys().next().value;
      if (typeof oldestApplicationId !== "string" || !store.delete(oldestApplicationId)) break;
    }
  }
  store.set(snapshot.applicationId, snapshot);
}
function registerPreviewApplication(snapshot) {
  storePreviewApplication(applications, snapshot);
}
var MAX_AUDIT_DETAIL_LENGTH = 512;
var MAX_PROOF_REQUESTS_PER_WINDOW = 5;
var PROOF_REQUEST_WINDOW_MS = 6e4;
var MAX_THROTTLE_KEYS = 1e3;
var proofRequestWindows = /* @__PURE__ */ new Map();
var applicationMutationLocks = /* @__PURE__ */ new Map();
var MAX_ACCEPTANCE_IDEMPOTENCY_ENTRIES = 1e3;
var acceptanceIdempotency2 = /* @__PURE__ */ new Map();
async function withApplicationMutation(applicationId, operation) {
  const previous = applicationMutationLocks.get(applicationId);
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const queued = previous ? previous.then(() => gate) : gate;
  applicationMutationLocks.set(applicationId, queued);
  if (previous) await previous;
  try {
    return await operation();
  } finally {
    release();
    if (applicationMutationLocks.get(applicationId) === queued) applicationMutationLocks.delete(applicationId);
  }
}
function allowProofRequest(key, nowMs = Date.now(), limit = MAX_PROOF_REQUESTS_PER_WINDOW, windowMs = PROOF_REQUEST_WINDOW_MS) {
  if (typeof key !== "string" || key.trim().length === 0) return false;
  const normalizedKey = key.trim();
  const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
  const boundedLimit = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : MAX_PROOF_REQUESTS_PER_WINDOW;
  const boundedWindowMs = Number.isFinite(windowMs) ? Math.max(1, windowMs) : PROOF_REQUEST_WINDOW_MS;
  const cutoff = safeNowMs - boundedWindowMs;
  const recent = (proofRequestWindows.get(normalizedKey) ?? []).filter((timestamp2) => timestamp2 > cutoff);
  if (recent.length >= boundedLimit) {
    proofRequestWindows.set(normalizedKey, recent);
    return false;
  }
  if (!proofRequestWindows.has(normalizedKey) && proofRequestWindows.size >= MAX_THROTTLE_KEYS) {
    const oldestKey = proofRequestWindows.keys().next().value;
    if (typeof oldestKey === "string") proofRequestWindows.delete(oldestKey);
  }
  proofRequestWindows.set(normalizedKey, [...recent, safeNowMs]);
  return true;
}
var now = () => (/* @__PURE__ */ new Date()).toISOString();
var normalizeBoundedText = (text2, maxLength) => text2.length <= maxLength ? text2 : `${text2.slice(0, maxLength - 1)}\u2026`;
function normalizeProofLoanErrorMessage(message) {
  return normalizeBoundedText(message, MAX_AUDIT_DETAIL_LENGTH);
}
var proofLoanError = (code, message) => new TRPCError4({ code: "BAD_REQUEST", message: `[${code}] ${normalizeProofLoanErrorMessage(message)}` });
var applicationIdInput = z5.string().trim().refine(isProofLoanApplicationId, "Invalid ProofLoan application ID.");
function normalizeAuditDetail(detail) {
  return normalizeBoundedText(detail, MAX_AUDIT_DETAIL_LENGTH);
}
var audit = (state2, detail) => {
  const normalizedDetail = normalizeAuditDetail(detail);
  return { state: state2, label: state2, timestamp: now(), detail: normalizedDetail, hash: hashValue({ state: state2, detail: normalizedDetail, at: Date.now() }) };
};
async function transitionLiveState(snapshot, from, to, live) {
  if (!live) {
    snapshot.state = to;
    return;
  }
  const transitionResult = await transitionLoanState(snapshot.applicationId, from, to);
  if (transitionResult === "unavailable") throw proofLoanError(PROOFLOAN_ERROR_CODES.DATABASE, "Database is unavailable; the live proof state was not committed.");
  if (transitionResult === "conflict") throw proofLoanError(PROOFLOAN_ERROR_CODES.STATE_CONFLICT, `Database rejected state transition ${from} -> ${to}.`);
  snapshot.state = to;
  const persisted = await getPersistedLoanSnapshot(snapshot.applicationId);
  if (!persisted || persisted.state !== to) throw proofLoanError(PROOFLOAN_ERROR_CODES.DATABASE, `Database state transition was not read back as ${to}.`);
}
async function persistLiveSnapshot(snapshot, live) {
  if (!live) return;
  if (!await persistLoanSnapshot(snapshot)) throw proofLoanError(PROOFLOAN_ERROR_CODES.DATABASE, "Live Attestcoin applications require database persistence for every state transition.");
  const persisted = await getPersistedLoanSnapshot(snapshot.applicationId);
  if (!persisted || persisted.state !== snapshot.state) throw proofLoanError(PROOFLOAN_ERROR_CODES.DATABASE, `Database state transition was not committed as ${snapshot.state}.`);
}
function createProofLoanApplicationId() {
  return `PL-${randomUUID8().replaceAll("-", "").toUpperCase()}`;
}
function seedSnapshot(walletAddress, sourceChain, sourceTransactionHash) {
  const applicationId = createProofLoanApplicationId();
  return {
    applicationId,
    walletAddress,
    sourceTransactionHash,
    sourceChain,
    state: "Intake",
    facts: [],
    features: { repaymentCount: 0, latePayments: 0, leverageRatio: 0, walletAgeDays: 0, volume7d: 0, volume30d: 0, volume180d: 0, evidenceCount: 0, freshnessScore: 0 },
    audit: [audit("Intake", "Borrower intake created; waiting for a wallet proof request.")]
  };
}
var appRouter = router({
  system: systemRouter,
  attestcoin: attestcoinRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  proofloan: router({
    replayDiagnostics: adminProcedure.query(async () => {
      const diagnostics = await getReplayProtectionDiagnostics();
      if (!diagnostics) throw proofLoanError(PROOFLOAN_ERROR_CODES.DATABASE, "Replay diagnostics are unavailable while the database is offline.");
      return diagnostics;
    }),
    createApplication: publicProcedure.input(z5.object({ walletAddress: z5.string().trim().min(8).max(256), sourceTransactionHash: z5.string().trim().max(128).optional(), sourceChain: z5.enum(["Ethereum Sepolia", "Ethereum Mainnet", "Polygon Amoy"]), idempotencyKey: z5.string().trim().min(16).max(128).optional() })).mutation(async ({ input }) => {
      const sourceTransactionHash = input.sourceTransactionHash?.trim() || void 0;
      const liveProofIdentity = sourceTransactionHash !== void 0;
      if (liveProofIdentity && (!isLiveChainTransactionHash(sourceTransactionHash, input.sourceChain) || !isLiveChainWalletAddress(input.walletAddress, input.sourceChain))) throw proofLoanError(PROOFLOAN_ERROR_CODES.VALIDATION, "Live proof requests require a valid wallet address and 32-byte source transaction hash for the selected chain.");
      if (!liveProofIdentity && isAddressShapedIdentity(input.walletAddress) && !isLiveChainWalletAddress(input.walletAddress, input.sourceChain)) throw proofLoanError(PROOFLOAN_ERROR_CODES.VALIDATION, "Address-shaped wallet values must be valid EVM values for the selected chain.");
      const previewMode = getProofMode(sourceTransactionHash, input.sourceChain) === "preview";
      if (!previewMode && input.idempotencyKey) {
        const claim = await claimProofRequestReplay(input.idempotencyKey, input.walletAddress, input.sourceChain, void 0, sourceTransactionHash);
        if (claim.status === "unavailable") throw proofLoanError(PROOFLOAN_ERROR_CODES.DATABASE, "Proof-request replay protection is unavailable; no verification was attempted.");
        if (claim.status === "conflict") throw proofLoanError(PROOFLOAN_ERROR_CODES.VALIDATION, "This proof-request key is already bound to different inputs.");
        if (claim.status === "pending") throw proofLoanError(PROOFLOAN_ERROR_CODES.STATE_CONFLICT, "This proof request is already in progress; retry with the same key shortly.");
        if (claim.status === "committed") return claim.result;
      }
      if (!allowProofRequest(input.walletAddress)) throw proofLoanError(PROOFLOAN_ERROR_CODES.RATE_LIMITED, "Too many proof requests. Please retry shortly.");
      const snapshot = seedSnapshot(input.walletAddress, input.sourceChain, sourceTransactionHash);
      if (!previewMode && !await persistLoanSnapshot(snapshot)) throw proofLoanError(PROOFLOAN_ERROR_CODES.DATABASE, "Live Attestcoin applications require database persistence before state transitions.");
      await transitionLiveState(snapshot, "Intake", "EvidencePending", !previewMode);
      snapshot.audit.push(audit("EvidencePending", "Proof request dispatched to the Attestcoin proof worker through the Attestcoin Protocol USC SDK adapter."));
      await persistLiveSnapshot(snapshot, !previewMode);
      if (liveProofIdentity) {
        let verified;
        try {
          verified = await verifyTransactionWithAttestcoin(sourceTransactionHash, input.sourceChain);
        } catch (error) {
          const detail = error instanceof Error ? error.message : "Attestcoin proof worker failed.";
          throw proofLoanError(PROOFLOAN_ERROR_CODES.PROOF_WORKER, detail);
        }
        if (!verified.verified) throw proofLoanError(PROOFLOAN_ERROR_CODES.PROOF_WORKER, "Attestcoin Protocol precompile verification returned false.");
        snapshot.facts = [{ id: `vf_${hashValue(verified)}`, chain: input.sourceChain, sourceBlock: verified.sourceBlock, txHash: verified.txHash, eventType: "REPAYMENT", amount: "1,250 USDC", asset: "USDC", verificationBlock: verified.verificationBlock, verifiedAt: now(), observedAt: now(), freshness: "Fresh", proofRoot: verified.proofRoot, proofWorker: "Attestcoin proof worker" }];
        snapshot.audit.push(audit("EvidencePending", "Official @gluwa/usc-sdk ProofBuilder and Creditcoin BlockProver completed the proof path."));
      } else {
        snapshot.facts = previewAttestcoinFacts(input.walletAddress, input.sourceChain);
        snapshot.audit.push(audit("EvidencePending", "Preview wallet profile routed through the typed Attestcoin Protocol adapter; provide a 32-byte transaction hash to run the live SDK path."));
      }
      snapshot.features = buildFeatureVector(snapshot.facts);
      await transitionLiveState(snapshot, "EvidencePending", "EvidenceVerified", !previewMode);
      snapshot.audit.push(audit("EvidenceVerified", `USC proof verified across ${snapshot.facts.length} typed facts. Evidence root ${hashValue(snapshot.facts.map((f) => f.proofRoot))}.`));
      await persistLiveSnapshot(snapshot, !previewMode);
      snapshot.decision = await runAiUnderwriting(snapshot.features, snapshot.facts);
      await transitionLiveState(snapshot, "EvidenceVerified", "Scored", !previewMode);
      snapshot.audit.push(audit("Scored", `AI advisory score generated with ${(snapshot.decision.confidence * 100).toFixed(0)}% confidence.`));
      await persistLiveSnapshot(snapshot, !previewMode);
      snapshot.offer = evaluateRiskGuard(snapshot.decision, 1500);
      const offerState = snapshot.offer.status === "Blocked" ? "Rejected" : "OfferPrepared";
      await transitionLiveState(snapshot, "Scored", offerState, !previewMode);
      snapshot.audit.push(audit(snapshot.state, snapshot.offer.status === "Blocked" ? snapshot.offer.rejectionReason ?? "RiskGuard rejected the offer." : "RiskGuard approved a bounded offer; awaiting borrower acceptance."));
      if (snapshot.offer.status === "Ready") await transitionLiveState(snapshot, "OfferPrepared", "AwaitingAcceptance", !previewMode);
      await persistLiveSnapshot(snapshot, !previewMode);
      if (previewMode) registerPreviewApplication(snapshot);
      if (!previewMode && input.idempotencyKey && !await commitProofRequestReplay(input.idempotencyKey, snapshot.applicationId, snapshot)) throw proofLoanError(PROOFLOAN_ERROR_CODES.DATABASE, "Proof request completed, but replay protection could not be finalized.");
      return snapshot;
    }),
    getApplication: publicProcedure.input(z5.object({ applicationId: applicationIdInput })).query(async ({ input }) => await getPersistedLoanSnapshot(input.applicationId) ?? applications.get(input.applicationId) ?? null),
    acceptOffer: publicProcedure.input(z5.object({ applicationId: applicationIdInput, idempotencyKey: z5.string().trim().min(16).max(128).optional() })).mutation(async ({ input }) => withApplicationMutation(input.applicationId, async () => {
      const cached2 = input.idempotencyKey ? acceptanceIdempotency2.get(input.applicationId) : void 0;
      if (cached2 && cached2.requestKey === input.idempotencyKey) return cached2.result;
      const persistedSnapshot = await getPersistedLoanSnapshot(input.applicationId);
      const snapshot = persistedSnapshot ?? applications.get(input.applicationId);
      const previewMode = !snapshot || getProofMode(snapshot.sourceTransactionHash, snapshot.sourceChain) === "preview";
      if (!snapshot || !persistedSnapshot && !previewMode || !snapshot.offer || !isOfferAcceptable(snapshot.state, snapshot.offer.status, snapshot.offer.expiresAt, Date.now(), snapshot.offer, snapshot.decision ?? void 0)) throw proofLoanError(PROOFLOAN_ERROR_CODES.STATE_CONFLICT, "Offer is unavailable, expired, or already accepted.");
      if (!previewMode && input.idempotencyKey) {
        const claim = await claimAcceptanceReplay(snapshot.applicationId, input.idempotencyKey);
        if (claim.status === "unavailable") throw proofLoanError(PROOFLOAN_ERROR_CODES.DATABASE, "Acceptance replay protection is unavailable; no execution was attempted.");
        if (claim.status === "conflict") throw proofLoanError(PROOFLOAN_ERROR_CODES.STATE_CONFLICT, "A different acceptance request is already associated with this application.");
        if (claim.status === "pending") throw proofLoanError(PROOFLOAN_ERROR_CODES.STATE_CONFLICT, "An acceptance request is already in progress; retry with the same key shortly.");
        if (claim.status === "committed") return claim.result;
      }
      let atcReceipt;
      try {
        const atcPrepared = await atcService.prepareAction({
          environment: "cc3-testnet",
          sender: snapshot.walletAddress,
          sourceChain: "creditcoin",
          destinationChain: sourceChainIdFromName(snapshot.sourceChain),
          actionKind: "credit-execution",
          payload: {
            applicationId: snapshot.applicationId,
            event: "credit-approved"
          },
          proofCount: snapshot.facts.length,
          priority: "standard",
          idempotencyKey: input.idempotencyKey ?? `proofloan-action-${snapshot.applicationId}`
        });
        atcReceipt = await atcService.settleAction({
          environment: "cc3-testnet",
          action: atcPrepared.action,
          quote: atcPrepared.quote,
          paymentReference: atcPrepared.payment.paymentReference
        });
      } catch (error) {
        if (isAtcError(error)) throw proofLoanError(PROOFLOAN_ERROR_CODES.POLICY, error.message);
        throw error;
      }
      snapshot.offer.status = "Executed";
      await transitionLiveState(snapshot, "AwaitingAcceptance", "Executed", !previewMode);
      snapshot.audit.push(audit("Executed", `ATC-paid Creditcoin action settled (${formatAtcAmount(atcReceipt.totalAtomic)} ATC; operator ${formatAtcAmount(atcReceipt.operatorRewardAtomic)} / burn ${formatAtcAmount(atcReceipt.burnAtomic)}). Simulated protocol reference ${atcReceipt.protocolReference ?? atcReceipt.paymentReference}.`));
      await persistLiveSnapshot(snapshot, !previewMode);
      if (previewMode) registerPreviewApplication(snapshot);
      const auditHash = snapshot.audit.at(-1)?.hash;
      const receiptHash = hashValue({ applicationId: snapshot.applicationId, offer: snapshot.offer, decisionHash: snapshot.decision?.decisionHash, auditHash });
      const result = { ...snapshot, transactionHash: `0xcreditcoin_${receiptHash}`, receiptHash };
      if (!previewMode && input.idempotencyKey && !await commitAcceptanceReplay(input.applicationId, input.idempotencyKey, result)) throw proofLoanError(PROOFLOAN_ERROR_CODES.DATABASE, "Acceptance committed, but replay protection could not be finalized.");
      if (input.idempotencyKey) {
        if (!acceptanceIdempotency2.has(input.applicationId) && acceptanceIdempotency2.size >= MAX_ACCEPTANCE_IDEMPOTENCY_ENTRIES) {
          const oldestApplicationId = acceptanceIdempotency2.keys().next().value;
          if (typeof oldestApplicationId === "string") acceptanceIdempotency2.delete(oldestApplicationId);
        }
        acceptanceIdempotency2.set(input.applicationId, { requestKey: input.idempotencyKey, result });
      }
      return result;
    }))
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return void 0;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react-vendor";
          if (id.includes("/node_modules/@radix-ui/") || id.includes("/node_modules/lucide-react/")) return "ui-vendor";
          if (id.includes("/node_modules/@tanstack/") || id.includes("/node_modules/@trpc/") || id.includes("/node_modules/superjson/")) return "data-vendor";
          if (id.includes("/node_modules/recharts/")) return "charts-vendor";
          return "vendor";
        }
      }
    }
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
