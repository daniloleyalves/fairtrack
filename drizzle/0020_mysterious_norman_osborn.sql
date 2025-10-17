ALTER TABLE "step_flow_events" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "step_flow_events" CASCADE;--> statement-breakpoint
ALTER TABLE "gamification"."experienceLevels" RENAME TO "experience_levels";--> statement-breakpoint
ALTER TABLE "gamification"."experience_level_events" DROP CONSTRAINT "experience_level_events_level_id_experienceLevels_id_fk";
--> statement-breakpoint
ALTER TABLE "gamification"."experience_level_events" ADD CONSTRAINT "experience_level_events_level_id_experience_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "gamification"."experience_levels"("id") ON DELETE no action ON UPDATE no action;