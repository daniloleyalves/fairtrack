ALTER TABLE "gamification"."level_events" RENAME TO "experience_level_events";--> statement-breakpoint
ALTER TABLE "gamification"."levels" RENAME TO "experienceLevels";--> statement-breakpoint
ALTER TABLE "gamification"."experience_level_events" DROP CONSTRAINT "level_events_level_id_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "gamification"."experience_level_events" DROP CONSTRAINT "level_events_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "gamification"."experience_level_events" ADD CONSTRAINT "experience_level_events_level_id_experienceLevels_id_fk" FOREIGN KEY ("level_id") REFERENCES "gamification"."experienceLevels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification"."experience_level_events" ADD CONSTRAINT "experience_level_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_preferences_user_id_idx" ON "auth"."user_preferences" USING btree ("user_id");