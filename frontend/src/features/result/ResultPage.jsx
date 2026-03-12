import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trackEvent } from "../../lib/analytics/tracking";
import { ApiError, ApiNetworkError, ApiTimeoutError } from "../../lib/api/client";
import {
  normalizeUnlockedResult,
  submitTryItClick,
  submitRecommendationFeedback,
  unlockRecommendation
} from "../../lib/api/recommendationApi";
import { useToast } from "../../components/ui/ToastProvider";
import { useAuth } from "../auth/AuthContext";
import UnlockForm from "../unlock/UnlockForm";
import { t } from "../../lib/i18n";
import { useRecommendation } from "./RecommendationContext";

const REGISTERED_UNLOCK_KEY = "trustmebro.registered_unlock";

const TOOL_FAVICON_DOMAINS = {
  chatgpt: "chat.openai.com",
  claude: "claude.ai",
  copilot: "copilot.microsoft.com",
  perplexity: "perplexity.ai",
  cursor: "cursor.com",
  gemini: "gemini.google.com",
  mistral: "mistral.ai",
  notebooklm: "notebooklm.google.com",
  "copy.ai": "copy.ai",
  "canva magic write": "canva.com",
  canva: "canva.com",
  grok: "x.ai",
  "jasper": "jasper.ai",
  "writesonic": "writesonic.com",
  "grammarly": "grammarly.com",
  "notion ai": "notion.so",
  notion: "notion.so",
  "otter.ai": "otter.ai",
  "midjourney": "midjourney.com",
  "dall-e": "openai.com",
  "stable diffusion": "stability.ai",
  "github copilot": "github.com",
};

function resolveToolLogoUrl(toolName) {
  const key = String(toolName || "").trim().toLowerCase();
  const domain = TOOL_FAVICON_DOMAINS[key] || null;
  if (domain) return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  return null;
}

function resolveToolLogoToken(toolName) {
  return (toolName || "AI").slice(0, 2).toUpperCase();
}

function hasRegisteredUnlockMarker() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(REGISTERED_UNLOCK_KEY) === "1";
}

function setRegisteredUnlockMarker(isEnabled) {
  if (typeof window === "undefined") {
    return;
  }

  if (isEnabled) {
    window.localStorage.setItem(REGISTERED_UNLOCK_KEY, "1");
    return;
  }

  window.localStorage.removeItem(REGISTERED_UNLOCK_KEY);
}

function LockedPrimaryCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-violet-500/5 p-6">
      {/* Glow */}
      <div className="pointer-events-none absolute -top-10 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      {/* Blurred content placeholder */}
      <div className="space-y-3 blur-md select-none">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/20" />
          <div className="space-y-1.5">
            <div className="h-5 w-28 rounded bg-white/30" />
            <div className="h-3 w-44 rounded bg-white/15" />
          </div>
        </div>
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-4/5 rounded bg-white/10" />
      </div>
      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-400/40 bg-blue-500/20 text-blue-400">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-white">{t("result.lockCardTitle")}</p>
        <p className="text-xs text-slate-400">{t("result.lockCardSubtitle")}</p>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { isAuthenticated } = useAuth();
  const {
    resultState,
    setUnlockedResult,
    clearResult
  } = useRecommendation();

  const [manualUnlocking, setManualUnlocking] = useState(false);
  const autoUnlockAttemptRef = useRef(false);
  const [lastUnlockedEmail, setLastUnlockedEmail] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSignal, setFeedbackSignal] = useState(null);
  const [primaryLogoLoadFailed, setPrimaryLogoLoadFailed] = useState(false);
  const alternatives = (Array.isArray(resultState?.alternatives) ? resultState.alternatives : []).slice(0, 2);
  const primaryTool = resultState?.primaryTool || {};
  const tryItUrl = primaryTool.tryItUrl || primaryTool.referralUrl || primaryTool.website || "#";
  const primaryLogoToken = resolveToolLogoToken(primaryTool.toolName);
  const faviconUrl = resolveToolLogoUrl(primaryTool.toolName);
  const apiLogoUrl = Boolean(primaryTool.logoUrl) && !primaryLogoLoadFailed ? primaryTool.logoUrl : null;
  const logoUrl = apiLogoUrl || faviconUrl;
  const shouldRenderLogo = Boolean(logoUrl);

  useEffect(() => {
    autoUnlockAttemptRef.current = false;
  }, [resultState?.sessionId, resultState?.recommendationId]);

  useEffect(() => {
    setPrimaryLogoLoadFailed(false);
  }, [primaryTool.logoUrl, primaryTool.toolName]);

  useEffect(() => {
    if (!resultState || resultState.unlocked || autoUnlockAttemptRef.current) {
      return;
    }

    const hasUnlockMarker = hasRegisteredUnlockMarker();
    const shouldAttemptAutoUnlock = isAuthenticated || hasUnlockMarker;

    if (!shouldAttemptAutoUnlock) {
      return;
    }

    let isCancelled = false;
    autoUnlockAttemptRef.current = true;
    const unlockMethod = isAuthenticated ? "authenticated_session" : "remembered_session";

    unlockRecommendation({
      sessionId: resultState.sessionId,
      recommendationId: resultState.recommendationId
    })
      .then((payload) => {
        if (isCancelled) {
          return;
        }

        const unlocked = normalizeUnlockedResult(payload, resultState);
        setUnlockedResult(unlocked);
        trackEvent("recommendation_unlocked", {
          session_id: unlocked.sessionId,
          recommendation_id: unlocked.recommendationId,
          unlock_method: unlockMethod
        });
      })
      .catch(() => {
        if (!isCancelled && !isAuthenticated) {
          setRegisteredUnlockMarker(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, resultState, setUnlockedResult]);

  if (!resultState) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("result.noResultTitle")}</h1>
        <p className="text-sm text-slate-400">{t("result.noResultBody")}</p>
        <button
          type="button"
          onClick={() => navigate("/wizard")}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
        >
          {t("result.startWizard")}
        </button>
      </div>
    );
  }

  async function handleUnlock({ email, emailConsent }) {
    setManualUnlocking(true);

    try {
      const payload = await unlockRecommendation({
        sessionId: resultState.sessionId,
        recommendationId: resultState.recommendationId,
        email,
        emailConsent
      });

      const unlocked = normalizeUnlockedResult(payload, resultState);
      setUnlockedResult(unlocked);
      setRegisteredUnlockMarker(true);
      setLastUnlockedEmail(email.trim());
      trackEvent("recommendation_unlocked", {
        session_id: unlocked.sessionId,
        recommendation_id: unlocked.recommendationId,
        unlock_method: "email_consent"
      });
      notify(t("result.unlockSuccessToast"), "success");
    } catch (error) {
      if (
        error instanceof ApiTimeoutError ||
        error instanceof ApiNetworkError ||
        (error instanceof ApiError && error.status >= 500)
      ) {
        throw new Error(t("result.unlockServerUnavailable"));
      }

      if (error instanceof ApiError) {
        throw new Error(error.message || t("result.unlockFailed"));
      }

      throw new Error(t("result.unlockServerUnavailable"));
    } finally {
      setManualUnlocking(false);
    }
  }

  function handleTryItClick() {
    trackEvent("try_it_clicked", {
      session_id: resultState.sessionId,
      recommendation_id: resultState.recommendationId,
      tool_name: primaryTool.toolName,
      try_it_url: tryItUrl
    });

    if (!resultState.recommendationId || !resultState.sessionId) {
      return;
    }

    void submitTryItClick({
      recommendationId: resultState.recommendationId,
      sessionId: resultState.sessionId
    }).catch(() => {
      // KPI tracking must not block or disrupt the conversion path.
    });
  }

  async function handleFeedback(signal) {
    if (!resultState.recommendationId) {
      notify(t("result.feedbackUnavailable"), "error");
      return;
    }

    setFeedbackLoading(true);

    try {
      await submitRecommendationFeedback({
        recommendationId: resultState.recommendationId,
        signal
      });
      setFeedbackSignal(signal);
      notify(t("result.feedbackThanks"), "success");
    } catch {
      notify(t("result.feedbackFailed"), "error");
    } finally {
      setFeedbackLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {resultState.unlocked ? t("result.unlockedHeader") : t("result.lockedHeader")}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            clearResult();
            navigate("/wizard");
          }}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-white"
        >
          {t("result.runAgain")}
        </button>
      </header>

      {resultState.unlocked ? (
        <section className="space-y-6" data-testid="unlocked-primary">

          {/* Hero reveal card */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-violet-500/5 p-6 text-center">
            <div className="pointer-events-none absolute -top-10 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative flex flex-col items-center gap-3">
              {shouldRenderLogo ? (
                <img
                  src={logoUrl}
                  alt={`${primaryTool.toolName} logo`}
                  className="h-14 w-14 rounded-2xl object-contain"
                  onError={() => setPrimaryLogoLoadFailed(true)}
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold text-blue-300">
                  {primaryLogoToken}
                </div>
              )}
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  {primaryTool.toolName || t("result.defaultPrimaryToolName")}
                </h2>
                {resultState.primaryReason ? (
                  <p className="mt-2 text-sm text-slate-400">{resultState.primaryReason}</p>
                ) : null}
              </div>
              <a
                href={tryItUrl}
                target="_blank"
                rel="noreferrer"
                onClick={handleTryItClick}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                {t("result.tryIt")}
              </a>
            </div>
          </div>

          {/* Feedback — simple inline, not a section */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs text-slate-500">{t("result.feedbackQuestion")}</span>
            <button
              type="button"
              disabled={feedbackLoading}
              onClick={() => handleFeedback(1)}
              className={[
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                feedbackSignal === 1
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              ].join(" ")}
            >
              {t("result.feedbackYes")}
            </button>
            <button
              type="button"
              disabled={feedbackLoading}
              onClick={() => handleFeedback(-1)}
              className={[
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                feedbackSignal === -1
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              ].join(" ")}
            >
              {t("result.feedbackNo")}
            </button>
          </div>

          {/* Account nudge — quiet, not a banner */}
          {!isAuthenticated ? (
            <p className="text-center text-xs text-slate-600">
              {t("result.accountNudgePrefix")}{" "}
              <Link
                to={`/register?${new URLSearchParams({ redirect: "/result", ...(lastUnlockedEmail ? { email: lastUnlockedEmail } : {}) }).toString()}`}
                className="text-slate-400 underline underline-offset-2 hover:text-white"
              >
                {t("result.accountNudgeCreate")}
              </Link>
              {" "}{t("result.accountNudgeOr")}{" "}
              <Link
                to={`/login?${new URLSearchParams({ redirect: "/result", ...(lastUnlockedEmail ? { email: lastUnlockedEmail } : {}) }).toString()}`}
                className="text-slate-400 underline underline-offset-2 hover:text-white"
              >
                {t("result.accountNudgeLogin")}
              </Link>
            </p>
          ) : null}

        </section>
      ) : (
        <section className="space-y-4" data-testid="locked-primary">
          <div>
            <h2 className="text-lg font-bold text-white">{t("result.lockedSectionTitle")}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{t("result.lockedSectionSubtitle")}</p>
          </div>
          <LockedPrimaryCard />
          <UnlockForm onUnlock={handleUnlock} loading={manualUnlocking} />
        </section>
      )}

      {alternatives.length ? (
        <section className="pt-2" data-testid="alternatives-section">
          <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t("result.alternativesTitle")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {alternatives.map((tool) => (
              <div
                key={`${tool.toolName}-${tool.contextWord}`}
                data-testid="alternative-item"
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition hover:border-white/10 hover:bg-white/5"
              >
                {resolveToolLogoUrl(tool.toolName) ? (
                  <img
                    src={resolveToolLogoUrl(tool.toolName)}
                    alt={tool.toolName}
                    className="h-8 w-8 rounded-lg object-contain"
                    onError={(e) => { e.currentTarget.replaceWith(Object.assign(document.createElement('div'), { className: 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[10px] font-bold text-slate-400', textContent: (tool.toolName || '?').slice(0, 2).toUpperCase() })); }}
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[10px] font-bold text-slate-400">
                    {(tool.toolName || "?").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{tool.toolName}</p>
                  {tool.contextWord ? (
                    <p className="mt-0.5 text-[11px] text-slate-500">{tool.contextWord}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
