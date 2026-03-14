import { Link, useLocation } from "react-router-dom";
import { trackEvent } from "../../lib/analytics/tracking";
import { useAuth } from "../../features/auth/AuthContext";
import { t } from "../../lib/i18n";

function LandingFooter() {
  return (
    <footer className="mx-auto mt-4 w-full max-w-sm pb-2">
      <div className="flex items-center justify-between text-[11px] font-medium tracking-tight text-slate-600">
        <p>{t("appShell.landingFooterCopyright")}</p>
        <a
          href="https://www.linkedin.com/in/dimouzunov/"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-slate-500/60 underline-offset-2 transition hover:text-slate-400"
        >
          {t("appShell.landingFooterLinkedIn")}
        </a>
      </div>
    </footer>
  );
}

function DefaultFooter() {
  return (
    <footer className="mx-auto mt-4 w-full max-w-3xl pb-2 text-center">
      <p className="text-[10px] text-slate-600">{t("appShell.defaultFooterMadeBy")}</p>
      <a
        href="https://www.linkedin.com/in/dimouzunov/"
        target="_blank"
        rel="noreferrer"
        className="mt-0.5 inline-block text-[10px] text-slate-500 underline decoration-slate-500/60 underline-offset-2 transition hover:text-slate-400"
      >
        {t("appShell.landingFooterLinkedIn")}
      </a>
    </footer>
  );
}

function resolvePasskeyNudgeRedirect(location) {
  if (location.pathname.startsWith("/auth/recovery/verify")) {
    const redirectFromQuery = new URLSearchParams(location.search).get("redirect");
    if (typeof redirectFromQuery === "string" && redirectFromQuery.startsWith("/") && !redirectFromQuery.startsWith("//")) {
      return redirectFromQuery;
    }
  }

  return location.pathname;
}

export default function AppShell({ children }) {
  const location = useLocation();
  const passkeyNudgeRedirect = resolvePasskeyNudgeRedirect(location);
  const isLanding = location.pathname === "/";
  const isAuth = ["/login", "/register", "/auth/recovery"].some(p => location.pathname.startsWith(p));
  const {
    user,
    isAuthenticated,
    isBootstrapping,
    requiresPasskeyEnrollment,
    dismissPasskeyEnrollmentNudge,
    logout
  } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      trackEvent("logout", {
        user_id: user?.id || null
      });
    } catch {
      // Keep UI interactive even if logout request fails.
    }
  }

  return (
    <div className="min-h-screen text-slate-100">
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-16 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/14 blur-3xl" />
          <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-violet-500/18 blur-3xl" />
          <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-indigo-400/16 blur-3xl" />
          <div className="absolute bottom-20 left-1/2 h-96 w-[38rem] -translate-x-1/2 rounded-full bg-sky-400/12 blur-3xl" />
        </div>

        <header className={["mx-auto w-full pb-3", isLanding || isAuth ? "max-w-[42rem]" : "max-w-3xl"].join(" ")}>
          <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#161b22]/80 px-4 py-3 backdrop-blur">
            <Link className="flex items-center group" to="/">
              <span className="text-sm font-extrabold text-white tracking-normal">
                Trust Me Bro<span className="text-blue-400 italic"> AI</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              {isBootstrapping ? (
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400">
                  {t("appShell.loading")}
                </span>
              ) : isAuthenticated ? (
                <>
                  <Link
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
                    to="/history"
                  >
                    {t("appShell.history")}
                  </Link>
                  <span className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 sm:inline-flex">
                    {user?.email || t("appShell.signedInFallback")}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-white"
                  >
                    {t("appShell.logout")}
                  </button>
                </>
              ) : (
                <Link
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
                  to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                >
                  {t("appShell.account")}
                </Link>
              )}
            </div>
          </nav>

          {isAuthenticated && requiresPasskeyEnrollment ? (
            <div
              data-testid="passkey-enrollment-nudge"
              className="mt-3 flex flex-col gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-amber-200">{t("appShell.recoveryNudgeTitle")}</p>
                <p className="text-xs text-amber-100/90">{t("appShell.recoveryNudgeBody")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/register?${new URLSearchParams({
                    redirect: passkeyNudgeRedirect,
                    enroll: "1"
                  }).toString()}`}
                  className="rounded-lg bg-amber-400/90 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-amber-300"
                >
                  {t("appShell.recoveryNudgeAction")}
                </Link>
                <button
                  type="button"
                  onClick={dismissPasskeyEnrollmentNudge}
                  className="rounded-lg border border-amber-100/30 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:border-amber-100/60"
                >
                  {t("appShell.recoveryNudgeDismiss")}
                </button>
              </div>
            </div>
          ) : null}
        </header>

        <section className="mx-auto flex w-full flex-1 items-center justify-center py-4">
          <div
            className={[
              "card-surface w-full p-6 sm:p-10",
              isLanding || isAuth ? "max-w-[42rem]" : "max-w-3xl",
              isLanding ? "landing-card" : ""
            ].join(" ")}
          >
            {children}
          </div>
        </section>

        {isLanding ? <LandingFooter /> : <DefaultFooter />}
      </main>
    </div>
  );
}
