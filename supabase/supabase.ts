import { createClient } from "@supabase/supabase-js";
import { Database } from "../src/types/supabase";

// Always use the environment variables if available, otherwise fallback to hardcoded values
const supabaseUrl = "https://hboghefefjvwbroshixn.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib2doZWZlZmp2d2Jyb3NoaXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMTA0NjYsImV4cCI6MjA1Njg4NjQ2Nn0.isMKZ7lUukyucD31EpZJN1XBPEmnjBD5ygY9XahYae4";

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
