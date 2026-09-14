CREATE TABLE `challenge_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` varchar(64) NOT NULL DEFAULT '7day-web3-challenge',
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`daysCompleted` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `challenge_enrollments_id` PRIMARY KEY(`id`)
);
