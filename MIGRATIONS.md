# Automatic SQL Migrations

This project includes scripts to automatically run SQL migration files without manually logging into Supabase.

## Quick Start

### Option 1: Automatic (Recommended)

1. **Add service role key to `.env.local`**:
   ```bash
   # Get from: Supabase Dashboard → Settings → API → service_role (secret)
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

2. **Setup helper RPC (one-time)**:
   ```bash
   npm run migrate:setup
   ```
   This will show you SQL to run in Supabase SQL Editor. Copy and run it once.

3. **Run migrations**:
   ```bash
   # Run all migrations
   npm run migrate

   # Run a specific migration
   npm run migrate -- 009
   ```

### Option 2: Supabase CLI (Alternative)

If you have Supabase CLI installed:

```bash
# Install CLI
npm install -g supabase

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### Option 3: Manual (Fallback)

If automatic execution doesn't work:

1. Open Supabase SQL Editor: https://app.supabase.com/project/_/sql
2. Copy contents of migration file from `supabase/schema/`
3. Paste and run

## Migration Files

Migrations are in `supabase/schema/` and run in numerical order:

- `001_estimating_estimates.sql`
- `002_estimating_builder_engine.sql`
- `003_estimating_work_orders_purchase_orders.sql`
- `004_estimating_share_tokens_activity_pdf.sql`
- `005_estimating_quote_editor_branding.sql`
- `006_estimating_templates_acceptance_section_narrative.sql`
- `007_estimating_quote_versions_conversion.sql`
- `008_estimating_snapshots_rules_portals_ux.sql`
- `009_estimating_ratebook_settings_engine.sql`

## Troubleshooting

**Error: "function exec_sql does not exist"**
- Run `npm run migrate:setup` and execute the SQL shown

**Error: "Missing VITE_SUPABASE_SERVICE_ROLE_KEY"**
- Add it to `.env.local` (get from Supabase Dashboard → Settings → API)

**Error: "permission denied"**
- Make sure you're using the **service_role** key (not anon key)
- Service role key bypasses RLS and can execute SQL

**Migrations fail with syntax errors**
- Check the SQL file for issues
- Some migrations may need to be run in order
- Check Supabase logs for detailed error messages

## Security Note

⚠️ **Never commit `.env.local` to git!**

The service role key has full database access. Keep it secret.

