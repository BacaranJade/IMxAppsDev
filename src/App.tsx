import React, { useState } from "react";
import Login, {
  LoginPayload,
  RegisterPayload,
  ForgotPayload,
} from "./auth/Login";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { AuthUser, MaintenanceRequest, NewRequestInput, RequestStatus } from "./types";
import { mockRequests } from "./data/mockRequests";

/**
 * Demo-only: in a real backend, the server tells you the role. Here we infer
 * it from the email so the two dashboards are easy to try out locally.
 * Log in with any "...admin@..." email to see the admin view.
 */
function inferRole(email: string): "admin" | "student" {
  return email.toLowerCase().includes("admin") ? "admin" : "student";
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState<string | undefined>(undefined);
  const [requests, setRequests] = useState<MaintenanceRequest[]>(mockRequests);

  async function handleLogin({ email, password }: LoginPayload) {
    setAuthError(undefined);
    if (password.length < 4) {
      setAuthError("Incorrect email or password.");
      return;
    }
    await new Promise((r) => setTimeout(r, 400));
    setUser({ email, role: inferRole(email) });
  }

  async function handleRegister({ email }: RegisterPayload) {
    setAuthError(undefined);
    await new Promise((r) => setTimeout(r, 400));
    setUser({ email, role: "student" });
  }

  async function handleForgotPassword({ email }: ForgotPayload) {
    await new Promise((r) => setTimeout(r, 400));
    console.log("Password reset requested for", email);
  }

  function handleLogout() {
    setUser(null);
    setAuthError(undefined);
  }

  function handleCreateRequest(input: NewRequestInput) {
    if (!user) return;
    const now = new Date().toISOString();
    const newRequest: MaintenanceRequest = {
      id: `req-${Date.now()}`,
      ...input,
      status: "Pending", // needs admin approval first
      requestedBy: user.email,
      dateSubmitted: now,
      dateUpdated: now,
    };
    setRequests((prev) => [newRequest, ...prev]);
  }

  function handleStatusChange(id: string, status: RequestStatus) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status, dateUpdated: new Date().toISOString() } : r
      )
    );
  }

  function handleApprove(id: string) {
    handleStatusChange(id, "Open");
  }

  function handleDecline(id: string, reason: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Declined",
              declineReason: reason || undefined,
              dateUpdated: new Date().toISOString(),
            }
          : r
      )
    );
  }

  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
        onRegister={handleRegister}
        onForgotPassword={handleForgotPassword}
        errorMessage={authError}
      />
    );
  }

  if (user.role === "admin") {
    return (
      <AdminDashboard
        currentUser={user}
        requests={requests}
        onStatusChange={handleStatusChange}
        onApprove={handleApprove}
        onDecline={handleDecline}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <StudentDashboard
      currentUser={user}
      requests={requests}
      onCreateRequest={handleCreateRequest}
      onLogout={handleLogout}
    />
  );
}