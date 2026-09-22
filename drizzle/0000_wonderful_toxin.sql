CREATE TABLE `collection_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text NOT NULL,
	`status` text NOT NULL,
	`post_count` integer NOT NULL,
	`error` text
);
--> statement-breakpoint
CREATE TABLE `monitor_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`published_at` text NOT NULL,
	`category` text NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_posts_published_at` ON `posts` (`published_at`);