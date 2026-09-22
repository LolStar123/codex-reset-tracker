CREATE TABLE `raw_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`value` text NOT NULL,
	`collected_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reset_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_date` text NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reset_events_date` ON `reset_events` (`event_date`);