CREATE TABLE "contribution_version_history" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"checkin_id" text NOT NULL,
	"fairteiler_id" text NOT NULL,
	"user_id" text NOT NULL,
	"prev_value" text NOT NULL,
	"new_value" text NOT NULL,
	"field" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contribution_version_history" ADD CONSTRAINT "contribution_version_history_checkin_id_checkin_id_fk" FOREIGN KEY ("checkin_id") REFERENCES "public"."checkin"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribution_version_history" ADD CONSTRAINT "contribution_version_history_fairteiler_id_fairteiler_id_fk" FOREIGN KEY ("fairteiler_id") REFERENCES "auth"."fairteiler"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribution_version_history" ADD CONSTRAINT "contribution_version_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;