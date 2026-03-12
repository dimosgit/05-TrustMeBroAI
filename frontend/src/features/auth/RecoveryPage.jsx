import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { trackEvent } from "../../lib/analytics/tracking";
import { ApiError, ApiNetworkError, ApiTimeoutError } from "../../lib/api/client";
import { requestRecoveryAuth } from "../../lib/api/authApi";
import { useAuth } from "./AuthContext";
import { isValidEmailAddress, sanitizeRedirectPath } from "./utils";

export default function RecoveryPage() {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const redirectPath = sanitizeRedirectPath(searchParams.get("redirect"));

  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const loginHref = useMemo(() => {
    const params = new URLSearchParams();
    const trimmedEmail = email.trim();

    if (trimmedEmail) {
      params.set("email", trimmedEmail);
    }
    params.set("redirect", redirectPath);

    return `/login?${params.toString()}`;
  }, [email, redirectPath]);

  if (isAuthenticated) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">You are already signed in</h1>
        <p className="text-sm text-slate-300">
          Signed in as <span className="font-semibold text-white">{user?.email || "your account"}</span>.
        </p>
        <Link
          to={redirectPath}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
        >
          Continue
        </Link>
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!isValidEmailAddress(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      await requestRecoveryAuth({
        email: trimmedEmail,
        redirectPath
      });
      trackEvent("recovery_requested", {
        email_domain: trimmedEmail.split("@")[1] || null,
        redirect_path: redirectPath
      });
      setIsSubmitted(true);
    } catch (submitError) {
      if (
        submitError instanceof ApiTimeoutError ||
        submitError instanceof ApiNetworkError ||
        (submitError instanceof ApiError && submitError.status >= 500)
      ) {
        setError("Server is unavailable. Please try again.");
      } else if (submitError instanceof ApiError) {
        setError(submitError.message || "Could not start recovery. Please try again.");
      } else {
        setError("Server is unavailable. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Account Recovery</p>
        <h1 className="text-2xl font-bold tracking-tight text-white">Recovery email fallback</h1>
        <p className="text-sm text-slate-400">
          Use this only when passkey sign-in is unavailable on your current device.
        </p>
      </header>

      {isSubmitted ? (
        <div className="space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
          <h2 className="text-lg font-semibold text-emerald-300">Check your email</h2>
          <p className="text-sm text-slate-200">
            If the email is valid, a secure recovery link has been sent to{" "}
            <span className="font-semibold text-white">{email.trim()}</span>.
          </p>
          <p className="text-xs text-slate-300">Open it on this device to complete sign-in.</p>
          <Link to={loginHref} className="text-sm font-semibold text-blue-300 hover:text-blue-200">
            Back to passkey sign-in
          </Link>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={handleSubmit}>
          {error ? <InlineAlert>{error}</InlineAlert> : null}

          <label className="block text-left text-sm font-medium text-slate-300">
            Account email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/30"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-bold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending recovery email..." : "Send recovery email"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-slate-400">
        Prefer passkeys?{" "}
        <Link to={loginHref} className="font-semibold text-blue-300 hover:text-blue-200">
          Return to sign-in
        </Link>
      </p>
    </div>
  );
}
