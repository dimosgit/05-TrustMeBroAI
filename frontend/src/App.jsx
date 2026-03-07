import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const SESSION_DEFAULTS = {
  budget: "Flexible",
  experienceLevel: "Intermediate"
};

const PROFILE_CHOICES = [
  {
    name: "Business",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    name: "Developer",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    name: "Consultant",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    name: "Student",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    )
  },
  {
    name: "Creator",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    )
  }
];

const TASK_CHOICES = [
  {
    name: "Analyze a PDF",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    name: "Write content",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  {
    name: "Summarize documents",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    )
  },
  {
    name: "Write code",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m0 0l-2 1m2-1v2.5M14 4l-2 1m0 0l-2-1m2 1v2.5M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1m2 1l2-1m-2 1V15.5M18 18l2-1m-2 1l-2-1m2 1v-2.5" />
      </svg>
    )
  },
  {
    name: "Build an app",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    name: "Automate work",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    name: "Do research",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    name: "Create images",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  }
];

const PRIORITY_CHOICES = [
  {
    name: "Lowest price",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    name: "Best quality",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )
  },
  {
    name: "Fastest results",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    name: "Easiest to use",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    name: "Privacy",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    name: "Microsoft friendly",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  }
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
  const steps = ["Profile", "Mission", "Priorities"];
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between pb-2">
        <div className="space-y-0.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-500/80">TrustMeBroAI</p>
          <h3 className="text-lg font-bold text-white tracking-tight">{steps[question - 1]}</h3>
        </div>
        <div className="text-right">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Progress</span>
          <span className="text-xs font-black text-white">{Math.round((question / 3) * 100)}%</span>
        </div>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/5 p-[0.5px]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-700 ease-out"
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
        "group relative w-full overflow-hidden rounded-2xl border px-5 py-4 text-left transition-all duration-500",
        "hover:scale-[1.02] active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/40",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
        selected
          ? "border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-blue-600/5 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
          : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/5"
      ].join(" ")}
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/0 to-transparent transition-opacity group-hover:via-blue-500/30" />
      <div className="flex items-center gap-4">
        <span className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition-all duration-300",
          selected
            ? "border-blue-500/50 bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            : "border-white/10 bg-white/5 text-slate-400 group-hover:border-white/20 group-hover:text-white group-hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
        ].join(" ")}>
          {icon}
        </span>
        <div className="flex-1">
          <span className={[
            "block text-sm font-bold tracking-tight transition-colors",
            selected ? "text-white" : "text-slate-300 group-hover:text-white"
          ].join(" ")}>
            {title}
          </span>
          {subtitle && (
            <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500 transition-colors group-hover:text-slate-400">
              {subtitle}
            </span>
          )}
        </div>
        <div className={[
          "flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-500",
          selected
            ? "border-blue-500 bg-blue-500 text-white scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            : "border-white/10 bg-white/5 opacity-0 group-hover:opacity-100"
        ].join(" ")}>
          <span className="text-[10px] font-bold">✓</span>
        </div>
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
      <div className="space-y-6 py-2 text-center">
        <p className="text-sm font-medium tracking-[0.2em] text-slate-400">TrustMeBroAI</p>

        <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          There are thousands of AI tools.
          <br className="hidden sm:block" />
          We tell you which one to use.
        </h1>

        <p className="mx-auto max-w-xl text-base text-slate-400">
          Answer a few simple questions and get
          <br className="hidden sm:block" />
          the best AI tool for your task.
        </p>

        <div className="mx-auto flex w-full max-w-sm flex-col gap-2.5 py-2">
          <button
            type="button"
            onClick={onStart}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-base font-bold text-white shadow-lg transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98]"
          >
            Find my AI tool
          </button>
          <a
            href="/login"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-base font-bold text-white transition-all hover:bg-white/10 active:scale-[0.98]"
          >
            Log in
          </a>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/5" />
            <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-widest text-slate-500">Works with the best AI tools</p>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5153-4.9108 6.0462 6.0462 0 0 0-4.7471-3.1248 6.1213 6.1213 0 0 0-5.1189 1.954 6.0461 6.0461 0 0 0-5.1189-1.954 6.0462 6.0462 0 0 0-4.7471 3.1248 5.9847 5.9847 0 0 0-.5183 4.9108 6.0461 6.0461 0 0 0 1.956 5.1189 6.0461 6.0461 0 0 0-1.956 5.1189 5.9847 5.9847 0 0 0 .5153 4.9108 6.0462 6.0462 0 0 0 4.7471 3.1248 6.1213 6.1213 0 0 0 5.1189-1.954 6.0461 6.0461 0 0 0 5.1189 1.954 6.0462 6.0462 0 0 0 4.7471-3.1248 5.9847 5.9847 0 0 0 .5183-4.9108 6.0461 6.0461 0 0 0-1.956-5.1189 6.0461 6.0461 0 0 0 1.956-5.122zM12.0003 12.9803l-2.025-1.17 4.0538-2.3438 1.0113.585a2.025 2.025 0 0 1 0 3.5075l-3.0401 1.7513zm-1.0113-7.5187l3.0401-1.7513a2.025 2.025 0 0 1 2.7663.7431c.3.5181.4 1.1212.28 1.6963l-4.0538 2.3438-2.0326-1.1738v-1.8581zm-7.0945 4.0938a2.025 2.025 0 0 1-.2743-1.698 2.025 2.025 0 0 1 .741-.9983l3.0401-1.7513 2.0287 1.1738v4.6125l-5.5355-3.1974zm0 6.39l5.5355-3.1974v4.6125l-3.0401 1.7513a2.025 2.025 0 0 1-2.7663-.7431 2.0251 2.0251 0 0 1-.28-1.693l4.0538-2.3438zm11.148 4.094a2.025 2.025 0 0 1 .2743 1.698c.1175-.5738.0163-1.1713-.2845-1.685l-3.0401-1.7513-2.0287-1.1738v-4.6125l5.5355 3.1971z" /></svg>
              </span>
              <span className="text-lg font-semibold text-white">ChatGPT</span>
            </div>
            {LANDING_LOGOS.slice(1).map((logo) => (
              <div key={logo.name} className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${logo.tone} text-[10px] font-bold`}>
                  {logo.token}
                </span>
                <span className="text-lg font-semibold text-white">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="pt-2 text-sm font-medium text-slate-400">Fast. Simple. Built for real people.</p>
      </div>
    </StepShell>
  );
}

function StepProfile({ options, selectedId, onSelect, onNext, onBack }) {
  return (
    <StepShell>
      <StepHeader question={1} />
      <h2 className="mb-4 text-xl font-bold tracking-tight text-white sm:text-2xl">Who are you?</h2>
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
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-white/10 bg-white/5 px-8 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-white/10"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedId}
          className="rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
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
      <h2 className="mb-4 text-xl font-bold tracking-tight text-white sm:text-2xl">What's the mission?</h2>
      <div className="grid gap-2.5 sm:grid-cols-2">
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
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-white/10 bg-white/5 px-8 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-white/10"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedId}
          className="rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
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
      <h2 className="mb-4 text-xl font-bold tracking-tight text-white sm:text-2xl">What matters most?</h2>
      <div className="grid gap-2.5 sm:grid-cols-2">
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
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-white/10 bg-white/5 px-8 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-white/10"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={selected.length === 0 || loading}
          className="relative overflow-hidden rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className={loading ? "opacity-0" : "opacity-100"}>Get recommendations</span>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
      <div className="space-y-6 py-4 text-center sm:py-6">
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/10" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
            <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl">Finding your perfect match...</h2>
          <p className="text-xs text-slate-500">Our AI is consulting the experts.</p>
        </div>

        <div className="mx-auto max-w-xs space-y-2.5 pt-2 text-left">
          {checks.map((text, index) => {
            const active = stage > index;
            const current = stage === index;
            return (
              <div
                key={text}
                className={[
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-500",
                  active
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : current
                      ? "border-blue-500/20 bg-blue-500/5 text-blue-400 shimmer"
                      : "border-white/5 bg-white/[0.02] text-slate-500 opacity-40"
                ].join(" ")}
              >
                <div className={[
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px]",
                  active ? "border-emerald-500/50 bg-emerald-400 text-[#0d1117]" : "border-current"
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
      <div className="space-y-4 py-1">
        <header className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Recommendation</p>
            <h2 className="mt-0.5 text-2xl font-bold text-white tracking-tight">Your Best Match</h2>
          </div>
          <button
            type="button"
            onClick={onRunAgain}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"
          >
            Start Over
          </button>
        </header>

        <section className="relative overflow-hidden rounded-2xl border border-blue-500/10 bg-[#161b22]/40 p-5 sm:p-6">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-xl font-bold text-blue-400">
                {primary?.name?.substring(0, 2).toUpperCase() || "AI"}
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">{primary?.name || "ChatGPT"}</h3>
                <p className="mt-0.5 flex items-center gap-2 text-[10px] font-semibold text-blue-400/80">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {tag}
                </p>
              </div>
            </div>
            <a
              href={primary?.website_url || "#"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg transition-all hover:bg-blue-500"
            >
              Open {primary?.name || "Tool"}
            </a>
          </div>

          <div className="mt-6 grid gap-4 border-t border-white/5 pt-6 sm:grid-cols-2">
            <div>
              <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Why this tool?</h4>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {result?.explanation || (primary?.name || "This tool") + " is the industry leader for this specific use case."}
              </p>
            </div>
            <div>
              <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Key Strengths</h4>
              <ul className="mt-2 space-y-1.5">
                {(primary?.strengths || ["Industry standard", "High accuracy", "Easy integration"]).slice(0, 3).map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/10 text-[9px] text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {alternatives.length > 0 && (
          <section>
            <h3 className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Other good options</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {alternatives.map((tool, idx) => (
                <div key={tool.id} className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">{tool.name}</p>
                    <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[9px] font-bold text-slate-400 lowercase">
                      {idx === 0 ? "Fastest" : "Easiest"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-500">A strong alternative for your workflow.</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 text-center">
          <h3 className="text-xs font-bold text-white tracking-tight">Share recommendation</h3>
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(shareMessage);
                alert("Link copied!");
              }}
              className="rounded-lg bg-white/5 px-4 py-2 text-[10px] font-bold text-white hover:bg-white/10"
            >
              Copy Link
            </button>
            <button
              type="button"
              className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[10px] font-bold text-blue-400 hover:bg-blue-500/20"
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
    <footer className="mx-auto mt-4 w-full max-w-sm pb-2">
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
    <footer className="mx-auto mt-4 w-full max-w-3xl text-center pb-2">
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
    <div className="min-h-screen text-slate-100 flex flex-col">
      <main className="relative mx-auto flex flex-1 w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-16 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/14 blur-3xl" />
          <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-violet-500/18 blur-3xl" />
          <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-indigo-400/16 blur-3xl" />
          <div className="absolute bottom-20 left-1/2 h-96 w-[38rem] -translate-x-1/2 rounded-full bg-sky-400/12 blur-3xl" />
        </div>

        <section className="mx-auto flex w-full flex-1 items-center justify-center py-4">
          <div
            className={[
              "card-surface w-full p-6 sm:p-10",
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
