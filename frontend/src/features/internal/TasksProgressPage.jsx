import { taskProgressSections } from "./tasksProgressData";

const STATUS_META = {
  completed: {
    symbol: "[x]",
    label: "Done",
    chipClassName: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    panelClassName: "border-emerald-500/15 bg-emerald-500/[0.05]"
  },
  in_progress: {
    symbol: "[~]",
    label: "In progress",
    chipClassName: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    panelClassName: "border-amber-400/15 bg-amber-400/[0.05]"
  },
  not_started: {
    symbol: "[ ]",
    label: "To do",
    chipClassName: "border-slate-500/30 bg-slate-500/10 text-slate-300",
    panelClassName: "border-white/10 bg-white/[0.03]"
  }
};

const PRIORITY_META = {
  P0: {
    className: "border-rose-500/30 bg-rose-500/10 text-rose-200"
  },
  P1: {
    className: "border-sky-400/30 bg-sky-400/10 text-sky-200"
  },
  P2: {
    className: "border-slate-500/30 bg-slate-500/10 text-slate-300"
  }
};

const STATUS_ORDER = ["not_started", "in_progress", "completed"];

function PriorityChip({ priority = "P2" }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.P2;

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${meta.className}`}
      aria-label={`Priority ${priority}`}
    >
      {priority}
    </span>
  );
}

function TaskRow({ task }) {
  const meta = STATUS_META[task.status] || STATUS_META.not_started;

  return (
    <li className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
      <div className="flex flex-wrap items-start gap-2">
        <span
          className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${meta.chipClassName}`}
          aria-label={meta.label}
        >
          {meta.symbol} {meta.label}
        </span>
        <PriorityChip priority={task.priority} />
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-100">{task.text}</p>
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

function splitTasksByStatus(tasks) {
  return STATUS_ORDER.map((status) => ({
    status,
    meta: STATUS_META[status],
    items: tasks.filter((task) => task.status === status)
  }));
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
        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_ORDER.map((status) => {
            const meta = STATUS_META[status];

            return (
              <span
                key={status}
                className={`inline-flex rounded-lg border px-3 py-1 text-xs font-semibold ${meta.chipClassName}`}
              >
                {meta.symbol} {meta.label}
              </span>
            );
          })}
          <PriorityChip priority="P0" />
          <PriorityChip priority="P1" />
          <PriorityChip priority="P2" />
        </div>
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
            <div className="grid gap-4 xl:grid-cols-3">
              {splitTasksByStatus(section.tasks).map(({ status, meta, items }) => (
                <div
                  key={status}
                  className={`rounded-2xl border p-4 ${meta.panelClassName}`}
                  data-testid={`${section.title}-${status}`.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className={`inline-flex rounded-lg border px-3 py-1 text-xs font-semibold ${meta.chipClassName}`}>
                      {meta.symbol} {meta.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{items.length}</span>
                  </div>

                  {items.length > 0 ? (
                    <ul className="space-y-2">
                      {items.map((task) => (
                        <TaskRow key={task.text} task={task} />
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-500">
                      No tasks in this column.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}
