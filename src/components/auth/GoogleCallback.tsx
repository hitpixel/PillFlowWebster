import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/supabase";
import { Card, CardContent } from "@/components/ui/card";
import AuthLayout from "./AuthLayout";

export default function GoogleCallback() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);
        // Get the hash fragment and search params from the URL
        const hash = window.location.hash;
        const searchParams = window.location.search;
        console.log("Processing OAuth callback with hash:", hash);
        console.log(
          "Processing OAuth callback with search params:",
          searchParams,
        );
        console.log("Full callback URL:", window.location.href);

        try {
          console.log("Attempting to handle OAuth callback");

          // First try to exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            window.location.href,
          );

          if (error) {
            console.warn("Error exchanging code:", error);
            // Continue to check for session anyway
          }

          // Check if we have a session after the exchange
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Error getting session:", sessionError);
          }

          if (session) {
            console.log("Session found, redirecting to dashboard");
            navigate("/dashboard");
            return;
          }

          // If we still don't have a session, try one more time after a delay
          console.log("No session found, retrying after delay...");
          setTimeout(async () => {
            const { data: retryData } = await supabase.auth.getSession();
            if (retryData.session) {
              console.log("Session found on retry");
              navigate("/dashboard");
            } else {
              setError("Failed to get session. Please try logging in again.");
            }
          }, 2000);
        } catch (exchangeError: any) {
          console.error("Error in OAuth callback:", exchangeError);
          setError(exchangeError.message || "Failed to process authentication");
        }
      } catch (err: any) {
        console.error("Error processing OAuth callback:", err);
        setError(err.message || "Failed to process authentication");
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <AuthLayout>
      <Card className="w-full bg-[#0f1623] border-[#1e2738] text-white">
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-300">Processing authentication...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Return to Login
              </button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
