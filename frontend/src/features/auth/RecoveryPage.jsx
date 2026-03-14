import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { trackEvent } from "../../lib/analytics/tracking";
import { ApiError, ApiNetworkError, ApiTimeoutError } from "../../lib/api/client";
import { requestRecoveryAuth } from "../../lib/api/authApi";
import { t } from "../../lib/i18n";
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
        setError(t("auth.serverUnavailable"));
      } else if (submitError instanceof ApiError) {
        setError(submitError.message || t("auth.recoveryFailure"));
      } else {
        setError(t("auth.serverUnavailable"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-2xl">📧</div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("auth.recoveryTitle")}</h1>
        <p className="text-sm text-slate-500">{t("auth.recoverySubtitle")}</p>
      </header>

      {isSubmitted ? (
        <div className="space-y-3 rounded-2xl bg-emerald-500/10 p-5 text-center">
          <div className="text-3xl">📬</div>
          <h2 className="text-base font-semibold text-emerald-300">{t("auth.recoveryCheckEmailTitle")}</h2>
          <p className="text-sm text-slate-300">
            {t("auth.recoveryCheckEmailBody", { email: email.trim() })}
          </p>
          <p className="text-xs text-slate-500">{t("auth.recoveryCheckEmailHint")}</p>
          <Link to={loginHref} className="block text-sm text-slate-400 underline underline-offset-2 hover:text-white">
            {t("auth.recoveryBackToPasskey")}
          </Link>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={handleSubmit}>
          {error ? <InlineAlert>{error}</InlineAlert> : null}

          <label className="block text-left text-sm font-medium text-slate-300">
            {t("auth.accountEmailLabel")}
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-xl bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:ring-2 focus:ring-blue-500/30"
              placeholder={t("auth.emailPlaceholder")}
              autoComplete="email"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t("auth.recoverySending") : t("auth.recoverySubmit")}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-slate-500">
        {t("auth.recoveryPreferPasskeyPrefix")}{" "}
        <Link to={loginHref} className="text-slate-400 underline underline-offset-2 hover:text-white">
          {t("auth.recoveryPreferPasskeyAction")}
        </Link>
      </p>
    </div>
  );
}
