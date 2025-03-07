import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log("Starting sign up process with email:", email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      console.log("Sign up result:", {
        success: !error,
        error: error?.message,
      });

      if (error) throw error;

      // Create a customer record for the new user
      if (data?.user) {
        try {
          const { error: customerError } = await supabase
            .from("customers")
            .insert({
              full_name: fullName,
              email: email,
              user_id: data.user.id,
              status: "active",
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (customerError) {
            console.error("Error creating customer record:", customerError);
          }
        } catch (customerErr) {
          console.error("Error in customer creation:", customerErr);
        }
      }

      return data;
    } catch (err) {
      console.error("Sign up error:", err);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Starting sign in process with email:", email);

      // Use localStorage approach for Vercel deployment
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: true,
        },
      });

      console.log("Sign in attempt result:", {
        email,
        success: !error,
        error: error?.message,
      });

      if (error) {
        // If SDK method fails, try direct API approach with no credentials
        console.warn("SDK method failed, trying direct API approach");

        const supabaseUrl =
          import.meta.env.VITE_SUPABASE_URL ||
          "https://hboghefefjvwbroshixn.supabase.co";
        const supabaseAnonKey =
          import.meta.env.VITE_SUPABASE_ANON_KEY ||
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib2doZWZlZmp2d2Jyb3NoaXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMTA0NjYsImV4cCI6MjA1Njg4NjQ2Nn0.isMKZ7lUukyucD31EpZJN1XBPEmnjBD5ygY9XahYae4";

        const response = await fetch(
          `${supabaseUrl}/auth/v1/token?grant_type=password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseAnonKey,
              "X-Client-Info": "pillflow-web-app",
            },
            // Don't use credentials mode as it can cause CORS issues
            credentials: "omit",
            body: JSON.stringify({
              email,
              password,
            }),
          },
        );

        const apiData = await response.json();

        if (response.ok) {
          console.log("Direct API login successful");
          // Set the session manually
          const { access_token, refresh_token } = apiData;
          if (access_token) {
            await supabase.auth.setSession({
              access_token,
              refresh_token: refresh_token || "",
            });
            // Store in localStorage as a fallback
            localStorage.setItem("sb-access-token", access_token);
            if (refresh_token) {
              localStorage.setItem("sb-refresh-token", refresh_token);
            }
            return { session: { access_token, refresh_token } };
          }
        } else {
          console.error("Direct API login failed:", apiData);
          throw new Error(apiData.error_description || "Login failed");
        }
      }

      return data;
    } catch (err) {
      console.error("Authentication error:", err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Force clear user state after signout
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Get the current hostname
      const hostname = window.location.hostname;

      // Determine the appropriate redirect URL based on the environment
      let redirectUrl;
      if (hostname === "app.pillflow.com.au") {
        redirectUrl = "https://app.pillflow.com.au/auth/callback";
      } else if (hostname.includes("vercel.app")) {
        // For Vercel deployments
        redirectUrl = `${window.location.origin}/auth/callback`;
      } else {
        // Local development or other environments
        redirectUrl = `${window.location.origin}/auth/callback`;
      }

      // Update the redirect URL for the new Supabase project
      const callbackUrl = redirectUrl;

      console.log("Google OAuth redirect URL:", redirectUrl);
      console.log("Current hostname:", hostname);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext, AuthProvider, useAuth };
