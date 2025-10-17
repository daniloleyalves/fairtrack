CREATE TABLE "company" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image" text,
	"attachment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."tags" RENAME TO "tag";--> statement-breakpoint
ALTER TABLE "auth"."tag" DROP CONSTRAINT "tags_fairteiler_id_fairteiler_id_fk";
--> statement-breakpoint
ALTER TABLE "auth"."tag" ADD CONSTRAINT "tag_fairteiler_id_fairteiler_id_fk" FOREIGN KEY ("fairteiler_id") REFERENCES "auth"."fairteiler"("id") ON DELETE cascade ON UPDATE no action;