import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, Link } from "react-router-dom";
import { Pill, LogIn } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      console.log("Attempting login with:", email);
      // Add a small delay to ensure network is ready
      await new Promise((resolve) => setTimeout(resolve, 500));
      await signIn(email, password);
      console.log("Login successful, navigating to dashboard");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      // Provide more detailed error information
      if (error.message && error.message.includes("Failed to fetch")) {
        setError(
          `Network error: Failed to connect to Supabase. Please check your network connection. URL: ${import.meta.env.VITE_SUPABASE_URL}`,
        );
      } else if (error.status) {
        setError(`Server error (${error.status}): ${error.message}`);
      } else {
        setError(error?.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0e17] relative overflow-hidden">
      {/* Ambient gradient background */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[70vh] bg-gradient-radial from-blue-500/20 via-blue-900/10 to-transparent pointer-events-none" />

      {/* Left side - Image */}
      <div className="relative hidden w-1/2 lg:block">
        <div
          className="h-full w-full object-cover"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e17] via-[#0a0e17]/80 to-transparent">
          <img
            src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&q=80"
            alt="Pharmacy Medicine"
            className="absolute inset-0 mix-blend-overlay opacity-40 object-cover w-full h-full"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-20">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white">
            Welcome to PillFlow
          </h1>
          <p className="text-lg text-gray-300">
            Streamline your healthcare webster packing workflow with our modern
            solution.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full lg:w-1/2 relative z-10">
        <div className="mx-auto flex w-full max-w-lg flex-col justify-center space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <Pill className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">PillFlow</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-gray-400">
              Please enter your details to sign in to your account
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#1a2133] border-[#1e2738] text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#1a2133] border-[#1e2738] text-white placeholder-gray-400"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm text-gray-300">
                  Remember me
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#1e2738]"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0a0e17] px-2 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              className="w-full bg-white text-black hover:bg-gray-200"
              onClick={() => signInWithGoogle()}
              disabled={loading}
            >
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>
          <div className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
