ALTER TABLE "auth"."user" RENAME COLUMN "first_login" TO "is_first_login";--> statement-breakpoint
ALTER TABLE "auth"."user_preferences" DROP COLUMN "is_anonymous";