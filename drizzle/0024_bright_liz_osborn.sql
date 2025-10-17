ALTER TABLE "checkin" DROP CONSTRAINT "checkin_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "checkin" DROP CONSTRAINT "checkin_fairteiler_id_fairteiler_id_fk";
--> statement-breakpoint
ALTER TABLE "gamification"."experience_level_events" DROP CONSTRAINT "experience_level_events_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "gamification"."milestone_events" DROP CONSTRAINT "milestone_events_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "gamification"."onboarding_steps_events" DROP CONSTRAINT "onboarding_steps_events_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "gamification"."quest_badge_events" DROP CONSTRAINT "quest_badge_events_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "checkin" ADD CONSTRAINT "checkin_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkin" ADD CONSTRAINT "checkin_fairteiler_id_fairteiler_id_fk" FOREIGN KEY ("fairteiler_id") REFERENCES "auth"."fairteiler"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification"."experience_level_events" ADD CONSTRAINT "experience_level_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification"."milestone_events" ADD CONSTRAINT "milestone_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification"."onboarding_steps_events" ADD CONSTRAINT "onboarding_steps_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification"."quest_badge_events" ADD CONSTRAINT "quest_badge_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;