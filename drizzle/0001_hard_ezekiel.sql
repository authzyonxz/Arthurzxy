CREATE TABLE `custom_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionToken` varchar(255) NOT NULL,
	`role` enum('admin','reseller') NOT NULL,
	`resellerId` int,
	`expiresAt` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `custom_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `custom_sessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `generated_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resellerId` int NOT NULL,
	`keyValue` varchar(128) NOT NULL,
	`keyType` enum('1h','1d','7d','30d','999d') NOT NULL,
	`creditsUsed` int NOT NULL DEFAULT 1,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `key_stock` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyValue` varchar(128) NOT NULL,
	`keyType` enum('1h','1d','7d','30d','999d') NOT NULL,
	`isUsed` int NOT NULL DEFAULT 0,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `key_stock_id` PRIMARY KEY(`id`),
	CONSTRAINT `key_stock_keyValue_unique` UNIQUE(`keyValue`)
);
--> statement-breakpoint
CREATE TABLE `resellers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(64) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`credits` int NOT NULL DEFAULT 0,
	`status` enum('active','paused') NOT NULL DEFAULT 'active',
	`totalKeysGenerated` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resellers_id` PRIMARY KEY(`id`),
	CONSTRAINT `resellers_username_unique` UNIQUE(`username`)
);
