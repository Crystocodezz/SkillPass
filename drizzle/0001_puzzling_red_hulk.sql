CREATE TABLE `skillpass_app_state` (
	`id` varchar(32) NOT NULL,
	`payload` json NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `skillpass_app_state_id` PRIMARY KEY(`id`)
);
