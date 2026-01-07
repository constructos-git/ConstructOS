-- ConstructOS: Setup Test Data
-- Migration: 002_setup_test_data.sql
-- Description: Creates a test company and membership
-- Run this AFTER 000_company_memberships.sql and 001_estimating_estimates.sql

-- OPTION 1: If you're authenticated in Supabase (signed in via Dashboard)
-- This will automatically use your current user
do $$
declare
  test_company_id uuid;
  current_user_id uuid;
begin
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  if current_user_id is null then
    raise notice 'No authenticated user found. Using OPTION 2 below instead.';
    raise notice 'To authenticate: Sign in to Supabase Dashboard, then run this script again.';
  else
    -- Generate a test company ID
    test_company_id := gen_random_uuid();
    
    -- Create membership for current user
    INSERT INTO company_memberships (company_id, user_id, role)
    VALUES (test_company_id, current_user_id, 'admin')
    ON CONFLICT (company_id, user_id) DO NOTHING;

    raise notice 'Created test company membership:';
    raise notice '  Company ID: %', test_company_id;
    raise notice '  User ID: %', current_user_id;
  end if;
end $$;

-- OPTION 2: Manual setup (works without authentication)
-- Replace 'YOUR_USER_UUID_HERE' with your actual user UUID from auth.users table
-- To find your user UUID: SELECT id, email FROM auth.users;

-- Uncomment and modify the lines below:
/*
DO $$
DECLARE
  test_company_id uuid;
  your_user_id uuid;
BEGIN
  -- Replace this with your actual user UUID
  your_user_id := 'YOUR_USER_UUID_HERE'::uuid;
  
  -- Generate company ID
  test_company_id := gen_random_uuid();
  
  -- Create membership
  INSERT INTO company_memberships (company_id, user_id, role)
  VALUES (test_company_id, your_user_id, 'admin')
  ON CONFLICT (company_id, user_id) DO NOTHING;
  
  RAISE NOTICE 'Created membership with Company ID: %', test_company_id;
END $$;
*/

-- OPTION 3: Simple one-liner (replace YOUR_USER_UUID)
-- Uncomment and replace YOUR_USER_UUID:
-- INSERT INTO company_memberships (company_id, user_id, role)
-- VALUES (gen_random_uuid(), 'YOUR_USER_UUID'::uuid, 'admin')
-- RETURNING company_id, user_id;

-- Find your user UUID (run this first to see available users):
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
