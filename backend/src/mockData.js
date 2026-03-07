export const mockProfiles = [
  { id: 1, name: "Business", description: "Business-focused workflows and decision support" },
  { id: 2, name: "Developer", description: "Software engineering and technical product tasks" },
  { id: 3, name: "Consultant", description: "Client delivery, strategy, and communication workflows" },
  { id: 4, name: "Student", description: "Learning, studying, and knowledge synthesis" },
  { id: 5, name: "Creator", description: "Content, media, and audience growth workflows" }
];

export const mockTasks = [
  { id: 1, name: "Analyze a PDF", description: "Extract key insights from PDF files quickly", category: "analysis" },
  { id: 2, name: "Write content", description: "Draft marketing, social, or long-form writing", category: "content" },
  { id: 3, name: "Summarize documents", description: "Produce concise summaries from long material", category: "analysis" },
  { id: 4, name: "Write code", description: "Generate and improve code quickly", category: "development" },
  { id: 5, name: "Build an app", description: "Plan and implement software products end-to-end", category: "development" },
  { id: 6, name: "Automate work", description: "Create no-code or low-code automations", category: "automation" },
  { id: 7, name: "Do research", description: "Find and synthesize reliable information", category: "research" },
  { id: 8, name: "Create images", description: "Generate and iterate visual assets", category: "creative" }
];

export const mockPriorities = [
  { id: 1, name: "Lowest price", description: "Minimize recurring spend" },
  { id: 2, name: "Best quality", description: "Prioritize output quality and reliability" },
  { id: 3, name: "Fastest results", description: "Get useful output as quickly as possible" },
  { id: 4, name: "Easiest to use", description: "Reduce complexity and learning curve" },
  { id: 5, name: "Beginner friendly", description: "Accessible setup and simple workflows" },
  { id: 6, name: "Privacy", description: "Prefer stronger privacy and controlled data usage" }
];

export const mockTools = [
  {
    id: 1,
    name: "ChatGPT",
    category: "assistant",
    pricing_type: "freemium",
    pricing_label: "Free + paid tiers",
    website_url: "https://chatgpt.com",
    description: "General-purpose AI assistant with strong multimodal capabilities.",
    strengths: ["Versatile", "Fast responses", "Strong ecosystem"],
    weaknesses: ["Can require prompt tuning"],
    is_active: true
  },
  {
    id: 2,
    name: "Claude",
    category: "assistant",
    pricing_type: "freemium",
    pricing_label: "Free + paid tiers",
    website_url: "https://claude.ai",
    description: "AI assistant optimized for long context and thoughtful writing.",
    strengths: ["Long context", "Strong writing quality"],
    weaknesses: ["Smaller plugin ecosystem"],
    is_active: true
  },
  {
    id: 3,
    name: "Microsoft Copilot",
    category: "assistant",
    pricing_type: "freemium",
    pricing_label: "Free + Microsoft plans",
    website_url: "https://copilot.microsoft.com",
    description: "Microsoft-integrated assistant for office and productivity use cases.",
    strengths: ["Microsoft integration", "Productivity workflows"],
    weaknesses: ["Best inside Microsoft stack"],
    is_active: true
  },
  {
    id: 4,
    name: "Perplexity",
    category: "research",
    pricing_type: "freemium",
    pricing_label: "Free + Pro",
    website_url: "https://www.perplexity.ai",
    description: "AI answer engine focused on research and source-grounded responses.",
    strengths: ["Research speed", "Source citations"],
    weaknesses: ["Less suited for coding-heavy tasks"],
    is_active: true
  },
  {
    id: 5,
    name: "Cursor",
    category: "development",
    pricing_type: "paid",
    pricing_label: "Pro subscription",
    website_url: "https://www.cursor.com",
    description: "AI-native code editor designed for fast implementation workflows.",
    strengths: ["Codebase-aware assistance", "Developer speed"],
    weaknesses: ["Primarily developer-focused"],
    is_active: true
  },
  {
    id: 6,
    name: "GitHub Copilot",
    category: "development",
    pricing_type: "paid",
    pricing_label: "Individual + business plans",
    website_url: "https://github.com/features/copilot",
    description: "AI coding assistant deeply integrated with IDEs and GitHub workflows.",
    strengths: ["IDE integration", "Code completion quality"],
    weaknesses: ["Most value in coding contexts"],
    is_active: true
  },
  {
    id: 7,
    name: "Zapier",
    category: "automation",
    pricing_type: "freemium",
    pricing_label: "Free + tiered paid plans",
    website_url: "https://zapier.com",
    description: "No-code automation platform with extensive app integrations.",
    strengths: ["Ease of use", "Large integration library"],
    weaknesses: ["Costs can grow with usage"],
    is_active: true
  },
  {
    id: 8,
    name: "Make",
    category: "automation",
    pricing_type: "freemium",
    pricing_label: "Free + tiered paid plans",
    website_url: "https://www.make.com",
    description: "Visual automation builder for advanced multi-step workflows.",
    strengths: ["Visual scenario builder", "Flexible logic"],
    weaknesses: ["Slightly steeper learning curve"],
    is_active: true
  },
  {
    id: 9,
    name: "n8n",
    category: "automation",
    pricing_type: "open-source",
    pricing_label: "Self-hosted free + cloud plans",
    website_url: "https://n8n.io",
    description: "Workflow automation platform with strong self-hosted flexibility.",
    strengths: ["Self-hosted control", "High customization"],
    weaknesses: ["Requires more technical setup"],
    is_active: true
  }
];

let nextSessionId = 1;
const sessions = new Map();
const recommendations = [];

export function createMockSession(payload) {
  const now = new Date().toISOString();
  const session = {
    id: nextSessionId++,
    email: payload.email ?? null,
    profile_id: payload.profile_id,
    task_id: payload.task_id,
    budget: payload.budget,
    experience_level: payload.experience_level,
    selected_priorities: payload.selected_priorities || [],
    created_at: now,
    updated_at: now
  };
  sessions.set(session.id, session);
  return { id: session.id, created_at: session.created_at };
}

export function getMockSessionWithTaskName(sessionId) {
  const session = sessions.get(Number(sessionId));
  if (!session) {
    return null;
  }

  const task = mockTasks.find((item) => item.id === Number(session.task_id));
  if (!task) {
    return null;
  }

  return {
    id: session.id,
    budget: session.budget,
    experience_level: session.experience_level,
    selected_priorities: session.selected_priorities,
    task_name: task.name
  };
}

export function getMockToolsByNames(names) {
  const target = new Set(names);
  return mockTools.filter((tool) => target.has(tool.name) && tool.is_active);
}

export function storeMockRecommendation(payload) {
  recommendations.push({
    id: recommendations.length + 1,
    ...payload,
    created_at: new Date().toISOString()
  });
}
