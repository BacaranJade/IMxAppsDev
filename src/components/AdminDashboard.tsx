import React, { useEffect, useMemo, useState } from "react";
import "./shared/dashboard-shared.css";
import { AuthUser, MaintenanceRequest, RequestStatus } from "../types";
import { computeStats, filterRequests, StatusFilter } from "./shared/requestUtils";
import DashboardHeader from "./shared/DashboardHeader";
import StatsBar from "./shared/StatsBar";
import RequestCard from "./shared/RequestCard";
import ApprovalActions from "./shared/ApprovalActions";

export default function AdminDashboard({
  currentUser,
  requests,
  onStatusChange,
  onApprove,
  onDecline,
  onLogout,
}: {
  currentUser: AuthUser;
  requests: MaintenanceRequest[];
  onStatusChange: (id: string, status: RequestStatus) => void;
  onApprove: (id: string) => void;
  onDecline: (id: string, reason: string) => void;
  onLogout: () => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [notice, setNotice] = useState<string | null>(null);

  // Hide the confirmation message after a few seconds.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  function handleApprove(r: MaintenanceRequest) {
    onApprove(r.id);
    setNotice(`You approved the report "${r.title}".`);
  }

  function handleDecline(r: MaintenanceRequest, reason: string) {
    onDecline(r.id, reason);
    setNotice(`You declined the report "${r.title}".`);
  }

  const stats = useMemo(() => computeStats(requests), [requests]);

  // Reports waiting for a decision, newest first.
  const pending = useMemo(
    () => filterRequests(requests, { search: "", statusFilter: "Pending" }),
    [requests]
  );

  // Everything already handled (approved, in progress, resolved, declined).
  const reviewed = useMemo(
    () =>
      filterRequests(
        requests.filter((r) => r.status !== "Pending"),
        { search, statusFilter }
      ),
    [requests, search, statusFilter]
  );

  return (
    <div className="dashboard">
      <DashboardHeader
        title="Maintenance Admin"
        subtitle="Review and manage requests across the school"
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <main className="dashboard-main">
        <StatsBar stats={stats} />

        <section className="approval-section">
          <h2 className="section-heading">
            Needs approval <span className="count-pill">{pending.length}</span>
          </h2>
          <div className="request-list">
            {pending.length === 0 ? (
              <p className="empty-state empty-state--small">
                No reports are waiting for approval.
              </p>
            ) : (
              pending.map((r) => (
                <RequestCard
                  key={r.id}
                  request={r}
                  actions={
                    <ApprovalActions
                      onApprove={() => handleApprove(r)}
                      onDecline={(reason) => handleDecline(r, reason)}
                    />
                  }
                />
              ))
            )}
          </div>
        </section>

        <h2 className="section-heading">All reviewed requests</h2>

        <section className="toolbar">
          <input
            type="search"
            className="search-input"
            placeholder="Search by title, room, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search requests"
          />
          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Declined">Declined</option>
          </select>
        </section>

        <section className="request-list">
          {reviewed.length === 0 ? (
            <p className="empty-state">No requests match your filters.</p>
          ) : (
            reviewed.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                onStatusChange={onStatusChange}
              />
            ))
          )}
        </section>
      </main>

      {notice && (
        <div className="toast" role="status">
          <span className="toast-icon" aria-hidden="true">
            ✓
          </span>
          <span>{notice}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setNotice(null)}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}