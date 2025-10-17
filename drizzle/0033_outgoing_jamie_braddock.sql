ALTER TABLE "fairteiler_tutorial" DROP CONSTRAINT "fairteiler_tutorial_created_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "fairteiler_tutorial_step" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "fairteiler_tutorial" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "fairteiler_tutorial_step" DROP COLUMN "description";