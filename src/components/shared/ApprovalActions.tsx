import React, { useState } from "react";

/** Approve / Decline controls for a pending request (admin only). */
export default function ApprovalActions({
  onApprove,
  onDecline,
}: {
  onApprove: () => void;
  onDecline: (reason: string) => void;
}) {
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");

  if (declining) {
    return (
      <div className="decline-form">
        <input
          type="text"
          value={reason}
          placeholder="Reason (optional)"
          autoFocus
          onChange={(e) => setReason(e.target.value)}
          aria-label="Reason for declining"
        />
        <button
          type="button"
          className="btn-danger"
          onClick={() => onDecline(reason.trim())}
        >
          Confirm decline
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setDeclining(false)}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="approval-actions">
      <button type="button" className="btn-secondary" onClick={() => setDeclining(true)}>
        Decline
      </button>
      <button type="button" className="btn-primary" onClick={onApprove}>
        Approve
      </button>
    </div>
  );
}