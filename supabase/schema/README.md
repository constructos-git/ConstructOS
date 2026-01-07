# ConstructOS Database Migrations

## Migration Order

Run migrations in this order:

1. **001_estimating_estimates.sql** - Estimating module tables
2. **Create a user** - Via Supabase Dashboard (Authentication → Users → Add User)

**Note:** ConstructOS is an internal single-tenant system. All authenticated users share access to all data. No company memberships needed.

## Setup Instructions

### Option 1: Run All Migrations (Recommended)

Copy and paste the contents of each migration file into Supabase SQL Editor in order:

1. Open Supabase SQL Editor: https://app.supabase.com/project/_/sql
2. Run `000_company_memberships.sql` first
3. Then run `001_estimating_estimates.sql`

### Option 2: Run Individual Migrations

If you only need specific modules, run their migrations and prerequisites.

## Verification

After running migrations, verify tables exist:

```sql
-- Check company_memberships exists
SELECT * FROM company_memberships LIMIT 1;

-- Check estimates table exists
SELECT * FROM estimates LIMIT 1;
```

## Troubleshooting

**"No rows returned" when checking auth.users**
- You need to create a user first:
  1. Go to Supabase Dashboard → Authentication → Users
  2. Click "Add User" → "Create new user"
  3. Enter email and password
  4. The user is now ready to use ConstructOS

**Error: "permission denied" or "No authenticated user"**
- Make sure you're signed in to ConstructOS
- Verify your user exists: `SELECT id, email FROM auth.users;`
- The RLS policy allows all authenticated users to access estimates

