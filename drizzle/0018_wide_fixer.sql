CREATE SCHEMA "gamification";
--> statement-breakpoint
CREATE TABLE "gamification"."level_events" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamification"."levels" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer NOT NULL,
	"icon" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamification"."milestone_events" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"milestone_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamification"."milestones" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quantity" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamification"."onboarding_steps" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" integer NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamification"."onboarding_steps_events" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"onboarding_step_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamification"."quest_badge_events" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quest_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamification"."quests" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"goal_quantity" real NOT NULL,
	"start" timestamp NOT NULL,
	"end" timestamp NOT NULL,
	"current_quantity" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "step_flow_events" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flow_id" text NOT NULL,
	"step_id" text NOT NULL,
	"user_id" text NOT NULL,
	"event_type" text NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "step_flow_progress" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flow_id" text NOT NULL,
	"user_id" text NOT NULL,
	"current_step_index" integer DEFAULT 0 NOT NULL,
	"completed_steps" jsonb DEFAULT '[]' NOT NULL,
	"skipped_steps" jsonb DEFAULT '[]' NOT NULL,
	"step_data" jsonb DEFAULT '{}' NOT NULL,
	"progress" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."user_preferences" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"enable_streaks" boolean DEFAULT true NOT NULL,
	"enable_quests" boolean DEFAULT true NOT NULL,
	"enable_ai_feedback" boolean DEFAULT true NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gamification"."level_events" ADD CONSTRAINT "level_events_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "gamification"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification"."level_events" ADD CONSTRAINT "level_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification"."milestone_events" ADD CONSTRAINT "milestone_events_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "gamification"."milestones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification"."milestone_events" ADD CONSTRAINT "milestone_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification"."onboarding_steps_events" ADD CONSTRAINT "onboarding_steps_events_onboarding_step_id_onboarding_steps_id_fk" FOREIGN KEY ("onboarding_step_id") REFERENCES "gamification"."onboarding_steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification"."onboarding_steps_events" ADD CONSTRAINT "onboarding_steps_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification"."quest_badge_events" ADD CONSTRAINT "quest_badge_events_quest_id_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "gamification"."quests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification"."quest_badge_events" ADD CONSTRAINT "quest_badge_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_flow_events" ADD CONSTRAINT "step_flow_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_flow_progress" ADD CONSTRAINT "step_flow_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."user_preferences" ADD CONSTRAINT "user_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_flow_unique" ON "step_flow_progress" USING btree ("user_id","flow_id");