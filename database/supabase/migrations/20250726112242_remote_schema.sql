alter table "public"."organisations_on_users" add column "created_at" timestamp(3) without time zone not null default CURRENT_TIMESTAMP;

alter table "public"."warranties" add column "created_by" uuid not null default auth.uid();

alter table "public"."warranties" add column "description" text;

alter table "public"."warranties" add constraint "warranties_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."warranties" validate constraint "warranties_created_by_fkey";


