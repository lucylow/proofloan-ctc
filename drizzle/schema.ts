import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const loanApplications = mysqlTable("loan_applications", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const verifiedFacts = mysqlTable("verified_facts", {
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
  verifiedAt: timestamp("verifiedAt").defaultNow().notNull(),
  chainKey: int("chainKey"),
  txIndex: int("txIndex"),
  environment: varchar("environment", { length: 32 }),
  receiptStatus: varchar("receiptStatus", { length: 8 }),
  merkleProofHash: varchar("merkleProofHash", { length: 128 }),
  continuityProofHash: varchar("continuityProofHash", { length: 128 }),
  verificationStatus: varchar("verificationStatus", { length: 16 }),
  confirmations: int("confirmations"),
  requestHash: varchar("requestHash", { length: 128 }),
});

export const decisions = mysqlTable("decisions", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const offers = mysqlTable("offers", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;


export const acceptanceIdempotency = mysqlTable("acceptance_idempotency", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: varchar("applicationId", { length: 64 }).notNull().unique(),
  requestKey: varchar("requestKey", { length: 128 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  resultJson: text("resultJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const proofRequestIdempotency = mysqlTable("proof_request_idempotency", {
  id: int("id").autoincrement().primaryKey(),
  requestKey: varchar("requestKey", { length: 128 }).notNull().unique(),
  walletAddress: varchar("walletAddress", { length: 128 }).notNull(),
  sourceTransactionHash: varchar("sourceTransactionHash", { length: 128 }),
  sourceChain: varchar("sourceChain", { length: 48 }).notNull(),
  applicationId: varchar("applicationId", { length: 64 }),
  status: varchar("status", { length: 16 }).notNull(),
  resultJson: text("resultJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditEvents = mysqlTable("audit_events", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: varchar("applicationId", { length: 64 }).notNull(),
  state: varchar("state", { length: 32 }).notNull(),
  label: varchar("label", { length: 64 }).notNull(),
  detail: text("detail").notNull(),
  eventHash: varchar("eventHash", { length: 128 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const atcQuotes = mysqlTable("atc_quotes", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const atcFeeLedger = mysqlTable("atc_fee_ledger", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const atcOperatorRewards = mysqlTable("atc_operator_rewards", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const atcActionReceipts = mysqlTable("atc_action_receipts", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const attestorProfiles = mysqlTable("attestor_profiles", {
  id: int("id").autoincrement().primaryKey(),
  operatorId: varchar("operatorId", { length: 96 }).notNull().unique(),
  environment: varchar("environment", { length: 32 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  payoutAddress: varchar("payoutAddress", { length: 128 }).notNull(),
  stakeAtomic: varchar("stakeAtomic", { length: 80 }).notNull(),
  weightBps: int("weightBps").notNull(),
  profileJson: text("profileJson").notNull(),
  lastSeenAt: timestamp("lastSeenAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const attestorCertificates = mysqlTable("attestor_certificates", {
  id: int("id").autoincrement().primaryKey(),
  certificateId: varchar("certificateId", { length: 80 }).notNull().unique(),
  environment: varchar("environment", { length: 32 }).notNull(),
  sourceChain: varchar("sourceChain", { length: 64 }).notNull(),
  sourceBlock: int("sourceBlock").notNull(),
  digest: varchar("digest", { length: 128 }).notNull(),
  certificateJson: text("certificateJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const attestorFaults = mysqlTable("attestor_faults", {
  id: int("id").autoincrement().primaryKey(),
  faultId: varchar("faultId", { length: 80 }).notNull().unique(),
  operatorId: varchar("operatorId", { length: 96 }).notNull(),
  sourceChain: varchar("sourceChain", { length: 64 }).notNull(),
  category: varchar("category", { length: 48 }).notNull(),
  severity: varchar("severity", { length: 16 }).notNull(),
  evidenceDigest: varchar("evidenceDigest", { length: 128 }).notNull(),
  slashBps: int("slashBps"),
  faultJson: text("faultJson").notNull(),
  detectedAt: timestamp("detectedAt").notNull(),
  confirmedAt: timestamp("confirmedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const attestorRewardLedger = mysqlTable("attestor_reward_ledger", {
  id: int("id").autoincrement().primaryKey(),
  ledgerId: varchar("ledgerId", { length: 160 }).notNull().unique(),
  feeId: varchar("feeId", { length: 64 }).notNull(),
  operatorId: varchar("operatorId", { length: 96 }).notNull(),
  activity: varchar("activity", { length: 32 }).notNull(),
  amountAtomic: varchar("amountAtomic", { length: 80 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  rewardJson: text("rewardJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const attestorEvents = mysqlTable("attestor_events", {
  id: int("id").autoincrement().primaryKey(),
  eventId: varchar("eventId", { length: 80 }).notNull().unique(),
  eventType: varchar("eventType", { length: 48 }).notNull(),
  digest: varchar("digest", { length: 128 }).notNull(),
  eventJson: text("eventJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const attestcoinProofRecords = mysqlTable("attestcoin_proof_records", {
  id: int("id").autoincrement().primaryKey(),
  requestHash: varchar("requestHash", { length: 128 }).notNull().unique(),
  requestId: varchar("requestId", { length: 128 }).notNull(),
  environment: varchar("environment", { length: 32 }).notNull(),
  sourceChain: varchar("sourceChain", { length: 48 }).notNull(),
  chainKey: int("chainKey").notNull(),
  sourceBlock: int("sourceBlock").notNull(),
  txHash: varchar("txHash", { length: 128 }).notNull(),
  txIndex: int("txIndex").notNull(),
  proofRoot: varchar("proofRoot", { length: 128 }).notNull(),
  merkleProofHash: varchar("merkleProofHash", { length: 128 }).notNull(),
  continuityProofHash: varchar("continuityProofHash", { length: 128 }).notNull(),
  receiptStatus: varchar("receiptStatus", { length: 8 }).notNull(),
  verificationStatus: varchar("verificationStatus", { length: 16 }).notNull(),
  freshness: varchar("freshness", { length: 16 }).notNull(),
  confirmations: int("confirmations").notNull(),
  confirmationDepth: int("confirmationDepth").notNull(),
  verificationBlock: int("verificationBlock").notNull(),
  recordJson: text("recordJson").notNull(),
  verifiedAt: timestamp("verifiedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const attestcoinProofIdempotency = mysqlTable("attestcoin_proof_idempotency", {
  id: int("id").autoincrement().primaryKey(),
  requestHash: varchar("requestHash", { length: 128 }).notNull().unique(),
  requestId: varchar("requestId", { length: 128 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  proofRoot: varchar("proofRoot", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
