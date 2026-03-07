import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const SESSION_DEFAULTS = {
  budget: "Flexible",
  experienceLevel: "Intermediate"
};

const PROFILE_CHOICES = [
  { name: "Business", icon: "BR" },
  { name: "Developer", icon: "DV" },
  { name: "Consultant", icon: "CS" },
  { name: "Student", icon: "ST" },
  { name: "Creator", icon: "CR" }
];

const TASK_CHOICES = [
  { name: "Analyze a PDF", icon: "PDF" },
  { name: "Write content", icon: "TXT" },
  { name: "Summarize documents", icon: "SUM" },
  { name: "Write code", icon: "DEV" },
  { name: "Build an app", icon: "APP" },
  { name: "Automate work", icon: "BOT" },
  { name: "Do research", icon: "RCH" },
  { name: "Create images", icon: "IMG" }
];

const PRIORITY_CHOICES = [
  { name: "Lowest price", icon: "$$" },
  { name: "Best quality", icon: "HQ" },
  { name: "Fastest results", icon: "SPD" },
  { name: "Easiest to use", icon: "UX" },
  { name: "Privacy", icon: "PRV" },
  { name: "Microsoft friendly", icon: "MS" }
];

const LANDING_LOGOS = [
  { name: "ChatGPT", token: "✺", tone: "bg-white/10" },
  { name: "Claude", token: "C", tone: "bg-fuchsia-500/20 text-fuchsia-300" },
  { name: "Copilot", token: "⬢", tone: "bg-sky-500/20 text-sky-300" },
  { name: "Perplexity", token: "P", tone: "bg-slate-500/20 text-slate-300" },
  { name: "Cursor", token: "▶", tone: "bg-teal-500/20 text-teal-300" }
];

const initialForm = {
  profileId: null,
  taskId: null,
  priorities: []
};

function StepHeader({ question }) {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">TrustMeBroAI</p>
        <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-secondaryText">
          Step {question} of 3
        </span>
      </div>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-secondary-500 transition-all duration-500 ease-out"
          style={{ width: (question / 3) * 100 + "%" }}
        />
      </div>
    </header>
  );
}

function ChoiceCard({ title, subtitle, icon, selected, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "choice-card-hover group relative w-full overflow-hidden rounded-2xl border px-5 py-4 text-left transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-brand-500/40",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
        selected
          ? "choice-card-selected border-brand-500/50 bg-brand-500/10"
          : "border-white/10 bg-white/[0.03]"
      ].join(" ")}
    >
      <div className="flex items-center gap-4">
        <span className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-colors duration-300",
          selected
            ? "border-brand-500/50 bg-brand-500/20 text-brand-400"
            : "border-white/10 bg-white/5 text-secondaryText group-hover:border-white/20 group-hover:text-primaryText"
        ].join(" ")}>
          {icon}
        </span>
        <div className="flex-1">
          <span className={[
            "block text-sm font-semibold transition-colors",
            selected ? "text-primaryText" : "text-secondaryText group-hover:text-primaryText"
          ].join(" ")}>
            {title}
          </span>
          {subtitle && (
            <span className="mt-0.5 block text-xs leading-relaxed text-secondaryText opacity-70">
              {subtitle}
            </span>
          )}
        </div>
        {selected && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">
            ✓
          </div>
        )}
      </div>
    </button>
  );
}

function StepShell({ children }) {
  return <div className="step-in px-2 sm:px-4">{children}</div>;
}

function Landing({ onStart }) {
  return (
    <StepShell>
      <div className="space-y-10 py-4 text-center">
        <p className="text-sm font-medium tracking-[0.2em] text-slate-400">TrustMeBroAI</p>

        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          There are thousands of AI tools.
          <br className="hidden sm:block" />
          We tell you which one to use.
        </h1>

        <p className="mx-auto max-w-xl text-lg text-slate-400">
          Answer a few simple questions and get
          <br className="hidden sm:block" />
          the best AI tool for your task.
        </p>

        <div className="mx-auto flex w-full max-w-sm flex-col gap-3 py-4">
          <button
            type="button"
            onClick={onStart}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-lg font-bold text-white shadow-lg transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98]"
          >
            Find my AI tool
          </button>
          <a
            href="/login"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 text-lg font-bold text-white transition-all hover:bg-white/10 active:scale-[0.98]"
          >
            Log in
          </a>
        </div>

        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/5" />
            <p className="whitespace-nowrap text-xs font-medium uppercase tracking-widest text-slate-500">Works with the best AI tools</p>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5153-4.9108 6.0462 6.0462 0 0 0-4.7471-3.1248 6.1213 6.1213 0 0 0-5.1189 1.954 6.0461 6.0461 0 0 0-5.1189-1.954 6.0462 6.0462 0 0 0-4.7471 3.1248 5.9847 5.9847 0 0 0-.5183 4.9108 6.0461 6.0461 0 0 0 1.956 5.1189 6.0461 6.0461 0 0 0-1.956 5.1189 5.9847 5.9847 0 0 0 .5153 4.9108 6.0462 6.0462 0 0 0 4.7471 3.1248 6.1213 6.1213 0 0 0 5.1189-1.954 6.0461 6.0461 0 0 0 5.1189 1.954 6.0462 6.0462 0 0 0 4.7471-3.1248 5.9847 5.9847 0 0 0 .5183-4.9108 6.0461 6.0461 0 0 0-1.956-5.1189 6.0461 6.0461 0 0 0 1.956-5.122zM12.0003 12.9803l-2.025-1.17 4.0538-2.3438 1.0113.585a2.025 2.025 0 0 1 0 3.5075l-3.0401 1.7513zm-1.0113-7.5187l3.0401-1.7513a2.025 2.025 0 0 1 2.7663.7431c.3.5181.4 1.1212.28 1.6963l-4.0538 2.3438-2.0326-1.1738v-1.8581zm-7.0945 4.0938a2.025 2.025 0 0 1-.2743-1.698 2.025 2.025 0 0 1 .741-.9983l3.0401-1.7513 2.0287 1.1738v4.6125l-5.5355-3.1974zm0 6.39l5.5355-3.1974v4.6125l-3.0401 1.7513a2.025 2.025 0 0 1-2.7663-.7431 2.0251 2.0251 0 0 1-.28-1.693l4.0538-2.3438zm11.148 4.094a2.025 2.025 0 0 1 .2743 1.698c.1175-.5738.0163-1.1713-.2845-1.685l-3.0401-1.7513-2.0287-1.1738v-4.6125l5.5355 3.1971z" /></svg>
              </span>
              <span className="text-xl font-semibold text-white">ChatGPT</span>
            </div>
            {LANDING_LOGOS.slice(1).map((logo) => (
              <div key={logo.name} className="flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${logo.tone} text-sm font-bold`}>
                  {logo.token}
                </span>
                <span className="text-xl font-semibold text-white">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="pt-8 text-lg font-medium text-slate-400">Fast. Simple. Built for real people.</p>
      </div>
    </StepShell>
  );
}

function StepProfile({ options, selectedId, onSelect, onNext, onBack }) {
  return (
    <StepShell>
      <StepHeader question={1} />
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">Who are you?</h2>
      <div className="grid gap-4">
        {options.map((option) => (
          <ChoiceCard
            key={option.name}
            title={option.name}
            subtitle={option.description}
            icon={option.icon}
            selected={selectedId === option.id}
            onClick={() => onSelect(option.id)}
            disabled={!option.id}
          />
        ))}
      </div>
      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-[18px] border border-white/10 px-8 py-3.5 text-sm font-bold text-secondaryText transition-all hover:bg-white/5"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedId}
          className="rounded-[18px] bg-white px-8 py-3.5 text-sm font-bold text-background transition-all hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Continue
        </button>
      </div>
    </StepShell>
  );
}

function StepTask({ options, selectedId, onSelect, onNext, onBack }) {
  return (
    <StepShell>
      <StepHeader question={2} />
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">What's the mission?</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <ChoiceCard
            key={option.name}
            title={option.name}
            subtitle={option.description}
            icon={option.icon}
            selected={selectedId === option.id}
            onClick={() => onSelect(option.id)}
            disabled={!option.id}
          />
        ))}
      </div>
      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-[18px] border border-white/10 px-8 py-3.5 text-sm font-bold text-secondaryText transition-all hover:bg-white/5"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedId}
          className="rounded-[18px] bg-white px-8 py-3.5 text-sm font-bold text-background transition-all hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Continue
        </button>
      </div>
    </StepShell>
  );
}

function StepPriority({ selected, onToggle, onSubmit, onBack, loading }) {
  return (
    <StepShell>
      <StepHeader question={3} />
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">What matters most?</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {PRIORITY_CHOICES.map((option) => {
          const isSelected = selected.includes(option.name);
          return (
            <ChoiceCard
              key={option.name}
              title={option.name}
              icon={option.icon}
              selected={isSelected}
              onClick={() => onToggle(option.name)}
            />
          );
        })}
      </div>
      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-[18px] border border-white/10 px-8 py-3.5 text-sm font-bold text-secondaryText transition-all hover:bg-white/5"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={selected.length === 0 || loading}
          className="relative overflow-hidden rounded-[18px] bg-white px-8 py-3.5 text-sm font-bold text-background transition-all hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className={loading ? "opacity-0" : "opacity-100"}>Get recommendations</span>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
            </div>
          )}
        </button>
      </div>
    </StepShell>
  );
}

function LoadingStep({ stage }) {
  const checks = ["Analyzing your task", "Comparing AI tools", "Ranking results"];

  return (
    <StepShell>
      <div className="space-y-8 py-8 text-center sm:py-12">
        <div className="relative mx-auto h-20 w-20">
          <div className="absolute inset-0 animate-ping rounded-full bg-brand-500/20" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
            <svg className="h-10 w-10 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Finding your perfect match...</h2>
          <p className="text-sm text-secondaryText">Our AI is consulting the experts.</p>
        </div>

        <div className="mx-auto max-w-xs space-y-3 pt-4 text-left">
          {checks.map((text, index) => {
            const active = stage > index;
            const current = stage === index;
            return (
              <div
                key={text}
                className={[
                  "flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm transition-all duration-500",
                  active
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : current
                      ? "border-brand-500/30 bg-brand-500/5 text-brand-400 shimmer"
                      : "border-white/5 bg-white/[0.02] text-secondaryText opacity-40"
                ].join(" ")}
              >
                <div className={[
                  "flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                  active ? "border-emerald-500/50 bg-emerald-500 text-white" : "border-current"
                ].join(" ")}>
                  {active ? "✓" : index + 1}
                </div>
                <span className="font-medium">{text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </StepShell>
  );
}

function ResultStep({ result, taskLabel, onRunAgain }) {
  const primary = result?.primary_tool;
  const alternatives = (result?.alternative_tools || []).slice(0, 2);
  const tag = "Best quality for your task";

  const shareMessage = "I asked TrustMeBroAI which AI tool to use for " + (taskLabel || "my task") + ".\n\nResult: " + (primary?.name || "ChatGPT") + "\n\nTry it yourself:\ntrustmebro.ai";

  return (
    <StepShell>
      <div className="space-y-8">
        <header className="flex items-center justify-between border-b border-white/5 pb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-400">Recommendation</p>
            <h2 className="mt-1 text-3xl font-bold text-white">Your Best Match</h2>
          </div>
          <button
            type="button"
            onClick={onRunAgain}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-secondaryText hover:bg-white/5"
          >
            Start Over
          </button>
        </header>

        <section className="relative overflow-hidden rounded-[28px] border border-brand-500/20 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent p-6 sm:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-brand-500/30 bg-brand-500/20 text-2xl font-bold text-brand-400">
                {primary?.name?.substring(0, 2).toUpperCase() || "AI"}
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tight text-white">{primary?.name || "ChatGPT"}</h3>
                <p className="mt-1 flex items-center gap-2 text-xs font-bold text-brand-400/80">
                  <span className="inline-block h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                  {tag}
                </p>
              </div>
            </div>
            <a
              href={primary?.website_url || "#"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-sm font-bold text-background transition-all hover:bg-brand-50"
            >
              Open {primary?.name || "Tool"}
            </a>
          </div>

          <div className="mt-8 grid gap-6 border-t border-white/5 pt-8 sm:grid-cols-2">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-secondaryText">Why this tool?</h4>
              <p className="mt-3 text-sm leading-6 text-secondaryText">
                {result?.explanation || (primary?.name || "This tool") + " is the industry leader for this specific use case, offering the best balance of speed and reasoning."}
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-secondaryText">Key Strengths</h4>
              <ul className="mt-3 space-y-2">
                {(primary?.strengths || ["Industry standard", "High accuracy", "Easy integration"]).slice(0, 3).map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-primaryText">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {alternatives.length > 0 && (
          <section>
            <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondaryText">Other good options</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {alternatives.map((tool, idx) => (
                <div key={tool.id} className="group rounded-[22px] border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white">{tool.name}</p>
                    <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-bold text-secondaryText lowercase">
                      {idx === 0 ? "Fastest" : "Easiest"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-secondaryText opacity-70">A strong alternative with unique perks for your workflow.</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-[24px] border border-white/5 bg-white/[0.01] p-6 text-center">
          <h3 className="text-sm font-bold text-white">Share your recommendation</h3>
          <p className="mt-1 text-xs text-secondaryText">Help others find the right AI tool.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(shareMessage);
                alert("Link copied!");
              }}
              className="rounded-xl bg-white/5 px-6 py-3 text-xs font-bold text-white hover:bg-white/10"
            >
              Copy Link
            </button>
            <button
              type="button"
              className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-6 py-3 text-xs font-bold text-brand-400 hover:bg-brand-500/20"
            >
              Twitter / X
            </button>
          </div>
        </section>
      </div>
    </StepShell>
  );
}

function LandingFooter() {
  return (
    <footer className="mx-auto mt-12 w-full max-w-sm pb-8">
      <div className="flex items-center justify-between text-[11px] font-medium tracking-tight text-slate-600">
        <p>© 2024 TrustMeBroAI</p>
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
    <footer className="mx-auto mt-6 w-full max-w-3xl text-center">
      <p className="text-xs text-slate-500">Made by real people.</p>
      <a
        href="https://www.linkedin.com/in/YOUR-LINK-HERE"
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-block text-xs text-slate-400 transition hover:text-slate-200"
      >
        LinkedIn: [placeholder link]
      </a>
    </footer>
  );
}

function App() {
  const [profiles, setProfiles] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [formData, setFormData] = useState(initialForm);
  const [view, setView] = useState("landing");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const isLanding = view === "landing";

  useEffect(() => {
    async function loadLookupData() {
      try {
        setError("");
        const [profilesRes, tasksRes] = await Promise.all([
          fetch(API_BASE_URL + "/profiles"),
          fetch(API_BASE_URL + "/tasks")
        ]);

        if (!profilesRes.ok || !tasksRes.ok) {
          throw new Error("Unable to load app data");
        }

        const [profilesData, tasksData] = await Promise.all([profilesRes.json(), tasksRes.json()]);
        setProfiles(profilesData);
        setTasks(tasksData);
      } catch {
        setError("Unable to load options. Check backend connection and try again.");
      }
    }

    loadLookupData();
  }, []);

  useEffect(() => {
    if (view !== "loading") {
      return undefined;
    }

    setLoadingStage(0);
    const timer = setInterval(() => {
      setLoadingStage((prev) => Math.min(prev + 1, 3));
    }, 320);

    return () => clearInterval(timer);
  }, [view]);

  const profileOptions = useMemo(
    () =>
      PROFILE_CHOICES.map((choice) => {
        const match = profiles.find((profile) => profile.name === choice.name);
        return {
          ...choice,
          id: match?.id ?? null,
          description: match?.description || null
        };
      }),
    [profiles]
  );

  const taskOptions = useMemo(
    () =>
      TASK_CHOICES.map((choice) => {
        const match = tasks.find((task) => task.name === choice.name);
        return {
          ...choice,
          id: match?.id ?? null,
          description: match?.description || null
        };
      }),
    [tasks]
  );

  const selectedTaskLabel = useMemo(
    () => taskOptions.find((task) => task.id === formData.taskId)?.name || "analyzing PDFs",
    [formData.taskId, taskOptions]
  );

  async function handleSubmit() {
    if (!formData.profileId || !formData.taskId || formData.priorities.length === 0) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setView("loading");

      const minDelay = new Promise((resolve) => setTimeout(resolve, 1400));

      const recommendationPromise = (async () => {
        const sessionResponse = await fetch(API_BASE_URL + "/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile_id: formData.profileId,
            task_id: formData.taskId,
            budget: SESSION_DEFAULTS.budget,
            experience_level: SESSION_DEFAULTS.experienceLevel,
            selected_priorities: formData.priorities
          })
        });

        if (!sessionResponse.ok) {
          throw new Error("Failed to save session");
        }

        const session = await sessionResponse.json();

        const recommendationResponse = await fetch(API_BASE_URL + "/recommendation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_session_id: session.id })
        });

        if (!recommendationResponse.ok) {
          throw new Error("Failed to create recommendation");
        }

        return recommendationResponse.json();
      })();

      const [recommendation] = await Promise.all([recommendationPromise, minDelay]);
      setResult(recommendation);
      setView("result");
    } catch {
      setError("Something went wrong while generating recommendation. Please retry.");
      setView("priority");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setFormData(initialForm);
    setResult(null);
    setError("");
    setView("landing");
  }

  function renderContent() {
    if (view === "landing") {
      return <Landing onStart={() => setView("profile")} />;
    }

    if (view === "profile") {
      return (
        <StepProfile
          options={profileOptions}
          selectedId={formData.profileId}
          onSelect={(profileId) => setFormData((prev) => ({ ...prev, profileId }))}
          onBack={() => setView("landing")}
          onNext={() => setView("task")}
        />
      );
    }

    if (view === "task") {
      return (
        <StepTask
          options={taskOptions}
          selectedId={formData.taskId}
          onSelect={(taskId) => setFormData((prev) => ({ ...prev, taskId }))}
          onBack={() => setView("profile")}
          onNext={() => setView("priority")}
        />
      );
    }

    if (view === "priority") {
      return (
        <StepPriority
          selected={formData.priorities}
          onToggle={(priorityName) =>
            setFormData((prev) => ({
              ...prev,
              priorities: prev.priorities.includes(priorityName)
                ? prev.priorities.filter((item) => item !== priorityName)
                : [...prev.priorities, priorityName]
            }))
          }
          onBack={() => setView("task")}
          onSubmit={handleSubmit}
          loading={loading}
        />
      );
    }

    if (view === "loading") {
      return <LoadingStep stage={loadingStage} />;
    }

    return <ResultStep result={result} taskLabel={selectedTaskLabel} onRunAgain={resetAll} />;
  }

  return (
    <div className="min-h-screen text-slate-100">
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-16 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/14 blur-3xl" />
          <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-violet-500/18 blur-3xl" />
          <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-indigo-400/16 blur-3xl" />
          <div className="absolute bottom-20 left-1/2 h-96 w-[38rem] -translate-x-1/2 rounded-full bg-sky-400/12 blur-3xl" />
        </div>

        <section className="mx-auto flex w-full flex-1 items-center justify-center py-6 sm:py-8">
          <div
            className={[
              "card-surface w-full p-8 sm:p-12",
              isLanding ? "landing-card max-w-[42rem]" : "max-w-3xl"
            ].join(" ")}
          >
            {renderContent()}
          </div>
        </section>

        {error ? (
          <div className="mx-auto w-full max-w-3xl rounded-xl border border-rose-900/70 bg-rose-950/60 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {isLanding ? <LandingFooter /> : <DefaultFooter />}
      </main>
    </div>
  );
}

export default App;
