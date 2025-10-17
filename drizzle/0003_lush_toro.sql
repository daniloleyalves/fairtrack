CREATE TABLE "fairteiler_category" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fairteiler_id" text NOT NULL,
	"category_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fairteiler_company" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fairteiler_id" text NOT NULL,
	"company_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fairteiler_origin" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fairteiler_id" text NOT NULL,
	"origin_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fairteiler_category" ADD CONSTRAINT "fairteiler_category_fairteiler_id_fairteiler_id_fk" FOREIGN KEY ("fairteiler_id") REFERENCES "auth"."fairteiler"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fairteiler_category" ADD CONSTRAINT "fairteiler_category_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fairteiler_company" ADD CONSTRAINT "fairteiler_company_fairteiler_id_fairteiler_id_fk" FOREIGN KEY ("fairteiler_id") REFERENCES "auth"."fairteiler"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fairteiler_company" ADD CONSTRAINT "fairteiler_company_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fairteiler_origin" ADD CONSTRAINT "fairteiler_origin_fairteiler_id_fairteiler_id_fk" FOREIGN KEY ("fairteiler_id") REFERENCES "auth"."fairteiler"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fairteiler_origin" ADD CONSTRAINT "fairteiler_origin_origin_id_origin_id_fk" FOREIGN KEY ("origin_id") REFERENCES "public"."origin"("id") ON DELETE cascade ON UPDATE no action;