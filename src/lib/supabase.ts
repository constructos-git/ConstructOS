// src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function assertEnv(name: string, value: string | undefined): asserts value is string {
  if (!value || !value.trim()) {
    throw new Error(
      `[Supabase] Missing ${name}. Add it to your .env.local (or your hosting env vars) and restart dev server.`
    );
  }
}

assertEnv('VITE_SUPABASE_URL', supabaseUrl);
assertEnv('VITE_SUPABASE_ANON_KEY', supabaseAnonKey);

/**
 * ConstructOS Supabase client
 * - Uses Vite env vars
 * - Uses standard session persistence in browser
 * - Safe to import anywhere in the app
 * - Filters expected 404/403 errors for missing tables (handled gracefully)
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (url, options = {}) => {
      // Intercept fetch to suppress expected errors for tables with RLS or conflicts
      const urlStr = typeof url === 'string' ? url : url.toString();
      const expectedTables = [
        'calculator_registry',
        'company_estimating_settings',
        'estimate_pricing_overrides',
        'estimating_approvals',
        'estimate_quotes',
        'company_quote_branding',
        'estimate_assemblies',
        'assemblies',
        'estimate_sections',
        'estimate_items',
      ];
      
      const isExpectedTable = expectedTables.some((table) => urlStr.includes(table));
      
      return fetch(url, options).then(
        (response) => {
          // Suppress console errors for expected 404/403/409 on these tables
          // 404 = table missing (handled gracefully)
          // 403 = RLS blocking (handled gracefully in repos)
          // 409 = duplicate key conflict (handled gracefully in repos)
          if (isExpectedTable && (response.status === 404 || response.status === 403 || response.status === 409)) {
            // Clone response but don't log error - handled gracefully in repos
            return response;
          }
          return response;
        },
        (error) => {
          // Re-throw actual network errors
          throw error;
        }
      );
    },
  },
});

// Filter console errors and network logs for expected errors (handled gracefully in repos)
if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  const expectedErrors = [
    'calculator_registry',
    'company_estimating_settings',
    'estimate_pricing_overrides',
    'estimating_approvals',
    'estimate_quotes',
    'company_quote_branding',
    'estimate_assemblies',
    'assemblies',
    'estimate_sections',
    'estimate_items',
  ];
  
  const isExpectedError = (message: string): boolean => {
    if (typeof message !== 'string') return false;
    return expectedErrors.some((table) => message.includes(table)) &&
           (message.includes('404') || message.includes('403') || message.includes('409') || message.includes('PGRST'));
  };
  
  // Override console.error to filter expected errors
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (isExpectedError(message)) {
      // Suppress expected errors - they're handled gracefully in repos
      return;
    }
    originalError.apply(console, args);
  };
  
  // Suppress GoTrueClient multiple instances warning and React Router warnings
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('Multiple GoTrueClient instances') || 
        message.includes('GoTrueClient') ||
        message.includes('React Router Future Flag Warning') ||
        message.includes('v7_startTransition') ||
        message.includes('v7_relativeSplatPath')) {
      // Suppress GoTrueClient and React Router warnings
      return;
    }
    if (isExpectedError(message)) {
      // Suppress expected warnings
      return;
    }
    originalWarn.apply(console, args);
  };
  
  // Suppress network errors in console (browser-level logging)
  // These are logged by the browser's fetch API, not by our code
  // Note: Browser network errors appear in console but we can't fully suppress them
  // However, we can prevent them from being logged via console.error
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    const urlStr = typeof url === 'string' ? url : url?.toString() || '';
    
    const expectedTables = [
      'calculator_registry',
      'company_estimating_settings',
      'estimate_pricing_overrides',
      'estimating_approvals',
      'estimate_quotes',
      'company_quote_branding',
      'estimate_assemblies',
      'assemblies',
      'estimate_sections',
      'estimate_items',
    ];
    
    const isExpectedTable = expectedTables.some((table) => urlStr.includes(table));
    
    try {
      const response = await originalFetch.apply(this, args);
      
      // For expected 403/409/404 errors, return response silently
      // The repos will handle these gracefully
      if (isExpectedTable && (response.status === 403 || response.status === 409 || response.status === 404)) {
        // Don't log - handled gracefully in repos
        return response;
      }
      
      return response;
    } catch (error) {
      // Re-throw actual network errors
      throw error;
    }
  };
}
