ALTER TABLE "auth"."user_preferences" DROP CONSTRAINT "user_preferences_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "auth"."user_preferences" ADD CONSTRAINT "user_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;