ALTER TABLE "step_flow_progress" DROP CONSTRAINT "step_flow_progress_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "step_flow_progress" ADD CONSTRAINT "step_flow_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;