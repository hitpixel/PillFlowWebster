import React, { Suspense } from "react";
import { Navigate, Route, Routes, useRoutes } from "react-router-dom";
import { useAuth } from "../supabase/auth";
import routes from "tempo-routes";
import LoginForm from "./components/auth/LoginForm";
import RegisterPage from "./components/auth/RegisterPage";
import NetworkTest from "./components/auth/NetworkTest";
import GoogleCallback from "./components/auth/GoogleCallback";
import DebugSession from "./components/auth/DebugSession";
import Dashboard from "./components/pages/dashboard";
import Success from "./components/pages/success";
import ScanOut from "./components/pages/scan-out";
import Customers from "./components/pages/customers";
import Settings from "./components/pages/settings";
import { AuthProvider } from "../supabase/auth";
import DashboardProvider, {
  useDashboard,
} from "./components/dashboard/context/DashboardContext";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />
        <Route path="/debug-session" element={<DebugSession />} />
        <Route path="/network-test" element={<NetworkTest />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/scan-out"
          element={
            <PrivateRoute>
              <ScanOut />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <Customers />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <PrivateRoute>
              <Suspense fallback={<div>Loading...</div>}>
                {React.createElement(
                  React.lazy(
                    () => import("./components/pages/customer-details"),
                  ),
                )}
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Suspense fallback={<div>Loading...</div>}>
                {React.createElement(
                  React.lazy(() => import("./components/pages/reports")),
                )}
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route path="/success" element={<Success />} />
      </Routes>
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <AppRoutes />
        </Suspense>
      </DashboardProvider>
    </AuthProvider>
  );
}

export default App;
