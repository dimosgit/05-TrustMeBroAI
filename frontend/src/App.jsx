import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const BUDGET_OPTIONS = ["Free only", "Low cost", "Flexible", "Enterprise"];
const EXPERIENCE_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

const initialForm = {
  profileId: null,
  taskId: null,
  priorities: [],
  budget: null,
  experienceLevel: null
};

function StepCard({ title, subtitle, children }) {
  return (
    <section className="card-surface w-full p-6 sm:p-8">
      <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h3>
      {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function OptionButton({ selected, onClick, title, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-xl border px-4 py-3 text-left transition duration-150",
        selected
          ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100"
          : "border-slate-200 bg-white hover:border-slate-300"
      ].join(" ")}
    >
      <div className="font-semibold text-slate-900">{title}</div>
      {description ? <div className="mt-1 text-xs text-slate-500">{description}</div> : null}
    </button>
  );
}

function App() {
  const [profiles, setProfiles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [priorities, setPriorities] = useState([]);

  const [formData, setFormData] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLookupData() {
      try {
        setError("");
        const [profilesRes, tasksRes, prioritiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/profiles`),
          fetch(`${API_BASE_URL}/tasks`),
          fetch(`${API_BASE_URL}/priorities`)
        ]);

        if (!profilesRes.ok || !tasksRes.ok || !prioritiesRes.ok) {
          throw new Error("Unable to load app data");
        }

        const [profilesData, tasksData, prioritiesData] = await Promise.all([
          profilesRes.json(),
          tasksRes.json(),
          prioritiesRes.json()
        ]);

        setProfiles(profilesData);
        setTasks(tasksData);
        setPriorities(prioritiesData);
      } catch (e) {
        setError("Unable to load options. Check backend connection and try again.");
      }
    }

    loadLookupData();
  }, []);

  const stepDefinitions = useMemo(
    () => [
      {
        key: "profile",
        title: "Choose your profile",
        subtitle: "So recommendations are tuned to your working style.",
        valid: Boolean(formData.profileId),
        render: () => (
          <div className="grid gap-3 sm:grid-cols-2">
            {profiles.map((profile) => (
              <OptionButton
                key={profile.id}
                selected={formData.profileId === profile.id}
                onClick={() => setFormData((prev) => ({ ...prev, profileId: profile.id }))}
                title={profile.name}
                description={profile.description}
              />
            ))}
          </div>
        )
      },
      {
        key: "task",
        title: "Choose your task",
        subtitle: "Pick the outcome you need right now.",
        valid: Boolean(formData.taskId),
        render: () => (
          <div className="grid gap-3 sm:grid-cols-2">
            {tasks.map((task) => (
              <OptionButton
                key={task.id}
                selected={formData.taskId === task.id}
                onClick={() => setFormData((prev) => ({ ...prev, taskId: task.id }))}
                title={task.name}
                description={task.description}
              />
            ))}
          </div>
        )
      },
      {
        key: "priorities",
        title: "Choose your priorities",
        subtitle: "You can select more than one.",
        valid: formData.priorities.length > 0,
        render: () => (
          <div className="grid gap-3 sm:grid-cols-2">
            {priorities.map((priority) => {
              const selected = formData.priorities.includes(priority.name);
              return (
                <OptionButton
                  key={priority.id}
                  selected={selected}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      priorities: selected
                        ? prev.priorities.filter((item) => item !== priority.name)
                        : [...prev.priorities, priority.name]
                    }));
                  }}
                  title={priority.name}
                  description={priority.description}
                />
              );
            })}
          </div>
        )
      },
      {
        key: "budget",
        title: "Choose your budget",
        subtitle: "This helps us avoid recommendations outside your range.",
        valid: Boolean(formData.budget),
        render: () => (
          <div className="grid gap-3 sm:grid-cols-2">
            {BUDGET_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={formData.budget === option}
                onClick={() => setFormData((prev) => ({ ...prev, budget: option }))}
                title={option}
              />
            ))}
          </div>
        )
      },
      {
        key: "experience",
        title: "Choose your experience level",
        subtitle: "We’ll match tools to your comfort level.",
        valid: Boolean(formData.experienceLevel),
        render: () => (
          <div className="grid gap-3 sm:grid-cols-3">
            {EXPERIENCE_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={formData.experienceLevel === option}
                onClick={() => setFormData((prev) => ({ ...prev, experienceLevel: option }))}
                title={option}
              />
            ))}
          </div>
        )
      }
    ],
    [formData, priorities, profiles, tasks]
  );

  const currentStep = stepDefinitions[step];
  const progress = Math.round(((step + 1) / stepDefinitions.length) * 100);

  async function handleGetRecommendation() {
    try {
      setLoading(true);
      setError("");

      const sessionResponse = await fetch(`${API_BASE_URL}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: formData.profileId,
          task_id: formData.taskId,
          budget: formData.budget,
          experience_level: formData.experienceLevel,
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

      const recommendation = await recommendationResponse.json();
      setResult(recommendation);
      setStep(stepDefinitions.length);
    } catch (e) {
      setError("Something went wrong while generating recommendation. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  function resetFlow() {
    setFormData(initialForm);
    setResult(null);
    setStep(0);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen text-slate-900">
      <main className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <section className="grid items-center gap-8 rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-soft lg:grid-cols-[1.15fr_0.85fr] lg:p-12">
          <div>
            <p className="inline-flex rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
              AI Tool Consultant
            </p>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
              There are thousands of AI tools. TrustMeBroAI tells you which one to use.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Pick your task, answer a few quick questions, and get the best AI tool for the job.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  const wizard = document.getElementById("wizard");
                  wizard?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Find my tool
              </button>
              <p className="text-sm text-slate-500">Fast, simple, and built for real people.</p>
            </div>
          </div>

          <aside className="card-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">Example recommendation</p>
            <h2 className="mt-3 text-lg font-bold text-slate-900">Best Match: Perplexity</h2>
            <p className="mt-2 text-sm text-slate-600">
              For fast research and source-backed answers, Perplexity gives the strongest speed-to-confidence ratio.
            </p>
            <div className="mt-4 grid gap-2 text-sm text-slate-700">
              <div className="rounded-lg bg-slate-100 px-3 py-2">Alternative: ChatGPT</div>
              <div className="rounded-lg bg-slate-100 px-3 py-2">Alternative: Claude</div>
            </div>
          </aside>
        </section>

        <section id="wizard" className="mt-10">
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}

          {step < stepDefinitions.length ? (
            <>
              <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
                <span>
                  Step {step + 1} of {stepDefinitions.length}
                </span>
                <span>{progress}% complete</span>
              </div>
              <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 to-teal-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <StepCard title={currentStep.title} subtitle={currentStep.subtitle}>
                {currentStep.render()}
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                    disabled={step === 0 || loading}
                    className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Back
                  </button>

                  {step === stepDefinitions.length - 1 ? (
                    <button
                      type="button"
                      disabled={!currentStep.valid || loading}
                      onClick={handleGetRecommendation}
                      className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "Generating..." : "Get recommendation"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!currentStep.valid || loading}
                      onClick={() => setStep((prev) => prev + 1)}
                      className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  )}
                </div>
              </StepCard>
            </>
          ) : (
            <section className="space-y-4">
              <div className="card-surface p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Your result</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                  Best Match: {result?.primary_tool?.name}
                </h2>
                <p className="mt-3 text-slate-600">{result?.explanation}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Primary</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">{result?.primary_tool?.name}</h3>
                    <p className="mt-2 text-sm text-slate-600">{result?.primary_tool?.description}</p>
                    <a
                      className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:text-brand-600"
                      href={result?.primary_tool?.website_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit website
                    </a>
                  </div>

                  {result?.alternative_tools?.map((tool) => (
                    <div key={tool.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Alternative</p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">{tool.name}</h3>
                      <p className="mt-2 text-sm text-slate-600">{tool.description}</p>
                      <a
                        className="mt-3 inline-block text-sm font-semibold text-slate-700 hover:text-slate-900"
                        href={tool.website_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit website
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-surface overflow-x-auto p-6 sm:p-8">
                <h3 className="text-lg font-bold text-slate-900">Comparison</h3>
                <table className="mt-4 min-w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="pb-3 pr-4 font-semibold">Tool</th>
                      <th className="pb-3 pr-4 font-semibold">Category</th>
                      <th className="pb-3 pr-4 font-semibold">Pricing</th>
                      <th className="pb-3 font-semibold">Top strength</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[result?.primary_tool, ...(result?.alternative_tools || [])].filter(Boolean).map((tool) => (
                      <tr key={tool.id} className="border-t border-slate-200">
                        <td className="py-3 pr-4 font-semibold text-slate-900">{tool.name}</td>
                        <td className="py-3 pr-4 text-slate-600">{tool.category}</td>
                        <td className="py-3 pr-4 text-slate-600">{tool.pricing_label}</td>
                        <td className="py-3 text-slate-600">{tool.strengths?.[0] || "Strong overall fit"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  type="button"
                  onClick={resetFlow}
                  className="mt-6 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Run again
                </button>
              </div>
            </section>
          )}
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-900">TrustMeBroAI</p>
            <p>Simple guidance to pick the right AI tool in minutes.</p>
          </div>
          <div className="text-right">
            <a
              href="https://www.linkedin.com/in/YOUR-LINK-HERE"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-700 hover:text-brand-600"
            >
              LinkedIn: https://www.linkedin.com/in/YOUR-LINK-HERE
            </a>
            <p className="mt-1 text-xs text-slate-500">© {new Date().getFullYear()} TrustMeBroAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
