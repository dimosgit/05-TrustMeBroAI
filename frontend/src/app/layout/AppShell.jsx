import { Link, useLocation } from "react-router-dom";
import { trackEvent } from "../../lib/analytics/tracking";
import { useAuth } from "../../features/auth/AuthContext";

function LandingFooter() {
  return (
    <footer className="mx-auto mt-4 w-full max-w-sm pb-2">
      <div className="flex items-center justify-between text-[11px] font-medium tracking-tight text-slate-600">
        <p>© 2026 TrustMeBroAI</p>
        <div className="flex items-center gap-1">
          <span>LinkedIn :</span>
          <a
            href="https://linkedin.com/in/YOUR-LINK-HERE"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-400"
          >
            linkedin.com/in/YOUR-LINK-HERE
          </a>
        </div>
      </div>
    </footer>
  );
}

function DefaultFooter() {
  return (
    <footer className="mx-auto mt-4 w-full max-w-3xl pb-2 text-center">
      <p className="text-[10px] text-slate-600">Made by real people.</p>
      <a
        href="https://www.linkedin.com/in/YOUR-LINK-HERE"
        target="_blank"
        rel="noreferrer"
        className="mt-0.5 inline-block text-[10px] text-slate-500 transition hover:text-slate-400"
      >
        LinkedIn: [placeholder link]
      </a>
    </footer>
  );
}

export default function AppShell({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const { user, isAuthenticated, isBootstrapping, logout } = useAuth();

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

        <header className="mx-auto w-full max-w-4xl pb-3">
          <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#161b22]/80 px-4 py-3 backdrop-blur">
            <Link className="text-sm font-extrabold uppercase tracking-[0.2em] text-blue-400" to="/">
              TrustMeBroAI
            </Link>
            <div className="flex items-center gap-2">
              {isBootstrapping ? (
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400">
                  Loading...
                </span>
              ) : isAuthenticated ? (
                <>
                  <span className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 sm:inline-flex">
                    {user?.email || "Signed in"}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
                  to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                >
                  Account
                </Link>
              )}
            </div>
          </nav>
        </header>

        <section className="mx-auto flex w-full flex-1 items-center justify-center py-4">
          <div
            className={[
              "card-surface w-full p-6 sm:p-10",
              isLanding ? "landing-card max-w-[42rem]" : "max-w-3xl"
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
