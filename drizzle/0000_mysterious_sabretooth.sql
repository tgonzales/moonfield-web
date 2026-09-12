CREATE TABLE "artifact_access_event" (
	"id" text PRIMARY KEY NOT NULL,
	"artifact_id" text NOT NULL,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" text
);
--> statement-breakpoint
CREATE TABLE "artifact" (
	"artifact_id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"release_handle" text NOT NULL,
	"track_title" text,
	"campaign" text,
	"status" text DEFAULT 'GENERATED' NOT NULL,
	"edition_number" integer,
	"edition_of" integer,
	"owner_customer_id" text,
	"first_access_at" timestamp with time zone,
	"last_access_at" timestamp with time zone,
	"access_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"audio_key" text,
	"video_key" text,
	"story_key" text,
	"credits_key" text,
	"lyrics_key" text,
	"visual_keys" jsonb,
	CONSTRAINT "artifact_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "artifact_access_event" ADD CONSTRAINT "artifact_access_event_artifact_id_artifact_artifact_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifact"("artifact_id") ON DELETE cascade ON UPDATE no action;