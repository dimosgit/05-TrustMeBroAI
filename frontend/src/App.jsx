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

const LANDING_LOGOS = ["ChatGPT", "Claude", "Copilot", "Perplexity", "Cursor"];

const initialForm = {
  profileId: null,
  taskId: null,
  priorities: []
};

function StepHeader({ question }) {
  return (
    <header className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">TrustMeBroAI</p>
      <p className="mt-2 text-xs font-medium text-slate-400">Question {question} of 3</p>
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
        "w-full rounded-2xl border px-4 py-3 text-left transition duration-200",
        "focus:outline-none focus:ring-2 focus:ring-brand-500/60",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
        selected
          ? "border-brand-500 bg-brand-500/12 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]"
          : "border-slate-700/80 bg-slate-900/65 hover:border-slate-500"
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-600 bg-slate-900/80 px-2 text-[10px] font-bold uppercase tracking-wide text-slate-300">
          {icon}
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-100">{title}</span>
          {subtitle ? <span className="mt-1 block text-xs text-slate-400">{subtitle}</span> : null}
        </span>
      </div>
    </button>
  );
}

function StepShell({ children }) {
  return <div className="step-in">{children}</div>;
}

function Landing({ onStart }) {
  return (
    <StepShell>
      <div className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">TrustMeBroAI</p>
        <h1 className="text-3xl font-extrabold leading-tight text-slate-50 sm:text-4xl">
          There are thousands of AI tools.
          <br />
          We tell you which one to use.
        </h1>
        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          Answer a few simple questions and get the best AI tool for your task.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onStart}
            className="rounded-xl bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Find my AI tool
          </button>
          <a
            href="/login"
            className="rounded-xl border border-slate-600 px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:text-white"
          >
            Log in
          </a>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {LANDING_LOGOS.map((logo) => (
            <span
              key={logo}
              className="rounded-lg border border-slate-700/80 bg-slate-900/50 px-2.5 py-1 text-[11px] font-medium text-slate-400"
            >
              {logo}
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-500">Fast. Simple. Built for real people.</p>
      </div>
    </StepShell>
  );
}

function StepProfile({ options, selectedId, onSelect, onNext, onBack }) {
  return (
    <StepShell>
      <StepHeader question={1} />
      <h2 className="mb-5 text-2xl font-bold text-slate-50">Who are you?</h2>
      <div className="grid gap-3">
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
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-400"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedId}
          className="rounded-xl bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
        </button>
      </div>
    </StepShell>
  );
}

function StepTask({ options, selectedId, onSelect, onNext, onBack }) {
  return (
    <StepShell>
      <StepHeader question={2} />
      <h2 className="mb-5 text-2xl font-bold text-slate-50">What do you want to do?</h2>
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
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-400"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedId}
          className="rounded-xl bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
        </button>
      </div>
    </StepShell>
  );
}

function StepPriority({ selected, onToggle, onSubmit, onBack, loading }) {
  return (
    <StepShell>
      <StepHeader question={3} />
      <h2 className="mb-5 text-2xl font-bold text-slate-50">What matters most?</h2>
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
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-400"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={selected.length === 0 || loading}
          className="rounded-xl bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {loading ? "Working..." : "Get my AI tools"}
        </button>
      </div>
    </StepShell>
  );
}

function LoadingStep({ stage }) {
  const checks = ["Analyzing your task", "Comparing AI tools", "Ranking results"];

  return (
    <StepShell>
      <div className="space-y-6 py-6 text-center sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">TrustMeBroAI</p>
        <h2 className="text-2xl font-bold text-slate-50">Finding the best AI tool for you...</h2>
        <div className="mx-auto max-w-sm space-y-3 text-left">
          {checks.map((text, index) => {
            const active = stage > index;
            return (
              <div
                key={text}
                className={[
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition duration-300",
                  active
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-100"
                    : "border-slate-700 bg-slate-900/70 text-slate-400"
                ].join(" ")}
              >
                <span className="text-base">{active ? "✓" : "•"}</span>
                <span>{text}</span>
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
  const explanation =
    result?.explanation ||
    `${primary?.name || "This tool"} is most accurate and great for ${taskLabel ? taskLabel.toLowerCase() : "your workflow"}.`;

  const shareMessage = `I asked TrustMeBroAI which AI tool to use for ${taskLabel || "my task"}.\n\nResult: ${primary?.name || "ChatGPT"}\n\nTry it yourself:\ntrustmebro.ai`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareMessage);
    } catch {
      // no-op
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareMessage });
        return;
      } catch {
        // no-op
      }
    }
    await handleCopy();
  }

  return (
    <StepShell>
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">TrustMeBroAI</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-50">Your best AI tool</h2>
        </header>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Primary recommendation</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-50">{primary?.name || "ChatGPT"}</h3>
            </div>
            <span className="rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
              {tag}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-300">{explanation}</p>

          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {(primary?.strengths || ["Great with long PDFs", "Very accurate", "Easy to use"]).slice(0, 3).map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-emerald-300">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <a
            href={primary?.website_url || "#"}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-xl bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Use {primary?.name || "ChatGPT"}
          </a>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Other good options</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {alternatives.length > 0
              ? alternatives.map((tool, index) => (
                  <div key={tool.id || tool.name} className="rounded-2xl border border-slate-700 bg-slate-900/65 p-4">
                    <p className="text-lg font-semibold text-slate-100">{tool.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{index === 0 ? "Fast" : "Easiest to use"}</p>
                  </div>
                ))
              : ["Claude", "Copilot"].map((name, index) => (
                  <div key={name} className="rounded-2xl border border-slate-700 bg-slate-900/65 p-4">
                    <p className="text-lg font-semibold text-slate-100">{name}</p>
                    <p className="mt-1 text-xs text-slate-400">{index === 0 ? "Fast" : "Easiest to use"}</p>
                  </div>
                ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/65 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Share your result</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Share result
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-400"
            >
              Copy link
            </button>
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs leading-relaxed text-slate-400">
            {shareMessage}
          </pre>
        </section>

        <div className="pt-1">
          <button
            type="button"
            onClick={onRunAgain}
            className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-400"
          >
            Run again
          </button>
        </div>
      </div>
    </StepShell>
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

  useEffect(() => {
    async function loadLookupData() {
      try {
        setError("");
        const [profilesRes, tasksRes] = await Promise.all([
          fetch(`${API_BASE_URL}/profiles`),
          fetch(`${API_BASE_URL}/tasks`)
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
        const sessionResponse = await fetch(`${API_BASE_URL}/session`, {
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

        const recommendationResponse = await fetch(`${API_BASE_URL}/recommendation`, {
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
      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-28 top-16 h-72 w-72 rounded-full bg-blue-500/22 blur-3xl" />
          <div className="absolute -right-28 top-1/4 h-80 w-80 rounded-full bg-violet-500/22 blur-3xl" />
          <div className="absolute bottom-8 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/14 blur-3xl" />
        </div>

        <section className="mx-auto flex w-full flex-1 items-center justify-center py-4 sm:py-8">
          <div className="card-surface w-full max-w-3xl p-6 sm:p-8">{renderContent()}</div>
        </section>

        {error ? (
          <div className="mx-auto w-full max-w-3xl rounded-xl border border-rose-900/70 bg-rose-950/60 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

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
      </main>
    </div>
  );
}

export default App;
