CREATE TYPE "public"."announcement_audience" AS ENUM('fairteiler', 'user');--> statement-breakpoint
CREATE TABLE "announcement" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audience" "announcement_audience" NOT NULL,
	"roles" "member_role"[],
	"fairteiler_id" text,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"highlights" text[],
	"link_url" text,
	"link_label" text,
	"starts_at" timestamp DEFAULT now() NOT NULL,
	"ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcement_dismissal" (
	"announcement_id" text NOT NULL,
	"user_id" text NOT NULL,
	"dismissed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "announcement_dismissal_announcement_id_user_id_pk" PRIMARY KEY("announcement_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_fairteiler_id_fairteiler_id_fk" FOREIGN KEY ("fairteiler_id") REFERENCES "auth"."fairteiler"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_dismissal" ADD CONSTRAINT "announcement_dismissal_announcement_id_announcement_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_dismissal" ADD CONSTRAINT "announcement_dismissal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcement_audience_starts_at_idx" ON "announcement" USING btree ("audience","starts_at");--> statement-breakpoint
INSERT INTO "announcement" ("id", "audience", "roles", "title", "message", "highlights", "ends_at") VALUES (
	'release-1.2.0',
	'fairteiler',
	ARRAY['owner', 'member', 'viewer']::"member_role"[],
	'Neu in FairTrack 1.2',
	'Beiträge mit eigenem Konto brauchen jetzt einen Nachweis vor Ort: einen QR-Scan oder einen geteilten Standort am Fairteiler.',
	ARRAY[
		'QR-Codes für unbetreute Fairteiler: Inhaber:innen erstellen und drucken sie unter Präferenzen. Ein Scan bestätigt 30 Minuten lang, dass man vor Ort ist.',
		'Beiträge mit eigenem Konto werden nur noch gespeichert, wenn ein QR-Scan oder ein geteilter Standort am Fairteiler vorliegt. Bitte informiert eure Foodsaver:innen.',
		'Mit „Beiträge als Gast ermöglichen“ am QR-Code können Gäste ohne Anmeldung beitragen. Ihre Beiträge landen beim gewählten Gastzugang.',
		'Beiträge lassen sich im Retteformular für einen früheren Tag nachtragen, bis zu einem Jahr zurück.',
		'Inhaber:innen können das Passwort eines Zugangs auf der Mitgliederseite zurücksetzen.',
		'Der Verlauf lässt sich nach Zugangsart und Beitragenden filtern.',
		'Erreichte Meilensteine erscheinen im Dashboard als übersichtlicher Stapel.'
	],
	'2026-12-01 00:00:00'
) ON CONFLICT ("id") DO NOTHING;
