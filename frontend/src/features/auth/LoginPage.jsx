import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { trackEvent } from "../../lib/analytics/tracking";
import { ApiError, ApiNetworkError, ApiTimeoutError } from "../../lib/api/client";
import {
  requestPasskeyLoginOptions,
  verifyPasskeyLogin
} from "../../lib/api/authApi";
import { getPasskeyCredential } from "./passkeyClient";
import { useAuth } from "./AuthContext";
import { isValidEmailAddress, sanitizeRedirectPath } from "./utils";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuthenticatedUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const redirectPath = sanitizeRedirectPath(searchParams.get("redirect"));

  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerHref = useMemo(() => {
    const params = new URLSearchParams();
    const trimmedEmail = email.trim();

    if (trimmedEmail) {
      params.set("email", trimmedEmail);
    }
    params.set("redirect", redirectPath);

    return `/register?${params.toString()}`;
  }, [email, redirectPath]);

  const recoveryHref = useMemo(() => {
    const params = new URLSearchParams();
    const trimmedEmail = email.trim();

    if (trimmedEmail) {
      params.set("email", trimmedEmail);
    }
    params.set("redirect", redirectPath);

    return `/auth/recovery?${params.toString()}`;
  }, [email, redirectPath]);

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
      const optionsPayload = await requestPasskeyLoginOptions({
        email: trimmedEmail
      });
      const challengeId = optionsPayload?.challenge_id || optionsPayload?.challengeId || null;
      const publicKeyOptions = optionsPayload?.public_key || optionsPayload?.publicKey || optionsPayload;
      const credential = await getPasskeyCredential(publicKeyOptions);
      const authUser = await verifyPasskeyLogin({
        challengeId,
        credential
      });

      await setAuthenticatedUser(authUser);
      trackEvent("passkey_login_success", {
        email_domain: trimmedEmail.split("@")[1] || null,
        redirect_path: redirectPath
      });
      navigate(redirectPath, { replace: true });
    } catch (submitError) {
      trackEvent("passkey_login_failure", {
        reason: submitError instanceof ApiError ? `api_${submitError.status}` : "client_error",
        redirect_path: redirectPath
      });

      if (
        submitError instanceof ApiTimeoutError ||
        submitError instanceof ApiNetworkError ||
        (submitError instanceof ApiError && submitError.status >= 500)
      ) {
        setError("Server is unavailable. Please try again.");
      } else if (submitError instanceof ApiError) {
        setError(submitError.message || "Could not complete passkey sign-in.");
      } else if (submitError instanceof Error) {
        setError(submitError.message || "Could not complete passkey sign-in.");
      } else {
        setError("Could not complete passkey sign-in.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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

  return (
    <div className="space-y-4">
      <header className="space-y-1 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Account</p>
        <h1 className="text-2xl font-bold tracking-tight text-white">Sign in with passkey</h1>
        <p className="text-sm text-slate-400">
          Use the passkey saved on your device for fast, passwordless sign-in.
        </p>
      </header>

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
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in with passkey"}
        </button>
      </form>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center text-xs text-slate-400">
        Need account recovery or first-device bootstrap?{" "}
        <Link to={recoveryHref} className="font-semibold text-blue-300 hover:text-blue-200">
          Use email recovery
        </Link>
      </div>

      <p className="text-center text-sm text-slate-400">
        New here?{" "}
        <Link to={registerHref} className="font-semibold text-blue-300 hover:text-blue-200">
          Create account with passkey
        </Link>
      </p>
    </div>
  );
}
