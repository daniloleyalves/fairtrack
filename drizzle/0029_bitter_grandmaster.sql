CREATE TYPE "public"."feedback_category" AS ENUM('bug', 'feature', 'improvement', 'general');--> statement-breakpoint
CREATE TABLE "user_feedback" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"fairteiler_id" text,
	"category" "feedback_category" NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_feedback" ADD CONSTRAINT "user_feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_feedback" ADD CONSTRAINT "user_feedback_fairteiler_id_fairteiler_id_fk" FOREIGN KEY ("fairteiler_id") REFERENCES "auth"."fairteiler"("id") ON DELETE set null ON UPDATE no action;