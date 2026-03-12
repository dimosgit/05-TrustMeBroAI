import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { trackEvent } from "../../lib/analytics/tracking";
import {
  fetchCatalogData
} from "../../lib/api/catalogApi";
import {
  computeRecommendation,
  createRecommendationSession,
  normalizeLockedResult
} from "../../lib/api/recommendationApi";
import { useRecommendation } from "../result/RecommendationContext";
import {
  DEFAULT_ICON,
  initialWizardForm,
  PRIORITY_ICON_MAP,
  PROFILE_ICON_MAP,
  TASK_ICON_MAP
} from "./constants";
import {
  LoadingStep,
  StepPriority,
  StepProfile,
  StepTask
} from "./components/WizardSteps";

function mapWithIcons(items, iconMap) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    icon: iconMap[item.name] || DEFAULT_ICON
  }));
}

export default function WizardPage() {
  const navigate = useNavigate();
  const { setLockedResult, clearResult } = useRecommendation();
  const wizardStartedAtMs = useRef(Date.now());

  const [profiles, setProfiles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [priorities, setPriorities] = useState([]);

  const [lookupLoading, setLookupLoading] = useState(true);
  const [lookupError, setLookupError] = useState("");

  const [formData, setFormData] = useState(initialWizardForm);
  const [step, setStep] = useState("profile");
  const [loadingStage, setLoadingStage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function loadLookupData() {
      setLookupLoading(true);
      setLookupError("");

      try {
        const catalog = await fetchCatalogData();
        setProfiles(mapWithIcons(catalog.profiles, PROFILE_ICON_MAP));
        setTasks(mapWithIcons(catalog.tasks, TASK_ICON_MAP));
        setPriorities(mapWithIcons(catalog.priorities, PRIORITY_ICON_MAP));
      } catch {
        setLookupError("Unable to load wizard options. Please retry.");
      } finally {
        setLookupLoading(false);
      }
    }

    void loadLookupData();
  }, []);

  useEffect(() => {
    if (step !== "loading") {
      return undefined;
    }

    setLoadingStage(0);
    const timer = window.setInterval(() => {
      setLoadingStage((current) => Math.min(current + 1, 3));
    }, 320);

    return () => window.clearInterval(timer);
  }, [step]);

  const selectedPriorityName = useMemo(
    () => priorities.find((item) => item.id === formData.priorityId)?.name || "",
    [priorities, formData.priorityId]
  );

  async function handleSubmit() {
    if (!formData.profileId || !formData.taskId || !formData.priorityId) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setStep("loading");

    try {
      const minDelay = new Promise((resolve) => window.setTimeout(resolve, 1200));
      const wizardDurationSeconds = Math.max(
        0,
        Math.round((Date.now() - wizardStartedAtMs.current) / 1000)
      );

      const computePromise = (async () => {
        const sessionId = await createRecommendationSession({
          profileId: formData.profileId,
          taskId: formData.taskId,
          priorityName: selectedPriorityName,
          wizardDurationSeconds
        });

        const computed = await computeRecommendation({ sessionId });
        return normalizeLockedResult(computed, sessionId);
      })();

      const [lockedResult] = await Promise.all([computePromise, minDelay]);

      setLockedResult(lockedResult);
      trackEvent("wizard_completed", {
        session_id: lockedResult.sessionId,
        recommendation_id: lockedResult.recommendationId,
        selected_priority: selectedPriorityName,
        wizard_duration_seconds: wizardDurationSeconds
      });
      navigate("/result", { replace: true });
    } catch {
      setSubmitError("Could not generate recommendation. Please try again.");
      setStep("priority");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setFormData(initialWizardForm);
    clearResult();
    wizardStartedAtMs.current = Date.now();
    setStep("profile");
    setSubmitError("");
  }

  function renderStep() {
    if (lookupLoading || step === "loading") {
      return <LoadingStep stage={loadingStage} />;
    }

    if (step === "profile") {
      return (
        <StepProfile
          options={profiles}
          selectedId={formData.profileId}
          onSelect={(profileId) => setFormData((current) => ({ ...current, profileId }))}
          onNext={() => setStep("task")}
        />
      );
    }

    if (step === "task") {
      return (
        <StepTask
          options={tasks}
          selectedId={formData.taskId}
          onSelect={(taskId) => setFormData((current) => ({ ...current, taskId }))}
          onBack={() => setStep("profile")}
          onNext={() => setStep("priority")}
        />
      );
    }

    return (
      <StepPriority
        options={priorities}
        selectedId={formData.priorityId}
        onSelect={(priorityId) => setFormData((current) => ({ ...current, priorityId }))}
        onBack={() => setStep("task")}
        onSubmit={handleSubmit}
        loading={isSubmitting}
      />
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between pb-3">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Find your best AI tool</h1>
        <button
          type="button"
          onClick={resetForm}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-white"
        >
          Reset
        </button>
      </header>

      {lookupError ? <InlineAlert>{lookupError}</InlineAlert> : null}
      {submitError ? <InlineAlert>{submitError}</InlineAlert> : null}

      {renderStep()}
    </div>
  );
}
