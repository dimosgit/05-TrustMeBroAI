const CODE_TASKS = new Set(["write code", "build an app"]);
const RESEARCH_TASKS = new Set(["do research", "summarize documents", "analyze a pdf"]);
const AUTOMATION_TASKS = new Set(["automate work"]);
const CONTENT_TASKS = new Set(["write content"]);
const IMAGE_TASKS = new Set(["create images"]);

function includesPriority(priorities, needle) {
  return priorities.some((priority) => priority.toLowerCase() === needle.toLowerCase());
}

function normalizeName(value = "") {
  return value.trim().toLowerCase();
}

export function pickMockRecommendation({ task, priorities, budget, experience }) {
  const normalizedTask = normalizeName(task);
  const normalizedPriorities = priorities.map((p) => normalizeName(p));

  let primary = "ChatGPT";
  let alternatives = ["Claude", "Perplexity"];
  let explanation = "Balanced choice for broad use-cases with fast onboarding.";

  // TODO: Replace this block with the real scoring engine later.
  if (CODE_TASKS.has(normalizedTask)) {
    if (includesPriority(normalizedPriorities, "easiest to use") || experience === "Beginner") {
      primary = "GitHub Copilot";
      alternatives = ["Cursor", "ChatGPT"];
      explanation = "Optimized for rapid coding assistance with low setup friction.";
    } else {
      primary = "Cursor";
      alternatives = ["GitHub Copilot", "Claude"];
      explanation = "Strong fit for advanced coding workflows and app building speed.";
    }
  } else if (AUTOMATION_TASKS.has(normalizedTask)) {
    if (budget === "Free only") {
      primary = "n8n";
      alternatives = ["Make", "Zapier"];
      explanation = "Best free-first flexibility with powerful workflow customization.";
    } else if (includesPriority(normalizedPriorities, "easiest to use")) {
      primary = "Zapier";
      alternatives = ["Make", "n8n"];
      explanation = "Fastest path to automation with beginner-friendly setup.";
    } else {
      primary = "Make";
      alternatives = ["Zapier", "n8n"];
      explanation = "Great balance of visual automation depth and time-to-value.";
    }
  } else if (RESEARCH_TASKS.has(normalizedTask)) {
    if (includesPriority(normalizedPriorities, "best quality")) {
      primary = "Claude";
      alternatives = ["ChatGPT", "Perplexity"];
      explanation = "High-quality long-form reasoning and document synthesis quality.";
    } else {
      primary = "Perplexity";
      alternatives = ["ChatGPT", "Claude"];
      explanation = "Reliable for quick research workflows with source-oriented answers.";
    }
  } else if (CONTENT_TASKS.has(normalizedTask)) {
    primary = "ChatGPT";
    alternatives = ["Claude", "Microsoft Copilot"];
    explanation = "Strong all-around writing support and rapid content iteration.";
  } else if (IMAGE_TASKS.has(normalizedTask)) {
    primary = "ChatGPT";
    alternatives = ["Microsoft Copilot", "Perplexity"];
    explanation = "Simple image generation workflow and versatile creative prompts.";
  }

  if (includesPriority(normalizedPriorities, "privacy") && primary === "ChatGPT") {
    primary = "Claude";
    alternatives = ["ChatGPT", "Perplexity"];
    explanation = "Prioritizes conservative data-handling preferences for sensitive workflows.";
  }

  return { primary, alternatives, explanation };
}
