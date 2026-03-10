import { ValidationError } from "../errors.js";

export const VALID_PRIORITIES = [
  "Best quality",
  "Fastest results",
  "Easiest to use",
  "Lowest price"
];

export const PRIORITY_WEIGHTS = {
  "Best quality": { quality: 0.5, speed: 0.2, ease: 0.2, price: 0.1 },
  "Fastest results": { quality: 0.2, speed: 0.5, ease: 0.2, price: 0.1 },
  "Easiest to use": { quality: 0.2, speed: 0.2, ease: 0.5, price: 0.1 },
  "Lowest price": { quality: 0.1, speed: 0.2, ease: 0.2, price: 0.5 }
};

const PRIORITY_CONTEXT = {
  "Best quality": "when quality is what matters most",
  "Fastest results": "when you need results fast",
  "Easiest to use": "if you want the simplest experience",
  "Lowest price": "without spending money"
};

const PRIORITY_TIE_KEY = {
  "Best quality": "quality",
  "Fastest results": "speed",
  "Easiest to use": "ease_of_use",
  "Lowest price": "pricing_fit"
};

const CATEGORY_FALLBACK = {
  "Document/PDF": ["Research", "Content Creation"],
  Research: ["Document/PDF", "Content Creation"],
  "Content Creation": ["Document/PDF", "Research"],
  Coding: ["Automation", "Research"],
  Automation: ["Coding", "Research"]
};

const PRICING_FIT = {
  free: 5,
  freemium: 4,
  paid_low: 3,
  paid_mid: 2,
  paid_high: 1
};

export function getWeightsForPriority(priority) {
  const weights = PRIORITY_WEIGHTS[priority];
  if (!weights) {
    throw new ValidationError("selected_priority is invalid");
  }
  return weights;
}

export function getPriorityContext(priority) {
  const context = PRIORITY_CONTEXT[priority];
  if (!context) {
    throw new ValidationError("selected_priority is invalid");
  }
  return context;
}

export function getPriorityTieKey(priority) {
  const key = PRIORITY_TIE_KEY[priority];
  if (!key) {
    throw new ValidationError("selected_priority is invalid");
  }
  return key;
}

export function getFallbackCategories(primaryCategory) {
  return CATEGORY_FALLBACK[primaryCategory] || [];
}

export function getPricingFit(pricingTier) {
  return PRICING_FIT[pricingTier] || 2;
}

export function scoreTool(tool, weights) {
  return (
    tool.quality * weights.quality +
    tool.speed * weights.speed +
    tool.ease_of_use * weights.ease +
    tool.pricing_fit * weights.price
  );
}

export function normalizeTargetUsers(targetUsers) {
  if (!Array.isArray(targetUsers)) {
    return [];
  }
  return targetUsers.map((entry) => String(entry).toLowerCase());
}

export function containsProfile(targetUsers, profileName) {
  const normalized = normalizeTargetUsers(targetUsers);
  return normalized.includes(String(profileName || "").toLowerCase());
}

export function buildPrimaryReason({ toolName, taskLabel, priority }) {
  const context = getPriorityContext(priority);
  return `${toolName} is the best fit for ${String(taskLabel || "").toLowerCase()} ${context}.`;
}
