ALTER TABLE "fairteiler_tutorial_step" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "fairteiler_tutorial" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "fairteiler_tutorial_step" DROP COLUMN "icon_name";--> statement-breakpoint
ALTER TABLE "fairteiler_tutorial_step" DROP COLUMN "can_skip";