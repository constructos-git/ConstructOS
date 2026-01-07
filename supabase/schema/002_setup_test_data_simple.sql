-- ConstructOS: Simple Test Data Setup
-- Migration: 002_setup_test_data_simple.sql
-- Description: Creates a test company and membership (no authentication required)
-- 
-- INSTRUCTIONS:
-- 1. First, find your user UUID by running this query:
--    SELECT id, email FROM auth.users;
--
-- 2. Then, replace 'YOUR_USER_UUID_HERE' below with the UUID from step 1
--
-- 3. Run this entire script

-- Step 1: Find your user (run this first)
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 2: Create membership (replace YOUR_USER_UUID_HERE with UUID from Step 1)
-- Uncomment the INSERT below and replace YOUR_USER_UUID_HERE:

/*
INSERT INTO company_memberships (company_id, user_id, role)
VALUES (gen_random_uuid(), 'YOUR_USER_UUID_HERE'::uuid, 'admin')
RETURNING 
  company_id,
  user_id,
  role,
  'Use this company_id in your app' as note;
*/

-- Step 3: Verify (after running the INSERT above)
-- SELECT * FROM company_memberships WHERE user_id = 'YOUR_USER_UUID_HERE'::uuid;

