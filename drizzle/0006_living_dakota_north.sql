ALTER TABLE "checkin" ADD COLUMN "shelf_life" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "food" DROP COLUMN "shelf_life";