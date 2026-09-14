ALTER TABLE `verified_facts`
	ADD `chainKey` int,
	ADD `txIndex` int,
	ADD `environment` varchar(32),
	ADD `receiptStatus` varchar(8),
	ADD `merkleProofHash` varchar(128),
	ADD `continuityProofHash` varchar(128),
	ADD `verificationStatus` varchar(16),
	ADD `confirmations` int,
	ADD `requestHash` varchar(128);

CREATE TABLE `attestcoin_proof_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestHash` varchar(128) NOT NULL,
	`requestId` varchar(128) NOT NULL,
	`environment` varchar(32) NOT NULL,
	`sourceChain` varchar(48) NOT NULL,
	`chainKey` int NOT NULL,
	`sourceBlock` int NOT NULL,
	`txHash` varchar(128) NOT NULL,
	`txIndex` int NOT NULL,
	`proofRoot` varchar(128) NOT NULL,
	`merkleProofHash` varchar(128) NOT NULL,
	`continuityProofHash` varchar(128) NOT NULL,
	`receiptStatus` varchar(8) NOT NULL,
	`verificationStatus` varchar(16) NOT NULL,
	`freshness` varchar(16) NOT NULL,
	`confirmations` int NOT NULL,
	`confirmationDepth` int NOT NULL,
	`verificationBlock` int NOT NULL,
	`recordJson` text NOT NULL,
	`verifiedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attestcoin_proof_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `attestcoin_proof_records_requestHash_unique` UNIQUE(`requestHash`)
);

CREATE TABLE `attestcoin_proof_idempotency` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestHash` varchar(128) NOT NULL,
	`requestId` varchar(128) NOT NULL,
	`status` varchar(16) NOT NULL,
	`proofRoot` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attestcoin_proof_idempotency_id` PRIMARY KEY(`id`),
	CONSTRAINT `attestcoin_proof_idempotency_requestHash_unique` UNIQUE(`requestHash`)
);
