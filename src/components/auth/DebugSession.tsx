import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DebugSession() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      setSessionInfo({
        hasSession: !!data.session,
        user: data.session?.user || null,
        expiresAt: data.session?.expires_at
          ? new Date(data.session.expires_at * 1000).toISOString()
          : null,
        tokenType: data.session?.token_type || null,
        accessTokenLength: data.session?.access_token?.length || 0,
        refreshTokenLength: data.session?.refresh_token?.length || 0,
        providerToken: data.session?.provider_token ? "Present" : "None",
        providerRefreshToken: data.session?.provider_refresh_token
          ? "Present"
          : "None",
        localStorage: {
          accessToken: localStorage.getItem("sb-access-token")
            ? "Present"
            : "None",
          refreshToken: localStorage.getItem("sb-refresh-token")
            ? "Present"
            : "None",
          pillflowAuthToken: localStorage.getItem("pillflow-auth-token")
            ? "Present"
            : "None",
        },
      });
    } catch (err: any) {
      console.error("Error checking session:", err);
      setError(err.message || "Failed to check session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] text-white p-4">
      <Card className="w-full max-w-2xl bg-[#0f1623] border-[#1e2738] text-white">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Session Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={checkSession}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Checking..." : "Check Session"}
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
                {error}
              </div>
            )}

            {sessionInfo && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">
                  Session Information
                </h3>
                <pre className="p-3 bg-[#1a2133] border border-[#1e2738] rounded overflow-auto text-xs whitespace-pre-wrap">
                  {JSON.stringify(sessionInfo, null, 2)}
                </pre>

                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-medium">Actions</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        try {
                          await supabase.auth.signOut();
                          checkSession();
                        } catch (err: any) {
                          setError(err.message);
                        }
                      }}
                      variant="destructive"
                      className="flex-1"
                    >
                      Sign Out
                    </Button>
                    <Button
                      onClick={() => {
                        localStorage.clear();
                        checkSession();
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Clear LocalStorage
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
