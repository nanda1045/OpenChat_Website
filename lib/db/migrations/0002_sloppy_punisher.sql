ALTER TABLE "profiles" ADD COLUMN "api_key" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_api_key_unique" UNIQUE("api_key");