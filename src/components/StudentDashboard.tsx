import React, { useMemo, useState } from "react";
import "./shared/dashboard-shared.css";
import { AuthUser, MaintenanceRequest, NewRequestInput } from "../types";
import {
  computeStats,
  filterRequests,
  findDuplicateRequest,
  StatusFilter,
} from "./shared/requestUtils";
import DashboardHeader from "./shared/DashboardHeader";
import StatsBar from "./shared/StatsBar";
import RequestCard from "./shared/RequestCard";
import RequestFormModal from "./shared/RequestFormModal";

export default function StudentDashboard({
  currentUser,
  requests,
  onCreateRequest,
  onLogout,
}: {
  currentUser: AuthUser;
  requests: MaintenanceRequest[];
  onCreateRequest: (input: NewRequestInput) => void;
  onLogout: () => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [showModal, setShowModal] = useState(false);

  // Students only ever see what they submitted.
  const ownRequests = useMemo(
    () => requests.filter((r) => r.requestedBy === currentUser.email),
    [requests, currentUser.email]
  );

  const stats = useMemo(() => computeStats(ownRequests), [ownRequests]);
  const filtered = useMemo(
    () => filterRequests(ownRequests, { search, statusFilter }),
    [ownRequests, search, statusFilter]
  );

  function handleCreateRequest(input: NewRequestInput) {
    onCreateRequest(input);
    setShowModal(false);
  }

  return (
    <div className="dashboard">
      <DashboardHeader
        title="School Maintenance"
        subtitle="Report and track your maintenance requests"
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <main className="dashboard-main">
        <StatsBar stats={stats} showPending={false} />

        <section className="toolbar">
          <input
            type="search"
            className="search-input"
            placeholder="Search your requests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search your requests"
          />
          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending approval</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Declined">Declined</option>
          </select>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + New request
          </button>
        </section>

        <section className="request-list">
          {filtered.length === 0 ? (
            <p className="empty-state">
              {ownRequests.length === 0
                ? "You haven't submitted any requests yet."
                : "No requests match your filters."}
            </p>
          ) : (
            filtered.map((r) => <RequestCard key={r.id} request={r} />)
          )}
        </section>
      </main>

      {showModal && (
        <RequestFormModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateRequest}
          findDuplicate={(input) =>
            findDuplicateRequest(requests, input, currentUser.email)
          }
        />
      )}
    </div>
  );
}