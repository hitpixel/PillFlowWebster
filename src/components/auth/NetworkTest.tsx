import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function NetworkTest() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    console.log(
      "Testing connection with URL:",
      import.meta.env.VITE_SUPABASE_URL,
    );
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Test basic connectivity to Supabase
      const response = await fetch(
        "https://dmundkgajcfptrgnniiy.supabase.co/rest/v1/",
        {
          method: "GET",
          headers: {
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdW5ka2dhamNmcHRyZ25uaWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MjgxOTAsImV4cCI6MjA1NTUwNDE5MH0.TxM0YZOsM9Rmtm2NgRovmvuBDT2wbg_B4T87FYqOnEA",
          },
        },
      );

      const data = await response.text();
      setResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers]),
        data: data,
      });
    } catch (err: any) {
      console.error("Network test error:", err);
      setError(err.message || "Network error occurred");
      setResult({
        error: err.toString(),
        stack: err.stack,
      });
    } finally {
      setLoading(false);
    }
  };

  const testCORS = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Test CORS with preflight
      const response = await fetch(
        "https://dmundkgajcfptrgnniiy.supabase.co/rest/v1/customers?select=id",
        {
          method: "GET",
          headers: {
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdW5ka2dhamNmcHRyZ25uaWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MjgxOTAsImV4cCI6MjA1NTUwNDE5MH0.TxM0YZOsM9Rmtm2NgRovmvuBDT2wbg_B4T87FYqOnEA",
            "Content-Type": "application/json",
            "X-Client-Info": "pillflow-web-app",
          },
          mode: "cors",
        },
      );

      const data = await response.json();
      setResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers]),
        data: data,
      });
    } catch (err: any) {
      console.error("CORS test error:", err);
      setError(err.message || "CORS error occurred");
      setResult({
        error: err.toString(),
        stack: err.stack,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] text-white">
      <Card className="w-full max-w-md bg-[#0f1623] border-[#1e2738] text-white">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Network Connectivity Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={testConnection}
                disabled={loading}
                className="flex-1"
              >
                Test Basic Connectivity
              </Button>
              <Button onClick={testCORS} disabled={loading} className="flex-1">
                Test CORS
              </Button>
            </div>

            {loading && (
              <div className="p-3 bg-blue-900/30 border border-blue-800 rounded text-blue-300 text-sm">
                Testing connection...
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
                {error}
              </div>
            )}

            {result && (
              <div className="mt-4">
                <Label>Response:</Label>
                <pre className="mt-2 p-3 bg-[#1a2133] border border-[#1e2738] rounded overflow-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
