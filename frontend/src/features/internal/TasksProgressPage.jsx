import { taskProgressSections } from "./tasksProgressData";

const STATUS_META = {
  completed: {
    symbol: "[x]",
    label: "Completed",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
  },
  in_progress: {
    symbol: "[~]",
    label: "In progress",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-100"
  },
  not_started: {
    symbol: "[ ]",
    label: "Not started",
    className: "border-white/10 bg-white/5 text-slate-300"
  }
};

function TaskRow({ task }) {
  const meta = STATUS_META[task.status] || STATUS_META.not_started;

  return (
    <li className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span
        className={`mt-0.5 inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${meta.className}`}
        aria-label={meta.label}
      >
        {meta.symbol}
      </span>
      <span className="text-sm text-slate-200">{task.text}</span>
    </li>
  );
}

function StateRow({ item }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
      <p className="mt-1 text-sm font-medium text-white">{item.value}</p>
    </div>
  );
}

export default function TasksProgressPage() {
  return (
    <div className="w-full space-y-6" data-testid="tasks-progress-page">
      <section className="rounded-3xl border border-sky-400/20 bg-sky-500/10 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200">Internal only</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Tasks progress</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          This route is for development visibility only. It must be deleted or disabled before go-live.
        </p>
      </section>

      {taskProgressSections.map((section) => (
        <section key={section.title} className="space-y-3 rounded-3xl border border-white/10 bg-[#131822]/70 p-5">
          <h2 className="text-lg font-semibold text-white">{section.title}</h2>

          {section.items ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {section.items.map((item) => (
                <StateRow key={item.label} item={item} />
              ))}
            </div>
          ) : null}

          {section.tasks ? (
            <ul className="space-y-2">
              {section.tasks.map((task) => (
                <TaskRow key={task.text} task={task} />
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
