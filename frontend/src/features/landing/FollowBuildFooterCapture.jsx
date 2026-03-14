import { useState } from "react";
import { ApiError } from "../../lib/api/client";
import { captureFollowBuildEmail } from "../../lib/api/growthApi";
import { t } from "../../lib/i18n";

export default function FollowBuildFooterCapture() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [followBuildEmail, setFollowBuildEmail] = useState("");
  const [followBuildError, setFollowBuildError] = useState("");
  const [followBuildSubmitted, setFollowBuildSubmitted] = useState(false);
  const [isSubmittingFollowBuild, setIsSubmittingFollowBuild] = useState(false);

  async function handleFollowBuildSubmit(event) {
    event.preventDefault();
    const normalizedEmail = followBuildEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFollowBuildError(t("landing.followBuild.invalidEmail"));
      return;
    }

    setFollowBuildError("");
    setIsSubmittingFollowBuild(true);

    try {
      await captureFollowBuildEmail({ email: normalizedEmail });
      setFollowBuildSubmitted(true);
      setIsExpanded(true);
      setFollowBuildEmail("");
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 400) {
        setFollowBuildError(t("landing.followBuild.invalidEmail"));
      } else {
        setFollowBuildError(t("landing.followBuild.genericError"));
      }
    } finally {
      setIsSubmittingFollowBuild(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left">
      <button
        type="button"
        onClick={() => setIsExpanded((previous) => !previous)}
        className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left transition hover:border-white/20 hover:bg-white/[0.04]"
        aria-expanded={isExpanded}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {t("landing.followBuild.label")}
        </span>
        <span className="text-xs text-slate-500">{isExpanded ? "Hide" : "Open"}</span>
      </button>

      {isExpanded ? (
        <div className="mt-2">
          {followBuildSubmitted ? (
            <p className="text-sm text-emerald-300">{t("landing.followBuild.success")}</p>
          ) : (
            <form className="space-y-2.5" onSubmit={handleFollowBuildSubmit} noValidate>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <input
                  type="email"
                  value={followBuildEmail}
                  onChange={(event) => setFollowBuildEmail(event.target.value)}
                  placeholder={t("landing.followBuild.placeholder")}
                  className="h-9 w-full rounded-lg border border-white/15 bg-slate-900/70 px-3 text-sm text-white outline-none transition focus:border-blue-400"
                  autoComplete="email"
                />
                <button
                  type="submit"
                  className="h-9 self-start whitespace-nowrap rounded-lg border border-blue-300/35 bg-blue-500/15 px-3.5 text-xs font-semibold text-blue-100 transition hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSubmittingFollowBuild}
                >
                  {isSubmittingFollowBuild ? t("landing.followBuild.submitting") : t("landing.followBuild.cta")}
                </button>
              </div>

              {followBuildError ? (
                <p className="text-xs text-rose-300" role="alert">
                  {followBuildError}
                </p>
              ) : null}

              <p className="text-[11px] text-slate-500">{t("landing.followBuild.consentNote")}</p>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
