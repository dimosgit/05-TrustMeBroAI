function StepHeader({ question }) {
  return (
    <header className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">Step {question} of 3</span>
        <span className="text-xs font-semibold text-slate-400">{Math.round((question / 3) * 100)}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-700 ease-out"
          style={{ width: `${(question / 3) * 100}%` }}
        />
      </div>
    </header>
  );
}

function ChoiceCard({ title, subtitle, icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative w-full overflow-hidden rounded-2xl border px-5 py-4 text-left transition-all duration-500",
        "hover:scale-[1.02] active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/40",
        selected
          ? "border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-blue-600/5 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
          : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/5"
      ].join(" ")}
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/0 to-transparent transition-opacity group-hover:via-blue-500/30" />
      <div className="flex items-center gap-4">
        <span
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition-all duration-300",
            selected
              ? "border-blue-500/50 bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              : "border-white/10 bg-white/5 text-slate-400 group-hover:border-white/20 group-hover:text-white group-hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
          ].join(" ")}
        >
          {icon}
        </span>
        <div className="flex-1">
          <span className={["block text-sm font-bold tracking-tight transition-colors", selected ? "text-white" : "text-slate-300 group-hover:text-white"].join(" ")}>{title}</span>
          {subtitle ? (
            <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500 transition-colors group-hover:text-slate-400">
              {subtitle}
            </span>
          ) : null}
        </div>
        <div
          className={[
            "flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-500",
            selected
              ? "scale-110 border-blue-500 bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              : "border-white/10 bg-white/5 opacity-0 group-hover:opacity-100"
          ].join(" ")}
        >
          <span className="text-[10px] font-bold">✓</span>
        </div>
      </div>
    </button>
  );
}

export function StepShell({ children }) {
  return <div className="step-in pb-4 px-2 sm:px-4">{children}</div>;
}

function StepActionBar({ children }) {
  return (
    <div
      data-testid="wizard-action-bar"
      className="sticky bottom-0 z-20 -mx-2 mt-6 px-2 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 sm:static sm:z-auto sm:mx-0 sm:mt-6 sm:p-0"
    >
      <div className="rounded-2xl border border-white/10 bg-[#161b22]/95 px-3 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none sm:backdrop-blur-0">
        {children}
      </div>
    </div>
  );
}

export function StepProfile({ options, selectedId, onSelect, onNext }) {
  return (
    <StepShell>
      <StepHeader question={1} />
      <h2 className="mb-4 text-xl font-bold tracking-tight text-white sm:text-2xl">Who are you?</h2>
      <div className="grid gap-3">
        {options.map((option) => (
          <ChoiceCard
            key={option.id}
            title={option.name}
            subtitle={option.description}
            icon={option.icon}
            selected={selectedId === option.id}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
      <StepActionBar>
        <div className="sm:flex sm:justify-end">
          <button
            type="button"
            onClick={onNext}
            disabled={!selectedId}
            className="w-full rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
          >
            Continue
          </button>
        </div>
      </StepActionBar>
    </StepShell>
  );
}

export function StepTask({ options, selectedId, onSelect, onNext, onBack }) {
  return (
    <StepShell>
      <StepHeader question={2} />
      <h2 className="mb-4 text-xl font-bold tracking-tight text-white sm:text-2xl">What&apos;s the mission?</h2>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {options.map((option) => (
          <ChoiceCard
            key={option.id}
            title={option.name}
            subtitle={option.description}
            icon={option.icon}
            selected={selectedId === option.id}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
      <StepActionBar>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-white/10 sm:px-8"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!selectedId}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30 sm:px-8"
          >
            Continue
          </button>
        </div>
      </StepActionBar>
    </StepShell>
  );
}

export function StepPriority({ options, selectedId, onSelect, onSubmit, onBack, loading }) {
  return (
    <StepShell>
      <StepHeader question={3} />
      <h2 className="mb-4 text-xl font-bold tracking-tight text-white sm:text-2xl">What matters most?</h2>
      <p className="mb-4 text-xs text-slate-500">Pick one top priority only.</p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {options.map((option) => (
          <ChoiceCard
            key={option.id}
            title={option.name}
            subtitle={option.description}
            icon={option.icon}
            selected={selectedId === option.id}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
      <StepActionBar>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-white/10 sm:px-8"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!selectedId || loading}
            className="relative overflow-hidden rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30 sm:px-8"
          >
            <span className={loading ? "opacity-0" : "opacity-100"}>Find my match</span>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            ) : null}
          </button>
        </div>
      </StepActionBar>
    </StepShell>
  );
}

export function LoadingStep({ stage }) {
  const checks = ["Saving your session", "Computing recommendation", "Preparing result"];

  return (
    <StepShell>
      <div className="space-y-6 py-4 text-center sm:py-6">
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/10" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
            <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Finding your best match...</h2>
          <p className="text-xs text-slate-500">One moment while we process your choices.</p>
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
                      ? "shimmer border-blue-500/20 bg-blue-500/5 text-blue-400"
                      : "border-white/5 bg-white/[0.02] text-slate-500 opacity-40"
                ].join(" ")}
              >
                <div className={["flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px]", active ? "border-emerald-500/50 bg-emerald-400 text-[#0d1117]" : "border-current"].join(" ")}>
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
