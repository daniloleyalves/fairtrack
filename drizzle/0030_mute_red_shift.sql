CREATE TABLE "fairteiler_tutorial" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fairteiler_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fairteiler_tutorial_step" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutorial_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"icon_name" text,
	"sort_index" integer NOT NULL,
	"can_skip" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gamification"."experience_levels" RENAME COLUMN "sort_order" TO "sort_index";--> statement-breakpoint
ALTER TABLE "fairteiler_tutorial" ADD CONSTRAINT "fairteiler_tutorial_fairteiler_id_fairteiler_id_fk" FOREIGN KEY ("fairteiler_id") REFERENCES "auth"."fairteiler"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fairteiler_tutorial" ADD CONSTRAINT "fairteiler_tutorial_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fairteiler_tutorial_step" ADD CONSTRAINT "fairteiler_tutorial_step_tutorial_id_fairteiler_tutorial_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "public"."fairteiler_tutorial"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fairteiler_tutorial_fairteiler_id_idx" ON "fairteiler_tutorial" USING btree ("fairteiler_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fairteiler_tutorial_unique" ON "fairteiler_tutorial" USING btree ("fairteiler_id");--> statement-breakpoint
CREATE INDEX "fairteiler_tutorial_step_tutorial_id_idx" ON "fairteiler_tutorial_step" USING btree ("tutorial_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tutorial_step_order_unique" ON "fairteiler_tutorial_step" USING btree ("tutorial_id","sort_index");