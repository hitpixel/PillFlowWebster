import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Starting sign in process with email:", email);

      // Try the SDK method first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Sign in attempt result:", {
        email,
        success: !error,
        error: error?.message,
      });

      if (error) {
        // If SDK method fails, try direct API approach
        console.warn("SDK method failed, trying direct API approach");

        const response = await fetch(
          "https://dmundkgajcfptrgnniiy.supabase.co/auth/v1/token?grant_type=password",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdW5ka2dhamNmcHRyZ25uaWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MjgxOTAsImV4cCI6MjA1NTUwNDE5MH0.TxM0YZOsM9Rmtm2NgRovmvuBDT2wbg_B4T87FYqOnEA",
              "X-Client-Info": "pillflow-web-app",
            },
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

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
