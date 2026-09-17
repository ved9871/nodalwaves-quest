
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`content` text NOT NULL,
	`type` enum('info','event','warning','campaign') NOT NULL DEFAULT 'info',
	`isActive` boolean NOT NULL DEFAULT true,
	`ctaText` varchar(128),
	`ctaLink` varchar(512),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);

CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`icon` varchar(64),
	`color` varchar(32) DEFAULT '#FFD700',
	`criteria` json,
	`xpBonus` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`),
	CONSTRAINT `badges_slug_unique` UNIQUE(`slug`)
);

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

CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`rules` json,
	`rewardDescription` text,
	`startDate` timestamp,
	`endDate` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);

CREATE TABLE `challenge_day_completions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` varchar(64) NOT NULL DEFAULT '7day-web3-challenge',
	`dayNumber` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`completionDate` date NOT NULL,
	`sourceType` enum('quiz','lesson') NOT NULL,
	`sourceId` int NOT NULL,
	CONSTRAINT `challenge_day_completions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_challenge_day_source` UNIQUE(`userId`,`challengeId`,`sourceType`,`sourceId`),
	CONSTRAINT `uq_challenge_day_date` UNIQUE(`userId`,`challengeId`,`completionDate`)
);

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

CREATE TABLE `daily_check_ins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`checkedInAt` timestamp NOT NULL DEFAULT (now()),
	`xpEarned` int NOT NULL DEFAULT 25,
	`streakDay` int NOT NULL DEFAULT 1,
	CONSTRAINT `daily_check_ins_id` PRIMARY KEY(`id`)
);

CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`zoneId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`content` text NOT NULL,
	`topic` enum('nws','staking','lite_node','founder_node','node_vault','treasury','wallet_safety','scam_protection') NOT NULL,
	`xpReward` int NOT NULL DEFAULT 50,
	`order` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`),
	CONSTRAINT `lessons_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `mini_game_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gameType` enum('node_charge','quiz_battle','scam_detector') NOT NULL,
	`score` int NOT NULL,
	`xpEarned` int NOT NULL DEFAULT 0,
	`playedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mini_game_scores_id` PRIMARY KEY(`id`)
);

CREATE TABLE `password_reset_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(256) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`used` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`)
);

CREATE TABLE `quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizId` int NOT NULL,
	`question` text NOT NULL,
	`options` json NOT NULL,
	`correctIndex` int NOT NULL,
	`explanation` text,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);

CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int,
	`zoneId` int,
	`title` varchar(256) NOT NULL,
	`description` text,
	`timeLimitSeconds` int NOT NULL DEFAULT 60,
	`xpReward` int NOT NULL DEFAULT 100,
	`passingScore` int NOT NULL DEFAULT 70,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);

CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredUserId` int NOT NULL,
	`xpBonusGranted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);

CREATE TABLE `user_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_badges_id` PRIMARY KEY(`id`)
);

CREATE TABLE `user_lesson_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`xpEarned` int NOT NULL DEFAULT 0,
	CONSTRAINT `user_lesson_progress_id` PRIMARY KEY(`id`)
);

CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`username` varchar(64),
	`avatarId` varchar(32) DEFAULT 'avatar1',
	`xp` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastCheckIn` timestamp,
	`referralCode` varchar(16),
	`referredBy` int,
	`totalReferrals` int NOT NULL DEFAULT 0,
	`profileSetupDone` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `user_profiles_referralCode_unique` UNIQUE(`referralCode`)
);

CREATE TABLE `user_quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`quizId` int NOT NULL,
	`score` int NOT NULL,
	`xpEarned` int NOT NULL DEFAULT 0,
	`timeTaken` int NOT NULL DEFAULT 0,
	`passed` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_quiz_attempts_id` PRIMARY KEY(`id`)
);

CREATE TABLE `user_zone_unlocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`zoneId` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_zone_unlocks_id` PRIMARY KEY(`id`)
);

CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin','demo_admin') NOT NULL DEFAULT 'user',
	`passwordHash` varchar(256),
	`isTestUser` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

CREATE TABLE `xp_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`value` int NOT NULL,
	`description` varchar(256),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `xp_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `xp_config_key_unique` UNIQUE(`key`)
);

CREATE TABLE `xp_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`source` enum('lesson','quiz','daily_checkin','streak_bonus','badge_bonus','mini_game','referral','admin_grant') NOT NULL,
	`sourceId` int,
	`description` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `xp_logs_id` PRIMARY KEY(`id`)
);

CREATE TABLE `zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`order` int NOT NULL,
	`requiredLevel` int NOT NULL DEFAULT 1,
	`requiredXp` int NOT NULL DEFAULT 0,
	`icon` varchar(64),
	`color` varchar(32),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `zones_id` PRIMARY KEY(`id`),
	CONSTRAINT `zones_slug_unique` UNIQUE(`slug`)
);

