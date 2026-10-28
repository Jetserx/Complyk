CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`record_id` text NOT NULL,
	`action` text NOT NULL,
	`actor` text NOT NULL,
	`at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_activity_workspace_at` ON `activity` (`workspace_id`,`at`);--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`owner` text DEFAULT '' NOT NULL,
	`reference` text DEFAULT '' NOT NULL,
	`due_date` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_records_workspace_kind` ON `records` (`workspace_id`,`kind`);--> statement-breakpoint
CREATE INDEX `idx_records_workspace_due` ON `records` (`workspace_id`,`due_date`);