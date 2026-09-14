CREATE TABLE `password_reset_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(256) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`used` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','demo_admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `challenge_day_completions` ADD `completionDate` date NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(256);--> statement-breakpoint
ALTER TABLE `challenge_day_completions` ADD CONSTRAINT `uq_challenge_day_date` UNIQUE(`userId`,`challengeId`,`completionDate`);