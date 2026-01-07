-- Step 1: Check current state of company_id column
SELECT 
  column_name, 
  is_nullable, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'estimates' 
  AND column_name = 'company_id';

-- Step 2: If is_nullable shows 'NO', run this to fix it:
-- ALTER TABLE public.estimates 
-- ALTER COLUMN company_id DROP NOT NULL;

-- Step 3: Verify it's now nullable (is_nullable should show 'YES')
-- Run the SELECT query again to confirm

