import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { trackEvent } from "../../lib/analytics/tracking";
import { ApiError, ApiNetworkError, ApiTimeoutError } from "../../lib/api/client";
import { verifyRecoveryAuth } from "../../lib/api/authApi";
import { t } from "../../lib/i18n";
import { useAuth } from "./AuthContext";
import { sanitizeRedirectPath } from "./utils";

export default function AuthVerifyPage() {
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const redirectPath = sanitizeRedirectPath(searchParams.get("redirect"));

  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function verifyToken() {
      if (!token) {
        trackEvent("recovery_verify_failure", {
          reason: "missing_token",
          redirect_path: redirectPath
        });
        setError(t("auth.verifyMissingToken"));
        setIsVerifying(false);
        return;
      }

      try {
        const recoveryPayload = await verifyRecoveryAuth({ token });
        await setAuthenticatedUser(recoveryPayload.user, {
          requiresPasskeyEnrollment: recoveryPayload.requiresPasskeyEnrollment
        });
        trackEvent("recovery_verify_success", {
          redirect_path: redirectPath,
          requires_passkey_enrollment: recoveryPayload.requiresPasskeyEnrollment
        });

        if (!isCancelled) {
          navigate(redirectPath, { replace: true });
        }
      } catch (verifyError) {
        trackEvent("recovery_verify_failure", {
          reason: verifyError instanceof ApiError ? `api_${verifyError.status}` : "network_error",
          redirect_path: redirectPath
        });

        if (!isCancelled) {
          if (
            verifyError instanceof ApiTimeoutError ||
            verifyError instanceof ApiNetworkError ||
            (verifyError instanceof ApiError && verifyError.status >= 500)
          ) {
            setError(t("auth.serverUnavailable"));
          } else if (verifyError instanceof ApiError) {
            setError(verifyError.message || t("auth.verifyInvalidOrExpired"));
          } else {
            setError(t("auth.serverUnavailable"));
          }
        }
      } finally {
        if (!isCancelled) {
          setIsVerifying(false);
        }
      }
    }

    void verifyToken();

    return () => {
      isCancelled = true;
    };
  }, [navigate, redirectPath, setAuthenticatedUser, token]);

  if (isVerifying) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{t("auth.accountRecoveryLabel")}</p>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("auth.verifyLoadingTitle")}</h1>
        <p className="text-sm text-slate-400">{t("auth.verifyLoadingSubtitle")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{t("auth.accountRecoveryLabel")}</p>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("auth.verifyFailureTitle")}</h1>
      </header>

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <div className="flex flex-col gap-2 text-center">
        <Link
          to={`/auth/recovery?redirect=${encodeURIComponent(redirectPath)}`}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
        >
          {t("auth.verifyRequestAnother")}
        </Link>
        <Link
          to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
          className="text-sm font-semibold text-blue-300 hover:text-blue-200"
        >
          {t("auth.verifyBackToPasskey")}
        </Link>
      </div>
    </div>
  );
}
