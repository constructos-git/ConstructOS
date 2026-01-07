# Supabase Edge Functions

## Setup

These functions provide server-side rate search and refresh capabilities.

### Prerequisites

1. Install Supabase CLI: `npm install -g supabase`
2. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`

### Deploy Functions

```bash
# Deploy rates-search
supabase functions deploy rates-search

# Deploy rates-refresh
supabase functions deploy rates-refresh
```

### Set Secrets

```bash
# Optional: For generic API provider
supabase secrets set RATES_GENERIC_API_KEY=your-api-key
supabase secrets set RATES_GENERIC_API_BASE_URL=https://api.example.com
```

### Schedule Refresh

1. Go to Supabase Dashboard → Database → Cron Jobs
2. Create new cron job:
   - Name: `rates-refresh-daily`
   - Schedule: `0 2 * * *` (2 AM daily)
   - SQL: 
     ```sql
     SELECT net.http_post(
       url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/rates-refresh',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
       ),
       body := jsonb_build_object()
     );
     ```

## Current Status

These functions are **placeholder implementations**. They provide the structure but need:
- Full provider adapter logic
- Cache management
- History writing
- Error handling

The client-side implementation works without these functions, but edge functions provide:
- Better security (secrets server-side)
- Rate limiting
- Scheduled refreshes
- Centralized caching

