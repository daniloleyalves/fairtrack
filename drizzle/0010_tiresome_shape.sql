CREATE UNIQUE INDEX "account_user_id_idx" ON "auth"."account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "checkin_user_id_idx" ON "checkin" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "checkin_fairteiler_id_idx" ON "checkin" USING btree ("fairteiler_id");--> statement-breakpoint
CREATE UNIQUE INDEX "checkin_food_id_idx" ON "checkin" USING btree ("food_id");--> statement-breakpoint
CREATE INDEX "company_origin_id_idx" ON "company" USING btree ("origin_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fairteiler_slug_idx" ON "auth"."fairteiler" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "fairteiler_category_fairteiler_id_idx" ON "fairteiler_category" USING btree ("fairteiler_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fairteiler_category_category_id_idx" ON "fairteiler_category" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_fairteiler_category_idx" ON "fairteiler_category" USING btree ("fairteiler_id","category_id");--> statement-breakpoint
CREATE INDEX "fairteiler_company_fairteiler_id_idx" ON "fairteiler_company" USING btree ("fairteiler_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fairteiler_company_company_id_idx" ON "fairteiler_company" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_fairteiler_company_idx" ON "fairteiler_company" USING btree ("fairteiler_id","company_id");--> statement-breakpoint
CREATE INDEX "fairteiler_origin_fairteiler_id_idx" ON "fairteiler_origin" USING btree ("fairteiler_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fairteiler_origin_origin_id_idx" ON "fairteiler_origin" USING btree ("origin_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_fairteiler_origin_idx" ON "fairteiler_origin" USING btree ("fairteiler_id","origin_id");--> statement-breakpoint
CREATE INDEX "food_origin_id_idx" ON "food" USING btree ("origin_id");--> statement-breakpoint
CREATE INDEX "food_category_id_idx" ON "food" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "food_company_id_idx" ON "food" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "member_organization_id_idx" ON "auth"."member" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_user_id_idx" ON "auth"."member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_organization_user_idx" ON "auth"."member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "tag_fairteiler_id_idx" ON "auth"."tag" USING btree ("fairteiler_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "auth"."user" USING btree ("email");