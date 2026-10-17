import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u; // any language
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELD_ORDER = ["name", "email", "password", "agree"];
const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

const cleanName = (value) => value.replace(/\s+/g, " ").trim();

// The same rules the server applies, so mistakes are caught before sending.
function validate(mode, data, agree) {
  const errors = {};

  if (mode === "signup") {
    const name = cleanName(data.name);
    if (!name) errors.name = "Enter your name.";
    else if (name.length < 2 || name.length > 50)
      errors.name = "Name must be 2 to 50 characters.";
    else if (!NAME_RE.test(name))
      errors.name = "Use letters only (spaces, - and ' are allowed).";
  }

  const email = data.email.trim();
  if (!email) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  if (!data.password) {
    errors.password = mode === "login" ? "Enter your password." : "Enter a password.";
  } else if (mode === "signup") {
    if (data.password.length < 8) errors.password = "Use at least 8 characters.";
    else if (new TextEncoder().encode(data.password).length > 72)
      errors.password = "Password is too long (72 bytes at most).";
  }

  if (mode === "signup" && !agree)
    errors.agree = "Please accept the terms to create an account.";

  return errors;
}

const EyeIcon = ({ off }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
);

// Defined outside LoginPopup on purpose: a component created inside another
// component is rebuilt on every keystroke and the input would lose focus.
const Field = ({ id, label, error, hint, children }) => (
  <div className="auth-field">
    <label htmlFor={id}>{label}</label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="auth-error" role="alert">
        {error}
      </p>
    ) : hint ? (
      <p id={`${id}-hint`} className="auth-hint">
        {hint}
      </p>
    ) : null}
  </div>
);

const LoginPopup = ({ setShowLogin }) => {
  const { url, login } = useContext(StoreContext);

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);

  const dialogRef = useRef(null);
  const isLogin = mode === "login";

  const close = () => setShowLogin(false);

  // Lock the page behind the popup and give focus back to the Sign in button on close.
  useEffect(() => {
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, []);

  // Start typing straight away (and again when switching between Login and Sign Up).
  useEffect(() => {
    dialogRef.current?.querySelector("input")?.focus();
  }, [mode]);

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    // keep Tab inside the popup
    if (event.key === "Tab") {
      const items = dialogRef.current?.querySelectorAll(FOCUSABLE);
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setShowPassword(false);
    setData((d) => ({ ...d, password: "" }));
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((d) => ({ ...d, [name]: value }));
    if (errors[name] || errors.form) {
      setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
    }
  };

  const focusFirstError = (found) => {
    const first = FIELD_ORDER.find((key) => found[key]);
    if (first) document.getElementById(`auth-${first}`)?.focus();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const found = validate(mode, data, agree);
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstError(found);
      return;
    }

    const payload = isLogin
      ? { email: data.email.trim(), password: data.password }
      : {
          name: cleanName(data.name),
          email: data.email.trim(),
          password: data.password,
        };

    setLoading(true);
    // A free server that has been idle can take up to a minute to wake up.
    const slowTimer = setTimeout(() => setSlow(true), 5000);

    try {
      const response = await axios.post(
        url + (isLogin ? "/api/user/login" : "/api/user/register"),
        payload,
        { timeout: 70000 }
      );

      if (response.data.success && response.data.token) {
        await login(response.data.token);
        close();
        return;
      }
      setErrors({ form: response.data.message || "Something went wrong. Please try again." });
    } catch (error) {
      if (error.response) {
        const body = error.response.data || {};
        const next = {
          ...(body.errors || {}),
          form: body.message || "Something went wrong. Please try again.",
        };
        setErrors(next);
        focusFirstError(next);
      } else if (error.request) {
        // the request left the browser but nothing came back: offline, wrong API address, or server down
        setErrors({ form: "Can't reach the server. Check your connection and try again." });
      } else {
        // a bug in the page itself, not a network problem
        console.error("Sign-in failed inside the app:", error);
        setErrors({ form: "Something went wrong in the app. Please refresh and try again." });
      }
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setLoading(false);
    }
  };

  const describe = (key, hasHint) =>
    errors[key] ? `auth-${key}-error` : hasHint ? `auth-${key}-hint` : undefined;

  return (
    <div
      className="login-popup"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          // preventDefault stops the browser moving focus to the page after the
          // popup closes, so focus can go back to the Sign in button
          event.preventDefault();
          close();
        }
      }}
      onKeyDown={onKeyDown}
    >
      <div
        ref={dialogRef}
        className="login-popup-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <div className="login-popup-title">
          <div>
            <h2 id="auth-title">{isLogin ? "Welcome back" : "Create your account"}</h2>
            <p>
              {isLogin
                ? "Log in to see your cart and orders."
                : "It takes less than a minute."}
            </p>
          </div>
          <button
            type="button"
            className="login-popup-close"
            onClick={close}
            aria-label="Close"
          >
            <img src={assets.cross_icon} alt="" />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="login-popup-form">
          {!isLogin && (
            <Field id="auth-name" label="Name" error={errors.name}>
              <input
                id="auth-name"
                type="text"
                name="name"
                value={data.name}
                onChange={onChangeHandler}
                placeholder="Your name"
                autoComplete="name"
                maxLength={50}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describe("name")}
              />
            </Field>
          )}

          <Field id="auth-email" label="Email" error={errors.email}>
            <input
              id="auth-email"
              type="email"
              name="email"
              value={data.email}
              onChange={onChangeHandler}
              placeholder="you@example.com"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              inputMode="email"
              maxLength={254}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describe("email")}
            />
          </Field>

          <Field
            id="auth-password"
            label="Password"
            error={errors.password}
            hint={isLogin ? undefined : "At least 8 characters."}
          >
            <div className="auth-password">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={data.password}
                onChange={onChangeHandler}
                placeholder={isLogin ? "Your password" : "Create a password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                maxLength={128}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={describe("password", !isLogin)}
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                <EyeIcon off={showPassword} />
              </button>
            </div>
          </Field>

          {!isLogin && (
            <div className="auth-field">
              <label className="login-popup-condition">
                <input
                  id="auth-agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked);
                    if (e.target.checked) setErrors((p) => ({ ...p, agree: "" }));
                  }}
                  aria-invalid={Boolean(errors.agree)}
                  aria-describedby={describe("agree")}
                />
                <span>I agree to the terms of use and privacy policy.</span>
              </label>
              {errors.agree && (
                <p id="auth-agree-error" className="auth-error" role="alert">
                  {errors.agree}
                </p>
              )}
            </div>
          )}

          {errors.form && (
            <p className="auth-banner" role="alert">
              {errors.form}
            </p>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading && <span className="auth-spinner" aria-hidden="true" />}
            {loading
              ? isLogin
                ? "Logging in…"
                : "Creating account…"
              : isLogin
                ? "Log in"
                : "Create account"}
          </button>

          {slow && (
            <p className="auth-note" role="status">
              The server is waking up. This can take up to a minute the first time.
            </p>
          )}
        </form>

        <p className="login-popup-switch">
          {isLogin ? "New here? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => switchMode(isLogin ? "signup" : "login")}
          >
            {isLogin ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPopup;