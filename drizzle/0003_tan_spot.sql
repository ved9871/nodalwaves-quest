CREATE TABLE `challenge_day_completions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` varchar(64) NOT NULL DEFAULT '7day-web3-challenge',
	`dayNumber` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`sourceType` enum('quiz','lesson') NOT NULL,
	`sourceId` int NOT NULL,
	CONSTRAINT `challenge_day_completions_id` PRIMARY KEY(`id`)
);
