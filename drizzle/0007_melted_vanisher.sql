CREATE TABLE `beta_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`issueType` enum('bug','suggestion','confusing_text','mobile_issue','game_issue') NOT NULL,
	`pageOrSection` varchar(128),
	`message` text NOT NULL,
	`screenshotNote` text,
	`deviceType` varchar(64),
	`browser` varchar(64),
	`status` enum('new','reviewed','resolved','dismissed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `beta_feedback_id` PRIMARY KEY(`id`)
);
