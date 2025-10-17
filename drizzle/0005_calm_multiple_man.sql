ALTER TABLE "foods" RENAME TO "food";--> statement-breakpoint
ALTER TABLE "checkin" DROP CONSTRAINT "checkin_food_id_foods_id_fk";
--> statement-breakpoint
ALTER TABLE "food" DROP CONSTRAINT "foods_origin_id_origin_id_fk";
--> statement-breakpoint
ALTER TABLE "food" DROP CONSTRAINT "foods_category_id_category_id_fk";
--> statement-breakpoint
ALTER TABLE "food" DROP CONSTRAINT "foods_company_id_company_id_fk";
--> statement-breakpoint
ALTER TABLE "checkin" ADD CONSTRAINT "checkin_food_id_food_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."food"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food" ADD CONSTRAINT "food_origin_id_origin_id_fk" FOREIGN KEY ("origin_id") REFERENCES "public"."origin"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food" ADD CONSTRAINT "food_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food" ADD CONSTRAINT "food_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;