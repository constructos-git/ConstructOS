-- URGENT FIX: Make company_id nullable in estimates table
-- Run this in Supabase SQL Editor to fix the "null value in column company_id" error

ALTER TABLE public.estimates 
ALTER COLUMN company_id DROP NOT NULL;

-- Verify it worked (should show company_id as nullable)
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'estimates' 
  AND column_name = 'company_id';

