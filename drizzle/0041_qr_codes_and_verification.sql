CREATE TYPE "public"."verification_method" AS ENUM('qr', 'location', 'staff');--> statement-breakpoint
CREATE TABLE "fairteiler_qr_code" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fairteiler_id" text NOT NULL,
	"token" text NOT NULL,
	"label" text,
	"guest_access_view_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
DROP VIEW "public"."v_contributions";--> statement-breakpoint
ALTER TABLE "checkin" ADD COLUMN "verified_via" "verification_method";--> statement-breakpoint
ALTER TABLE "fairteiler_qr_code" ADD CONSTRAINT "fairteiler_qr_code_fairteiler_id_fairteiler_id_fk" FOREIGN KEY ("fairteiler_id") REFERENCES "auth"."fairteiler"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fairteiler_qr_code" ADD CONSTRAINT "fairteiler_qr_code_guest_access_view_id_user_id_fk" FOREIGN KEY ("guest_access_view_id") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "fairteiler_qr_code_token_idx" ON "fairteiler_qr_code" USING btree ("token");--> statement-breakpoint
CREATE INDEX "fairteiler_qr_code_fairteiler_id_idx" ON "fairteiler_qr_code" USING btree ("fairteiler_id");--> statement-breakpoint
CREATE VIEW "public"."v_contributions" AS (
    SELECT
        c.id AS checkin_id,
        c.fairteiler_id AS fairteiler_id,
        c.created_at AS contribution_date,
        c.user_id AS user_id,
        c.quantity AS quantity,
        c.shelf_life AS shelf_life,
        c.verified_via AS verified_via,
        f.id AS food_id,
        f.title AS food_title,
        f.cool AS food_cool,
        f.allergens AS food_allergens,
        f.comment AS food_comment,
        f.company AS food_company,
        u.name AS user_name,
        u.email AS user_email,
        u.image AS user_image,
        u.is_anonymous AS user_is_anonymous,
        ft.name AS fairteiler_name,
        cat.id AS category_id,
        cat.name AS category_name,
        cat.image AS category_image,
        o.id AS origin_id,
        o.name AS origin_name,
        comp.id AS company_id,
        comp.name AS company_name
    FROM
        "checkin" c 
    LEFT JOIN
        auth."user" u ON c.user_id = u.id 
    LEFT JOIN
        auth.fairteiler ft ON c.fairteiler_id = ft.id
    LEFT JOIN
        "food" f ON c.food_id = f.id 
    LEFT JOIN
        "category" cat ON f.category_id = cat.id
    LEFT JOIN
        "origin" o ON f.origin_id = o.id 
    LEFT JOIN
        "company" comp ON f.company_id = comp.id
);