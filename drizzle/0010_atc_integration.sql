CREATE TABLE `atc_quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` varchar(64) NOT NULL,
	`kind` varchar(16) NOT NULL,
	`environment` varchar(32) NOT NULL,
	`sender` varchar(128),
	`sourceChain` varchar(64) NOT NULL,
	`destinationChain` varchar(64) NOT NULL,
	`actionKind` varchar(48) NOT NULL,
	`payloadHash` varchar(128) NOT NULL,
	`totalAtomic` varchar(80) NOT NULL,
	`operatorRewardAtomic` varchar(80) NOT NULL,
	`burnAtomic` varchar(80) NOT NULL,
	`treasuryAtomic` varchar(80) NOT NULL,
	`quoteJson` text NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `atc_quotes_id` PRIMARY KEY(`id`),
	CONSTRAINT `atc_quotes_quoteId_unique` UNIQUE(`quoteId`)
);

CREATE TABLE `atc_fee_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feeId` varchar(64) NOT NULL,
	`quoteId` varchar(64) NOT NULL,
	`actionId` varchar(64) NOT NULL,
	`idempotencyKey` varchar(128) NOT NULL,
	`requestFingerprint` varchar(128) NOT NULL,
	`status` varchar(16) NOT NULL,
	`totalAtomic` varchar(80) NOT NULL,
	`operatorRewardAtomic` varchar(80) NOT NULL,
	`burnAtomic` varchar(80) NOT NULL,
	`treasuryAtomic` varchar(80) NOT NULL,
	`paymentReference` varchar(256),
	`protocolReference` varchar(256),
	`feeJson` text NOT NULL,
	`settledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `atc_fee_ledger_id` PRIMARY KEY(`id`),
	CONSTRAINT `atc_fee_ledger_feeId_unique` UNIQUE(`feeId`),
	CONSTRAINT `atc_fee_ledger_actionId_unique` UNIQUE(`actionId`),
	CONSTRAINT `atc_fee_ledger_idempotencyKey_unique` UNIQUE(`idempotencyKey`)
);

CREATE TABLE `atc_operator_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rewardId` varchar(64) NOT NULL,
	`feeId` varchar(64) NOT NULL,
	`actionId` varchar(64) NOT NULL,
	`operatorId` varchar(64) NOT NULL,
	`amountAtomic` varchar(80) NOT NULL,
	`status` varchar(16) NOT NULL,
	`rewardJson` text NOT NULL,
	`claimedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `atc_operator_rewards_id` PRIMARY KEY(`id`),
	CONSTRAINT `atc_operator_rewards_rewardId_unique` UNIQUE(`rewardId`)
);

CREATE TABLE `atc_action_receipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`receiptId` varchar(64) NOT NULL,
	`actionId` varchar(64) NOT NULL,
	`quoteId` varchar(64) NOT NULL,
	`feeId` varchar(64) NOT NULL,
	`status` varchar(16) NOT NULL,
	`paymentReference` varchar(256) NOT NULL,
	`protocolReference` varchar(256),
	`totalAtomic` varchar(80) NOT NULL,
	`receiptJson` text NOT NULL,
	`settledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `atc_action_receipts_id` PRIMARY KEY(`id`),
	CONSTRAINT `atc_action_receipts_receiptId_unique` UNIQUE(`receiptId`),
	CONSTRAINT `atc_action_receipts_actionId_unique` UNIQUE(`actionId`)
);
