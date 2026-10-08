import React, { ReactNode } from "react";
import { MaintenanceRequest, RequestStatus } from "../../types";

const STATUS_OPTIONS: RequestStatus[] = ["Open", "In Progress", "Resolved"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RequestCard({
  request,
  onStatusChange,
  actions,
}: {
  request: MaintenanceRequest;
  /**
   * Omit this to render a read-only status badge (student view).
   * Pass it to render an editable status dropdown (admin view).
   */
  onStatusChange?: (id: string, status: RequestStatus) => void;
  /** Replaces the status area, e.g. Approve / Decline buttons for pending requests. */
  actions?: ReactNode;
}) {
  // Pending and Declined requests can't be moved along; they need approval first.
  const editable =
    !!onStatusChange &&
    request.status !== "Pending" &&
    request.status !== "Declined";
  return (
    <article className="request-card">
      <div className="request-card-top">
        <div className="request-card-titles">
          <h3 className="request-card-title">{request.title}</h3>
          <p className="request-card-location">{request.location}</p>
        </div>
        <span className={`badge priority-${request.priority.toLowerCase()}`}>
          {request.priority}
        </span>
      </div>

      <p className="request-card-description">{request.description}</p>

      {request.photoDataUrl && (
        <img
          src={request.photoDataUrl}
          alt={`Proof photo for: ${request.title}`}
          className="request-card-photo"
          onClick={() => window.open(request.photoDataUrl, "_blank")}
        />
      )}

      <div className="request-card-meta">
        <span className="badge category-badge">{request.category}</span>
        <span className="request-card-date">
          Submitted {formatDate(request.dateSubmitted)}
        </span>
      </div>

      {request.status === "Declined" && request.declineReason && (
        <p className="decline-reason">
          <strong>Declined:</strong> {request.declineReason}
        </p>
      )}

      <div className="request-card-footer">
        <span className="request-card-requester">{request.requestedBy}</span>
        {actions ? (
          actions
        ) : editable ? (
          <label className="status-select-wrap">
            <span
              className={`status-dot status-dot--${statusSlug(request.status)}`}
            />
            <select
              className="status-select"
              value={request.status}
              onChange={(e) =>
                onStatusChange!(request.id, e.target.value as RequestStatus)
              }
              aria-label={`Status for ${request.title}`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="status-badge-wrap">
            <span
              className={`status-dot status-dot--${statusSlug(request.status)}`}
            />
            <span className="status-badge-text">{request.status}</span>
          </span>
        )}
      </div>
    </article>
  );
}

function statusSlug(status: RequestStatus): string {
  return status.toLowerCase().replace(/\s+/g, "-");
}