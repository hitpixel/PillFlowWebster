import { createClient } from "@supabase/supabase-js";
import { Database } from "../src/types/supabase";

// Always use the environment variables if available, otherwise fallback to hardcoded values
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://dmundkgajcfptrgnniiy.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdW5ka2dhamNmcHRyZ25uaWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MjgxOTAsImV4cCI6MjA1NTUwNDE5MH0.TxM0YZOsM9Rmtm2NgRovmvuBDT2wbg_B4T87FYqOnEA";

// For Vercel deployment, use localStorage instead of cookies
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "pillflow-auth-token",
    flowType: "implicit",
    storage: localStorage,
  },
  global: {
    headers: {
      "X-Client-Info": "pillflow-web-app",
    },
  },
});

// Log Supabase configuration for debugging
console.log("Supabase Configuration:", {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  domain: window.location.hostname,
  origin: window.location.origin,
});
