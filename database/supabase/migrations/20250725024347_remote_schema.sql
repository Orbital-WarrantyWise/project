ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."OrganisationRole" AS ENUM (
    'Owner',
    'Admin',
    'Member'
);


ALTER TYPE "public"."OrganisationRole" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."_prisma_migrations" (
    "id" character varying(36) NOT NULL,
    "checksum" character varying(64) NOT NULL,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) NOT NULL,
    "logs" "text",
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applied_steps_count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."_prisma_migrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organisations" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" DEFAULT 'Default organisation'::"text",
    "is_custom" boolean DEFAULT false NOT NULL,
    "owner_user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."organisations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."organisations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."organisations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."organisations_id_seq" OWNED BY "public"."organisations"."id";



CREATE TABLE IF NOT EXISTS "public"."organisations_on_users" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "organisation_id" integer NOT NULL,
    "role" "public"."OrganisationRole" DEFAULT 'Member'::"public"."OrganisationRole" NOT NULL
);


ALTER TABLE "public"."organisations_on_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "user_id" "uuid" NOT NULL,
    "email" "text" NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."warranties" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "categories" "text"[],
    "price" "money" NOT NULL,
    "purchase_date" timestamp(3) without time zone NOT NULL,
    "expiration_date" timestamp(3) without time zone NOT NULL,
    "organisation_id" integer NOT NULL,
    "created_at" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."warranties" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."warranties_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."warranties_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."warranties_id_seq" OWNED BY "public"."warranties"."id";



ALTER TABLE ONLY "public"."organisations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."organisations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."warranties" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."warranties_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."_prisma_migrations"
    ADD CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organisations_on_users"
    ADD CONSTRAINT "organisations_on_users_pkey" PRIMARY KEY ("user_id", "organisation_id") DEFERRABLE INITIALLY DEFERRED;



ALTER TABLE ONLY "public"."organisations"
    ADD CONSTRAINT "organisations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."warranties"
    ADD CONSTRAINT "warranties_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE FUNCTION "public"."create_custom_organisation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.organisations_on_users (user_id, organisation_id, role)
  VALUES (new.owner_user_id, new.id, 'Owner');

  RETURN new;
END;
$$;


ALTER FUNCTION "public"."create_custom_organisation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_organisation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  new_organisation_id BIGINT;
BEGIN
  INSERT INTO public.organisations (name, owner_user_id)
  VALUES ('My Organisation', new.id)
  RETURNING id into new_organisation_id;

  INSERT INTO public.users (user_id, email)
  VALUES (new.id, new.email);

  new."raw_user_meta_data" := (coalesce(new."raw_user_meta_data", '{}')::jsonb || 
    jsonb_build_object('default_organisation', new_organisation_id));

  RETURN new;
END;
$$;


ALTER FUNCTION "public"."create_user_organisation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_organisation_ids"() RETURNS TABLE("organisation_id" integer)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT organisation_id FROM organisations_on_users WHERE user_id = (SELECT auth.uid());
$$;


ALTER FUNCTION "public"."get_my_organisation_ids"() OWNER TO "postgres";



CREATE INDEX "organisations_on_users_user_id_organisation_id_idx" ON "public"."organisations_on_users" USING "btree" ("user_id", "organisation_id");



CREATE INDEX "organisations_on_users_user_id_organisation_id_role_idx" ON "public"."organisations_on_users" USING "btree" ("user_id", "organisation_id", "role");



CREATE OR REPLACE TRIGGER "on_organisation_created" AFTER INSERT ON "public"."organisations" FOR EACH ROW EXECUTE FUNCTION "public"."create_custom_organisation"();



ALTER TABLE ONLY "public"."organisations_on_users"
    ADD CONSTRAINT "organisations_on_users_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organisations_on_users"
    ADD CONSTRAINT "organisations_on_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;



ALTER TABLE ONLY "public"."organisations"
    ADD CONSTRAINT "organisations_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;



ALTER TABLE ONLY "public"."warranties"
    ADD CONSTRAINT "warranties_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Enable admins to insert/modify/delete warranties in organisation" ON "public"."warranties" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organisations_on_users"
  WHERE (("organisations_on_users"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("organisations_on_users"."organisation_id" = "warranties"."organisation_id") AND ("organisations_on_users"."role" = ANY (ARRAY['Admin'::"public"."OrganisationRole", 'Owner'::"public"."OrganisationRole"]))))));



CREATE POLICY "Enable admins to add members to organisation" ON "public"."organisations_on_users" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organisations_on_users" "current_user_orgs"
  WHERE (("current_user_orgs"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("current_user_orgs"."organisation_id" = "organisations_on_users"."organisation_id") AND ("current_user_orgs"."role" = 'Admin'::"public"."OrganisationRole") AND ("organisations_on_users"."role" = 'Member'::"public"."OrganisationRole")))));



CREATE POLICY "Enable admins to delete members from organisation" ON "public"."organisations_on_users" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organisations_on_users" "current_user_orgs"
  WHERE (("current_user_orgs"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("current_user_orgs"."organisation_id" = "organisations_on_users"."organisation_id") AND ("current_user_orgs"."role" = 'Admin'::"public"."OrganisationRole") AND ("organisations_on_users"."role" = 'Member'::"public"."OrganisationRole")))));



CREATE POLICY "Enable admins to modify their organisations" ON "public"."organisations" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organisations_on_users"
  WHERE (("organisations_on_users"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("organisations_on_users"."organisation_id" = "organisations"."id") AND ("organisations_on_users"."role" = ANY (ARRAY['Admin'::"public"."OrganisationRole", 'Owner'::"public"."OrganisationRole"]))))));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."organisations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable members to view their organisations" ON "public"."organisations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organisations_on_users"
  WHERE (("organisations_on_users"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("organisations_on_users"."organisation_id" = "organisations"."id")))));



CREATE POLICY "Enable members to view their organisations' warranties" ON "public"."warranties" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organisations_on_users"
  WHERE (("organisations_on_users"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("organisations_on_users"."organisation_id" = "warranties"."organisation_id")))));



CREATE POLICY "Enable owner to add admins to organisation" ON "public"."organisations_on_users" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organisations_on_users" "current_user_orgs"
  WHERE (("current_user_orgs"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("current_user_orgs"."organisation_id" = "organisations_on_users"."organisation_id") AND ("current_user_orgs"."role" = 'Owner'::"public"."OrganisationRole") AND ("organisations_on_users"."role" = ANY (ARRAY['Admin'::"public"."OrganisationRole", 'Member'::"public"."OrganisationRole"]))))));



CREATE POLICY "Enable owner to delete admins from organisation" ON "public"."organisations_on_users" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organisations_on_users" "current_user_orgs"
  WHERE (("current_user_orgs"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("current_user_orgs"."organisation_id" = "organisations_on_users"."organisation_id") AND ("current_user_orgs"."role" = 'Owner'::"public"."OrganisationRole") AND ("organisations_on_users"."role" = ANY (ARRAY['Admin'::"public"."OrganisationRole", 'Member'::"public"."OrganisationRole"]))))));



CREATE POLICY "Enable owners to delete their organisations" ON "public"."organisations" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organisations_on_users"
  WHERE (("organisations_on_users"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("organisations_on_users"."organisation_id" = "organisations"."id") AND ("organisations_on_users"."role" = 'Owner'::"public"."OrganisationRole")))));



CREATE POLICY "Enable users to view their own data only" ON "public"."organisations_on_users" FOR SELECT TO "authenticated" USING (("organisation_id" IN ( SELECT "get_my_organisation_ids"."organisation_id"
   FROM "public"."get_my_organisation_ids"() "get_my_organisation_ids"("organisation_id"))));



CREATE POLICY "View other members from the same organisations" ON "public"."users" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."organisations_on_users" "current_user_orgs"
     JOIN "public"."organisations_on_users" "target_user_orgs" ON (("current_user_orgs"."organisation_id" = "target_user_orgs"."organisation_id")))
  WHERE (("current_user_orgs"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("target_user_orgs"."user_id" = "users"."user_id")))));



ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organisations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organisations_on_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."warranties" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."create_custom_organisation"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_custom_organisation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_custom_organisation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_organisation"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_organisation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_organisation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_organisation_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_organisation_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_organisation_ids"() TO "service_role";


















GRANT ALL ON TABLE "public"."_prisma_migrations" TO "anon";
GRANT ALL ON TABLE "public"."_prisma_migrations" TO "authenticated";
GRANT ALL ON TABLE "public"."_prisma_migrations" TO "service_role";



GRANT ALL ON TABLE "public"."organisations" TO "anon";
GRANT ALL ON TABLE "public"."organisations" TO "authenticated";
GRANT ALL ON TABLE "public"."organisations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."organisations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."organisations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."organisations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."organisations_on_users" TO "anon";
GRANT ALL ON TABLE "public"."organisations_on_users" TO "authenticated";
GRANT ALL ON TABLE "public"."organisations_on_users" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."warranties" TO "anon";
GRANT ALL ON TABLE "public"."warranties" TO "authenticated";
GRANT ALL ON TABLE "public"."warranties" TO "service_role";



GRANT ALL ON SEQUENCE "public"."warranties_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."warranties_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."warranties_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



























RESET ALL;
