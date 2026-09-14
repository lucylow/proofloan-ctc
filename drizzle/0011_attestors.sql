CREATE TABLE `attestor_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operatorId` varchar(96) NOT NULL,
	`environment` varchar(32) NOT NULL,
	`status` varchar(16) NOT NULL,
	`payoutAddress` varchar(128) NOT NULL,
	`stakeAtomic` varchar(80) NOT NULL,
	`weightBps` int NOT NULL,
	`profileJson` text NOT NULL,
	`lastSeenAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attestor_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `attestor_profiles_operatorId_unique` UNIQUE(`operatorId`)
);

CREATE TABLE `attestor_certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`certificateId` varchar(80) NOT NULL,
	`environment` varchar(32) NOT NULL,
	`sourceChain` varchar(64) NOT NULL,
	`sourceBlock` int NOT NULL,
	`digest` varchar(128) NOT NULL,
	`certificateJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attestor_certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `attestor_certificates_certificateId_unique` UNIQUE(`certificateId`)
);

CREATE TABLE `attestor_faults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`faultId` varchar(80) NOT NULL,
	`operatorId` varchar(96) NOT NULL,
	`sourceChain` varchar(64) NOT NULL,
	`category` varchar(48) NOT NULL,
	`severity` varchar(16) NOT NULL,
	`evidenceDigest` varchar(128) NOT NULL,
	`slashBps` int,
	`faultJson` text NOT NULL,
	`detectedAt` timestamp NOT NULL,
	`confirmedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attestor_faults_id` PRIMARY KEY(`id`),
	CONSTRAINT `attestor_faults_faultId_unique` UNIQUE(`faultId`)
);

CREATE TABLE `attestor_reward_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ledgerId` varchar(160) NOT NULL,
	`feeId` varchar(64) NOT NULL,
	`operatorId` varchar(96) NOT NULL,
	`activity` varchar(32) NOT NULL,
	`amountAtomic` varchar(80) NOT NULL,
	`status` varchar(16) NOT NULL,
	`rewardJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attestor_reward_ledger_id` PRIMARY KEY(`id`),
	CONSTRAINT `attestor_reward_ledger_ledgerId_unique` UNIQUE(`ledgerId`)
);

CREATE TABLE `attestor_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(80) NOT NULL,
	`eventType` varchar(48) NOT NULL,
	`digest` varchar(128) NOT NULL,
	`eventJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attestor_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `attestor_events_eventId_unique` UNIQUE(`eventId`)
);
