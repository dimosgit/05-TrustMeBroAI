import fs from "node:fs/promises";
import path from "node:path";

const ALLOWED_RUNTIME_CATEGORIES = [
  "Document/PDF",
  "Research",
  "Content Creation",
  "Coding",
  "Automation"
];

const CONFIDENCE_RANK = {
  low: 1,
  medium: 2,
  high: 3
};

const CONSOLIDATED_FIELDS = [
  "tool_name",
  "tool_slug",
  "website",
  "category",
  "pricing",
  "pricing_tier",
  "ease_of_use",
  "speed",
  "quality",
  "best_for",
  "target_users",
  "tags",
  "context_word",
  "record_status"
];

const REQUIRED_IDENTITY_FIELDS = ["tool_name", "tool_slug", "website", "category"];
const REQUIRED_PRICING_AND_SCORE_FIELDS = ["pricing", "pricing_tier", "ease_of_use", "speed", "quality"];
const TAGLESS_WORDS = new Set(["and", "or", "for", "the", "with", "from", "tool", "tools", "ai"]);

function compareLexical(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function compareEvidence(a, b) {
  return (
    compareLexical(a.tool_slug, b.tool_slug) ||
    compareLexical(a.field, b.field) ||
    compareLexical(a.source_file, b.source_file) ||
    (a.source_line || 0) - (b.source_line || 0) ||
    compareLexical(JSON.stringify(a.value), JSON.stringify(b.value))
  );
}

function compareConflicts(a, b) {
  return (
    compareLexical(a.tool_slug, b.tool_slug) ||
    compareLexical(a.type, b.type) ||
    compareLexical(a.field || "", b.field || "")
  );
}

function compareCandidate(a, b) {
  return compareLexical(a.tool_slug, b.tool_slug);
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanMarkdownValue(value) {
  return normalizeWhitespace(
    String(value || "")
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .replace(/^[-*]\s+/, "")
      .replace(/[.;,\s]+$/, "")
  );
}

function normalizeToolName(value) {
  const normalized = cleanMarkdownValue(value).replace(/\s+\(.*?\)\s*$/, "").trim();
  return normalized || null;
}

function toToolSlug(toolName) {
  return normalizeWhitespace(toolName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

function normalizeWebsite(value) {
  if (!value) return null;
  let normalized = cleanMarkdownValue(value)
    .replace(/^\[(.+?)\]\((.+)\)$/u, "$2")
    .replace(/^www\./i, "")
    .toLowerCase();

  if (!normalized) return null;

  if (!/^https?:\/\//.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  try {
    const parsed = new URL(normalized);
    if (!parsed.hostname) return null;
    const pathname = parsed.pathname === "/" ? "" : parsed.pathname;
    return `${parsed.protocol}//${parsed.hostname}${pathname}`.replace(/\/$/, "");
  } catch {
    return null;
  }
}

function normalizeCategory(rawCategory) {
  if (!rawCategory) {
    return { value: null, confidence: "low" };
  }

  const normalized = cleanMarkdownValue(rawCategory);
  const direct = ALLOWED_RUNTIME_CATEGORIES.find(
    (candidate) => candidate.toLowerCase() === normalized.toLowerCase()
  );
  if (direct) {
    return { value: direct, confidence: "high" };
  }

  const lower = normalized.toLowerCase();
  if (lower.includes("coding") || lower.includes("developer") || lower.includes("programming")) {
    return { value: "Coding", confidence: "medium" };
  }
  if (lower.includes("content") || lower.includes("writing") || lower.includes("presentation")) {
    return { value: "Content Creation", confidence: "medium" };
  }
  if (
    lower.includes("document") ||
    lower.includes("pdf") ||
    lower.includes("legal") ||
    lower.includes("contract") ||
    lower.includes("parser")
  ) {
    return { value: "Document/PDF", confidence: "medium" };
  }
  if (lower.includes("research") || lower.includes("citation")) {
    return { value: "Research", confidence: "medium" };
  }
  if (
    lower.includes("automation") ||
    lower.includes("workflow") ||
    lower.includes("task") ||
    lower.includes("meeting") ||
    lower.includes("knowledge") ||
    lower.includes("email") ||
    lower.includes("productivity")
  ) {
    return { value: "Automation", confidence: "medium" };
  }

  return { value: null, confidence: "low" };
}

function inferPricingTier(rawPricing) {
  if (!rawPricing) {
    return { value: null, confidence: "low" };
  }

  const lower = rawPricing.toLowerCase();
  const priceValues = Array.from(lower.matchAll(/\$ ?(\d+(?:\.\d+)?)/g)).map((match) =>
    Number.parseFloat(match[1])
  );
  const maxPrice = priceValues.length ? Math.max(...priceValues) : null;

  if (lower.includes("freemium")) {
    return { value: "freemium", confidence: "high" };
  }

  if (lower.includes("free") && !lower.includes("paid") && maxPrice == null) {
    return { value: "free", confidence: "high" };
  }

  if (lower.includes("free") && (lower.includes("paid") || maxPrice != null)) {
    return { value: "freemium", confidence: "medium" };
  }

  if (maxPrice != null || lower.includes("paid") || lower.includes("enterprise")) {
    if (maxPrice == null) {
      return { value: "paid_mid", confidence: "medium" };
    }
    if (maxPrice <= 15) return { value: "paid_low", confidence: "medium" };
    if (maxPrice <= 40) return { value: "paid_mid", confidence: "medium" };
    return { value: "paid_high", confidence: "medium" };
  }

  return { value: null, confidence: "low" };
}

function normalizePricing(rawPricing, pricingTier) {
  if (rawPricing) {
    return { value: cleanMarkdownValue(rawPricing), confidence: "high" };
  }
  if (!pricingTier) {
    return { value: null, confidence: "low" };
  }

  const tierLabel = {
    free: "Free",
    freemium: "Freemium",
    paid_low: "Paid (low tier)",
    paid_mid: "Paid (mid tier)",
    paid_high: "Paid (high tier)"
  };

  return {
    value: tierLabel[pricingTier] || "Paid",
    confidence: "medium"
  };
}

function normalizeScore(rawValue) {
  if (rawValue == null) {
    return { value: null, confidence: "low", outOfRange: false };
  }

  const parsed = Number.parseFloat(String(rawValue).replace(/[^0-9.]+/g, ""));
  if (!Number.isFinite(parsed)) {
    return { value: null, confidence: "low", outOfRange: false };
  }

  if (parsed < 1 || parsed > 5) {
    return { value: null, confidence: "low", outOfRange: true };
  }

  return {
    value: Math.round(parsed),
    confidence: "medium",
    outOfRange: false
  };
}

function normalizeStringList(rawValue) {
  if (!rawValue) return [];
  return normalizeWhitespace(rawValue)
    .split(/[;,]/)
    .map((item) => cleanMarkdownValue(item))
    .filter(Boolean);
}

function deriveTags({ category, rawCategory, sourceFile }) {
  const tags = new Set();
  const fromCategory = normalizeWhitespace(rawCategory || category || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  for (const token of fromCategory) {
    if (!TAGLESS_WORDS.has(token)) {
      tags.add(token);
    }
  }

  const fileTokens = path
    .basename(sourceFile, path.extname(sourceFile))
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  for (const token of fileTokens) {
    if (!TAGLESS_WORDS.has(token)) {
      tags.add(token);
    }
  }

  return Array.from(tags).sort((a, b) => compareLexical(a, b)).slice(0, 12);
}

function deriveContextWord(category) {
  const mapped = {
    "Document/PDF": "documents",
    Research: "research",
    "Content Creation": "content",
    Coding: "coding",
    Automation: "automation"
  };
  return mapped[category] || "ai";
}

function toRelativePath(filePath, rootPath) {
  const relative = path.relative(rootPath, filePath);
  return relative.split(path.sep).join("/");
}

function extractFieldValue(line, label) {
  const regex = new RegExp(`^\\*\\*${label}:\\*\\*\\s*(.+?)\\s*$`, "i");
  const match = line.match(regex);
  return match ? match[1] : null;
}

function parseSourcesFromMarkdown({ sourceFile, content }) {
  const lines = content.split(/\r?\n/u);
  const hasToolNameFields = lines.some((line) => /^\*\*Tool Name:\*\*/i.test(line.trim()));
  const extracted = [];

  let current = null;
  const pushCurrent = () => {
    if (!current?.tool_name?.value) return;
    extracted.push(current);
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    const lineNo = index + 1;

    if (hasToolNameFields) {
      const toolNameValue = extractFieldValue(trimmed, "Tool Name");
      if (toolNameValue) {
        pushCurrent();
        current = { source_file: sourceFile, tool_name: { value: toolNameValue, line: lineNo } };
        continue;
      }
    } else {
      const headingMatch = trimmed.match(/^##+\s+\d+\.\s+(.+?)\s*$/u);
      if (headingMatch) {
        pushCurrent();
        current = { source_file: sourceFile, tool_name: { value: headingMatch[1], line: lineNo } };
        continue;
      }
    }

    if (!current) continue;
    if (trimmed === "---") continue;

    const categoryValue = extractFieldValue(trimmed, "Category");
    if (categoryValue) current.category = { value: categoryValue, line: lineNo };

    const pricingModelValue = extractFieldValue(trimmed, "Pricing Model");
    if (pricingModelValue) current.pricing = { value: pricingModelValue, line: lineNo };
    const pricingValue = extractFieldValue(trimmed, "Pricing");
    if (pricingValue && !current.pricing) current.pricing = { value: pricingValue, line: lineNo };

    const websiteValue = extractFieldValue(trimmed, "Website");
    if (websiteValue) current.website = { value: websiteValue, line: lineNo };

    const bestForValue = extractFieldValue(trimmed, "Best For") || extractFieldValue(trimmed, "Best for");
    if (bestForValue) current.best_for = { value: bestForValue, line: lineNo };

    const easeValue = extractFieldValue(trimmed, "Ease of Use \\(1[–-]5\\)");
    if (easeValue) current.ease_of_use = { value: easeValue, line: lineNo };

    const qualityValue = extractFieldValue(trimmed, "Quality \\(1[–-]5\\)");
    if (qualityValue) current.quality = { value: qualityValue, line: lineNo };

    const speedValue = extractFieldValue(trimmed, "Speed \\(1[–-]5\\)");
    if (speedValue) current.speed = { value: speedValue, line: lineNo };

    const usersValue = extractFieldValue(trimmed, "Typical Users");
    if (usersValue) current.target_users = { value: usersValue, line: lineNo };
  }

  pushCurrent();
  return extracted;
}

function toObservation({ toolSlug, field, value, confidence, sourceFile, sourceLine, extractor }) {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  return {
    tool_slug: toolSlug,
    field,
    value,
    confidence,
    source_file: sourceFile,
    source_line: sourceLine || 0,
    extractor
  };
}

function normalizeExtractedRecord(record) {
  const toolName = normalizeToolName(record.tool_name?.value);
  if (!toolName) return null;

  const toolSlug = toToolSlug(toolName);
  if (!toolSlug) return null;

  const category = normalizeCategory(record.category?.value);
  const website = normalizeWebsite(record.website?.value);
  const pricingTier = inferPricingTier(record.pricing?.value);
  const pricing = normalizePricing(record.pricing?.value, pricingTier.value);
  const ease = normalizeScore(record.ease_of_use?.value);
  const speed = normalizeScore(record.speed?.value);
  const quality = normalizeScore(record.quality?.value);
  const bestFor = record.best_for?.value ? cleanMarkdownValue(record.best_for.value) : null;
  const targetUsers = normalizeStringList(record.target_users?.value);
  const tags = deriveTags({
    category: category.value,
    rawCategory: record.category?.value || "",
    sourceFile: record.source_file
  });
  const contextWord = deriveContextWord(category.value);

  const observations = [
    toObservation({
      toolSlug,
      field: "tool_name",
      value: toolName,
      confidence: "high",
      sourceFile: record.source_file,
      sourceLine: record.tool_name?.line,
      extractor: "markdown_extract"
    }),
    toObservation({
      toolSlug,
      field: "tool_slug",
      value: toolSlug,
      confidence: "high",
      sourceFile: record.source_file,
      sourceLine: record.tool_name?.line,
      extractor: "slug_normalizer"
    }),
    toObservation({
      toolSlug,
      field: "website",
      value: website,
      confidence: website ? "high" : "low",
      sourceFile: record.source_file,
      sourceLine: record.website?.line,
      extractor: "website_normalizer"
    }),
    toObservation({
      toolSlug,
      field: "category",
      value: category.value,
      confidence: category.confidence,
      sourceFile: record.source_file,
      sourceLine: record.category?.line,
      extractor: "category_normalizer"
    }),
    toObservation({
      toolSlug,
      field: "pricing",
      value: pricing.value,
      confidence: pricing.confidence,
      sourceFile: record.source_file,
      sourceLine: record.pricing?.line,
      extractor: "pricing_normalizer"
    }),
    toObservation({
      toolSlug,
      field: "pricing_tier",
      value: pricingTier.value,
      confidence: pricingTier.confidence,
      sourceFile: record.source_file,
      sourceLine: record.pricing?.line,
      extractor: "pricing_tier_infer"
    }),
    toObservation({
      toolSlug,
      field: "ease_of_use",
      value: ease.value,
      confidence: ease.confidence,
      sourceFile: record.source_file,
      sourceLine: record.ease_of_use?.line,
      extractor: "score_normalizer"
    }),
    toObservation({
      toolSlug,
      field: "speed",
      value: speed.value,
      confidence: speed.confidence,
      sourceFile: record.source_file,
      sourceLine: record.speed?.line,
      extractor: "score_normalizer"
    }),
    toObservation({
      toolSlug,
      field: "quality",
      value: quality.value,
      confidence: quality.confidence,
      sourceFile: record.source_file,
      sourceLine: record.quality?.line,
      extractor: "score_normalizer"
    }),
    toObservation({
      toolSlug,
      field: "best_for",
      value: bestFor,
      confidence: bestFor ? "high" : "low",
      sourceFile: record.source_file,
      sourceLine: record.best_for?.line,
      extractor: "markdown_extract"
    }),
    toObservation({
      toolSlug,
      field: "target_users",
      value: targetUsers,
      confidence: targetUsers.length ? "high" : "low",
      sourceFile: record.source_file,
      sourceLine: record.target_users?.line,
      extractor: "list_normalizer"
    }),
    toObservation({
      toolSlug,
      field: "tags",
      value: tags,
      confidence: tags.length ? "medium" : "low",
      sourceFile: record.source_file,
      sourceLine: record.category?.line,
      extractor: "tag_deriver"
    }),
    toObservation({
      toolSlug,
      field: "context_word",
      value: contextWord,
      confidence: category.value ? "medium" : "low",
      sourceFile: record.source_file,
      sourceLine: record.category?.line,
      extractor: "context_deriver"
    }),
    toObservation({
      toolSlug,
      field: "record_status",
      value: "active",
      confidence: "high",
      sourceFile: record.source_file,
      sourceLine: 1,
      extractor: "default"
    })
  ].filter(Boolean);

  const recordConflicts = [];
  if (ease.outOfRange) {
    recordConflicts.push({
      type: "invalid_score_range",
      field: "ease_of_use",
      message: "ease_of_use must be within 1..5",
      source_file: record.source_file,
      source_line: record.ease_of_use?.line || 0
    });
  }
  if (speed.outOfRange) {
    recordConflicts.push({
      type: "invalid_score_range",
      field: "speed",
      message: "speed must be within 1..5",
      source_file: record.source_file,
      source_line: record.speed?.line || 0
    });
  }
  if (quality.outOfRange) {
    recordConflicts.push({
      type: "invalid_score_range",
      field: "quality",
      message: "quality must be within 1..5",
      source_file: record.source_file,
      source_line: record.quality?.line || 0
    });
  }

  return {
    tool_slug: toolSlug,
    observations,
    record_conflicts: recordConflicts
  };
}

function choosePreferredObservation(observations) {
  if (!observations.length) {
    return null;
  }

  const sorted = [...observations].sort((left, right) => {
    const leftRank = CONFIDENCE_RANK[left.confidence] || 0;
    const rightRank = CONFIDENCE_RANK[right.confidence] || 0;
    if (leftRank !== rightRank) return rightRank - leftRank;
    return (
      compareLexical(left.source_file, right.source_file) ||
      (left.source_line || 0) - (right.source_line || 0) ||
      compareLexical(JSON.stringify(left.value), JSON.stringify(right.value))
    );
  });

  return sorted[0];
}

function distinctValues(observations) {
  const values = new Map();
  for (const item of observations) {
    values.set(JSON.stringify(item.value), item.value);
  }
  return Array.from(values.values());
}

function hasAtLeastConfidence(confidence, minimum) {
  return (CONFIDENCE_RANK[confidence] || 0) >= (CONFIDENCE_RANK[minimum] || 0);
}

function quoteSqlString(value) {
  if (value == null) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function quoteSqlJson(value) {
  return `${quoteSqlString(JSON.stringify(value))}::jsonb`;
}

function generateApprovedSql(candidates) {
  const approved = candidates.filter((candidate) => candidate.status === "approved");
  if (!approved.length) {
    return [
      "-- No approved tool updates were generated.",
      "-- Resolve conflicts in curation_decisions.json before generating apply-ready SQL."
    ].join("\n");
  }

  const statements = approved
    .map((candidate) => {
      return [
        "INSERT INTO tools (",
        "  tool_name, tool_slug, logo_url, best_for, website, referral_url, category, pricing,",
        "  pricing_tier, ease_of_use, speed, quality, target_users, tags, context_word, record_status",
        ") VALUES (",
        `  ${quoteSqlString(candidate.tool_name)},`,
        `  ${quoteSqlString(candidate.tool_slug)},`,
        "  NULL,",
        `  ${quoteSqlString(candidate.best_for || `AI support for ${candidate.category.toLowerCase()} workflows`)},`,
        `  ${quoteSqlString(candidate.website)},`,
        "  NULL,",
        `  ${quoteSqlString(candidate.category)},`,
        `  ${quoteSqlString(candidate.pricing)},`,
        `  ${quoteSqlString(candidate.pricing_tier)},`,
        `  ${candidate.ease_of_use},`,
        `  ${candidate.speed},`,
        `  ${candidate.quality},`,
        `  ${quoteSqlJson(candidate.target_users || [])},`,
        `  ${quoteSqlJson(candidate.tags || [])},`,
        `  ${quoteSqlString(candidate.context_word)},`,
        `  ${quoteSqlString(candidate.record_status || "active")}`,
        ")",
        "ON CONFLICT (tool_slug)",
        "DO UPDATE SET",
        "  tool_name = EXCLUDED.tool_name,",
        "  best_for = EXCLUDED.best_for,",
        "  website = EXCLUDED.website,",
        "  category = EXCLUDED.category,",
        "  pricing = EXCLUDED.pricing,",
        "  pricing_tier = EXCLUDED.pricing_tier,",
        "  ease_of_use = EXCLUDED.ease_of_use,",
        "  speed = EXCLUDED.speed,",
        "  quality = EXCLUDED.quality,",
        "  target_users = EXCLUDED.target_users,",
        "  tags = EXCLUDED.tags,",
        "  context_word = EXCLUDED.context_word,",
        "  record_status = EXCLUDED.record_status,",
        "  updated_at = NOW();"
      ].join("\n");
    })
    .join("\n\n");

  return ["-- Generated in dry-run mode from docs/research markdown", "BEGIN;", statements, "COMMIT;"].join(
    "\n\n"
  );
}

export function buildResearchIngestionArtifacts({ sourceDocuments }) {
  const normalizedRecords = sourceDocuments
    .flatMap((source) =>
      parseSourcesFromMarkdown({
        sourceFile: source.sourceFile,
        content: source.content
      })
    )
    .map((record) => normalizeExtractedRecord(record))
    .filter(Boolean);

  const evidence = normalizedRecords
    .flatMap((record) => record.observations)
    .sort(compareEvidence);

  const recordConflicts = normalizedRecords.flatMap((record) =>
    record.record_conflicts.map((conflict) => ({
      type: conflict.type,
      tool_slug: record.tool_slug,
      field: conflict.field,
      message: conflict.message,
      source_files: [conflict.source_file]
    }))
  );

  const observationsBySlug = new Map();
  for (const item of evidence) {
    const current = observationsBySlug.get(item.tool_slug) || [];
    current.push(item);
    observationsBySlug.set(item.tool_slug, current);
  }

  const conflicts = [...recordConflicts];
  const candidates = [];

  for (const [toolSlug, observations] of observationsBySlug.entries()) {
    const byField = new Map();
    for (const observation of observations) {
      const fieldRows = byField.get(observation.field) || [];
      fieldRows.push(observation);
      byField.set(observation.field, fieldRows);
    }

    const candidate = {};
    const confidence = {};

    for (const field of CONSOLIDATED_FIELDS) {
      const fieldObservations = byField.get(field) || [];
      if (field === "target_users" || field === "tags") {
        const values = fieldObservations.flatMap((row) =>
          Array.isArray(row.value) ? row.value : []
        );
        const uniqueValues = Array.from(new Set(values)).sort((a, b) => compareLexical(a, b));
        candidate[field] = uniqueValues;
        confidence[field] = fieldObservations.length
          ? choosePreferredObservation(fieldObservations).confidence
          : "low";
        continue;
      }

      const preferred = choosePreferredObservation(fieldObservations);
      candidate[field] = preferred ? preferred.value : null;
      confidence[field] = preferred ? preferred.confidence : "low";

      const values = distinctValues(fieldObservations).filter((value) => value != null && value !== "");
      if (values.length > 1 && ["tool_name", "website", "category", "pricing_tier"].includes(field)) {
        conflicts.push({
          type: field === "tool_name" || field === "website" ? "identity_conflict" : "value_conflict",
          tool_slug: toolSlug,
          field,
          message: `Conflicting values detected for ${field}`,
          values,
          source_files: Array.from(new Set(fieldObservations.map((row) => row.source_file))).sort(
            (a, b) => compareLexical(a, b)
          )
        });
      }
    }

    candidate.tool_slug = candidate.tool_slug || toolSlug;
    candidate.source_files = Array.from(new Set(observations.map((row) => row.source_file))).sort((a, b) =>
      compareLexical(a, b)
    );
    candidate.confidence = confidence;

    for (const field of REQUIRED_IDENTITY_FIELDS) {
      if (!candidate[field]) {
        conflicts.push({
          type: "required_field_missing",
          tool_slug: candidate.tool_slug,
          field,
          message: `Missing required identity field: ${field}`,
          source_files: candidate.source_files
        });
      } else if (!hasAtLeastConfidence(confidence[field], "high")) {
        conflicts.push({
          type: "low_confidence_required_field",
          tool_slug: candidate.tool_slug,
          field,
          message: `Required identity field "${field}" must be high confidence`,
          source_files: candidate.source_files
        });
      }
    }

    for (const field of REQUIRED_PRICING_AND_SCORE_FIELDS) {
      if (
        candidate[field] == null ||
        candidate[field] === "" ||
        (Array.isArray(candidate[field]) && candidate[field].length === 0) ||
        !hasAtLeastConfidence(confidence[field], "medium")
      ) {
        conflicts.push({
          type: "review_required_field",
          tool_slug: candidate.tool_slug,
          field,
          message: `Field "${field}" must be at least medium confidence`,
          source_files: candidate.source_files
        });
      }
    }

    candidate.status = "review_required";
    candidates.push(candidate);
  }

  const conflictsBySlug = new Map();
  for (const conflict of conflicts) {
    const rows = conflictsBySlug.get(conflict.tool_slug) || [];
    rows.push(conflict);
    conflictsBySlug.set(conflict.tool_slug, rows);
  }

  for (const candidate of candidates) {
    candidate.status = (conflictsBySlug.get(candidate.tool_slug) || []).length ? "review_required" : "approved";
  }

  const sortedCandidates = candidates.sort(compareCandidate);
  const sortedConflicts = conflicts.sort(compareConflicts);
  const curationDecisions = sortedCandidates.map((candidate) => ({
    tool_slug: candidate.tool_slug,
    decision: candidate.status === "approved" ? "approve" : "review_required",
    rationale:
      candidate.status === "approved"
        ? "All thresholds met with no unresolved conflicts."
        : "Requires human curation before approval.",
    source_files: candidate.source_files
  }));
  const approvedSql = generateApprovedSql(sortedCandidates);

  return {
    candidateTools: sortedCandidates,
    candidateEvidence: evidence,
    candidateConflicts: {
      total_conflicts: sortedConflicts.length,
      conflicts: sortedConflicts
    },
    curationDecisions,
    approvedSql
  };
}

async function walkMarkdownFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkMarkdownFiles(absolute)));
      continue;
    }
    if (entry.isFile() && absolute.toLowerCase().endsWith(".md")) {
      files.push(absolute);
    }
  }
  return files;
}

async function writeJsonl(filePath, rows) {
  const content = rows.map((row) => JSON.stringify(row)).join("\n");
  await fs.writeFile(filePath, content ? `${content}\n` : "", "utf8");
}

async function readOptionalJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function mergeCurationDecisionsBySlug({ generatedDecisions, existingDecisions }) {
  const previous = new Map(
    toDecisionRows(existingDecisions)
      .filter((row) => row?.tool_slug)
      .map((row) => [normalizeWhitespace(row.tool_slug), row])
  );

  return generatedDecisions.map((decision) => {
    const prior = previous.get(normalizeWhitespace(decision.tool_slug));
    if (!prior) {
      return decision;
    }

    const priorDecision = String(prior.decision || "").trim();
    if (!priorDecision) {
      return decision;
    }

    return {
      ...decision,
      decision: priorDecision,
      rationale: normalizeWhitespace(prior.rationale) || decision.rationale
    };
  });
}

function applyApprovedConflictSuppression({ conflicts, curationDecisions }) {
  const approvedSlugs = new Set(
    toDecisionRows(curationDecisions)
      .filter((row) => {
        const decision = String(row?.decision || "").toLowerCase().trim();
        return decision === "approve" || decision === "approved";
      })
      .map((row) => normalizeWhitespace(row.tool_slug))
      .filter(Boolean)
  );

  const suppressedBySlug = new Map();
  const kept = [];

  for (const conflict of conflicts) {
    const slug = normalizeWhitespace(conflict?.tool_slug);
    if (approvedSlugs.has(slug)) {
      suppressedBySlug.set(slug, (suppressedBySlug.get(slug) || 0) + 1);
      continue;
    }
    kept.push(conflict);
  }

  return {
    approvedSlugs,
    keptConflicts: kept,
    suppressedByCuration: Array.from(suppressedBySlug.entries())
      .map(([tool_slug, suppressed_conflict_count]) => ({
        tool_slug,
        suppressed_conflict_count
      }))
      .sort((left, right) => compareLexical(left.tool_slug, right.tool_slug))
  };
}

export async function runResearchIngestionDryRun({
  projectRoot,
  researchDir = path.join(projectRoot, "docs", "research"),
  stagingDir = path.join(projectRoot, "backend", "db", "staging", "research_ingest")
}) {
  const markdownFiles = (await walkMarkdownFiles(researchDir)).sort((a, b) => compareLexical(a, b));
  const sourceDocuments = await Promise.all(
    markdownFiles.map(async (absolutePath) => ({
      sourceFile: toRelativePath(absolutePath, projectRoot),
      content: await fs.readFile(absolutePath, "utf8")
    }))
  );

  const artifacts = buildResearchIngestionArtifacts({ sourceDocuments });
  const existingDecisionsPath = path.join(stagingDir, "curation_decisions.json");
  const existingDecisions = await readOptionalJson(existingDecisionsPath);
  const mergedDecisions = mergeCurationDecisionsBySlug({
    generatedDecisions: artifacts.curationDecisions,
    existingDecisions
  });
  const { approvedSlugs, keptConflicts, suppressedByCuration } = applyApprovedConflictSuppression({
    conflicts: artifacts.candidateConflicts.conflicts,
    curationDecisions: mergedDecisions
  });
  const candidateToolsWithMergedStatus = artifacts.candidateTools.map((candidate) => ({
    ...candidate,
    status: approvedSlugs.has(candidate.tool_slug) ? "approved" : "review_required"
  }));
  const mergedApprovedSql = generateApprovedSql(candidateToolsWithMergedStatus);

  await fs.mkdir(stagingDir, { recursive: true });
  await writeJsonl(path.join(stagingDir, "candidate_tools.jsonl"), candidateToolsWithMergedStatus);
  await writeJsonl(path.join(stagingDir, "candidate_evidence.jsonl"), artifacts.candidateEvidence);
  await fs.writeFile(
    path.join(stagingDir, "candidate_conflicts.json"),
    `${JSON.stringify(
      {
        total_conflicts: keptConflicts.length,
        conflicts: keptConflicts,
        suppressed_by_curation: suppressedByCuration
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  await fs.writeFile(
    path.join(stagingDir, "curation_decisions.json"),
    `${JSON.stringify(mergedDecisions, null, 2)}\n`,
    "utf8"
  );
  await fs.writeFile(path.join(stagingDir, "approved_tool_updates.sql"), `${mergedApprovedSql}\n`, "utf8");

  return {
    source_count: sourceDocuments.length,
    candidate_count: candidateToolsWithMergedStatus.length,
    conflict_count: keptConflicts.length,
    approved_count: candidateToolsWithMergedStatus.filter((item) => item.status === "approved").length,
    staging_dir: stagingDir
  };
}

function parseJsonLines(content) {
  return String(content || "")
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function toDecisionRows(decisionsPayload) {
  if (Array.isArray(decisionsPayload)) {
    return decisionsPayload;
  }

  if (Array.isArray(decisionsPayload?.decisions)) {
    return decisionsPayload.decisions;
  }

  return [];
}

function toConflictRows(conflictsPayload) {
  if (Array.isArray(conflictsPayload)) {
    return conflictsPayload;
  }

  if (Array.isArray(conflictsPayload?.conflicts)) {
    return conflictsPayload.conflicts;
  }

  return [];
}

function normalizeReleaseId(value) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) {
    throw new Error("release_id is required");
  }

  if (!/^[a-zA-Z0-9._-]{3,120}$/.test(normalized)) {
    throw new Error(
      "release_id must be 3-120 chars and contain only letters, numbers, dot, dash, underscore"
    );
  }

  return normalized;
}

function validateApplyCandidate(candidate) {
  const requiredFields = [
    "tool_name",
    "tool_slug",
    "website",
    "category",
    "pricing",
    "pricing_tier",
    "ease_of_use",
    "speed",
    "quality"
  ];

  for (const field of requiredFields) {
    if (candidate[field] == null || candidate[field] === "") {
      throw new Error(`Approved candidate "${candidate.tool_slug || "unknown"}" missing field "${field}"`);
    }
  }

  for (const scoreField of ["ease_of_use", "speed", "quality"]) {
    const parsed = Number.parseInt(candidate[scoreField], 10);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
      throw new Error(
        `Approved candidate "${candidate.tool_slug}" has invalid ${scoreField}; expected integer 1..5`
      );
    }
  }
}

export async function loadCandidateReleaseArtifacts({
  stagingDir,
  readFile = (filePath, encoding) => fs.readFile(filePath, encoding)
}) {
  const candidateToolsPath = path.join(stagingDir, "candidate_tools.jsonl");
  const candidateConflictsPath = path.join(stagingDir, "candidate_conflicts.json");
  const curationDecisionsPath = path.join(stagingDir, "curation_decisions.json");

  const [candidateToolsRaw, candidateConflictsRaw, curationDecisionsRaw] = await Promise.all([
    readFile(candidateToolsPath, "utf8"),
    readFile(candidateConflictsPath, "utf8"),
    readFile(curationDecisionsPath, "utf8")
  ]);

  const candidateTools = parseJsonLines(candidateToolsRaw);
  const candidateConflicts = JSON.parse(candidateConflictsRaw);
  const curationDecisions = JSON.parse(curationDecisionsRaw);

  return {
    candidateTools,
    candidateConflicts,
    curationDecisions
  };
}

export function resolveApprovedCandidates({ candidateTools, candidateConflicts, curationDecisions }) {
  const decisions = toDecisionRows(curationDecisions);
  const conflicts = toConflictRows(candidateConflicts);

  const decisionApprovedValues = new Set(["approve", "approved"]);
  const approvedSlugs = Array.from(
    new Set(
      decisions
        .filter((row) => row && decisionApprovedValues.has(String(row.decision || "").toLowerCase()))
        .map((row) => normalizeWhitespace(row.tool_slug))
        .filter(Boolean)
    )
  ).sort((a, b) => compareLexical(a, b));

  if (!approvedSlugs.length) {
    throw new Error("No approved tools found in curation decisions");
  }

  const candidateBySlug = new Map(
    candidateTools
      .filter((candidate) => candidate?.tool_slug)
      .map((candidate) => [normalizeWhitespace(candidate.tool_slug), candidate])
  );

  const approvedCandidates = [];
  for (const slug of approvedSlugs) {
    const candidate = candidateBySlug.get(slug);
    if (!candidate) {
      throw new Error(`Approved tool "${slug}" is missing from candidate_tools.jsonl`);
    }
    validateApplyCandidate(candidate);
    approvedCandidates.push(candidate);
  }

  const conflictSlugs = new Set(
    conflicts.map((conflict) => normalizeWhitespace(conflict?.tool_slug)).filter(Boolean)
  );
  const blocked = approvedSlugs.filter((slug) => conflictSlugs.has(slug));
  if (blocked.length) {
    throw new Error(
      `Approved tools contain unresolved conflicts: ${blocked.join(", ")}`
    );
  }

  return approvedCandidates.sort((a, b) => compareLexical(a.tool_slug, b.tool_slug));
}

export async function applyApprovedCandidatesInTransaction({
  approvedCandidates,
  dbPool
}) {
  if (!dbPool?.connect) {
    throw new Error("Database pool is required for apply mode");
  }

  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");

    for (const candidate of approvedCandidates) {
      await client.query(
        `INSERT INTO tools (
           tool_name,
           tool_slug,
           logo_url,
           best_for,
           website,
           referral_url,
           category,
           pricing,
           pricing_tier,
           ease_of_use,
           speed,
           quality,
           target_users,
           tags,
           context_word,
           record_status
         )
         VALUES (
           $1, $2, NULL, $3, $4, NULL, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13, $14
         )
         ON CONFLICT (tool_slug)
         DO UPDATE SET
           tool_name = EXCLUDED.tool_name,
           best_for = EXCLUDED.best_for,
           website = EXCLUDED.website,
           category = EXCLUDED.category,
           pricing = EXCLUDED.pricing,
           pricing_tier = EXCLUDED.pricing_tier,
           ease_of_use = EXCLUDED.ease_of_use,
           speed = EXCLUDED.speed,
           quality = EXCLUDED.quality,
           target_users = EXCLUDED.target_users,
           tags = EXCLUDED.tags,
           context_word = EXCLUDED.context_word,
           record_status = EXCLUDED.record_status,
           updated_at = NOW()`,
        [
          candidate.tool_name,
          candidate.tool_slug,
          candidate.best_for || `AI support for ${String(candidate.category || "").toLowerCase()} workflows`,
          candidate.website,
          candidate.category,
          candidate.pricing,
          candidate.pricing_tier,
          Number.parseInt(candidate.ease_of_use, 10),
          Number.parseInt(candidate.speed, 10),
          Number.parseInt(candidate.quality, 10),
          JSON.stringify(candidate.target_users || []),
          JSON.stringify(candidate.tags || []),
          candidate.context_word || "ai",
          candidate.record_status || "active"
        ]
      );
    }

    await client.query("COMMIT");

    return {
      applied_count: approvedCandidates.length,
      applied_tool_slugs: approvedCandidates.map((candidate) => candidate.tool_slug)
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignore rollback errors; original apply error remains primary.
    }
    throw error;
  } finally {
    client.release();
  }
}

async function writeApplyEvidence({ projectRoot, releaseId, summary }) {
  const evidenceDir = path.join(projectRoot, "docs", "planning", "release-evidence", releaseId);
  await fs.mkdir(evidenceDir, { recursive: true });

  const summaryPath = path.join(evidenceDir, "backend-apply-summary.json");
  await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  return {
    evidence_dir: evidenceDir,
    summary_path: summaryPath
  };
}

export async function runResearchIngestionApplyCandidate({
  projectRoot,
  dbPool,
  releaseId,
  confirmToken,
  expectedConfirmToken = "APPLY_CANDIDATE_RELEASE",
  stagingDir = path.join(projectRoot, "backend", "db", "staging", "research_ingest"),
  now = new Date()
}) {
  if (confirmToken !== expectedConfirmToken) {
    throw new Error(
      `Apply confirmation token mismatch. Pass --confirm ${expectedConfirmToken} to proceed.`
    );
  }

  const safeReleaseId = normalizeReleaseId(releaseId);

  const artifacts = await loadCandidateReleaseArtifacts({ stagingDir });
  const approvedCandidates = resolveApprovedCandidates(artifacts);
  const applyResult = await applyApprovedCandidatesInTransaction({
    approvedCandidates,
    dbPool
  });

  const summary = {
    release_id: safeReleaseId,
    applied_at: now.toISOString(),
    staging_dir: stagingDir,
    approved_tool_count: approvedCandidates.length,
    applied_tool_count: applyResult.applied_count,
    applied_tool_slugs: applyResult.applied_tool_slugs,
    guardrails: {
      confirm_token_required: expectedConfirmToken,
      approved_decision_required: true,
      unresolved_conflicts_block_apply: true,
      transactional_apply: true
    }
  };
  const evidence = await writeApplyEvidence({
    projectRoot,
    releaseId: safeReleaseId,
    summary
  });

  return {
    ...summary,
    ...evidence
  };
}
