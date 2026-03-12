import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { useAuth } from "../auth/AuthContext";
import { useRecommendation } from "../result/RecommendationContext";
import { ApiError, ApiNetworkError, ApiTimeoutError } from "../../lib/api/client";
import { fetchRecommendationHistory } from "../../lib/api/recommendationApi";
import { t } from "../../lib/i18n";

function resolveDisplayDate(value) {
  if (!value) {
    return t("history.fallbackDate");
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return t("history.fallbackDate");
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(parsed);
}

function HistoryCard({ item, onOpenResult }) {
  const tryItUrl = item.primaryTool.tryItUrl || item.primaryTool.referralUrl || item.primaryTool.website || "";

  return (
    <article
      data-testid="history-item"
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">{item.primaryTool.toolName}</h2>
          <p className="text-xs text-slate-400">{resolveDisplayDate(item.createdAt)}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenResult(item)}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-white/30"
          >
            {t("history.openResult")}
          </button>
          {tryItUrl ? (
            <a
              href={tryItUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              {t("history.tryIt")}
            </a>
          ) : null}
        </div>
      </div>

      {item.selectedPriority ? (
        <p className="mt-3 text-xs text-slate-300">
          <span className="text-slate-500">{t("history.priorityLabel")}: </span>
          {item.selectedPriority}
        </p>
      ) : null}

      {item.primaryReason ? (
        <p className="mt-2 text-sm text-slate-300">{item.primaryReason}</p>
      ) : null}
    </article>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isBootstrapping } = useAuth();
  const { setUnlockedResult } = useRecommendation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setItems([]);
      setError("");
      return;
    }

    let isCancelled = false;

    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const history = await fetchRecommendationHistory({ limit: 20 });

        if (!isCancelled) {
          setItems(history);
        }
      } catch (historyError) {
        if (isCancelled) {
          return;
        }

        if (
          historyError instanceof ApiTimeoutError ||
          historyError instanceof ApiNetworkError ||
          (historyError instanceof ApiError && historyError.status >= 500)
        ) {
          setError(t("history.errorTitle"));
        } else if (historyError instanceof ApiError && historyError.status === 401) {
          setError("");
          setItems([]);
        } else {
          setError(t("history.errorTitle"));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, reloadKey]);

  const loginHref = useMemo(
    () => `/login?redirect=${encodeURIComponent("/history")}`,
    []
  );

  function handleOpenResult(item) {
    setUnlockedResult({
      sessionId: item.sessionId,
      recommendationId: item.recommendationId,
      primaryTool: item.primaryTool,
      primaryReason: item.primaryReason,
      alternatives: item.alternatives,
      unlocked: true
    });

    navigate("/result");
  }

  if (isBootstrapping || loading) {
    return (
      <div className="space-y-3 text-center" data-testid="history-loading">
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("history.title")}</h1>
        <p className="text-sm text-slate-400">{t("history.loading")}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 text-center" data-testid="history-signin-required">
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("history.signInTitle")}</h1>
        <p className="text-sm text-slate-400">{t("history.signInBody")}</p>
        <Link
          to={loginHref}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
        >
          {t("history.signInAction")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("history.title")}</h1>
        <p className="text-sm text-slate-400">{t("history.subtitle")}</p>
      </header>

      {error ? (
        <div className="space-y-2">
          <InlineAlert>{error}</InlineAlert>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/30"
            >
              {t("history.retry")}
            </button>
          </div>
        </div>
      ) : null}

      {!error && items.length === 0 ? (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center" data-testid="history-empty">
          <h2 className="text-lg font-semibold text-white">{t("history.emptyTitle")}</h2>
          <p className="text-sm text-slate-300">{t("history.emptyBody")}</p>
          <button
            type="button"
            onClick={() => navigate("/wizard")}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
          >
            {t("history.emptyAction")}
          </button>
        </div>
      ) : null}

      {!error && items.length > 0 ? (
        <div className="space-y-3" data-testid="history-list">
          {items.map((item) => (
            <HistoryCard
              key={`${item.sessionId}-${item.recommendationId}`}
              item={item}
              onOpenResult={handleOpenResult}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
