import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { useToast } from "../../components/ui/ToastProvider";
import { trackEvent } from "../../lib/analytics/tracking";
import { ApiError, ApiNetworkError, ApiTimeoutError } from "../../lib/api/client";
import {
  requestPasskeyRegisterOptions,
  verifyPasskeyRegister
} from "../../lib/api/authApi";
import { t } from "../../lib/i18n";
import { createPasskeyCredential } from "./passkeyClient";
import { useAuth } from "./AuthContext";
import { isValidEmailAddress, sanitizeRedirectPath } from "./utils";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const {
    isAuthenticated,
    user,
    setAuthenticatedUser,
    dismissPasskeyEnrollmentNudge
  } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectPath = sanitizeRedirectPath(searchParams.get("redirect"));
  const isEnrollmentMode = searchParams.get("enroll") === "1";
  const initialEmail = isEnrollmentMode ? user?.email || "" : searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [emailConsent, setEmailConsent] = useState(Boolean(user?.email_consent));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEnrollmentMode && user?.email) {
      setEmail(user.email);
      setEmailConsent(Boolean(user.email_consent));
    }
  }, [isEnrollmentMode, user]);

  const recoveryHref = useMemo(() => {
    const params = new URLSearchParams();
    const trimmedEmail = email.trim();

    if (trimmedEmail) {
      params.set("email", trimmedEmail);
    }
    params.set("redirect", redirectPath);

    return `/auth/recovery?${params.toString()}`;
  }, [email, redirectPath]);

  const loginHref = useMemo(() => {
    const params = new URLSearchParams();
    const trimmedEmail = email.trim();

    if (trimmedEmail) {
      params.set("email", trimmedEmail);
    }
    params.set("redirect", redirectPath);

    return `/login?${params.toString()}`;
  }, [email, redirectPath]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!isValidEmailAddress(trimmedEmail)) {
      setError(t("auth.invalidEmail"));
      return;
    }

    if (!emailConsent) {
      setError(t("auth.registerConsentRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      const optionsPayload = await requestPasskeyRegisterOptions({
        email: trimmedEmail,
        emailConsent,
        signupSource: isEnrollmentMode ? "recovery_enrollment" : "register_page"
      });
      const challengeId = optionsPayload?.challenge_id || optionsPayload?.challengeId || null;
      const publicKeyOptions = optionsPayload?.public_key || optionsPayload?.publicKey || optionsPayload;
      const credential = await createPasskeyCredential(publicKeyOptions);
      const authUser = await verifyPasskeyRegister({
        challengeId,
        credential
      });

      await setAuthenticatedUser(authUser, { requiresPasskeyEnrollment: false });
      dismissPasskeyEnrollmentNudge();

      if (isEnrollmentMode) {
        trackEvent("passkey_enrollment_success", {
          redirect_path: redirectPath
        });
        notify(t("auth.enrollmentSuccess"), "success");
      } else {
        trackEvent("passkey_register_success", {
          email_domain: trimmedEmail.split("@")[1] || null,
          redirect_path: redirectPath
        });
      }

      navigate(redirectPath, { replace: true });
    } catch (submitError) {
      if (isEnrollmentMode) {
        trackEvent("passkey_enrollment_failure", {
          reason: submitError instanceof ApiError ? `api_${submitError.status}` : "client_error",
          redirect_path: redirectPath
        });
      } else {
        trackEvent("passkey_register_failure", {
          reason: submitError instanceof ApiError ? `api_${submitError.status}` : "client_error",
          redirect_path: redirectPath
        });
      }

      if (
        submitError instanceof ApiTimeoutError ||
        submitError instanceof ApiNetworkError ||
        (submitError instanceof ApiError && submitError.status >= 500)
      ) {
        setError(t("auth.serverUnavailable"));
      } else if (submitError instanceof ApiError) {
        setError(
          submitError.message ||
            (isEnrollmentMode ? t("auth.enrollmentFailure") : t("auth.registerFailure"))
        );
      } else if (submitError instanceof Error) {
        setError(
          submitError.message ||
            (isEnrollmentMode ? t("auth.enrollmentFailure") : t("auth.registerFailure"))
        );
      } else {
        setError(isEnrollmentMode ? t("auth.enrollmentFailure") : t("auth.registerFailure"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthenticated && !isEnrollmentMode) {
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
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {isEnrollmentMode ? t("auth.enrollmentTitle") : t("auth.registerTitle")}
        </h1>
        <p className="text-sm text-slate-400">
          {isEnrollmentMode ? t("auth.enrollmentSubtitle") : t("auth.registerSubtitle")}
        </p>
      </header>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {error ? <InlineAlert>{error}</InlineAlert> : null}

        <label className="block text-left text-sm font-medium text-slate-300">
          {isEnrollmentMode ? t("auth.enrollmentEmailLabel") : t("auth.accountEmailLabel")}
          <input
            type="email"
            required
            value={email}
            readOnly={isEnrollmentMode}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/30"
            placeholder={t("auth.emailPlaceholder")}
            autoComplete="email"
          />
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={emailConsent}
            onChange={(event) => setEmailConsent(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/30 bg-transparent text-blue-500 focus:ring-blue-500"
          />
          <span>{isEnrollmentMode ? t("auth.enrollmentConsentLabel") : t("consent.copy")}</span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? (isEnrollmentMode ? t("auth.enrollmentSubmitting") : t("auth.registerCreating"))
            : (isEnrollmentMode ? t("auth.enrollmentSubmit") : t("auth.registerSubmit"))}
        </button>
      </form>

      {!isEnrollmentMode ? (
        <>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center text-xs text-slate-400">
            {t("auth.registerFallbackPrefix")}{" "}
            <Link to={recoveryHref} className="font-semibold text-blue-300 hover:text-blue-200">
              {t("auth.registerFallbackAction")}
            </Link>
          </div>

          <p className="text-center text-sm text-slate-400">
            {t("auth.registerAlreadyPrefix")}{" "}
            <Link to={loginHref} className="font-semibold text-blue-300 hover:text-blue-200">
              {t("auth.registerAlreadyAction")}
            </Link>
          </p>
        </>
      ) : null}
    </div>
  );
}
