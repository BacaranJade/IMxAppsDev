import React from "react";
import { RequestStats } from "./requestUtils";

export default function StatsBar({
  stats,
  showPending = true,
}: {
  stats: RequestStats;
  /** Admin-only card: how many reports are waiting for approval. */
  showPending?: boolean;
}) {
  return (
    <section className="stats-grid">
      <div className="stat-card">
        <span className="stat-value">{stats.total}</span>
        <span className="stat-label">Total requests</span>
      </div>
      {showPending && (
        <div className="stat-card stat-card--pending">
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">Pending approval</span>
        </div>
      )}
      <div className="stat-card stat-card--open">
        <span className="stat-value">{stats.open}</span>
        <span className="stat-label">Open</span>
      </div>
      <div className="stat-card stat-card--progress">
        <span className="stat-value">{stats.inProgress}</span>
        <span className="stat-label">In progress</span>
      </div>
      <div className="stat-card stat-card--resolved">
        <span className="stat-value">{stats.resolved}</span>
        <span className="stat-label">Resolved</span>
      </div>
    </section>
  );
}