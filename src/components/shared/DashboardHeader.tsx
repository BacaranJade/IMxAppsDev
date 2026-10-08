import React from "react";
import { AuthUser } from "../../types";

export default function DashboardHeader({
  title,
  subtitle,
  currentUser,
  onLogout,
}: {
  title: string;
  subtitle: string;
  currentUser: AuthUser;
  onLogout: () => void;
}) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-brand">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="dashboard-user">
        {currentUser.role === "admin" && (
          <span className="role-badge">Admin</span>
        )}
        <span className="user-email">{currentUser.email}</span>
        <button className="btn-secondary" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
