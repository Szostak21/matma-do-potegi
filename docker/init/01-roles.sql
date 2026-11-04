-- Migrations revoke access from the Supabase Data API roles.
-- Local Postgres does not create them, so the init script does.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
