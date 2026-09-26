CREATE TABLE "ai_usage" (
	"user_id" uuid NOT NULL,
	"day" date NOT NULL,
	"requests" integer DEFAULT 0 NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ai_usage_user_id_day_pk" PRIMARY KEY("user_id","day")
);
--> statement-breakpoint
CREATE TABLE "can_do_progress" (
	"user_id" uuid NOT NULL,
	"can_do_id" text NOT NULL,
	"demonstrated_at" timestamp with time zone NOT NULL,
	"evidence" text NOT NULL,
	CONSTRAINT "can_do_progress_user_id_can_do_id_pk" PRIMARY KEY("user_id","can_do_id")
);
--> statement-breakpoint
CREATE TABLE "conversation_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" text NOT NULL,
	"text" text NOT NULL,
	"translation" text,
	"feedback" jsonb,
	"glossary" jsonb,
	"input_mode" text,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mode" text NOT NULL,
	"persona_id" text,
	"scenario_id" text,
	"level" text NOT NULL,
	"title" text NOT NULL,
	"engine_state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_stats" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"sentences_produced" integer DEFAULT 0 NOT NULL,
	"words_produced" integer DEFAULT 0 NOT NULL,
	"speaking_turns" integer DEFAULT 0 NOT NULL,
	"voice_turns" integer DEFAULT 0 NOT NULL,
	"reviews_done" integer DEFAULT 0 NOT NULL,
	"listening_completed" integer DEFAULT 0 NOT NULL,
	"sentences_by_day" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"active_days" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_event_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"seq" bigserial NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"device_id" text,
	CONSTRAINT "learning_events_seq_unique" UNIQUE("seq")
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"user_id" uuid NOT NULL,
	"lesson_id" text NOT NULL,
	"status" text NOT NULL,
	"steps_completed" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"best_score" real,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "lesson_progress_user_id_lesson_id_pk" PRIMARY KEY("user_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "mistake_pattern_stats" (
	"user_id" uuid NOT NULL,
	"pattern_id" text NOT NULL,
	"category" text NOT NULL,
	"occurrences" integer NOT NULL,
	"drill_attempts" integer NOT NULL,
	"drill_correct" integer NOT NULL,
	"errors_by_day" jsonb NOT NULL,
	"drills_by_day" jsonb NOT NULL,
	"first_seen_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone NOT NULL,
	CONSTRAINT "mistake_pattern_stats_user_id_pattern_id_pk" PRIMARY KEY("user_id","pattern_id")
);
--> statement-breakpoint
CREATE TABLE "mistakes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"pattern_id" text NOT NULL,
	"category" text NOT NULL,
	"original" text NOT NULL,
	"correction" text NOT NULL,
	"explanation" text NOT NULL,
	"source" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"family_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"replaced_by" uuid,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "skill_estimates" (
	"user_id" uuid NOT NULL,
	"skill" text NOT NULL,
	"rating" real NOT NULL,
	"evidence_count" integer NOT NULL,
	"history" jsonb NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "skill_estimates_user_id_skill_pk" PRIMARY KEY("user_id","skill")
);
--> statement-breakpoint
CREATE TABLE "srs_cards" (
	"user_id" uuid NOT NULL,
	"item_id" text NOT NULL,
	"state" smallint NOT NULL,
	"stability" real NOT NULL,
	"difficulty" real NOT NULL,
	"reps" integer NOT NULL,
	"lapses" integer NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"last_review_at" timestamp with time zone,
	"source" text NOT NULL,
	CONSTRAINT "srs_cards_user_id_item_id_pk" PRIMARY KEY("user_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "tts_cache" (
	"key" text PRIMARY KEY NOT NULL,
	"voice" text NOT NULL,
	"rate" real NOT NULL,
	"text" text NOT NULL,
	"content_type" text NOT NULL,
	"storage_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"goals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"region" text DEFAULT 'nl' NOT NULL,
	"self_reported_level" text DEFAULT 'A0' NOT NULL,
	"daily_minutes" integer DEFAULT 10 NOT NULL,
	"native_language" text DEFAULT 'en' NOT NULL,
	"correction_style" text DEFAULT 'gentle' NOT NULL,
	"speech_rate" real DEFAULT 1 NOT NULL,
	"onboarded_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "can_do_progress" ADD CONSTRAINT "can_do_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_stats" ADD CONSTRAINT "learner_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_events" ADD CONSTRAINT "learning_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mistake_pattern_stats" ADD CONSTRAINT "mistake_pattern_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mistakes" ADD CONSTRAINT "mistakes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_estimates" ADD CONSTRAINT "skill_estimates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_cards" ADD CONSTRAINT "srs_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversation_messages_conv_idx" ON "conversation_messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "conversations_user_idx" ON "conversations" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "learning_events_user_seq_idx" ON "learning_events" USING btree ("user_id","seq");--> statement-breakpoint
CREATE INDEX "mistakes_user_pattern_idx" ON "mistakes" USING btree ("user_id","pattern_id","occurred_at");--> statement-breakpoint
CREATE INDEX "refresh_tokens_family_idx" ON "refresh_tokens" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_idx" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "srs_cards_due_idx" ON "srs_cards" USING btree ("user_id","due_at");