CREATE DATABASE qa_automation;

-- Create user with full database access
CREATE ROLE e2e_admin WITH
  NOSUPERUSER        -- Not server-wide admin
  CREATEDB           -- ✅ Can create databases
  CREATEROLE         -- ✅ Can create/manage other roles
  LOGIN              -- ✅ Can connect
  REPLICATION        -- ✅ Can use replication (if needed)
  BYPASSRLS          -- ✅ Can bypass row-level security
  ENCRYPTED PASSWORD '$PASSWORD';
-- Make user owner of the database
ALTER DATABASE qa_automation OWNER TO e2e_admin;

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE qa_automation TO e2e_admin;


