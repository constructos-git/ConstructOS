# Supabase Setup Instructions

## Quick Start

1. **Create `.env.local` file** in the project root:
   ```bash
   cp .env.example .env.local
   ```

2. **Get your Supabase credentials**:
   - Go to https://app.supabase.com
   - Select your project (or create a new one)
   - Go to Settings → API
   - Copy the "Project URL" and "anon/public" key

3. **Update `.env.local`** with your actual values:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Run the database migration**:
   - Open Supabase SQL Editor
   - Execute the contents of `supabase/schema/001_estimating_estimates.sql`
   - Verify the `estimates` table was created

5. **Restart your dev server**:
   ```bash
   npm run dev
   ```

## Verify Setup

- Navigate to `/estimating` in the app
- You should see the estimates list (empty initially)
- Click "Create Estimate" to test database connectivity

## Troubleshooting

**Error: "Missing VITE_SUPABASE_URL"**
- Make sure `.env.local` exists in the project root
- Restart the dev server after creating/updating `.env.local`
- Vite only loads env vars on startup

**Error: "permission denied" or empty results**
- Check that your authenticated user has a `company_memberships` row
- Verify RLS policies are correctly set up
- Check Supabase logs for detailed error messages
