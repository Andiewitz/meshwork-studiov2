CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"user_id" text,
	"parent_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "edges" (
	"id" text NOT NULL,
	"workspace_id" integer NOT NULL,
	"source" text NOT NULL,
	"target" text NOT NULL,
	"source_handle" text,
	"target_handle" text,
	"type" text,
	"data" jsonb,
	"style" jsonb,
	"marker_end" jsonb,
	"animated" integer DEFAULT 0,
	CONSTRAINT "edges_id_workspace_id_pk" PRIMARY KEY("id","workspace_id")
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"failed" integer DEFAULT 0 NOT NULL,
	"last_attempt" timestamp DEFAULT now() NOT NULL,
	"locked_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metrics_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"captured_at" timestamp DEFAULT now() NOT NULL,
	"total_requests" real DEFAULT 0 NOT NULL,
	"request_rate" real DEFAULT 0 NOT NULL,
	"avg_duration_ms" real DEFAULT 0 NOT NULL,
	"memory_mb" real DEFAULT 0 NOT NULL,
	"cpu_seconds" real DEFAULT 0 NOT NULL,
	"event_loop_lag_ms" real DEFAULT 0 NOT NULL,
	"ws_connections" integer DEFAULT 0 NOT NULL,
	"ws_rooms" integer DEFAULT 0 NOT NULL,
	"ai_requests" real DEFAULT 0 NOT NULL,
	"total_users" integer DEFAULT 0 NOT NULL,
	"new_users_today" integer DEFAULT 0 NOT NULL,
	"active_users_24h" integer DEFAULT 0 NOT NULL,
	"logins_today" integer DEFAULT 0 NOT NULL,
	"total_workspaces" integer DEFAULT 0 NOT NULL,
	"total_teams" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nodes" (
	"id" text NOT NULL,
	"workspace_id" integer NOT NULL,
	"type" text,
	"position" jsonb NOT NULL,
	"data" jsonb NOT NULL,
	"parent_id" text,
	"extent" text,
	"style" jsonb,
	"width" integer,
	"height" integer,
	"measured" jsonb,
	CONSTRAINT "nodes_id_workspace_id_pk" PRIMARY KEY("id","workspace_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar(16) DEFAULT 'editor' NOT NULL,
	"color" varchar(7) NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_workspaces" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" varchar NOT NULL,
	"workspace_id" integer NOT NULL,
	"shared_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(64) NOT NULL,
	"invite_code" varchar(8) NOT NULL,
	"owner_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "teams_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "user_api_keys" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"encrypted_key" text NOT NULL,
	"iv" text NOT NULL,
	"auth_tag" text NOT NULL,
	"key_hint" varchar(10),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"password_hash" varchar,
	"auth_provider" varchar DEFAULT 'email' NOT NULL,
	"has_notified_team" boolean DEFAULT false,
	"read_notification_ids" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'system' NOT NULL,
	"icon" text DEFAULT 'box',
	"is_favorite" boolean DEFAULT false,
	"user_id" text,
	"collection_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"description" text,
	"author" text,
	"ai_context" text,
	"groups" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
ALTER TABLE "edges" ADD CONSTRAINT "edges_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_workspaces" ADD CONSTRAINT "team_workspaces_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_workspaces" ADD CONSTRAINT "team_workspaces_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_api_keys" ADD CONSTRAINT "user_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_edges_workspace_id" ON "edges" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "IDX_login_attempts_email" ON "login_attempts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "IDX_login_attempts_locked_until" ON "login_attempts" USING btree ("locked_until");--> statement-breakpoint
CREATE INDEX "IDX_metrics_snapshots_captured_at" ON "metrics_snapshots" USING btree ("captured_at");--> statement-breakpoint
CREATE INDEX "IDX_nodes_workspace_id" ON "nodes" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "IDX_team_members_team_id" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "IDX_team_members_user_id" ON "team_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "UQ_team_members_team_user" ON "team_members" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE INDEX "IDX_team_workspaces_team_id" ON "team_workspaces" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "IDX_team_workspaces_workspace_id" ON "team_workspaces" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "UQ_team_workspaces_team_ws" ON "team_workspaces" USING btree ("team_id","workspace_id");--> statement-breakpoint
CREATE INDEX "IDX_teams_invite_code" ON "teams" USING btree ("invite_code");--> statement-breakpoint
CREATE INDEX "IDX_teams_owner_id" ON "teams" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "IDX_user_api_keys_user_id" ON "user_api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_user_api_keys_provider" ON "user_api_keys" USING btree ("provider");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_api_keys_one_active_per_provider" ON "user_api_keys" USING btree ("user_id","provider") WHERE is_active = true;