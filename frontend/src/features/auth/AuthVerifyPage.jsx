import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { trackEvent } from "../../lib/analytics/tracking";
import { ApiError, ApiNetworkError, ApiTimeoutError } from "../../lib/api/client";
import { verifyRecoveryAuth } from "../../lib/api/authApi";
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
        setError("This recovery link is invalid. Request a new recovery email.");
        setIsVerifying(false);
        return;
      }

      try {
        const authUser = await verifyRecoveryAuth({ token });
        await setAuthenticatedUser(authUser);
        trackEvent("recovery_verify_success", {
          redirect_path: redirectPath
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
            setError("Server is unavailable. Please try again.");
          } else if (verifyError instanceof ApiError) {
            setError(verifyError.message || "This recovery link is invalid or expired.");
          } else {
            setError("Server is unavailable. Please try again.");
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Account Recovery</p>
        <h1 className="text-2xl font-bold tracking-tight text-white">Verifying your recovery link</h1>
        <p className="text-sm text-slate-400">Please wait a moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Account Recovery</p>
        <h1 className="text-2xl font-bold tracking-tight text-white">Could not sign you in</h1>
      </header>

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <div className="flex flex-col gap-2 text-center">
        <Link
          to={`/auth/recovery?redirect=${encodeURIComponent(redirectPath)}`}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
        >
          Request another recovery email
        </Link>
        <Link
          to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
          className="text-sm font-semibold text-blue-300 hover:text-blue-200"
        >
          Back to passkey sign-in
        </Link>
      </div>
    </div>
  );
}
