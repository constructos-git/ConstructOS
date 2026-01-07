-- ConstructOS: Create Test User and Membership
-- Migration: 003_create_test_user.sql
-- Description: Creates a test user and company membership
-- Run this if auth.users is empty

-- STEP 1: Create a test user via Supabase Auth
-- Option A: Use Supabase Dashboard
--   1. Go to Authentication → Users
--   2. Click "Add User" → "Create new user"
--   3. Enter email and password
--   4. Copy the user UUID that's created

-- Option B: Create user programmatically (requires service role key - not recommended for production)
-- This is commented out for security - only use in development:
/*
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@constructos.local',
  crypt('testpassword123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  '',
  '',
  '',
  ''
) RETURNING id, email;
*/

-- STEP 2: After creating a user, create the membership
-- Replace 'USER_UUID_FROM_STEP_1' with the actual UUID:

-- First, let's see if there are any users:
SELECT 'Current users in auth.users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- If you see a user above, use this to create membership:
-- (Replace USER_UUID with the id from the query above)
/*
INSERT INTO company_memberships (company_id, user_id, role)
VALUES (gen_random_uuid(), 'USER_UUID'::uuid, 'admin')
RETURNING 
  company_id,
  user_id,
  role,
  'Copy this company_id to use in your app' as note;
*/

