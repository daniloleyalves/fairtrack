ALTER TABLE "checkin" DROP CONSTRAINT "checkin_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "checkin" DROP CONSTRAINT "checkin_fairteiler_id_fairteiler_id_fk";
--> statement-breakpoint
ALTER TABLE "checkin" DROP CONSTRAINT "checkin_food_id_food_id_fk";
--> statement-breakpoint
ALTER TABLE "contribution_version_history" DROP CONSTRAINT "contribution_version_history_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "food" DROP CONSTRAINT "food_origin_id_origin_id_fk";
--> statement-breakpoint
ALTER TABLE "food" DROP CONSTRAINT "food_category_id_category_id_fk";
--> statement-breakpoint
ALTER TABLE "checkin" ALTER COLUMN "user_id" SET DEFAULT 'unidentified';--> statement-breakpoint
ALTER TABLE "checkin" ALTER COLUMN "fairteiler_id" SET DEFAULT 'unidentified';--> statement-breakpoint
ALTER TABLE "contribution_version_history" ALTER COLUMN "user_id" SET DEFAULT 'unidentified';--> statement-breakpoint
ALTER TABLE "checkin" ADD CONSTRAINT "checkin_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkin" ADD CONSTRAINT "checkin_fairteiler_id_fairteiler_id_fk" FOREIGN KEY ("fairteiler_id") REFERENCES "auth"."fairteiler"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkin" ADD CONSTRAINT "checkin_food_id_food_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."food"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribution_version_history" ADD CONSTRAINT "contribution_version_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food" ADD CONSTRAINT "food_origin_id_origin_id_fk" FOREIGN KEY ("origin_id") REFERENCES "public"."origin"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food" ADD CONSTRAINT "food_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;