ALTER TABLE "auth"."session" DROP CONSTRAINT "session_qr_code_id_fairteiler_qr_code_id_fk";
--> statement-breakpoint
ALTER TABLE "auth"."session" DROP COLUMN "qr_code_id";