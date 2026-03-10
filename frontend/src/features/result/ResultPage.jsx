import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../../lib/analytics/tracking";
import { ApiError } from "../../lib/api/client";
import {
  normalizeUnlockedResult,
  submitTryItClick,
  submitRecommendationFeedback,
  unlockRecommendation
} from "../../lib/api/recommendationApi";
import { useToast } from "../../components/ui/ToastProvider";
import UnlockForm from "../unlock/UnlockForm";
import { useRecommendation } from "./RecommendationContext";

function LockedPrimaryCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#161b22]/70 p-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="space-y-3 blur-sm">
        <div className="h-5 w-32 rounded bg-white/20" />
        <div className="h-4 w-full rounded bg-white/10" />
        <div className="h-4 w-5/6 rounded bg-white/10" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <p className="max-w-xs text-sm font-semibold text-white">Enter your email to reveal your best match.</p>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const {
    resultState,
    setUnlockedResult,
    clearResult
  } = useRecommendation();

  const [unlocking, setUnlocking] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSignal, setFeedbackSignal] = useState(null);

  if (!resultState) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">No result yet</h1>
        <p className="text-sm text-slate-400">Complete the wizard first to see your recommendation.</p>
        <button
          type="button"
          onClick={() => navigate("/wizard")}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
        >
          Start wizard
        </button>
      </div>
    );
  }

  const alternatives = (Array.isArray(resultState.alternatives) ? resultState.alternatives : []).slice(0, 2);
  const primaryTool = resultState.primaryTool || {};
  const tryItUrl = primaryTool.tryItUrl || primaryTool.referralUrl || primaryTool.website || "#";

  async function handleUnlock({ email, emailConsent }) {
    setUnlocking(true);

    try {
      const payload = await unlockRecommendation({
        sessionId: resultState.sessionId,
        recommendationId: resultState.recommendationId,
        email,
        emailConsent
      });

      const unlocked = normalizeUnlockedResult(payload, resultState);
      setUnlockedResult(unlocked);
      trackEvent("recommendation_unlocked", {
        session_id: unlocked.sessionId,
        recommendation_id: unlocked.recommendationId,
        unlock_method: "email_consent"
      });
      notify("Recommendation unlocked.", "success");
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || "Could not unlock recommendation.");
      }

      throw new Error("Could not unlock recommendation.");
    } finally {
      setUnlocking(false);
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
    });
  }

  async function handleFeedback(signal) {
    if (!resultState.recommendationId) {
      notify("Feedback is unavailable for this result.", "error");
      return;
    }

    setFeedbackLoading(true);

    try {
      await submitRecommendationFeedback({
        recommendationId: resultState.recommendationId,
        signal
      });
      setFeedbackSignal(signal);
      notify("Thanks for the feedback.", "success");
    } catch {
      notify("Could not submit feedback right now.", "error");
    } finally {
      setFeedbackLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Result</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-white">
            {resultState.unlocked ? "Your Best Match" : "One step to unlock your best match"}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            clearResult();
            navigate("/wizard");
          }}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          Run again
        </button>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Also consider:</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {alternatives.map((tool) => (
            <div
              key={`${tool.toolName}-${tool.contextWord}`}
              data-testid="alternative-item"
              className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
            >
              <p className="text-sm font-semibold text-white">{tool.toolName}</p>
              {tool.contextWord ? (
                <p className="mt-0.5 text-[11px] text-slate-400">{tool.contextWord}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {resultState.unlocked ? (
        <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 sm:p-6" data-testid="unlocked-primary">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {primaryTool.logoUrl ? (
                <img src={primaryTool.logoUrl} alt={`${primaryTool.toolName} logo`} className="h-12 w-12 rounded-xl border border-white/10 bg-white/5 object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl font-bold text-blue-300">
                  {(primaryTool.toolName || "AI").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">{primaryTool.toolName || "Top recommendation"}</h2>
                {resultState.primaryReason ? (
                  <p className="mt-1 text-sm text-slate-300">{resultState.primaryReason}</p>
                ) : null}
              </div>
            </div>
            <a
              href={tryItUrl}
              target="_blank"
              rel="noreferrer"
              onClick={handleTryItClick}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              Try it -&gt;
            </a>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Was this helpful?</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={feedbackLoading}
                onClick={() => handleFeedback(1)}
                className={[
                  "rounded-lg border px-4 py-2 text-xs font-semibold transition",
                  feedbackSignal === 1
                    ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                ].join(" ")}
              >
                Thumbs up
              </button>
              <button
                type="button"
                disabled={feedbackLoading}
                onClick={() => handleFeedback(-1)}
                className={[
                  "rounded-lg border px-4 py-2 text-xs font-semibold transition",
                  feedbackSignal === -1
                    ? "border-rose-500/60 bg-rose-500/20 text-rose-300"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                ].join(" ")}
              >
                Thumbs down
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6" data-testid="locked-primary">
          <h2 className="text-lg font-bold text-white">Primary recommendation (locked)</h2>
          <LockedPrimaryCard />
          <UnlockForm onUnlock={handleUnlock} loading={unlocking} />
        </section>
      )}
    </div>
  );
}
