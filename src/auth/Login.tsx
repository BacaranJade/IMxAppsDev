import React, { useState, useCallback, FormEvent } from "react";
import "./Login.css";

type View = "login" | "register" | "forgot";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface ForgotPayload {
  email: string;
}

export interface LoginProps {
  onLogin?: (payload: LoginPayload) => void | Promise<void>;
  onRegister?: (payload: RegisterPayload) => void | Promise<void>;
  onForgotPassword?: (payload: ForgotPayload) => void | Promise<void>;
  errorMessage?: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MOUTH = {
  neutral:
    "M 75,115 C 79,120 91,126 101,125 110,125 126,118 127,114 125,117 117,125 101,125 85,126 79,117 75,115 Z",
  interestedValid:
    "M 75,115 C 79,110 92,117 102,117 111,117 123,111 127,114 131,117 123,136 102,136 81,137 73,121 75,115 Z",
  interestedTyping:
    "M 75,115 C 79,110 92,119 101,119 110,119 123,111 127,114 131,117 118,131 102,132 87,132 73,121 75,115 Z",
  worried:
    "M 78,122 C 84,114 96,113 101,116 106,113 118,114 124,122 118,120 110,121 101,120 92,121 84,120 78,122 Z",
};

const ARM_RESTING_LEFT =
  "M 155,88 C 191,90 194,114 192,125 191,137 172,109 155,116";
const ARM_RESTING_RIGHT =
  "M 45,89 C 25,92 9,108 11,124 13,141 27,115 48,119";
const ARM_COVER_LEFT =
  "M 155,88 C 145,68 105,51 103,62 102,74 123,117 155,116";
const ARM_COVER_RIGHT =
  "M 45,89 C 54,64 103,48 106,64 108,80 65,121 48,119";

function Mascot({
  emailValue,
  emailValid,
  coveringEyes,
}: {
  emailValue: string;
  emailValid: boolean;
  coveringEyes: boolean;
}) {
  const typing = emailValue.length > 0;
  const mouthPath = coveringEyes
    ? MOUTH.worried
    : !typing
    ? MOUTH.neutral
    : emailValid
    ? MOUTH.interestedValid
    : MOUTH.interestedTyping;

  const shift = Math.min(emailValue.length / 2.25, 13.33);

  return (
    <svg
      className="login-mascot"
      width="150"
      height="150"
      viewBox="0 0 200 200"
      role="img"
      aria-label="A friendly mascot"
    >
      <desc>A smiling mascot that floats and reacts to form input.</desc>
      <g
        className="mascot-body"
        fill="#fff"
        stroke="var(--accent-deep)"
        strokeWidth={3}
        strokeLinejoin="round"
      >
        <path d="M 54,181 C 44,131 13,11 99,11 185,12 164,110 150,182 146,195 139,185 137,177 134,170 126,169 124,179 120,192 114,190 109,179 105,167 98,166 94,179 92,185 85,193 79,179 74,170 68,168 66,179 62,193 56,191 54,181 Z" />
        <path
          fill="#fffef8"
          d="M 69,71 C 69,64 73,54 84,55 96,56 100,62 100,70 100,79 89,83 84,83 78,83 69,80 69,71 Z"
        />
        <path
          fill="#fffef8"
          d="M 105,73 C 104,66 108,57 120,57 130,57 134,65 134,71 134,80 125,85 119,85 114,85 105,82 105,73 Z"
        />
        {!coveringEyes && (
          <>
            <circle
              cx={78 + shift}
              cy={69}
              r={3}
              fill="rgba(30,20,10,0.55)"
              style={{ transition: "cx 0.15s ease-out" }}
            />
            <circle
              cx={113 + shift}
              cy={71}
              r={3}
              fill="rgba(30,20,10,0.55)"
              style={{ transition: "cx 0.15s ease-out" }}
            />
          </>
        )}
        <path
          className="mascot-mouth"
          d={mouthPath}
          fill="var(--accent-deep)"
          stroke="#7a4310"
        />
        <path
          className="mascot-arm mascot-arm-right"
          d={coveringEyes ? ARM_COVER_RIGHT : ARM_RESTING_RIGHT}
        />
        <path
          className="mascot-arm mascot-arm-left"
          d={coveringEyes ? ARM_COVER_LEFT : ARM_RESTING_LEFT}
        />
      </g>
    </svg>
  );
}

function FloatField({
  id,
  label,
  type,
  value,
  onChange,
  onFocus,
  onBlur,
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  type: "email" | "password";
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoComplete: string;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="field">
      <div className={`field-shell ${error ? "field-shell--error" : ""}`}>
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <label htmlFor={id} className={active ? "label label--active" : "label"}>
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Login({
  onLogin,
  onRegister,
  onForgotPassword,
  errorMessage,
}: LoginProps) {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [coveringEyes, setCoveringEyes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [sentTo, setSentTo] = useState<string | null>(null);

  const emailValid = EMAIL_RE.test(email);

  const resetFeedback = useCallback(() => {
    setFieldErrors({});
    setSentTo(null);
  }, []);

  function switchView(next: View) {
    setView(next);
    setPassword("");
    setConfirmPassword("");
    resetFeedback();
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!email) errors.email = "Enter your email address.";
    else if (!emailValid) errors.email = "That email address doesn't look right.";

    if (view !== "forgot") {
      if (!password) errors.password = "Enter your password.";
      else if (view === "register" && password.length < 8)
        errors.password = "Use at least 8 characters.";
    }

    if (view === "register") {
      if (!confirmPassword) errors.confirmPassword = "Confirm your password.";
      else if (confirmPassword !== password)
        errors.confirmPassword = "Passwords don't match.";
    }

    return errors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      if (view === "login") {
        await onLogin?.({ email, password });
      } else if (view === "register") {
        await onRegister?.({ email, password });
      } else {
        await onForgotPassword?.({ email });
        setSentTo(email);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const heading =
    view === "login"
      ? "Welcome back"
      : view === "register"
      ? "Create your account"
      : "Reset your password";

  const submitLabel =
    view === "login"
      ? submitting
        ? "Logging in…"
        : "Log in"
      : view === "register"
      ? submitting
        ? "Creating account…"
        : "Create account"
      : submitting
      ? "Sending link…"
      : "Send reset link";

  return (
    <div className="login-wrap">
      <div className="login-card">
        <Mascot
          emailValue={email}
          emailValid={emailValid}
          coveringEyes={coveringEyes}
        />

        <h1 className="login-heading">{heading}</h1>
        <p className="login-subheading">School Maintenance Request System</p>

        {view !== "forgot" && (
          <div className="tabs" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              role="tab"
              aria-selected={view === "login"}
              className={`tab ${view === "login" ? "tab--active" : ""}`}
              onClick={() => switchView("login")}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "register"}
              className={`tab ${view === "register" ? "tab--active" : ""}`}
              onClick={() => switchView("register")}
            >
              Register
            </button>
          </div>
        )}

        {view === "forgot" && sentTo ? (
          <div className="login-notice">
            <p>
              If an account exists for <strong>{sentTo}</strong>, a reset link
              is on its way.
            </p>
            <button
              type="button"
              className="link-button"
              onClick={() => switchView("login")}
            >
              Back to log in
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <FloatField
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(v) => {
                setEmail(v);
                if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
              }}
              autoComplete="email"
              error={fieldErrors.email}
            />

            {view !== "forgot" && (
              <FloatField
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  if (fieldErrors.password)
                    setFieldErrors((f) => ({ ...f, password: undefined }));
                }}
                onFocus={() => setCoveringEyes(true)}
                onBlur={() => setCoveringEyes(false)}
                autoComplete={
                  view === "register" ? "new-password" : "current-password"
                }
                error={fieldErrors.password}
              />
            )}

            {view === "register" && (
              <FloatField
                id="confirm-password"
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(v) => {
                  setConfirmPassword(v);
                  if (fieldErrors.confirmPassword)
                    setFieldErrors((f) => ({ ...f, confirmPassword: undefined }));
                }}
                onFocus={() => setCoveringEyes(true)}
                onBlur={() => setCoveringEyes(false)}
                autoComplete="new-password"
                error={fieldErrors.confirmPassword}
              />
            )}

            {view === "login" && (
              <button
                type="button"
                className="link-button link-button--right"
                onClick={() => switchView("forgot")}
              >
                Forgot password?
              </button>
            )}

            {errorMessage && (
              <p className="form-error" role="alert">
                {errorMessage}
              </p>
            )}

            <button type="submit" className="submit-button" disabled={submitting}>
              {submitLabel}
            </button>

            {view === "forgot" && (
              <button
                type="button"
                className="link-button"
                onClick={() => switchView("login")}
              >
                Back to log in
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}