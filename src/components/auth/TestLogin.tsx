import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function TestLogin() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      console.log("Test login with:", { email, password });
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

      const data = await response.json();
      setResult(data);

      if (response.ok) {
        console.log("Direct API login successful");
      } else {
        setError(data.error_description || "Login failed");
      }
    } catch (err: any) {
      console.error("Test login error:", err);
      setError(err.message || "An unexpected error occurred");
    }
  };

  const handleNormalLogin = async () => {
    try {
      await signIn(email, password);
      setResult({
        success: true,
        message: "Login successful using normal flow",
      });
    } catch (err: any) {
      console.error("Normal login error:", err);
      setError(err.message || "Login failed");
      setResult({ success: false, error: err.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] text-white">
      <Card className="w-full max-w-md bg-[#0f1623] border-[#1e2738] text-white">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Test Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1a2133] border-[#1e2738]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#1a2133] border-[#1e2738]"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Test Direct API
              </Button>
              <Button
                type="button"
                onClick={handleNormalLogin}
                className="flex-1"
              >
                Test Normal Login
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
                {error}
              </div>
            )}

            {result && (
              <div className="mt-4">
                <Label>API Response:</Label>
                <pre className="mt-2 p-3 bg-[#1a2133] border border-[#1e2738] rounded overflow-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
