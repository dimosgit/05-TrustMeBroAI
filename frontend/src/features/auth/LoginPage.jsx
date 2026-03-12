import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { trackEvent } from "../../lib/analytics/tracking";
import { ApiError, ApiNetworkError, ApiTimeoutError } from "../../lib/api/client";
import {
  requestPasskeyLoginOptions,
  verifyPasskeyLogin
} from "../../lib/api/authApi";
import { t } from "../../lib/i18n";
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
      setError(t("auth.invalidEmail"));
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

      await setAuthenticatedUser(authUser, { requiresPasskeyEnrollment: false });
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
        setError(t("auth.serverUnavailable"));
      } else if (submitError instanceof ApiError) {
        setError(submitError.message || t("auth.loginFailure"));
      } else if (submitError instanceof Error) {
        setError(submitError.message || t("auth.loginFailure"));
      } else {
        setError(t("auth.loginFailure"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthenticated) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("auth.alreadySignedInTitle")}</h1>
        <p className="text-sm text-slate-300">
          {t("auth.signedInAs", { email: user?.email || t("auth.signedInFallbackEmail") })}
        </p>
        <Link
          to={redirectPath}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
        >
          {t("auth.continue")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{t("auth.accountLabel")}</p>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("auth.loginTitle")}</h1>
        <p className="text-sm text-slate-400">
          {t("auth.loginSubtitle")}
        </p>
      </header>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {error ? <InlineAlert>{error}</InlineAlert> : null}

        <label className="block text-left text-sm font-medium text-slate-300">
          {t("auth.accountEmailLabel")}
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/30"
            placeholder={t("auth.emailPlaceholder")}
            autoComplete="email"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t("auth.loginSigningIn") : t("auth.loginSubmit")}
        </button>
      </form>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center text-xs text-slate-400">
        {t("auth.loginFallbackPrefix")}{" "}
        <Link to={recoveryHref} className="font-semibold text-blue-300 hover:text-blue-200">
          {t("auth.loginFallbackAction")}
        </Link>
      </div>

      <p className="text-center text-sm text-slate-400">
        {t("auth.loginNewPrefix")}{" "}
        <Link to={registerHref} className="font-semibold text-blue-300 hover:text-blue-200">
          {t("auth.loginNewAction")}
        </Link>
      </p>
    </div>
  );
}
