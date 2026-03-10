import { useNavigate } from "react-router-dom";

const LANDING_LOGOS = [
  { name: "ChatGPT", token: "✺", tone: "bg-white/10" },
  { name: "Claude", token: "C", tone: "bg-fuchsia-500/20 text-fuchsia-300" },
  { name: "Copilot", token: "⬢", tone: "bg-sky-500/20 text-sky-300" },
  { name: "Perplexity", token: "P", tone: "bg-slate-500/20 text-slate-300" },
  { name: "Cursor", token: "▶", tone: "bg-teal-500/20 text-teal-300" }
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 py-2 text-center">
      <p className="text-sm font-medium tracking-[0.2em] text-slate-400">TrustMeBroAI</p>

      <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
        There are thousands of AI tools.
        <br className="hidden sm:block" />
        We tell you exactly which one to use.
      </h1>

      <p className="mx-auto max-w-xl text-base text-slate-400">
        Complete a fast 3-step wizard.
        <br className="hidden sm:block" />
        Reveal your best match in under 60 seconds.
      </p>

      <div className="mx-auto flex w-full max-w-sm flex-col gap-2.5 py-2">
        <button
          type="button"
          onClick={() => navigate("/wizard")}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-base font-bold text-white shadow-lg transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98]"
        >
          Find my AI tool
        </button>
        <p className="text-xs text-slate-500">No login required to start.</p>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-widest text-slate-500">
            Works with the best AI tools
          </p>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {LANDING_LOGOS.map((logo) => (
            <div key={logo.name} className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${logo.tone} text-[10px] font-bold`}>
                {logo.token}
              </span>
              <span className="text-lg font-semibold text-white">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="pt-2 text-sm font-medium text-slate-400">Fast. Focused. Zero fluff.</p>
    </div>
  );
}
