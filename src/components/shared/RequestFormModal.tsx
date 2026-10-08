import React, { useState, FormEvent } from "react";
import { NewRequestInput, RequestCategory, RequestPriority } from "../../types";
import { DuplicateMatch } from "./requestUtils";

const CATEGORIES: RequestCategory[] = [
  "Electrical",
  "Plumbing",
  "HVAC",
  "Furniture",
  "Cleaning",
  "IT / Technology",
  "Structural",
  "Other",
];

const PRIORITIES: RequestPriority[] = ["Low", "Medium", "High", "Urgent"];

interface Errors {
  title?: string;
  location?: string;
  description?: string;
  photo?: string;
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

export default function RequestFormModal({
  onClose,
  onSubmit,
  findDuplicate,
}: {
  onClose: () => void;
  onSubmit: (input: NewRequestInput) => void;
  /** Optional: returns an existing active report for the same issue, if there is one. */
  findDuplicate?: (input: {
    location: string;
    category: RequestCategory;
  }) => DuplicateMatch | undefined;
}) {
  const [duplicate, setDuplicate] = useState<DuplicateMatch | null>(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<RequestCategory>("Electrical");
  const [priority, setPriority] = useState<RequestPriority>("Medium");
  const [description, setDescription] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(
    undefined
  );
  const [photoName, setPhotoName] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Errors>({});

  function validate(): Errors {
    const e: Errors = {};
    if (!title.trim()) e.title = "Give the request a short title.";
    if (!location.trim()) e.location = "Where is this located?";
    if (!description.trim() || description.trim().length < 10)
      e.description = "Add a bit more detail (at least 10 characters).";
    return e;
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((er) => ({ ...er, photo: "Please choose an image file." }));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setErrors((er) => ({ ...er, photo: "Image must be under 5MB." }));
      return;
    }

    setErrors((er) => ({ ...er, photo: undefined }));
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataUrl(reader.result as string);
      setPhotoName(file.name);
    };
    reader.onerror = () => {
      setErrors((er) => ({
        ...er,
        photo: "Couldn't read that file. Try a different image.",
      }));
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhotoDataUrl(undefined);
    setPhotoName(undefined);
    setErrors((er) => ({ ...er, photo: undefined }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const match = findDuplicate?.({ location: location.trim(), category });
    if (match) {
      setDuplicate(match);
      return;
    }
    submitRequest();
  }

  function submitRequest() {
    onSubmit({
      title: title.trim(),
      location: location.trim(),
      category,
      priority,
      description: description.trim(),
      photoDataUrl,
    });
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-request-heading"
      >
        <div className="modal-header">
          <h2 id="new-request-heading">New maintenance request</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <label htmlFor="req-title">Title</label>
            <input
              id="req-title"
              type="text"
              value={title}
              placeholder="e.g. Broken window latch"
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((er) => ({ ...er, title: undefined }));
              }}
            />
            {errors.title && <p className="form-field-error">{errors.title}</p>}
          </div>

          <div className="form-row">
            <label htmlFor="req-location">Location</label>
            <input
              id="req-location"
              type="text"
              value={location}
              placeholder="e.g. Main Building · Room 112"
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location)
                  setErrors((er) => ({ ...er, location: undefined }));
              }}
            />
            {errors.location && (
              <p className="form-field-error">{errors.location}</p>
            )}
          </div>

          <div className="form-row form-row--split">
            <div>
              <label htmlFor="req-category">Category</label>
              <select
                id="req-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as RequestCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="req-priority">Priority</label>
              <select
                id="req-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequestPriority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="req-description">Description</label>
            <textarea
              id="req-description"
              rows={4}
              value={description}
              placeholder="What's wrong, and anything the maintenance team should know?"
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((er) => ({ ...er, description: undefined }));
              }}
            />
            {errors.description && (
              <p className="form-field-error">{errors.description}</p>
            )}
          </div>

          <div className="form-row">
            <label htmlFor="req-photo">Proof photo (Required)</label>

            {photoDataUrl ? (
              <div className="photo-preview">
                <img src={photoDataUrl} alt="Preview of the uploaded proof" />
                <div className="photo-preview-meta">
                  <span className="photo-preview-name">{photoName}</span>
                  <button
                    type="button"
                    className="btn-secondary photo-preview-remove"
                    onClick={removePhoto}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label htmlFor="req-photo" className="photo-dropzone">
                <span className="photo-dropzone-icon" aria-hidden="true">
                  📷
                </span>
                <span>Click to upload a photo of the issue</span>
                <span className="photo-dropzone-hint">
                  JPG or PNG, up to 5MB
                </span>
              </label>
            )}

            <input
              id="req-photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="photo-input"
            />

            {errors.photo && <p className="form-field-error">{errors.photo}</p>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit request
            </button>
          </div>
        </form>
      </div>

      {duplicate && (
        <div className="duplicate-overlay">
          <div
            className="duplicate-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="duplicate-heading"
          >
            <h3 id="duplicate-heading">
              {duplicate.reportedByYou
                ? "You already reported this"
                : "This issue was already reported"}
            </h3>
            <p>
              A report for <strong>{duplicate.request.category}</strong> issues at{" "}
              <strong>{duplicate.request.location}</strong> is already{" "}
              {duplicate.request.status === "Pending"
                ? "waiting for admin approval"
                : `being handled (status: ${duplicate.request.status})`}
              . It was submitted on{" "}
              {new Date(duplicate.request.dateSubmitted).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              .
            </p>
            <p className="duplicate-note">
              "{duplicate.request.title}" – you don't need to report it again.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-primary" onClick={onClose}>
                OK, got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}